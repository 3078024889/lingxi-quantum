import type{ToolResultFile}from"@/lib/tools/types";

export type ContinueTarget={slug:string;reasonZh:string;reasonEn:string};

function ext(name:string){const i=name.lastIndexOf(".");return i>=0?name.slice(i).toLowerCase():""}
function kinds(files:ToolResultFile[]){
 const set=new Set<string>();
 for(const f of files){
  const mime=(f.mime||f.blob.type||"").toLowerCase(),e=ext(f.name);
  if(mime==="application/pdf"||e===".pdf")set.add("pdf");
  else if(mime.startsWith("image/")||[".jpg",".jpeg",".png",".webp",".heic",".heif",".avif"].includes(e))set.add("image");
  else if(mime.includes("spreadsheetml")||e===".xlsx")set.add("xlsx");
  else if(mime==="text/csv"||e===".csv"||e===".tsv")set.add("csv");
  else if(mime.startsWith("text/")||[".txt",".srt",".vtt"].includes(e))set.add("text");
 }
 return set;
}

const DEDUPE=(xs:ContinueTarget[])=>Array.from(new Map(xs.map(x=>[x.slug,x])).values());

export function continueTargets(sourceSlug:string,files:ToolResultFile[]):ContinueTarget[]{
 const k=kinds(files),out:ContinueTarget[]=[];
 if(k.has("pdf")){
  out.push(
   {slug:"compress-pdf",reasonZh:"继续缩小 PDF 体积",reasonEn:"Reduce the PDF size"},
   {slug:"split-pdf",reasonZh:"继续按页拆分",reasonEn:"Split into pages"},
   {slug:"pdf-to-jpg",reasonZh:"继续导出为图片",reasonEn:"Export pages as images"}
  );
 }
 if(k.has("image")){
  out.push(
   {slug:"compress-image",reasonZh:"继续压缩图片",reasonEn:"Compress the image"},
   {slug:"resize-image",reasonZh:"继续修改尺寸",reasonEn:"Resize the image"},
   {slug:"remove-exif",reasonZh:"继续清除隐私信息",reasonEn:"Remove image metadata"},
   {slug:"image-to-pdf",reasonZh:"继续生成 PDF",reasonEn:"Turn images into PDF"}
  );
 }
 if(k.has("xlsx"))out.push({slug:"xlsx-to-csv",reasonZh:"继续转成 CSV",reasonEn:"Continue to CSV"});
 if(k.has("csv"))out.push({slug:"csv-to-xlsx",reasonZh:"继续转成 Excel",reasonEn:"Continue to Excel"});
 return DEDUPE(out).filter(x=>x.slug!==sourceSlug).slice(0,4);
}
