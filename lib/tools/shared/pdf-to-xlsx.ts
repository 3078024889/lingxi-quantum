"use client";

type PdfTextItem={str?:string;transform?:number[];width?:number;height?:number};

type Token={text:string;x:number;y:number;width:number;height:number};
type RowToken={text:string;x:number;right:number;height:number};

function clean(value:string){return value.replace(/\s+/g," ").trim()}
function baseName(name:string){return name.replace(/\.pdf$/i,"")||"table"}

function groupPageRows(tokens:Token[]){
 const sorted=[...tokens].sort((a,b)=>Math.abs(b.y-a.y)>2?b.y-a.y:a.x-b.x);
 const rows:Array<{y:number;height:number;tokens:Token[]}>= [];
 for(const token of sorted){
  const tolerance=Math.max(2.5,Math.min(8,token.height*.65));
  let row=rows.find(r=>Math.abs(r.y-token.y)<=Math.max(tolerance,r.height*.55));
  if(!row){row={y:token.y,height:token.height,tokens:[]};rows.push(row)}
  row.tokens.push(token);
  row.y=(row.y*(row.tokens.length-1)+token.y)/row.tokens.length;
  row.height=Math.max(row.height,token.height);
 }
 rows.sort((a,b)=>b.y-a.y);
 return rows.map(row=>{
  const items=[...row.tokens].sort((a,b)=>a.x-b.x);
  const cells:RowToken[]=[];
  for(const item of items){
   const text=clean(item.text);if(!text)continue;
   const right=item.x+Math.max(item.width,text.length*Math.max(2,item.height*.28));
   const previous=cells[cells.length-1];
   const gap=previous?item.x-previous.right:Number.POSITIVE_INFINITY;
   const joinThreshold=Math.max(3,Math.min(11,item.height*.7));
   if(previous&&gap<=joinThreshold){
    previous.text=clean(previous.text+" "+text);
    previous.right=Math.max(previous.right,right);
    previous.height=Math.max(previous.height,item.height);
   }else cells.push({text,x:item.x,right,height:item.height});
  }
  return cells;
 }).filter(row=>row.length);
}

function inferColumns(rows:RowToken[][]){
 const anchors:number[]=[];
 const tolerance=14;
 for(const row of rows){
  for(const cell of row){
   let best=-1,bestDist=Number.POSITIVE_INFINITY;
   for(let i=0;i<anchors.length;i++){const d=Math.abs(anchors[i]-cell.x);if(d<bestDist){bestDist=d;best=i}}
   if(best>=0&&bestDist<=tolerance)anchors[best]=(anchors[best]+cell.x)/2;
   else anchors.push(cell.x);
  }
 }
 return anchors.sort((a,b)=>a-b);
}

function alignRows(rows:RowToken[][]){
 const columns=inferColumns(rows);
 if(!columns.length)return [] as string[][];
 return rows.map(row=>{
  const out=Array(columns.length).fill("") as string[];
  for(const cell of row){
   let index=0,best=Number.POSITIVE_INFINITY;
   for(let i=0;i<columns.length;i++){const d=Math.abs(columns[i]-cell.x);if(d<best){best=d;index=i}}
   out[index]=out[index]?clean(out[index]+" "+cell.text):cell.text;
  }
  while(out.length&&out[out.length-1]==="")out.pop();
  return out;
 });
}

export async function pdfToXlsx(file:File){
 const pdfjs=await import("pdfjs-dist/legacy/build/pdf.mjs");
 if(!pdfjs.GlobalWorkerOptions.workerSrc)pdfjs.GlobalWorkerOptions.workerSrc="/pdfjs/pdf.worker.min.mjs";
 const loading=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())});
 const pdf=await loading.promise;
 const pages:Array<{name:string;rows:string[][]}>=[];
 let totalTokens=0,totalRows=0,maxColumns=0;

 for(let pageNo=1;pageNo<=pdf.numPages;pageNo++){
  const page=await pdf.getPage(pageNo),content=await page.getTextContent();
  const tokens:Token[]=[];
  for(const raw of content.items as PdfTextItem[]){
   const text=clean(String(raw.str||"")),m=raw.transform;
   if(!text||!Array.isArray(m)||m.length<6)continue;
   const height=Math.max(6,Number(raw.height)||Math.hypot(Number(m[2])||0,Number(m[3])||0)||10);
   tokens.push({text,x:Number(m[4])||0,y:Number(m[5])||0,width:Math.max(0,Number(raw.width)||0),height});
  }
  totalTokens+=tokens.length;
  const rows=alignRows(groupPageRows(tokens));
  if(rows.length){
   totalRows+=rows.length;maxColumns=Math.max(maxColumns,...rows.map(r=>r.length));
   pages.push({name:`Page ${pageNo}`,rows});
  }
 }
 try{await pdf.destroy()}catch{}

 if(totalTokens<2||!pages.length)throw new Error("PDF_TABLE_TEXT_NOT_FOUND");

 const ExcelJSImport=await import("exceljs");
 const ExcelJS=(ExcelJSImport as any).default||ExcelJSImport;
 const workbook=new ExcelJS.Workbook();
 workbook.creator="LINGXIFIELD";
 workbook.created=new Date();
 for(const page of pages){
  const sheet=workbook.addWorksheet(page.name.slice(0,31));
  for(const row of page.rows)sheet.addRow(row);
  const columnCount=Math.max(1,...page.rows.map(r=>r.length));
  for(let col=1;col<=columnCount;col++){
   let max=8;
   for(const row of page.rows)max=Math.max(max,String(row[col-1]||"").length+2);
   sheet.getColumn(col).width=Math.min(50,max);
  }
  sheet.views=[{state:"frozen",ySplit:page.rows.length>1?1:0}];
 }
 const bytes=await workbook.xlsx.writeBuffer();
 const blob=new Blob([bytes],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
 return{name:`${baseName(file.name)}.xlsx`,blob,pages:pages.length,rows:totalRows,columns:maxColumns,tokens:totalTokens};
}
