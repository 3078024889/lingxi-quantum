import{NextResponse}from"next/server";
import{createAdminClient}from"@/lib/supabase/admin";
import{secureSecretEqual}from"@/lib/security/secret-equals";

export const runtime="nodejs";
export const dynamic="force-dynamic";

function authorized(req:Request){
 const actual=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
 return secureSecretEqual(process.env.MONEY_RECONCILE_SECRET,actual);
}

export async function GET(req:Request){
 if(!authorized(req))return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
 const admin=createAdminClient();
 const[{data:rows,error},{data:events,error:eventError}]=await Promise.all([
  admin.from("balance_withdrawals")
   .select("id,provider,currency,provider_currency,amount_minor,provider_amount_minor,status,failure_code,provider_status,provider_attempt_count,last_provider_checked_at,next_reconcile_at,created_at,updated_at")
   .order("updated_at",{ascending:false}).limit(100),
  admin.from("money_webhook_inbox")
   .select("id,provider,event_type,object_key,status,attempt_count,available_at,locked_until,last_error,created_at,updated_at")
   .in("status",["received","processing","dead_letter"])
   .order("updated_at",{ascending:false}).limit(100),
 ]);
 if(error||eventError)return NextResponse.json({error:"QUERY_FAILED"},{status:503});

 const withdrawals=rows??[];
 const active=withdrawals.filter((x:any)=>["requested","processing"].includes(String(x.status)));
 const inbox=events??[];
 const counts={
  active:active.length,
  providerActionRequired:active.filter((x:any)=>["PROVIDER_ACTION_REQUIRED","PROVIDER_FUNDS_REQUIRED","OPERATOR_REVIEW_REQUIRED"].includes(String(x.failure_code))).length,
  retrying:active.filter((x:any)=>["PROVIDER_RETRY_PENDING","PROVIDER_CONFIRMATION_PENDING"].includes(String(x.failure_code))).length,
  completed:withdrawals.filter((x:any)=>x.status==="completed").length,
  failed:withdrawals.filter((x:any)=>["failed","rejected"].includes(String(x.status))).length,
  webhookPending:inbox.filter((x:any)=>["received","processing"].includes(String(x.status))).length,
  webhookDeadLetter:inbox.filter((x:any)=>x.status==="dead_letter").length,
 };
 return NextResponse.json({ok:true,counts,active,webhookInbox:inbox},{headers:{"Cache-Control":"no-store"}});
}
