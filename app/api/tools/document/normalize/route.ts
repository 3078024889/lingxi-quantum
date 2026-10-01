import{NextResponse}from"next/server";
export const runtime="nodejs";export const maxDuration=60;
const MAX_BYTES=20*1024*1024;
const ALLOWED=new Set(["doc","docx","ppt","pptx","xls","xlsx","odt","ods","odp"]);
function customUrl(){const raw=(process.env.LINGXIFIELD_DOCUMENT_CONVERTER_URL||"").trim();if(!raw)return null;try{const u=new URL(raw),local=["127.0.0.1","localhost","::1"].includes(u.hostname);return u.protocol==="https:"||local?u:null}catch{return null}}
async function custom(file:File,ext:string){
 const url=customUrl(),secret=(process.env.LINGXIFIELD_DOCUMENT_CONVERTER_SECRET||"").trim();if(!url||!secret)return null;
 const r=await fetch(new URL("/convert",url),{method:"POST",headers:{authorization:`Bearer ${secret}`,"content-type":"application/octet-stream","x-lingxifield-ext":ext},body:Buffer.from(await file.arrayBuffer()),cache:"no-store"});
 if(!r.ok)throw new Error("CUSTOM_CONVERSION_FAILED");return await r.arrayBuffer();
}
async function convertApi(file:File,ext:string){
 const token=(process.env.LINGXIFIELD_CONVERTAPI_TOKEN||process.env.CONVERTAPI_SECRET||"").trim();if(!token)return null;
 const fd=new FormData();fd.set("File",file,file.name);fd.set("StoreFile","false");
 const r=await fetch(`https://v2.convertapi.com/convert/${encodeURIComponent(ext)}/to/pdf`,{method:"POST",headers:{authorization:`Bearer ${token}`},body:fd,cache:"no-store"});
 if(!r.ok)throw new Error(`CONVERTAPI_${r.status}`);
 const d:any=await r.json(),f=Array.isArray(d?.Files)?d.Files[0]:null;
 if(f?.FileData)return Uint8Array.from(atob(String(f.FileData)),c=>c.charCodeAt(0)).buffer;
 if(f?.Url){const x=await fetch(String(f.Url),{cache:"no-store"});if(x.ok)return await x.arrayBuffer()}
 throw new Error("CONVERTAPI_EMPTY");
}
function validPdf(bytes:ArrayBuffer){return bytes.byteLength>=5&&[0x25,0x50,0x44,0x46,0x2d].every((v,i)=>new Uint8Array(bytes,0,5)[i]===v)}
export async function POST(request:Request){
 const form=await request.formData().catch(()=>null),file=form?.get("file");
 if(!(file instanceof File))return NextResponse.json({error:"FILE_REQUIRED"},{status:400});
 if(file.size<1||file.size>MAX_BYTES)return NextResponse.json({error:"FILE_SIZE_UNSUPPORTED"},{status:413});
 const ext=(file.name.split(".").pop()||"").toLowerCase();if(!ALLOWED.has(ext))return NextResponse.json({error:"DOCUMENT_TYPE_UNSUPPORTED"},{status:415});
 try{
  let bytes=await custom(file,ext);
  if(!bytes)bytes=await convertApi(file,ext);
  if(!bytes)return NextResponse.json({error:"DOCUMENT_CONVERSION_UNAVAILABLE"},{status:503});
  if(!validPdf(bytes))return NextResponse.json({error:"DOCUMENT_CONVERSION_INVALID"},{status:502});
  return new NextResponse(bytes,{headers:{"content-type":"application/pdf","cache-control":"private, no-store","x-content-type-options":"nosniff"}});
 }catch(e){console.error("[document normalize]",e instanceof Error?e.message:String(e));return NextResponse.json({error:"DOCUMENT_CONVERSION_FAILED"},{status:502})}
}
