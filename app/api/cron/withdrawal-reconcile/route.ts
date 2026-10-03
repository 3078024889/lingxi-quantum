import{NextResponse}from"next/server";
import{processMoneyWebhookInbox}from"@/lib/money/webhook-inbox";
import{reconcileDueWithdrawals}from"@/lib/money/reconcile-worker";
import{secureSecretEqual}from"@/lib/security/secret-equals";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=90;

function authorized(req:Request){
 const actual=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
 return secureSecretEqual(process.env.CRON_SECRET,actual);
}

export async function GET(req:Request){
 if(!authorized(req))return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
 try{
  const webhookEvents=await processMoneyWebhookInbox(30);
  const result=await reconcileDueWithdrawals(20);
  const completed=result.filter((x:any)=>x?.status==="completed").length;
  const failed=result.filter((x:any)=>x?.status==="failed").length;
  const pending=result.length-completed-failed;
  return NextResponse.json({
   ok:true,
   webhookEvents:{
    checked:webhookEvents.length,
    deadLetter:webhookEvents.filter((x:any)=>x?.status==="dead_letter").length,
    retried:webhookEvents.filter((x:any)=>x?.status==="retry").length,
   },
   withdrawals:{checked:result.length,completed,failed,pending},
  },{headers:{"Cache-Control":"no-store"}});
 }catch(error){
  console.error("[withdrawal reconcile cron]",error instanceof Error?error.message:"unknown");
  return NextResponse.json({ok:false,error:"RECONCILIATION_FAILED"},{status:500});
 }
}
