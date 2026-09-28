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
  if(buffer.length>8*1024*1024)throw new Error("DOCUMENT_SIZE_LIMIT");
  if(extension==="pdf"){
    const mod=await import("pdf-parse");
    const fn=(mod.default??mod) as unknown as (input:Buffer)=>Promise<{text?:string}>;
    const out=await fn(buffer);
    return compact(out.text??"");
  }
  const zip=await JSZip.loadAsync(buffer);
  const entries=Object.values(zip.files).filter(file=>!file.dir);
  if(entries.length>2000)throw new Error("DOCUMENT_TOO_COMPLEX");
  // Bound actual decompressed bytes before handing Office archives to parsers.
  let expanded=0;
  for(const file of entries){
    await new Promise<void>((resolve,reject)=>{
      const stream=file.nodeStream("nodebuffer");
      let size=0,stopped=false;
      stream.on("data",(chunk:Buffer)=>{
        size+=chunk.length;expanded+=chunk.length;
        if(!stopped&&(size>12*1024*1024||expanded>32*1024*1024)){
          stopped=true;stream.pause();reject(new Error("DOCUMENT_EXPANSION_LIMIT"));
        }
      });
      stream.on("error",reject);
      stream.on("end",()=>{if(!stopped)resolve()});
    });

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
    // EPUB reading order is defined by its package spine, not ZIP entry order.
    const container=zip.file("META-INF/container.xml");
    if(!container)throw new Error("EPUB_CONTAINER_MISSING");
    const containerXml=await container.async("string");
    const packagePath=containerXml.match(/full-path\s*=\s*["']([^"']+)["']/i)?.[1];
    const packageFile=packagePath&&zip.file(packagePath);
    if(!packageFile)throw new Error("EPUB_PACKAGE_MISSING");
    const packageXml=await packageFile.async("string");
    const manifest=new Map<string,string>();
    const attribute=(tag:string,name:string)=>tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`,"i"))?.[1];
    for(const tag of packageXml.match(/<item\s[^>]*>/gi)??[]){
      const id=attribute(tag,"id"),href=attribute(tag,"href");
      if(id&&href)manifest.set(id,href);
    }
    const base=packagePath!.includes("/")?packagePath!.slice(0,packagePath!.lastIndexOf("/")+1):"";
    const names=(packageXml.match(/<itemref\s[^>]*>/gi)??[]).flatMap(tag=>{
      if(attribute(tag,"linear")==="no")return[];
      const href=manifest.get(attribute(tag,"idref")??"");
      if(!href)return[];
      const path=new URL(href,`https://epub.invalid/${base}`);
      if(path.origin!=="https://epub.invalid")throw new Error("EPUB_EXTERNAL_CHAPTER");
      return[decodeURIComponent(path.pathname.slice(1))];
    });
    if(!names.length||names.length>300)throw new Error("EPUB_SPINE_INVALID");
    const parts:string[]=[];
    for(const name of names){
      const chapter=zip.file(name);
      if(!chapter)throw new Error("EPUB_CHAPTER_MISSING");
      const html=await chapter.async("string");
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
