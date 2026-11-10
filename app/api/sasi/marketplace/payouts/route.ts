import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
export const runtime="nodejs";export const dynamic="force-dynamic";
const h={"Cache-Control":"private,no-store","X-Content-Type-Options":"nosniff"} as const;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function GET(){
 const db=createClient(),{data:{user}}=await db.auth.getUser();
 if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401,headers:h});
 try{
  const [sales,payouts,seller,snapshot]=await Promise.all([
   db.from("sasi_market_sales").select("order_id,currency,gross_minor,platform_fee_minor,seller_net_minor,status,available_at,created_at")
      .eq("seller_id",user.id).order("created_at",{ascending:false}).limit(151),
   db.from("sasi_market_payouts").select("id,currency,amount_minor,status,requested_at,submission_target_at,submitted_at,completed_at")
      .eq("seller_id",user.id).order("requested_at",{ascending:false}).limit(151),
   db.from("sasi_market_sellers").select("status,kyc_status,payout_provider").eq("user_id",user.id).maybeSingle(),
   db.rpc("sasi_market_seller_balance_snapshot")
  ]);
  if(sales.error||payouts.error||seller.error||snapshot.error||snapshot.data?.ok!==true)
    throw Error("REPORT_NOT_READY");
  const salesRows=sales.data||[];
  const payoutRows=payouts.data||[];
  const salesTruncated=salesRows.length>150;
  const payoutsTruncated=payoutRows.length>150;
  return NextResponse.json({
    balances:snapshot.data.balances,
    sales:salesRows.slice(0,150),
    payouts:payoutRows.slice(0,150),
    seller:seller.data,
    payoutsOpen:process.env.SASI_MARKET_PAYOUTS_ENABLED==="true",
    submissionTargetMinutes:15,
    providerArrivalGuaranteed:false,
    reportTruncated:salesTruncated||payoutsTruncated,
    history:{salesTruncated,payoutsTruncated,pageSize:150}
  },{headers:h});
 }catch{return NextResponse.json({error:"MARKET_BALANCE_NOT_READY"},{status:503,headers:h});}
}
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_ORIGIN"},{status:403,headers:h});
 if(process.env.SASI_MARKET_PAYOUTS_ENABLED!=="true")
  return NextResponse.json({error:"PAYOUT_PROVIDER_NOT_VERIFIED"},{status:503,headers:h});
 const db=createClient(),{data:{user}}=await db.auth.getUser();
 if(!user?.email_confirmed_at)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401,headers:h});
 const guard=await enforceAbuseGuard(req,{scope:"sasi-market-payout",userId:user.id,accountLimit:8,ipLimit:20});
 if(!guard.ok)return NextResponse.json({error:guard.error},{status:guard.status,headers:h});
 const b=await req.json().catch(()=>null);
 if(!Number.isSafeInteger(b?.amountMinor)||b.amountMinor<1||
 !["CNY","USD"].includes(b?.currency)||!UUID.test(String(b?.idempotencyKey||"")))
 return NextResponse.json({error:"INVALID_PAYOUT"},{status:400,headers:h});
 const {data,error}=await db.rpc("sasi_market_request_payout",{
  p_amount_minor:b.amountMinor,p_currency:b.currency,p_request_key:b.idempotencyKey
 });
 if(error)return NextResponse.json({error:"PAYOUT_REQUEST_NOT_READY"},{status:503,headers:h});
 if(!data?.ok)return NextResponse.json({error:data?.error||"PAYOUT_NOT_APPROVED"},{status:409,headers:h});
 // Provider transfer happens asynchronously via a separately verified worker;
 // "requested" NEVER means "paid" or "sent to bank".
 return NextResponse.json({id:data.id,status:data.status,submissionTargetMinutes:15,
  providerArrivalGuaranteed:false},{status:202,headers:h});
}
