import "server-only";

const COMMON_OFFICE_EXTENSIONS=[
 "doc","docx","docm","dot","dotm","dotx","odt","fodt","ott","rtf","txt",
 "xls","xlsx","xlsm","xlt","xltx","ods","csv","tsv",
 "ppt","pptx","pptm","pot","potx","odp"
] as const;

export const DOCUMENT_INPUT_EXTENSIONS=["pdf",...COMMON_OFFICE_EXTENSIONS] as const;
export const DOCUMENT_INPUT_FORMATS=[...DOCUMENT_INPUT_EXTENSIONS];

const MAX_INPUT_BYTES=50*1024*1024;
const MAX_PDF_BYTES=100*1024*1024;
async function limitedBody(response:Response,maxBytes=MAX_PDF_BYTES):Promise<ArrayBuffer>{
 if(Number(response.headers.get("content-length"))>maxBytes){await response.body?.cancel();throw new Error("DOCUMENT_SIZE_UNSUPPORTED")}
 if(!response.body)throw new Error("DOCUMENT_CONVERSION_EMPTY");
 const reader=response.body.getReader(),chunks:Uint8Array[]=[];let total=0;
 try{
  while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>maxBytes){await reader.cancel();throw new Error("DOCUMENT_SIZE_UNSUPPORTED")}chunks.push(value)}
  const result=new Uint8Array(total);let offset=0;for(const chunk of chunks){result.set(chunk,offset);offset+=chunk.byteLength}return result.buffer;
 }finally{reader.releaseLock()}
}
type Provider="gotenberg"|"custom"|"convertapi";
function trim(v?:string){return(v||"").trim()}
function extOf(name:string){return(name.split(".").pop()||"").toLowerCase()}
export function isOfficeInputName(name:string){return COMMON_OFFICE_EXTENSIONS.includes(extOf(name) as any)}
export function documentInputSupported(name:string){return DOCUMENT_INPUT_EXTENSIONS.includes(extOf(name) as any)}

