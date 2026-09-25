import {NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {executeProviderRefund} from "@/lib/payment-refunds";

export const runtime="nodejs";
export const maxDuration=60;

export async function GET(req:Request){
  const secret=process.env.CRON_SECRET?.trim();
  if(!secret||req.headers.get("authorization")!==`Bearer ${secret}`)return NextResponse.json({error:"UNAUTHORIZED"},{status:401});

  const admin=createAdminClient();
  const {data:rows,error}=await admin.from("balance_withdrawals")
    .select("id,user_id,order_id,provider,currency,provider_currency,amount_minor,provider_amount_minor,status")
    .eq("status","processing").order("updated_at",{ascending:true}).limit(25);
  if(error)return NextResponse.json({error:"QUERY_FAILED"},{status:500});

  let completed=0,failed=0,pending=0;
  for(const w of rows||[]){
    const {data:order}=await admin.from("orders")
      .select("id,provider,provider_payment_id,amount_rmb,amount_usd")
      .eq("id",w.order_id).single();
    if(!order?.provider_payment_id){pending++;continue}

    const providerCurrency=String(w.provider_currency||w.currency);
    const providerAmount=Number(w.provider_amount_minor||w.amount_minor);
    const providerOrderTotal=providerCurrency==="USD"
      ?Math.round(Number(order.amount_usd||0)*100)
      :Math.round(Number(order.amount_rmb||0)*100);

    try{
      const attempt=await executeProviderRefund({
        provider:String(w.provider),
        providerPaymentId:String(order.provider_payment_id),
        localOrderId:order.id,
        withdrawalId:w.id,
        currency:providerCurrency,
        orderAmountMinor:providerOrderTotal,
        refundAmountMinor:providerAmount,
      });
      if(attempt.state==="completed"){
        const done=await admin.rpc("complete_balance_withdrawal",{p_withdrawal_id:w.id,p_provider_refund_id:attempt.refundId||"",p_provider_status:attempt.providerStatus});
        if(!done.error&&(done.data as {ok?:boolean}|null)?.ok)completed++;else pending++;
      }else if(attempt.state==="failed"){
        const released=await admin.rpc("release_balance_withdrawal",{p_withdrawal_id:w.id,p_failure_code:"PROVIDER_REFUND_REJECTED",p_provider_status:attempt.providerStatus});
        if(!released.error)failed++;else pending++;
      }else{
        await admin.from("balance_withdrawals").update({provider_refund_id:attempt.refundId,provider_status:attempt.providerStatus,updated_at:new Date().toISOString()}).eq("id",w.id);
        pending++;
      }
    }catch(error){
      console.error("[withdrawal reconcile]",w.id,error instanceof Error?error.message:String(error));
      pending++;
    }
  }
  return NextResponse.json({ok:true,checked:(rows||[]).length,completed,failed,pending});
}
