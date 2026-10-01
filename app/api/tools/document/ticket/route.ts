import{createHmac,randomUUID}from"node:crypto";
import{NextResponse}from"next/server";
export const runtime="nodejs";

const MAX_DIRECT_BYTES=50*1024*1024;
const SAFE_VERCEL_BYTES=3_500_000;

function str(v?:string){return(v||"").trim()}
function sign(secret:string,payload:string){return createHmac("sha256",secret).update(payload).digest("base64url")}

export async function POST(req:Request){
 const body=await req.json().catch(()=>null) as null|{name?:string;size?:number;type?:string};
 const name=String(body?.name||"").slice(0,240);
 const size=Number(body?.size||0);
 const type=String(body?.type||"application/octet-stream").slice(0,160);
 if(!name||!Number.isFinite(size)||size<1||size>MAX_DIRECT_BYTES)return NextResponse.json({error:"DOCUMENT_SIZE_UNSUPPORTED"},{status:400});

 const gateway=str(process.env.LINGXIFIELD_DOCUMENT_GATEWAY_PUBLIC_URL);
 const secret=str(process.env.LINGXIFIELD_DOCUMENT_GATEWAY_SECRET);
 if(gateway&&secret){
  const exp=Math.floor(Date.now()/1000)+300;
  const nonce=randomUUID();
  const payload=[exp,nonce,size,name,type].join("\n");
  const token=sign(secret,payload);
  return NextResponse.json({mode:"direct",url:gateway.replace(/\/+$/,"")+"/convert",exp,nonce,token,maxBytes:MAX_DIRECT_BYTES},{headers:{"cache-control":"no-store"}});
 }

 const maxBytes=process.env.VERCEL?SAFE_VERCEL_BYTES:MAX_DIRECT_BYTES;
 return NextResponse.json({mode:"same-origin",maxBytes},{headers:{"cache-control":"no-store"}});
}
