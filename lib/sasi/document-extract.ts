import "server-only";
import JSZip from "jszip";
import ExcelJS from "exceljs";
import mammoth from "mammoth";

const MAX_TEXT=700_000;
function compact(value:string){
  return value.replace(/\r/g,"").replace(/[ \t]+\n/g,"\n").replace(/\n{3,}/g,"\n\n").trim().slice(0,MAX_TEXT);
}
function xmlText(xml:string){
  return compact(xml
    .replace(/<a:br\s*\/>/g,"\n")
    .replace(/<\/(?:a:p|w:p|text:p|h[1-6]|p)>/g,"\n")
    .replace(/<[^>]+>/g," ")
    .replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">")
    .replace(/&quot;/g,'"').replace(/&apos;/g,"'"));
}
export async function extractStructuredDocument(extension:string,bytes:ArrayBuffer){
  const buffer=Buffer.from(bytes);
  if(extension==="pdf"){
    const mod=await import("pdf-parse");
    const fn=(mod.default??mod) as unknown as (input:Buffer)=>Promise<{text?:string}>;
    const out=await fn(buffer);
    return compact(out.text??"");
  }
  if(extension==="docx"){
    const out=await mammoth.extractRawText({buffer});
    return compact(out.value??"");
  }
  if(extension==="xlsx"){
    const wb=new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);
    const rows:string[]=[];
    wb.eachSheet((sheet)=>{
      rows.push(`# ${sheet.name}`);
      sheet.eachRow(row=>{
        const values=(row.values as unknown[]).slice(1).map(v=>{
          if(v==null)return"";
          if(typeof v==="object"){
            if("text" in (v as any))return String((v as any).text??"");
            if("result" in (v as any))return String((v as any).result??"");
            return JSON.stringify(v);
          }
          return String(v);
        });
        rows.push(values.join("\t"));
      });
    });
    return compact(rows.join("\n"));
  }
  const zip=await JSZip.loadAsync(buffer);
  if(extension==="pptx"){
    const names=Object.keys(zip.files).filter(n=>/^ppt\/slides\/slide\d+\.xml$/i.test(n)).sort((a,b)=>{
      const an=Number(a.match(/slide(\d+)/i)?.[1]??0),bn=Number(b.match(/slide(\d+)/i)?.[1]??0);return an-bn;
    });
    const slides:string[]=[];
    for(const [i,name] of names.entries()){
      const xml=await zip.file(name)!.async("string");
      slides.push(`## 幻灯片 ${i+1}\n${xmlText(xml)}`);
    }
    return compact(slides.join("\n\n"));
  }
  if(extension==="epub"){
    const names=Object.keys(zip.files).filter(n=>/\.(xhtml|html|htm)$/i.test(n)).slice(0,300);
    const parts:string[]=[];
    for(const name of names){
      const html=await zip.file(name)!.async("string");
      parts.push(xmlText(html));
      if(parts.join("\n").length>MAX_TEXT)break;
    }
    return compact(parts.join("\n\n"));
  }
  if(extension==="odt"){
    const file=zip.file("content.xml");
    if(!file)throw new Error("ODT_CONTENT_MISSING");
    return xmlText(await file.async("string"));
  }
  throw new Error("DOCUMENT_FORMAT_UNSUPPORTED");
}
