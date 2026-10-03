import{scheduleMoneyNotices,flushMoneyNotifications}from"./operator-notifications";
import{createAdminClient}from"@/lib/supabase/admin";
import{moneyProviderAdapters,safeProviderError}from"./provider-adapters";
import{requireProviderAdapter}from"./provider-adapter";
import{planReconciliation}from"./reconciliation";
import{classifyProviderException}from"./refund-error-policy";
import{retryWithJitter}from"./retry-policy";
import type{ProviderRefundObservation,ProviderRefundRequest}from"./types";

type Row=Record<string,any>;
const OPERATOR_ATTEMPT_THRESHOLD=12;

function providerOrderTotalMinor(order:Row,providerCurrency:"CNY"|"USD"){
 const raw=providerCurrency==="USD"?order.amount_usd:order.amount_rmb;
 const value=Math.round(Number(raw)*100);
 if(!Number.isSafeInteger(value)||value<=0)throw new Error("PROVIDER_ORDER_TOTAL_INVALID");
 return value;
}

function observationFailureCode(o:ProviderRefundObservation,attempts:number){
 const error=String(o.errorCode||"");
 if(error==="ALIPAY_ACQ.SELLER_BALANCE_NOT_ENOUGH")return"PROVIDER_FUNDS_REQUIRED";
 if(error==="WECHAT_ABNORMAL"||error.startsWith("ALIPAY_"))return"PROVIDER_ACTION_REQUIRED";
 if(attempts>=OPERATOR_ATTEMPT_THRESHOLD&&o.status!=="succeeded")return"OPERATOR_REVIEW_REQUIRED";
 return error?"PROVIDER_CONFIRMATION_PENDING":null;
}

function nextDelay(base:number,attempt:number,key:string,failureCode:string|null){
 if(failureCode==="OPERATOR_REVIEW_REQUIRED")return 24*60*60;
 if(failureCode==="PROVIDER_FUNDS_REQUIRED")return retryWithJitter(6*60*60,1,key,8*60*60);
 return retryWithJitter(Math.max(30,base),attempt,key,6*60*60);
}

async function recordObservation(admin:any,w:Row,o:ProviderRefundObservation){
 const attempts=Number(w.provider_attempt_count||0)+1;
 const failureCode=observationFailureCode(o,attempts);
 const delay=nextDelay(Number(o.retryAfterSeconds||300),attempts,String(w.id),failureCode);
 const {error}=await admin.from("balance_withdrawals").update({
  provider_status:o.providerStatus||null,
  provider_raw_status:String(o.rawStatus||"").slice(0,500),
  provider_refund_id:o.providerRefundId||w.provider_refund_id||null,
  last_provider_error_code:o.errorCode||null,
  failure_code:failureCode,
  provider_attempt_count:attempts,
  last_provider_checked_at:new Date().toISOString(),
  next_reconcile_at:new Date(Date.now()+delay*1000).toISOString(),
  provider_call_locked_until:null,
  updated_at:new Date().toISOString(),
 }).eq("id",w.id);
 if(error)throw new Error("WITHDRAWAL_OBSERVATION_SAVE_FAILED");
}

async function recordException(admin:any,w:Row,error:unknown){
 const decision=classifyProviderException(error);
 const attempts=Number(w.provider_attempt_count||0)+1;
 const thresholdReached=attempts>=OPERATOR_ATTEMPT_THRESHOLD;
 const failureCode=thresholdReached&&!decision.operatorActionRequired
  ?"OPERATOR_REVIEW_REQUIRED"
  :decision.failureCode;
 const delay=nextDelay(decision.retryAfterSeconds,attempts,String(w.id),failureCode);

 const {error:saveError}=await admin.from("balance_withdrawals").update({
  failure_code:failureCode,
  provider_status:decision.providerStatus,
  last_provider_error_code:safeProviderError(error),
  provider_attempt_count:attempts,
  last_provider_checked_at:new Date().toISOString(),
  next_reconcile_at:new Date(Date.now()+delay*1000).toISOString(),
  provider_call_locked_until:null,
  updated_at:new Date().toISOString(),
 }).eq("id",w.id);
 if(saveError)throw new Error("WITHDRAWAL_OBSERVATION_SAVE_FAILED");

 return{
  ...decision,
  failureCode,
  operatorActionRequired:decision.operatorActionRequired||thresholdReached,
  retryAfterSeconds:delay,
 };
}

export async function reconcileWithdrawal(withdrawalId:string){
 const admin=createAdminClient();
 const{data:w,error:we}=await admin.from("balance_withdrawals").select("*").eq("id",withdrawalId).single();
 if(we||!w)throw new Error("WITHDRAWAL_NOT_FOUND");
 if(!["requested","processing"].includes(String(w.status)))return{ok:true,closed:true,status:w.status};

 const{data:lease,error:leaseError}=await admin.rpc("money_begin_provider_call",{p_withdrawal_id:w.id});
 if(leaseError)throw new Error("PROVIDER_CALL_CLAIM_FAILED");
 if(!lease?.ok)return{ok:true,status:lease?.status||"processing"};
 const{data:order,error:oe}=await admin.from("orders").select("*").eq("id",w.order_id).single();
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
  orderTotalMinor:providerOrderTotalMinor(order,providerCurrency),
 };

 const adapter=requireProviderAdapter(request.provider,moneyProviderAdapters());
 try{
  const observation=request.providerRefundId
   ?await adapter.queryRefund(request)
   :await adapter.createRefund(request);

  await recordObservation(admin,w,observation);
  const decision=planReconciliation(observation);

  if(decision.kind==="complete"){
   const{data,error}=await admin.rpc("complete_balance_withdrawal",{
    p_withdrawal_id:w.id,
    p_provider_refund_id:decision.providerRefundId,
    p_provider_status:decision.providerStatus,
   });
   if(error||data?.ok!==true)throw new Error("WITHDRAWAL_FINALIZATION_FAILED");
   return{ok:true,status:"completed",result:data};
  }

  if(decision.kind==="release"){
   const{data,error}=await admin.rpc("release_balance_withdrawal",{
    p_withdrawal_id:w.id,
    p_failure_code:decision.failureCode,
    p_provider_status:decision.providerStatus,
   });
   if(error||data?.ok!==true)throw new Error("WITHDRAWAL_FINALIZATION_FAILED");
   return{ok:true,status:"failed",result:data};
  }

  const failureCode=observationFailureCode(observation,Number(w.provider_attempt_count||0)+1);
  return{
   ok:true,
   status:"pending",
   failureCode,
   operatorActionRequired:failureCode==="PROVIDER_FUNDS_REQUIRED"||failureCode==="PROVIDER_ACTION_REQUIRED"||failureCode==="OPERATOR_REVIEW_REQUIRED",
   retryAfterSeconds:nextDelay(decision.afterSeconds,Number(w.provider_attempt_count||0)+1,String(w.id),observationFailureCode(observation,Number(w.provider_attempt_count||0)+1)),
  };
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
 }finally{scheduleMoneyNotices();}
}

export async function reconcileDueWithdrawals(limit=20){
 const admin=createAdminClient();
 await flushMoneyNotifications().catch(()=>null);
 const bounded=Math.max(1,Math.min(Number(limit)||20,100));
 const{data,error}=await admin.rpc("money_claim_reconciliation_v52e",{
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
