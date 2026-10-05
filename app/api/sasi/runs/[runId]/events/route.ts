import{NextRequest}from"next/server";
import{createClient}from"@/lib/supabase/server";
import{encodeHeartbeat,encodeSse}from"@/lib/sasi/durable/public-event-codec";
import{assertRunOwner,listPublicRunEvents}from"@/lib/sasi/durable/public-event-store";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=30;

function cursor(req:NextRequest){
 const header=req.headers.get("last-event-id");
 const query=req.nextUrl.searchParams.get("after");
 const n=Number(header||query||0);
 return Number.isFinite(n)&&n>0?Math.floor(n):0;
}

export async function GET(req:NextRequest,ctx:{params:Promise<{runId:string}>}){
 const{runId}=await ctx.params;
 if(!/^[0-9a-f-]{36}$/i.test(runId))return new Response("Not found",{status:404});
 const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();
 if(!user)return new Response("Unauthorized",{status:401});
 const owned=await assertRunOwner(user.id,runId);
 if(!owned)return new Response("Not found",{status:404});

 const encoder=new TextEncoder();
 let after=cursor(req),closed=false;
 const stream=new ReadableStream<Uint8Array>({
  async start(controller){
   const send=(s:string)=>{if(!closed)controller.enqueue(encoder.encode(s))};
   send(`retry: 2500\n\n`);
   const deadline=Date.now()+24_000;
   let lastHeartbeat=0;
   try{
    while(!closed&&Date.now()<deadline){
     if(req.signal.aborted)break;
     const rows=await listPublicRunEvents({userId:user.id,runId,afterId:after,limit:50});
     for(const event of rows){send(encodeSse(event));after=Math.max(after,event.id)}
     if(Date.now()-lastHeartbeat>=8_000){send(encodeHeartbeat());lastHeartbeat=Date.now()}
     const state=String((await assertRunOwner(user.id,runId))?.state||"");
     if(["succeeded","failed","cancelled"].includes(state)&&rows.length===0)break;
     await new Promise(resolve=>setTimeout(resolve,900));
    }
   }catch{
    // Public stream intentionally hides internal provider/database details.
   }finally{
    closed=true;try{controller.close()}catch{}
   }
  },
  cancel(){closed=true}
 });
 return new Response(stream,{headers:{
  "Content-Type":"text/event-stream; charset=utf-8",
  "Cache-Control":"no-store, no-cache, must-revalidate",
  "Connection":"keep-alive",
  "X-Accel-Buffering":"no",
  "Content-Encoding":"identity"
 }});
}
