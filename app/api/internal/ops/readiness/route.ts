import{NextResponse}from"next/server";
import{createAdminClient}from"@/lib/supabase/admin";
import{secureSecretEqual}from"@/lib/security/secret-equals";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=20;

function authorized(req:Request){
 const actual=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
 return secureSecretEqual(process.env.MONEY_RECONCILE_SECRET,actual);
}

function intEnv(name:string,fallback:number){
 const n=Number(process.env[name]);
 return Number.isFinite(n)&&n>0?Math.floor(n):fallback;
}

export async function GET(req:Request){
 if(!authorized(req))return NextResponse.json({error:"UNAUTHORIZED"},{status:401});

 const admin=createAdminClient();
 const now=Date.now();
 const expectedMinutes=intEnv("MONEY_RECONCILE_EXPECTED_MINUTES",1440);
 const staleAfterMinutes=expectedMinutes+Math.max(60,Math.ceil(expectedMinutes*.1));
 const staleBefore=new Date(now-staleAfterMinutes*60_000).toISOString();
 const nowIso=new Date(now).toISOString();

 const[
  heartbeatResult,
  deadLetterResult,
  overdueResult,
  actionRequiredResult,
 ]=await Promise.all([
  admin.from("ops_runtime_heartbeats")
   .select("key,last_started_at,last_succeeded_at,last_failed_at,last_error,updated_at")
   .eq("key","money-reconcile")
   .maybeSingle(),
  admin.from("money_webhook_inbox")
   .select("id",{count:"exact",head:true})
   .eq("status","dead_letter"),
  admin.from("balance_withdrawals")
   .select("id",{count:"exact",head:true})
   .in("status",["requested","processing"])
   .lt("next_reconcile_at",nowIso),
  admin.from("balance_withdrawals")
   .select("id",{count:"exact",head:true})
   .in("status",["requested","processing"])
   .in("failure_code",["PROVIDER_ACTION_REQUIRED","PROVIDER_FUNDS_REQUIRED","OPERATOR_REVIEW_REQUIRED"]),
 ]);

 const queryFailed=[
  heartbeatResult.error,
  deadLetterResult.error,
  overdueResult.error,
  actionRequiredResult.error,
 ].some(Boolean);

 if(queryFailed){
  return NextResponse.json({
   ok:false,
   status:"unavailable",
   error:"READINESS_QUERY_FAILED",
  },{status:503,headers:{"Cache-Control":"no-store"}});
 }

 const hb=heartbeatResult.data;
 const lastSuccess=hb?.last_succeeded_at?Date.parse(hb.last_succeeded_at):NaN;
 const heartbeatMissing=!hb?.last_succeeded_at;
 const heartbeatStale=heartbeatMissing||!Number.isFinite(lastSuccess)||hb!.last_succeeded_at!<staleBefore;

 const deadLetter=deadLetterResult.count??0;
 const overdue=overdueResult.count??0;
 const actionRequired=actionRequiredResult.count??0;

 const status=heartbeatStale?"not_ready":(deadLetter>0||overdue>0||actionRequired>0)?"degraded":"ready";

 return NextResponse.json({
  ok:status!=="not_ready",
  status,
  checks:{
   moneyReconcileHeartbeat:{
    ok:!heartbeatStale,
    expectedMinutes,
    staleAfterMinutes,
    lastStartedAt:hb?.last_started_at??null,
    lastSucceededAt:hb?.last_succeeded_at??null,
    lastFailedAt:hb?.last_failed_at??null,
    lastError:hb?.last_error??null,
   },
   webhookDeadLetter:{ok:deadLetter===0,count:deadLetter},
   overdueWithdrawals:{ok:overdue===0,count:overdue},
   providerActionRequired:{ok:actionRequired===0,count:actionRequired},
  },
  build:{
   commit:(process.env.VERCEL_GIT_COMMIT_SHA||"").slice(0,12)||null,
   environment:process.env.VERCEL_ENV||process.env.NODE_ENV||null,
  },
  time:new Date().toISOString(),
 },{status:status==="not_ready"?503:200,headers:{"Cache-Control":"no-store"}});
}