function validPdf(bytes:ArrayBuffer){
 const b=new Uint8Array(bytes);
 return b.length>=5&&b[0]===0x25&&b[1]===0x50&&b[2]===0x44&&b[3]===0x46&&b[4]===0x2d;
}
function gotenbergBase(){
 const raw=trim(process.env.LINGXIFIELD_GOTENBERG_URL);
 if(!raw)return null;
 try{const u=new URL(raw);return["http:","https:"].includes(u.protocol)?u:null}catch{return null}
}
function gotenbergHeaders():Headers{
 const headers=new Headers();
 const user=trim(process.env.LINGXIFIELD_GOTENBERG_BASIC_USER);
 const pass=trim(process.env.LINGXIFIELD_GOTENBERG_BASIC_PASSWORD);
 if(user&&pass)headers.set("authorization",`Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`);
 else{
  const token=trim(process.env.LINGXIFIELD_GOTENBERG_BEARER_TOKEN);
  if(token)headers.set("authorization",`Bearer ${token}`);
 }
 return headers;
}
async function probeGotenberg(signal?:AbortSignal){
 const base=gotenbergBase();if(!base)return false;
 try{
  const r=await fetch(new URL("/health",base),{method:"HEAD",headers:gotenbergHeaders(),cache:"no-store",signal});
  return r.ok;
 }catch{return false}
}
export async function documentConverterReadiness(){
 const custom=Boolean(trim(process.env.LINGXIFIELD_DOCUMENT_CONVERTER_URL)&&trim(process.env.LINGXIFIELD_DOCUMENT_CONVERTER_SECRET));
 const convertApi=Boolean(trim(process.env.LINGXIFIELD_CONVERTAPI_TOKEN)||trim(process.env.CONVERTAPI_SECRET));
 let gotenberg=false;
 if(gotenbergBase()){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),1500);
  try{gotenberg=await probeGotenberg(controller.signal)}finally{clearTimeout(timer)}
 }
 return{ready:gotenberg||custom||convertApi,formats:DOCUMENT_INPUT_FORMATS,families:["PDF","Word","PowerPoint","Excel","OpenDocument"],localPdf:true};
}
async function viaGotenberg(file:File,signal:AbortSignal){
 const base=gotenbergBase();if(!base)return null;
 const fd=new FormData();fd.set("files",file,file.name);
 const url=new URL("/forms/libreoffice/convert",base);
 let last:Error|null=null;
 for(let attempt=1;attempt<=2;attempt++){
  try{
   const r=await fetch(url,{method:"POST",headers:gotenbergHeaders(),body:fd,cache:"no-store",redirect:"error",signal});
   if(r.ok)return await limitedBody(r);
   const body=new TextDecoder().decode(await limitedBody(r,64*1024)).slice(0,500);
   if(r.status===400)throw new Error(`DOCUMENT_INPUT_INVALID:${body||"400"}`);
   last=new Error(`DOCUMENT_CONVERTER_${r.status}`);
   if(![500,503].includes(r.status))throw last;
  }catch(e){last=e instanceof Error?e:new Error(String(e));if(last.message.startsWith("DOCUMENT_INPUT_INVALID")||last.message==="DOCUMENT_SIZE_UNSUPPORTED")throw last;}
  if(signal.aborted)throw new Error("DOCUMENT_CONVERSION_TIMEOUT");
  if(attempt<2)await new Promise(r=>setTimeout(r,250));
 }
 if(last)throw last;
 return null;
}
function customBase(){
 const raw=trim(process.env.LINGXIFIELD_DOCUMENT_CONVERTER_URL);if(!raw)return null;
 try{const u=new URL(raw);return["http:","https:"].includes(u.protocol)?u:null}catch{return null}
}
async function viaCustom(file:File,ext:string,signal:AbortSignal){
 const base=customBase(),secret=trim(process.env.LINGXIFIELD_DOCUMENT_CONVERTER_SECRET);
 if(!base||!secret)return null;
 const r=await fetch(new URL("/convert",base),{method:"POST",headers:{authorization:`Bearer ${secret}`,"content-type":"application/octet-stream","x-lingxifield-ext":ext},body:Buffer.from(await file.arrayBuffer()),cache:"no-store",redirect:"error",signal});
 if(!r.ok)throw new Error(`DOCUMENT_CONVERTER_${r.status}`);
 return await limitedBody(r);
}
async function viaConvertApi(file:File,ext:string,signal:AbortSignal){
 const token=trim(process.env.LINGXIFIELD_CONVERTAPI_TOKEN)||trim(process.env.CONVERTAPI_SECRET);
 if(!token)return null;
 const fd=new FormData();fd.set("File",file,file.name);fd.set("StoreFile","false");
 const r=await fetch(`https://v2.convertapi.com/convert/${encodeURIComponent(ext)}/to/pdf`,{method:"POST",headers:{authorization:`Bearer ${token}`},body:fd,cache:"no-store",redirect:"error",signal});
 if(!r.ok)throw new Error(`DOCUMENT_CONVERTER_${r.status}`);
 const d:any=JSON.parse(new TextDecoder().decode(await limitedBody(r,Math.ceil(MAX_PDF_BYTES/3)*4+1024*1024))),f=Array.isArray(d?.Files)?d.Files[0]:null;
 if(f?.FileData){const encoded=String(f.FileData);if(encoded.length>Math.ceil(MAX_PDF_BYTES/3)*4)throw new Error("DOCUMENT_SIZE_UNSUPPORTED");return Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)).buffer;}
 if(f?.Url){const url=new URL(String(f.Url));if(url.protocol!=="https:"||url.hostname!=="v2.convertapi.com"||url.username||url.password||(url.port&&url.port!=="443"))throw new Error("DOCUMENT_CONVERSION_INVALID");const x=await fetch(url,{cache:"no-store",redirect:"error",signal});if(x.ok)return await limitedBody(x)}
 throw new Error("DOCUMENT_CONVERSION_EMPTY");
}
export async function convertDocumentToPdf(file:File){
 if(file.size<1||file.size>MAX_INPUT_BYTES)throw new Error("DOCUMENT_SIZE_UNSUPPORTED");
 const ext=extOf(file.name);
 if(ext==="pdf"||file.type==="application/pdf")return await file.arrayBuffer();
 if(!COMMON_OFFICE_EXTENSIONS.includes(ext as any))throw new Error("DOCUMENT_TYPE_UNSUPPORTED");
 const providers:Provider[]=["gotenberg","custom","convertapi"];
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),45_000);
 try{
 let last:Error|null=null;
 for(const provider of providers){
  try{
   if(controller.signal.aborted)throw new Error("DOCUMENT_CONVERSION_TIMEOUT");
   const bytes=provider==="gotenberg"?await viaGotenberg(file,controller.signal):provider==="custom"?await viaCustom(file,ext,controller.signal):await viaConvertApi(file,ext,controller.signal);
   if(!bytes)continue;
   if(!validPdf(bytes))throw new Error("DOCUMENT_CONVERSION_INVALID");
   return bytes;
  }catch(e){
   last=e instanceof Error?e:new Error(String(e));
   if(controller.signal.aborted)throw new Error("DOCUMENT_CONVERSION_TIMEOUT");
   if(last.message.startsWith("DOCUMENT_INPUT_INVALID")||last.message==="DOCUMENT_SIZE_UNSUPPORTED")throw last;
  }
 }
 if(last)throw last;
 throw new Error("DOCUMENT_CONVERSION_UNAVAILABLE");
 }finally{clearTimeout(timer)}
}
