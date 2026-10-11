import { createAdminClient } from '@/lib/supabase/admin';
import { TOPUP_EXPIRY_MS } from '@/lib/mini/order-deletion';
import { reconcileVirtualToolOrder } from '@/lib/mini/virtual-fulfillment';

export async function expireMiniUnpaidOrders(userId: string) {
  const admin=createAdminClient();
  const {data,error}=await admin.from('orders').select('id').eq('user_id',userId)
    .is('user_deleted_at',null).eq('status','pending').eq('provider','wechat_mini_virtual')
    .like('product_id','sasi-balance-%').lte('created_at',new Date(Date.now()-TOPUP_EXPIRY_MS).toISOString())
    .order('created_at',{ascending:false}).limit(5);
  if(error)throw new Error('MINI_ORDER_CLEANUP_UNAVAILABLE');
  await Promise.allSettled((data||[]).map(async row=>{
    const remote=await reconcileVirtualToolOrder(row.id,userId);
    if(remote.paid||!(remote.closed||remote.providerConfirmedUnpaid))return;
    const saved=await admin.from('orders').update({user_deleted_at:new Date().toISOString()})
      .eq('id',row.id).eq('user_id',userId).in('status',['pending','canceled']);
    if(saved.error)throw new Error('MINI_ORDER_CLEANUP_PENDING');
  }));
}
