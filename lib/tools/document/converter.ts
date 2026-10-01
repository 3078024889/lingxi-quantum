import "server-only";

const COMMON_OFFICE_EXTENSIONS=[
 "doc","docx","docm","dot","dotm","dotx","odt","fodt","ott","rtf","txt",
 "xls","xlsx","xlsm","xlt","xltx","ods","csv","tsv",
 "ppt","pptx","pptm","pot","potx","odp"
] as const;

export const DOCUMENT_INPUT_EXTENSIONS=["pdf",...COMMON_OFFICE_EXTENSIONS] as const;
export const DOCUMENT_INPUT_FORMATS=[...DOCUMENT_INPUT_EXTENSIONS];

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
async function viaGotenberg(file:File){
 const base=gotenbergBase();if(!base)return null;
 const fd=new FormData();fd.set("files",file,file.name);
 const url=new URL("/forms/libreoffice/convert",base);
 let last:Error|null=null;
 for(let attempt=1;attempt<=2;attempt++){
  try{
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),55_000);
   let r:Response;
   try{r=await fetch(url,{method:"POST",headers:gotenbergHeaders(),body:fd,cache:"no-store",signal:controller.signal})}
   finally{clearTimeout(timer)}
   if(r.ok)return await r.arrayBuffer();
   const body=(await r.text().catch(()=>"")).slice(0,500);
   if(r.status===400)throw new Error(`DOCUMENT_INPUT_INVALID:${body||"400"}`);
   last=new Error(`DOCUMENT_CONVERTER_${r.status}`);
   if(![500,503].includes(r.status))throw last;
  }catch(e){last=e instanceof Error?e:new Error(String(e))}
  if(attempt<2)await new Promise(r=>setTimeout(r,250));
 }
 if(last)throw last;
 return null;
}
function customBase(){
 const raw=trim(process.env.LINGXIFIELD_DOCUMENT_CONVERTER_URL);if(!raw)return null;
 try{const u=new URL(raw);return["http:","https:"].includes(u.protocol)?u:null}catch{return null}
}
async function viaCustom(file:File,ext:string){
 const base=customBase(),secret=trim(process.env.LINGXIFIELD_DOCUMENT_CONVERTER_SECRET);
 if(!base||!secret)return null;
 const r=await fetch(new URL("/convert",base),{method:"POST",headers:{authorization:`Bearer ${secret}`,"content-type":"application/octet-stream","x-lingxifield-ext":ext},body:Buffer.from(await file.arrayBuffer()),cache:"no-store"});
 if(!r.ok)throw new Error(`DOCUMENT_CONVERTER_${r.status}`);
 return await r.arrayBuffer();
}
async function viaConvertApi(file:File,ext:string){
 const token=trim(process.env.LINGXIFIELD_CONVERTAPI_TOKEN)||trim(process.env.CONVERTAPI_SECRET);
 if(!token)return null;
 const fd=new FormData();fd.set("File",file,file.name);fd.set("StoreFile","false");
 const r=await fetch(`https://v2.convertapi.com/convert/${encodeURIComponent(ext)}/to/pdf`,{method:"POST",headers:{authorization:`Bearer ${token}`},body:fd,cache:"no-store"});
 if(!r.ok)throw new Error(`DOCUMENT_CONVERTER_${r.status}`);
 const d:any=await r.json(),f=Array.isArray(d?.Files)?d.Files[0]:null;
 if(f?.FileData)return Uint8Array.from(atob(String(f.FileData)),c=>c.charCodeAt(0)).buffer;
 if(f?.Url){const x=await fetch(String(f.Url),{cache:"no-store"});if(x.ok)return await x.arrayBuffer()}
 throw new Error("DOCUMENT_CONVERSION_EMPTY");
}
export async function convertDocumentToPdf(file:File){
 const ext=extOf(file.name);
 if(ext==="pdf"||file.type==="application/pdf")return await file.arrayBuffer();
 if(!COMMON_OFFICE_EXTENSIONS.includes(ext as any))throw new Error("DOCUMENT_TYPE_UNSUPPORTED");
 const providers:Provider[]=["gotenberg","custom","convertapi"];
 let last:Error|null=null;
 for(const provider of providers){
  try{
   const bytes=provider==="gotenberg"?await viaGotenberg(file):provider==="custom"?await viaCustom(file,ext):await viaConvertApi(file,ext);
   if(!bytes)continue;
   if(!validPdf(bytes))throw new Error("DOCUMENT_CONVERSION_INVALID");
   return bytes;
  }catch(e){
   last=e instanceof Error?e:new Error(String(e));
   if(last.message.startsWith("DOCUMENT_INPUT_INVALID"))throw last;
  }
 }
 if(last)throw last;
 throw new Error("DOCUMENT_CONVERSION_UNAVAILABLE");
}
