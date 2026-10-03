import{createAdminClient}from"@/lib/supabase/admin";
import{moneyProviderAdapters,safeProviderError}from"./provider-adapters";
import{requireProviderAdapter}from"./provider-adapter";
import{planReconciliation}from"./reconciliation";
import{classifyProviderException}from"./refund-error-policy";
import type{ProviderRefundRequest}from"./types";

type Row=Record<string,any>;

function orderTotalMinor(order:Row,currency:"CNY"|"USD"){
 return Math.round(Number(currency==="USD"?order.amount_usd:order.amount_rmb)*100);
}

async function recordObservation(admin:any,w:Row,o:any){
 const attempts=Number(w.provider_attempt_count||0)+1;
 await admin.from("balance_withdrawals").update({
  provider_status:o.providerStatus||null,
  provider_raw_status:String(o.rawStatus||"").slice(0,500),
  provider_refund_id:o.providerRefundId||w.provider_refund_id||null,
  last_provider_error_code:o.errorCode||null,
  failure_code:o.errorCode?"PROVIDER_CONFIRMATION_PENDING":null,
  provider_attempt_count:attempts,
  last_provider_checked_at:new Date().toISOString(),
  next_reconcile_at:new Date(Date.now()+Math.max(30,Number(o.retryAfterSeconds||300))*1000).toISOString(),
  updated_at:new Date().toISOString(),
 }).eq("id",w.id);
}

async function recordException(admin:any,w:Row,error:unknown){
 const decision=classifyProviderException(error);
 await admin.from("balance_withdrawals").update({
  failure_code:decision.failureCode,
  provider_status:decision.providerStatus,
  last_provider_error_code:safeProviderError(error),
  provider_attempt_count:Number(w.provider_attempt_count||0)+1,
  last_provider_checked_at:new Date().toISOString(),
  next_reconcile_at:new Date(Date.now()+decision.retryAfterSeconds*1000).toISOString(),
  updated_at:new Date().toISOString(),
 }).eq("id",w.id);
 return decision;
}

export async function reconcileWithdrawal(withdrawalId:string){
 const admin=createAdminClient();
 const {data:w,error:we}=await admin.from("balance_withdrawals").select("*").eq("id",withdrawalId).single();
 if(we||!w)throw new Error("WITHDRAWAL_NOT_FOUND");
 if(!["requested","processing"].includes(String(w.status)))return{ok:true,closed:true,status:w.status};

 const {data:order,error:oe}=await admin.from("orders").select("*").eq("id",w.order_id).single();
 if(oe||!order)throw new Error("ORDER_NOT_FOUND");
 if(String(order.provider)!==String(w.provider))throw new Error("ORDER_PROVIDER_MISMATCH");
 if(!order.provider_payment_id)throw new Error("ORDER_PROVIDER_PAYMENT_ID_MISSING");

 const currency=String(w.currency)==="USD"?"USD":"CNY";
 const providerCurrency=String(w.provider_currency||currency)==="USD"?"USD":"CNY";
 const request:ProviderRefundRequest&{providerRefundId?:string|null;orderTotalMinor:number}={
  withdrawalId:w.id,
  orderId:order.id,
  provider:String(w.provider),
  currency,
  amountMinor:Number(w.amount_minor),
  providerCurrency,
  providerAmountMinor:Number(w.provider_amount_minor||w.amount_minor),
  providerPaymentId:String(order.provider_payment_id),
  idempotencyKey:String(w.provider_request_key||`lf-refund-${w.id}`),
  providerRefundId:w.provider_refund_id||null,
  orderTotalMinor:orderTotalMinor(order,currency),
 };

 const adapter=requireProviderAdapter(request.provider,moneyProviderAdapters());
 try{
  const observation=request.providerRefundId
   ?await adapter.queryRefund(request)
   :await adapter.createRefund(request);
  await recordObservation(admin,w,observation);
  const decision=planReconciliation(observation);

  if(decision.kind==="complete"){
   const {data,error}=await admin.rpc("complete_balance_withdrawal",{
    p_withdrawal_id:w.id,
    p_provider_refund_id:decision.providerRefundId,
    p_provider_status:decision.providerStatus,
   });
   if(error)throw error;
   return{ok:true,status:"completed",result:data};
  }
  if(decision.kind==="release"){
   const {data,error}=await admin.rpc("release_balance_withdrawal",{
    p_withdrawal_id:w.id,
    p_failure_code:decision.failureCode,
    p_provider_status:decision.providerStatus,
   });
   if(error)throw error;
   return{ok:true,status:"failed",result:data};
  }
  return{ok:true,status:"pending",retryAfterSeconds:decision.afterSeconds};
 }catch(error){
  const decision=await recordException(admin,w,error);
  return{
   ok:false,
   status:"pending",
   error:safeProviderError(error),
   failureCode:decision.failureCode,
   operatorActionRequired:decision.operatorActionRequired,
   retryAfterSeconds:decision.retryAfterSeconds,
  };
 }
}

export async function reconcileDueWithdrawals(limit=20){
 const admin=createAdminClient();
 const bounded=Math.max(1,Math.min(Number(limit)||20,100));
 const {data,error}=await admin.rpc("money_claim_reconciliation_v52e",{
  p_limit:bounded,
  p_lease_seconds:300,
 });
 if(error)throw error;

 const rows=Array.isArray(data)?data:[];
 const results=[];
 for(const row of rows){
  const id=typeof row==="string"?row:String((row as any)?.id||"");
  if(!id)continue;
  results.push(await reconcileWithdrawal(id));
 }
 return results;
}
