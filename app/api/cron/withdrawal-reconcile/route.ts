import crypto from"crypto";
import{NextResponse}from"next/server";
import{processMoneyWebhookInbox}from"@/lib/money/webhook-inbox";
import{reconcileDueWithdrawals}from"@/lib/money/reconcile-worker";
import{secureSecretEqual}from"@/lib/security/secret-equals";
import{markRuntimeFailed,markRuntimeStarted,markRuntimeSucceeded}from"@/lib/ops/runtime-heartbeat";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=90;

const HEARTBEAT_KEY="money-reconcile";

function authorized(req:Request){
 const actual=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
 return secureSecretEqual(process.env.CRON_SECRET,actual);
}

export async function GET(req:Request){
 if(!authorized(req))return NextResponse.json({error:"UNAUTHORIZED"},{status:401});

 const requestId=crypto.randomUUID();
 const started=Date.now();
 const schedule=req.headers.get("x-vercel-cron-schedule")||null;
 await markRuntimeStarted(HEARTBEAT_KEY,{requestId,schedule});

 try{
  const webhookEvents=await processMoneyWebhookInbox(30);
  const result=await reconcileDueWithdrawals(20);
  const completed=result.filter((x:any)=>x?.status==="completed").length;
  const failed=result.filter((x:any)=>x?.status==="failed").length;
  const pending=result.length-completed-failed;
  const durationMs=Date.now()-started;

  await markRuntimeSucceeded(HEARTBEAT_KEY,{
   requestId,schedule,durationMs,
   webhookChecked:webhookEvents.length,
   withdrawalChecked:result.length,
  });

  return NextResponse.json({
   ok:true,
   requestId,
   durationMs,
   webhookEvents:{
    checked:webhookEvents.length,
    deadLetter:webhookEvents.filter((x:any)=>x?.status==="dead_letter").length,
    retried:webhookEvents.filter((x:any)=>x?.status==="retry").length,
   },
   withdrawals:{checked:result.length,completed,failed,pending},
  },{headers:{"Cache-Control":"no-store"}});
 }catch(error){
  const durationMs=Date.now()-started;
  await markRuntimeFailed(HEARTBEAT_KEY,error,{requestId,schedule,durationMs});
  console.error("[withdrawal reconcile cron]",error instanceof Error?error.message:"unknown");
  return NextResponse.json({ok:false,requestId,error:"RECONCILIATION_FAILED"},{status:500});
 }
}
