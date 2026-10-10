"use client";

type PdfTextItem={str?:string;transform?:number[];width?:number;height?:number};
export type PositionedTextToken={text:string;x:number;y:number;width:number;height:number};
type RowToken={text:string;x:number;right:number;height:number};

function clean(value:string){return value.replace(/\s+/g," ").trim()}
function baseName(name:string){return name.replace(/\.(pdf|txt)$/i,"")||"table"}

function groupPageRows(tokens:PositionedTextToken[]){
 const sorted=[...tokens].sort((a,b)=>Math.abs(b.y-a.y)>2?b.y-a.y:a.x-b.x);
 const rows:Array<{y:number;height:number;tokens:PositionedTextToken[]}>= [];
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
   const previous=cells[cells.length-1],gap=previous?item.x-previous.right:Number.POSITIVE_INFINITY;
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

function modeColumnCount(rows:RowToken[][]){
 const frequency=new Map<number,number>();
 for(const row of rows)if(row.length>=2&&row.length<=24)frequency.set(row.length,(frequency.get(row.length)||0)+1);
 let columns=0,count=0;
 for(const [value,hits]of frequency)if(hits>count||(hits===count&&value>columns)){columns=value;count=hits}
 return{columns,count};
}

function inferColumns(rows:RowToken[][],expected:number){
 const basis=rows.filter(row=>row.length===expected),anchors:number[]=[],tolerance=16;
 for(const row of basis)for(const cell of row){
  let best=-1,bestDist=Number.POSITIVE_INFINITY;
  for(let i=0;i<anchors.length;i++){const d=Math.abs(anchors[i]-cell.x);if(d<bestDist){bestDist=d;best=i}}
  if(best>=0&&bestDist<=tolerance)anchors[best]=(anchors[best]+cell.x)/2;else anchors.push(cell.x);
 }
 const sorted=anchors.sort((a,b)=>a-b);
 if(sorted.length<=expected)return sorted;
 return sorted.map(x=>({x,hits:rows.reduce((n,row)=>n+(row.some(cell=>Math.abs(cell.x-x)<=tolerance)?1:0),0)}))
  .sort((a,b)=>b.hits-a.hits||a.x-b.x).slice(0,expected).sort((a,b)=>a.x-b.x).map(x=>x.x);
}

function alignRows(rows:RowToken[][]){
 const mode=modeColumnCount(rows);
 if(mode.columns<2||mode.count<2)return{rows:[] as string[][],columns:0,confidence:0};
 const columns=inferColumns(rows,mode.columns);
 if(columns.length<2)return{rows:[] as string[][],columns:0,confidence:0};
 const tolerance=20;
 const aligned=rows.map(row=>{
  const out=Array(columns.length).fill("") as string[];let matched=0;
  for(const cell of row){
   let index=0,best=Number.POSITIVE_INFINITY;
   for(let i=0;i<columns.length;i++){const d=Math.abs(columns[i]-cell.x);if(d<best){best=d;index=i}}
   if(best>tolerance*2.5)continue;
   matched++;out[index]=out[index]?clean(out[index]+" "+cell.text):cell.text;
  }
  while(out.length&&out[out.length-1]==="")out.pop();
  return{values:out,matched};
 }).filter(row=>row.matched>=2);
 const structuralRows=aligned.filter(row=>row.values.filter(Boolean).length>=2);
 const confidence=Math.min(1,structuralRows.length/Math.max(3,rows.length)*Math.min(1,mode.count/3));
 if(structuralRows.length<2||confidence<.34)return{rows:[] as string[][],columns:columns.length,confidence};
 return{rows:structuralRows.map(row=>row.values),columns:columns.length,confidence};
}

export async function positionedTextPagesToXlsx(fileName:string,inputPages:Array<{name?:string;tokens:PositionedTextToken[]}>){
 const pages:Array<{name:string;rows:string[][];confidence:number}>=[];
 let totalTokens=0,totalRows=0,maxColumns=0;
 for(let i=0;i<inputPages.length;i++){
  const input=inputPages[i];totalTokens+=input.tokens.length;
  const table=alignRows(groupPageRows(input.tokens));
  if(!table.rows.length)continue;
  totalRows+=table.rows.length;maxColumns=Math.max(maxColumns,table.columns);
  pages.push({name:(input.name||`Page ${i+1}`).slice(0,31),rows:table.rows,confidence:table.confidence});
 }
 if(totalTokens<2||!pages.length)throw new Error("PDF_TABLE_TEXT_NOT_FOUND");

 const ExcelJSImport=await import("exceljs"),ExcelJS=(ExcelJSImport as any).default||ExcelJSImport;
 const workbook=new ExcelJS.Workbook();workbook.creator="LINGXIFIELD";workbook.created=new Date();
 for(const page of pages){
  const sheet=workbook.addWorksheet(page.name);
  for(const row of page.rows)sheet.addRow(row);
  const columnCount=Math.max(1,...page.rows.map(r=>r.length));
  for(let col=1;col<=columnCount;col++){
   let max=8;for(const row of page.rows)max=Math.max(max,String(row[col-1]||"").length+2);
   sheet.getColumn(col).width=Math.min(50,max);
  }
  sheet.views=[{state:"frozen",ySplit:page.rows.length>1?1:0}];
 }
 const bytes=await workbook.xlsx.writeBuffer();
 const blob=new Blob([bytes],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
 const confidence=pages.reduce((n,p)=>n+p.confidence,0)/pages.length;
 return{name:`${baseName(fileName)}.xlsx`,blob,pages:pages.length,rows:totalRows,columns:maxColumns,tokens:totalTokens,confidence};
}

export async function pdfToXlsx(file:File){
 const pdfjs=await import("pdfjs-dist/legacy/build/pdf.mjs");
 if(!pdfjs.GlobalWorkerOptions.workerSrc)pdfjs.GlobalWorkerOptions.workerSrc="/pdfjs/pdf.worker.min.mjs";
 const loading=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())}),pdf=await loading.promise;
 const pages:Array<{name:string;tokens:PositionedTextToken[]}>= [];
 try{
  for(let pageNo=1;pageNo<=pdf.numPages;pageNo++){
   const page=await pdf.getPage(pageNo),content=await page.getTextContent(),tokens:PositionedTextToken[]=[];
   for(const raw of content.items as PdfTextItem[]){
    const text=clean(String(raw.str||"")),m=raw.transform;if(!text||!Array.isArray(m)||m.length<6)continue;
    const height=Math.max(6,Number(raw.height)||Math.hypot(Number(m[2])||0,Number(m[3])||0)||10);
    tokens.push({text,x:Number(m[4])||0,y:Number(m[5])||0,width:Math.max(0,Number(raw.width)||0),height});
   }
   pages.push({name:`Page ${pageNo}`,tokens});
  }
 }finally{try{await pdf.destroy()}catch{}}
 return positionedTextPagesToXlsx(file.name,pages);
}
