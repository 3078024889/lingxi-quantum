import{NextRequest,NextResponse}from"next/server";
import{timingSafeEqual}from"node:crypto";
import{runOneDetachedJob}from"@/lib/sasi/durable/detached-worker";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=60;

function safeEqual(a:string,b:string){
 const aa=Buffer.from(a),bb=Buffer.from(b);
 return aa.length===bb.length&&timingSafeEqual(aa,bb);
}
function authorized(req:NextRequest){
 const secret=String(process.env.SASI_WORKER_SECRET||"");
 if(secret.length<24)return false;
 const header=String(req.headers.get("authorization")||"");
 return safeEqual(header,`Bearer ${secret}`);
}

export async function POST(req:NextRequest){
 if(!authorized(req))return NextResponse.json({error:"NOT_FOUND"},{status:404});
 try{
  const result=await runOneDetachedJob();
  return NextResponse.json(result,{headers:{"Cache-Control":"no-store"}});
 }catch{
  return NextResponse.json({error:"WORKER_TICK_FAILED"},{status:503,headers:{"Cache-Control":"no-store","Retry-After":"5"}});
 }
}
