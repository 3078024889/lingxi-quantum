import 'server-only';
import {createAdminClient} from '@/lib/supabase/admin';
import {executeProviderRefund,queryProviderRefund,refundProviderConfigured} from '@/lib/payment-refunds';
// Claim a saved request before sending it. A concurrent caller must never
// release a hold that another caller is currently submitting.
export async function dispatchWithdrawal(id:string,userId:string){
 const admin=createAdminClient();
 const {data:w,error}=await admin.from('balance_withdrawals').select('*').eq('id',id).eq('user_id',userId).single();
 if(error||!w)return {ok:false,error:'WITHDRAWAL_NOT_FOUND'};
 if(w.status!=='requested')return {ok:true,status:w.status,withdrawalId:id};
 if(!refundProviderConfigured(w.provider)){
  await admin.from('balance_withdrawals').update({failure_code:'PROVIDER_CONFIGURATION_REQUIRED',updated_at:new Date().toISOString()}).eq('id',id).eq('status','requested');
  return {ok:true,status:'requested',withdrawalId:id,needsSupport:true};
 }
 const {data:order}=await admin.from('orders').select('id,provider_payment_id,amount_rmb,amount_usd').eq('id',w.order_id).eq('user_id',userId).single();
 if(!order?.provider_payment_id){
  await admin.from('balance_withdrawals').update({failure_code:'PAYMENT_REFERENCE_REQUIRED',updated_at:new Date().toISOString()}).eq('id',id).eq('status','requested');
  return {ok:true,status:'requested',withdrawalId:id,needsSupport:true};
 }
 const claim=await admin.from('balance_withdrawals').update({status:'processing',processing_started_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',id).eq('status','requested').select('id').maybeSingle();
 if(claim.error||!claim.data)return {ok:true,status:'processing',withdrawalId:id};
 try{
  const attempt=await executeProviderRefund({provider:w.provider,providerPaymentId:order.provider_payment_id,localOrderId:order.id,withdrawalId:id,currency:w.provider_currency,orderAmountMinor:Math.round(Number(w.provider_currency==='USD'?order.amount_usd:order.amount_rmb)*100),refundAmountMinor:Number(w.provider_amount_minor)});
  // Save the provider reference first so a ledger failure can be reconciled by GET.
  const saved=await admin.from('balance_withdrawals').update({provider_refund_id:attempt.refundId,provider_status:attempt.providerStatus,updated_at:new Date().toISOString()}).eq('id',id).eq('status','processing');
  if(saved.error)return {ok:true,status:'processing',withdrawalId:id};
  if(attempt.state==='completed'){
   const done=await admin.rpc('complete_balance_withdrawal',{p_withdrawal_id:id,p_provider_refund_id:attempt.refundId||'',p_provider_status:attempt.providerStatus});
   return {ok:true,status:!done.error&&done.data?.ok?'completed':'processing',withdrawalId:id};
  }
  if(attempt.state==='failed'){
   const released=await admin.rpc('release_balance_withdrawal',{p_withdrawal_id:id,p_failure_code:'PROVIDER_REFUND_REJECTED',p_provider_status:attempt.providerStatus});
   return {ok:true,status:!released.error&&released.data?.ok?'failed':'processing',withdrawalId:id};
  }
 }catch{
  await admin.from('balance_withdrawals').update({failure_code:'PROVIDER_CONFIRMATION_PENDING',updated_at:new Date().toISOString()}).eq('id',id).eq('status','processing');
 }
 return {ok:true,status:'processing',withdrawalId:id};
}

export async function refreshWithdrawal(id:string,userId:string){
 const admin=createAdminClient();
 const {data:w,error}=await admin.from('balance_withdrawals').select('*').eq('id',id).eq('user_id',userId).single();
 if(error||!w)return {ok:false,error:'WITHDRAWAL_NOT_FOUND'};
 if(w.status==='requested')return dispatchWithdrawal(id,userId);
 if(w.status!=='processing')return {ok:true,status:w.status,withdrawalId:id};
 if(Date.now()-Date.parse(w.updated_at)<30000)return {ok:true,status:'processing',withdrawalId:id};
 const {data:order}=await admin.from('orders').select('provider_payment_id').eq('id',w.order_id).eq('user_id',userId).single();
 if(!order?.provider_payment_id){
  await admin.from('balance_withdrawals').update({failure_code:'PAYMENT_REFERENCE_REQUIRED',updated_at:new Date().toISOString()}).eq('id',id).eq('status','processing');
  return {ok:true,status:'processing',withdrawalId:id,needsSupport:true};
 }
 try{
  const a=await queryProviderRefund({provider:w.provider,providerPaymentId:order.provider_payment_id,withdrawalId:id,refundId:w.provider_refund_id,currency:w.provider_currency,refundAmountMinor:Number(w.provider_amount_minor)});
  const saved=await admin.from('balance_withdrawals').update({provider_refund_id:a.refundId,provider_status:a.providerStatus,updated_at:new Date().toISOString()}).eq('id',id).eq('status','processing');
  if(saved.error||a.state==='pending')return {ok:true,status:'processing',withdrawalId:id};
  const result=a.state==='completed'?await admin.rpc('complete_balance_withdrawal',{p_withdrawal_id:id,p_provider_refund_id:a.refundId||'',p_provider_status:a.providerStatus}):await admin.rpc('release_balance_withdrawal',{p_withdrawal_id:id,p_failure_code:'PROVIDER_REFUND_REJECTED',p_provider_status:a.providerStatus});
  return {ok:true,status:!result.error&&result.data?.ok?a.state==='completed'?'completed':'failed':'processing',withdrawalId:id};
 }catch{
  await admin.from('balance_withdrawals').update({updated_at:new Date().toISOString(),failure_code:'PROVIDER_CONFIRMATION_PENDING'}).eq('id',id).eq('status','processing');
  return {ok:true,status:'processing',withdrawalId:id};
 }
}
