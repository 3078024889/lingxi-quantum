import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { executeProviderRefund } from "@/lib/payment-refunds";

export const runtime="nodejs";
export const maxDuration=30;

function isBalanceProduct(id:string){
  return id.startsWith("ai-balance-")
    || id.startsWith("sasi-balance-")
    || id.startsWith("sasi-credit-")
    || id.startsWith("ai-usd-balance-")
    || id.startsWith("sasi-usd-balance-");
}

export async function GET(){
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});

  const admin=createAdminClient();
  const [ordersResult,withdrawalsResult]=await Promise.all([
    admin.from("orders")
      .select("id,product_id,provider,amount_rmb,amount_usd,status,created_at")
      .eq("user_id",user.id)
      .eq("status","paid")
      .order("created_at",{ascending:false})
      .limit(100),
    admin.from("balance_withdrawals")
      .select("id,order_id,wallet_kind,provider,currency,amount_minor,status,provider_status,failure_code,created_at,completed_at")
      .eq("user_id",user.id)
      .order("created_at",{ascending:false})
      .limit(100),
  ]);
  if(ordersResult.error||withdrawalsResult.error){
    return NextResponse.json({error:"WITHDRAWAL_DATA_FAILED"},{status:500});
  }
  return NextResponse.json({
    orders:(ordersResult.data||[]).filter(o=>isBalanceProduct(String(o.product_id||""))),
    withdrawals:withdrawalsResult.data||[],
  },{headers:{"Cache-Control":"private, no-store, max-age=0"}});
}

export async function POST(req:NextRequest){
  if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});

  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});

  const body=await req.json().catch(()=>null) as {orderId?:unknown;amount?:unknown;note?:unknown}|null;
  const orderId=String(body?.orderId||"").trim();
  const amount=Number(body?.amount);
  if(!/^[0-9a-f-]{36}$/i.test(orderId)||!Number.isFinite(amount)||amount<=0){
    return NextResponse.json({error:"INVALID_WITHDRAWAL_REQUEST"},{status:400});
  }

  const admin=createAdminClient();
  const rate=await admin.rpc("rate_limit_check",{
    p_key:`balance-withdrawal:${user.id}`,
    p_limit:20,
    p_window_seconds:3600,
  });
  if(rate.error)return NextResponse.json({error:"RATE_GUARD_UNAVAILABLE"},{status:503});
  if(rate.data!==true)return NextResponse.json({error:"RATE_LIMITED"},{status:429});

  const {data:order,error:orderError}=await admin.from("orders")
    .select("id,user_id,product_id,provider,provider_payment_id,amount_rmb,amount_usd,status")
    .eq("id",orderId).eq("user_id",user.id).single();
  if(orderError||!order||order.status!=="paid"||!isBalanceProduct(String(order.product_id||""))){
    return NextResponse.json({error:"ORDER_NOT_REFUNDABLE"},{status:409});
  }

  const currency=order.provider==="paypal"?"USD":"CNY";
  const amountMinor=Math.round(amount*100);
  const orderAmountMinor=currency==="USD"
    ?Math.round(Number(order.amount_usd||0)*100)
    :Math.round(Number(order.amount_rmb||0)*100);
  if(amountMinor<=0||amountMinor>orderAmountMinor){
    return NextResponse.json({error:"INVALID_WITHDRAWAL_AMOUNT"},{status:400});
  }

  const requested=await admin.rpc("request_balance_withdrawal",{
    p_user_id:user.id,
    p_order_id:order.id,
    p_amount_minor:amountMinor,
    p_note:typeof body?.note==="string"?body.note.slice(0,500):null,
  });
  const requestData=requested.data as {ok?:boolean;error?:string;withdrawalId?:string;currency?:string}|null;
  if(requested.error||!requestData?.ok||!requestData.withdrawalId){
    return NextResponse.json({error:requestData?.error||"WITHDRAWAL_REQUEST_FAILED"},{status:409});
  }

  const withdrawalId=requestData.withdrawalId;
  const marked=await admin.from("balance_withdrawals")
    .update({status:"processing",processing_started_at:new Date().toISOString(),updated_at:new Date().toISOString()})
    .eq("id",withdrawalId).eq("user_id",user.id).eq("status","requested")
    .select("id").single();

  if(marked.error){
    await admin.rpc("release_balance_withdrawal",{
      p_withdrawal_id:withdrawalId,
      p_failure_code:"PROCESSING_STATE_FAILED",
      p_provider_status:null,
    });
    return NextResponse.json({error:"WITHDRAWAL_STATE_FAILED"},{status:500});
  }

  if(!order.provider_payment_id){
    await admin.rpc("release_balance_withdrawal",{
      p_withdrawal_id:withdrawalId,
      p_failure_code:"PROVIDER_PAYMENT_ID_MISSING",
      p_provider_status:null,
    });
    return NextResponse.json({error:"ORIGINAL_PAYMENT_REFERENCE_MISSING"},{status:409});
  }

  try{
    const attempt=await executeProviderRefund({
      provider:String(order.provider||""),
      providerPaymentId:String(order.provider_payment_id),
      localOrderId:order.id,
      withdrawalId,
      currency,
      orderAmountMinor,
      refundAmountMinor:amountMinor,
    });

    if(attempt.state==="completed"){
      const done=await admin.rpc("complete_balance_withdrawal",{
        p_withdrawal_id:withdrawalId,
        p_provider_refund_id:attempt.refundId||"",
        p_provider_status:attempt.providerStatus,
      });
      if(done.error||!(done.data as {ok?:boolean}|null)?.ok){
        return NextResponse.json({ok:true,status:"processing",withdrawalId},{status:202});
      }
      return NextResponse.json({ok:true,status:"completed",withdrawalId});
    }

    if(attempt.state==="failed"){
      await admin.rpc("release_balance_withdrawal",{
        p_withdrawal_id:withdrawalId,
        p_failure_code:"PROVIDER_REFUND_REJECTED",
        p_provider_status:attempt.providerStatus,
      });
      return NextResponse.json({error:"PROVIDER_REFUND_REJECTED",withdrawalId},{status:409});
    }

    await admin.from("balance_withdrawals").update({
      provider_refund_id:attempt.refundId,
      provider_status:attempt.providerStatus,
      updated_at:new Date().toISOString(),
    }).eq("id",withdrawalId);
    return NextResponse.json({ok:true,status:"processing",withdrawalId},{status:202});
  }catch(error){
    // Network timeout / unknown provider outcome must remain frozen and be reconciled.
    console.error("[balance withdrawal provider]",withdrawalId,error instanceof Error?error.message:String(error));
    return NextResponse.json({ok:true,status:"processing",withdrawalId},{status:202});
  }
}
