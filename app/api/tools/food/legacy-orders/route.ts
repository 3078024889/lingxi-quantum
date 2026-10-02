import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {createAdminClient} from '@/lib/supabase/admin';
export const runtime='nodejs';
export async function GET(){
 const {data:{user}}=await createClient().auth.getUser();if(!user)return NextResponse.json({items:[]},{status:401});
 const admin=createAdminClient();
 const {data:quotes,error}=await admin.from('tool_payment_quotes').select('id,quantity,currency,amount_rmb,amount_usd,metadata').eq('user_id',user.id).eq('tool_id','food-calorie').eq('status','paid').lt('created_at','2026-10-01T23:40:14Z').limit(100);
 if(error)return NextResponse.json({error:'ORDERS_UNAVAILABLE'},{status:503});
 const ids=(quotes||[]).map(q=>q.id);if(!ids.length)return NextResponse.json({items:[]});
 const [grants,old16,old18,current]=await Promise.all([
  admin.from('tool_export_grants').select('quote_id,consumed_quantity').eq('user_id',user.id).in('quote_id',ids),
  admin.from('food_calorie_paid_consumptions_v16').select('quote_id').eq('user_id',user.id).in('quote_id',ids),
  admin.from('food_calorie_paid_consumptions_v18').select('quote_id').eq('user_id',user.id).in('quote_id',ids),
  admin.from('food_analysis_requests_v19').select('quote_id').eq('account_id',user.id).in('quote_id',ids)
 ]);
 if([grants,old16,old18,current].some(x=>x.error))return NextResponse.json({error:'ORDERS_UNAVAILABLE'},{status:503});
 const consumed=new Set([...old16.data||[],...old18.data||[],...current.data||[]].map(x=>x.quote_id));
 const items=(quotes||[]).filter(q=>!q.metadata?.foodRequestId&&!consumed.has(q.id)&&grants.data?.some(g=>g.quote_id===q.id&&Number(g.consumed_quantity)===0)).map(q=>{
  const mode=['name-weight','custom','manual'].includes(q.metadata?.mode)?'custom':'image';const raw=q.metadata?.[mode==='custom'?'foods':'images'];const maxQuantity=/^\d{1,2}$/.test(String(raw))?Number(raw):Math.floor(Number(q.quantity));
  return {id:q.id,mode,maxQuantity,currency:q.currency||'CNY',amount:Number(q.currency==='USD'?q.amount_usd:q.amount_rmb)};
 });
 return NextResponse.json({items},{headers:{'Cache-Control':'private, no-store'}});
}
