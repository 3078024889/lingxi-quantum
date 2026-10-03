import 'server-only';
import {createAdminClient} from '@/lib/supabase/admin';
import {moneyOperatorSettings} from '@/lib/money/operator-settings';
import {moneyNotice,moneyText} from './money-copy';
export async function accountMoneyFeed(userId:string,lang:string,platform='web'){
 const admin=createAdminClient();
 const [orders,refunds,withdrawals,reads,announcements]=await Promise.all([
  admin.from('orders').select('id,product_id,currency,amount_rmb,amount_usd,paid_at,status,created_at').eq('user_id',userId).eq('status','paid').order('created_at',{ascending:false}).limit(30),
  admin.from('ai_refund_requests').select('id,amount_fen,status,updated_at,created_at').eq('user_id',userId).order('updated_at',{ascending:false}).limit(50),
  admin.from('balance_withdrawals').select('id,currency,amount_minor,status,provider_status,updated_at,created_at,completed_at,legacy_refund_id').eq('user_id',userId).order('updated_at',{ascending:false}).limit(50),
  admin.from('lingxifield_notification_reads').select('event_key').eq('user_id',userId).limit(500),
  admin.from('lingxifield_announcements').select('id,title_zh,body_zh,title_en,body_en,published_at,expires_at').eq('is_active',true).in('platform',['all',platform==='miniapp'?'miniapp':'web']).order('published_at',{ascending:false}).limit(30),
 ]);
 const seen=new Set((reads.data||[]).map(x=>x.event_key)),migrated=new Set((withdrawals.data||[]).map(x=>x.legacy_refund_id));
 const items=[];
 for(const o of orders.data||[]){const usd=o.currency==='USD'||(!o.currency&&String(o.product_id).includes('-usd-'));const currency=usd?'USD':'CNY',amountMinor=Math.round(Number(usd?o.amount_usd:o.amount_rmb)*100);const kind=String(o.product_id).includes('balance')?'topup':'payment';const id=`payment:${o.id}:paid`;items.push({id,eventKey:id,kind,currency,amountMinor,...moneyNotice(lang,kind,'completed',currency,amountMinor),createdAt:o.paid_at||o.created_at,href:kind==='topup'?'/ai-wallet':'/account/orders',read:seen.has(id)});}
 for(const r of refunds.data||[]){if(migrated.has(r.id))continue;const id=`refund:${r.id}:${r.status}`;items.push({id,eventKey:id,kind:'refund',currency:'CNY',amountMinor:Number(r.amount_fen),status:r.status,...moneyNotice(lang,'refund',r.status,'CNY',Number(r.amount_fen),true),createdAt:r.updated_at||r.created_at,href:`/account/withdrawals#legacy-${r.id}`,read:seen.has(id)});}
 for(const w of withdrawals.data||[]){const id=`withdrawal:${w.id}:${w.status}`;items.push({id,eventKey:id,kind:'withdrawal',currency:w.currency,amountMinor:Number(w.amount_minor),status:w.status,...moneyNotice(lang,'withdrawal',w.status,w.currency,Number(w.amount_minor)),createdAt:w.completed_at||w.updated_at||w.created_at,href:`/account/withdrawals#withdrawal-${w.id}`,read:seen.has(id)});}
 for(const a of announcements.data||[]){if(Date.parse(a.published_at)>Date.now()||(a.expires_at&&Date.parse(a.expires_at)<=Date.now()))continue;const id=`announcement:${a.id}`;items.push({id,eventKey:id,kind:'announcement',title:lang==='zh'?a.title_zh:(a.title_en||a.title_zh),body:lang==='zh'?a.body_zh:(a.body_en||a.body_zh),createdAt:a.published_at,href:'/account/notifications',read:seen.has(id)});}
 // Operator events are private to the server-side email allowlist.
 try{
  const [{data:{user}},settings]=await Promise.all([admin.auth.admin.getUserById(userId),moneyOperatorSettings()]);
  if(user?.email&&settings.admin_emails.some(email=>email.toLowerCase()===user.email!.toLowerCase())){
   const {data:events,error}=await admin.from('money_notification_outbox').select('id,event_type,created_at,withdrawal_id').order('created_at',{ascending:false}).limit(30);
   if(error)throw error;
   const ids=[...new Set((events||[]).map(e=>e.withdrawal_id).filter(Boolean))];
   if(ids.length){
    const {data:requests,error}=await admin.from('balance_withdrawals').select('id,provider_currency,provider_amount_minor,status').in('id',ids);
    if(error)throw error;
    for(const event of events||[]){const w=requests?.find(w=>w.id===event.withdrawal_id);if(!w)continue;
     const id='operator:'+event.id,notice=moneyNotice(lang,'withdrawal',event.event_type,w.provider_currency,Number(w.provider_amount_minor));
     items.push({id,eventKey:id,kind:'withdrawal',title:moneyText(lang,'moneyAdmin')+' · '+notice.title,body:event.event_type==='PROVIDER_FUNDS_REQUIRED'?moneyText(lang,'providerFunds'):notice.body,createdAt:event.created_at,href:'/account/money-admin',read:seen.has(id)});
    }
   }
  }
 }catch{ /* Preserve the user's personal feed when operator settings are unavailable. */ }
 items.sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt));
 return {items,partial:Boolean(orders.error||refunds.error||withdrawals.error||announcements.error),readAvailable:!reads.error,seen};
}
