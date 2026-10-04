import{createHmac,randomUUID}from"node:crypto";
import{NextResponse}from"next/server";
export const runtime="nodejs";

const MAX_DIRECT_BYTES=50*1024*1024;
const SAFE_VERCEL_BYTES=3_500_000;
const OFFICE_EXTENSIONS=new Set([
 "doc","docx","docm","dot","dotm","dotx","odt","fodt","ott","rtf","txt",
 "xls","xlsx","xlsm","xlt","xltx","ods","csv","tsv",
 "ppt","pptx","pptm","pot","potx","odp"
]);

function str(v?:string){return(v||"").trim()}
function extOf(name:string){return(name.split(".").pop()||"").toLowerCase()}
function sign(secret:string,payload:string){return createHmac("sha256",secret).update(payload).digest("base64url")}
function safeGateway(raw:string){
 try{
  const u=new URL(raw);
  const local=["127.0.0.1","localhost","::1"].includes(u.hostname);
  if(u.protocol!=="https:"&&!local)return"";
  u.username="";u.password="";u.hash="";u.search="";
  return u.toString().replace(/\/+$/,"");
 }catch{return""}
}

export async function POST(req:Request){
 const body=await req.json().catch(()=>null) as null|{name?:string;size?:number;type?:string};
 const name=String(body?.name||"").slice(0,240);
 const size=Number(body?.size||0);
 const type=String(body?.type||"application/octet-stream").slice(0,160);
 const ext=extOf(name);
 if(!name||!OFFICE_EXTENSIONS.has(ext))return NextResponse.json({error:"DOCUMENT_TYPE_UNSUPPORTED"},{status:415});
 if(!Number.isSafeInteger(size)||size<1||size>MAX_DIRECT_BYTES)return NextResponse.json({error:"DOCUMENT_SIZE_UNSUPPORTED"},{status:413});

 const gateway=safeGateway(str(process.env.LINGXIFIELD_DOCUMENT_GATEWAY_PUBLIC_URL));
 const secret=str(process.env.LINGXIFIELD_DOCUMENT_GATEWAY_SECRET);
 if(gateway&&secret.length>=32){
  const exp=Math.floor(Date.now()/1000)+300;
  const nonce=randomUUID();
  const version="v1";
  const payload=[version,exp,nonce,size,name,type].join("\n");
  const token=sign(secret,payload);
  return NextResponse.json({mode:"direct",version,url:gateway+"/convert",exp,nonce,token,maxBytes:MAX_DIRECT_BYTES},{headers:{"cache-control":"no-store, max-age=0"}});
 }

 const maxBytes=process.env.VERCEL?SAFE_VERCEL_BYTES:MAX_DIRECT_BYTES;
 return NextResponse.json({mode:"same-origin",maxBytes},{headers:{"cache-control":"no-store, max-age=0"}});
}
