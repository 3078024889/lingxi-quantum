import{NextResponse}from"next/server";
import{reconcileDueWithdrawals,reconcileWithdrawal}from"@/lib/money/reconcile-worker";
import{createAdminClient}from"@/lib/supabase/admin";
import{secureSecretEqual}from"@/lib/security/secret-equals";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=60;

function authorized(req:Request){
 const actual=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
 return secureSecretEqual(process.env.MONEY_RECONCILE_SECRET,actual);
}

export async function GET(req:Request){
 if(!authorized(req))return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
 const url=new URL(req.url);
 const id=url.searchParams.get("withdrawalId")||"";
 if(!id)return NextResponse.json({error:"WITHDRAWAL_ID_REQUIRED"},{status:400});
 const admin=createAdminClient();
 const{data,error}=await admin.from("balance_withdrawals")
  .select("id,provider,currency,provider_currency,amount_minor,provider_amount_minor,status,failure_code,provider_status,provider_refund_id,provider_attempt_count,last_provider_checked_at,next_reconcile_at,created_at,updated_at")
  .eq("id",id).maybeSingle();
 if(error)return NextResponse.json({error:"QUERY_FAILED"},{status:503});
 if(!data)return NextResponse.json({error:"WITHDRAWAL_NOT_FOUND"},{status:404});
 return NextResponse.json({ok:true,withdrawal:data},{headers:{"Cache-Control":"no-store"}});
}

export async function POST(req:Request){
 if(!authorized(req))return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
 const body=await req.json().catch(()=>({}));
 if(body.confirm!==true)return NextResponse.json({error:"CONFIRM_REQUIRED"},{status:409});
 const withdrawalId=typeof body.withdrawalId==="string"?body.withdrawalId:"";
 try{
  const result=withdrawalId
   ?await reconcileWithdrawal(withdrawalId)
   :await reconcileDueWithdrawals(Number(body.limit)||20);
  return NextResponse.json({ok:true,result},{headers:{"Cache-Control":"no-store"}});
 }catch(error){
  console.error("[money reconcile]",error instanceof Error?error.message:"unknown");
  return NextResponse.json({ok:false,error:"RECONCILIATION_FAILED"},{status:500});
 }
}
