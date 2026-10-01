import {NextResponse} from 'next/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {queryProviderRefund} from '@/lib/payment-refunds';
export const runtime='nodejs';
export const maxDuration=60;
export async function GET(req:Request){
 const secret=process.env.CRON_SECRET?.trim();
 if(!secret||req.headers.get('authorization')!==`Bearer ${secret}`)return NextResponse.json({error:'UNAUTHORIZED'},{status:401});
 const admin=createAdminClient();
 const {data:rows,error}=await admin.from('balance_withdrawals').select('*').eq('status','processing').lt('updated_at',new Date(Date.now()-60000).toISOString()).order('updated_at',{ascending:true}).limit(3);
 if(error)return NextResponse.json({error:'QUERY_FAILED'},{status:503});
 const states=await Promise.all((rows||[]).map(async w=>{
  try{
   const {data:order}=await admin.from('orders').select('provider_payment_id').eq('id',w.order_id).eq('user_id',w.user_id).single();
   if(!order?.provider_payment_id)return 'pending';
   const a=await queryProviderRefund({provider:w.provider,providerPaymentId:order.provider_payment_id,withdrawalId:w.id,refundId:w.provider_refund_id,currency:w.provider_currency,refundAmountMinor:Number(w.provider_amount_minor)});
   const saved=await admin.from('balance_withdrawals').update({provider_refund_id:a.refundId,provider_status:a.providerStatus,updated_at:new Date().toISOString()}).eq('id',w.id).eq('status','processing');
   if(saved.error||a.state==='pending')return 'pending';
   const result=a.state==='completed'?await admin.rpc('complete_balance_withdrawal',{p_withdrawal_id:w.id,p_provider_refund_id:a.refundId||'',p_provider_status:a.providerStatus}):await admin.rpc('release_balance_withdrawal',{p_withdrawal_id:w.id,p_failure_code:'PROVIDER_REFUND_REJECTED',p_provider_status:a.providerStatus});
   return !result.error&&result.data?.ok?a.state:'pending';
  }catch{
   await admin.from('balance_withdrawals').update({updated_at:new Date().toISOString(),failure_code:'PROVIDER_CONFIRMATION_PENDING'}).eq('id',w.id).eq('status','processing');
   return 'pending';
  }
 }));
 return NextResponse.json({ok:true,checked:states.length,completed:states.filter(x=>x==='completed').length,failed:states.filter(x=>x==='failed').length,pending:states.filter(x=>x==='pending').length},{headers:{'Cache-Control':'no-store'}});
}
