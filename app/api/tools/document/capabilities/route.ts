import{NextResponse}from"next/server";
import{DOCUMENT_INPUT_FORMATS,documentConverterReadiness}from"@/lib/tools/document/converter";
export const runtime="nodejs";

async function gatewayReady(){
 const raw=(process.env.LINGXIFIELD_DOCUMENT_GATEWAY_PUBLIC_URL||"").trim();
 const secret=(process.env.LINGXIFIELD_DOCUMENT_GATEWAY_SECRET||"").trim();
 if(!raw||secret.length<32)return false;
 try{
  const u=new URL(raw);
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),1500);
  try{
   const r=await fetch(new URL("/health",u),{cache:"no-store",signal:controller.signal});
   return r.ok;
  }finally{clearTimeout(timer)}
 }catch{return false}
}

export async function GET(){
 const [readiness,gateway]=await Promise.all([documentConverterReadiness(),gatewayReady()]);
 return NextResponse.json({
  formats:DOCUMENT_INPUT_FORMATS,
  officeSupported:true,
  officeReady:gateway||readiness.ready,
  families:readiness.families,
  localPdf:true
 },{headers:{"cache-control":"no-store, max-age=0"}});
}
