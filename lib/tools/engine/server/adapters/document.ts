import fs from "node:fs";import path from "node:path";

export async function docxToText(input:string){
  const m=await import("mammoth");const mammoth=(m as any).default||m;
  const r=await mammoth.extractRawText({path:input});
  return {text:String(r.value||""),messages:r.messages||[]};
}
export async function docxToHtml(input:string){
  const m=await import("mammoth");const mammoth=(m as any).default||m;
  const r=await mammoth.convertToHtml({path:input});
  return {html:String(r.value||""),messages:r.messages||[]};
}
async function excel(){
  const m=await import("exceljs");return (m as any).default||m;
}
export async function xlsxToCsv(input:string,outputDir:string){
  const ExcelJS=await excel();const wb=new ExcelJS.Workbook();await wb.xlsx.readFile(input);
  fs.mkdirSync(outputDir,{recursive:true});const outputs:string[]=[];
  for(const ws of wb.worksheets){
    const safe=String(ws.name||"Sheet").replace(/[<>:"/\\|?*\u0000-\u001f]/g,"_").slice(0,80)||"Sheet";
    const out=path.join(outputDir,`${safe}.csv`);
    const rows:string[]=[];
    ws.eachRow({includeEmpty:true},(row:any)=>{
      const vals=(row.values as any[]).slice(1).map(v=>{
        const raw=v==null?"":typeof v==="object"&&"text" in v?String((v as any).text):String(v);
        return /[",\r\n]/.test(raw)?`"${raw.replace(/"/g,'""')}"`:raw;
      });
      rows.push(vals.join(","));
    });
    fs.writeFileSync(out,rows.join("\r\n"),"utf8");outputs.push(out);
  }
  return {outputs,sheetCount:wb.worksheets.length};
}
export async function csvToXlsx(input:string,output:string,delimiter=","){
  const ExcelJS=await excel();const wb=new ExcelJS.Workbook();const ws=wb.addWorksheet("Sheet1");
  const text=fs.readFileSync(input,"utf8").replace(/^\uFEFF/,"");
  // ExcelJS handles quoted CSV through its csv reader when reading from file.
  await wb.csv.readFile(input,{parserOptions:{delimiter}});
  const source=wb.worksheets[0];
  if(source&&source.name!=="Sheet1"){
    // no-op: workbook already contains parsed sheet
  }
  await wb.xlsx.writeFile(output);
  return {output,bytes:fs.statSync(output).size,rowCount:(wb.worksheets[0]?.rowCount||0),sourceBytes:Buffer.byteLength(text)};
}
