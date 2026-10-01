import{NextResponse}from"next/server";
import{createClient}from"@/lib/supabase/server";import{createAdminClient}from"@/lib/supabase/admin";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(){
 let admin;try{admin=createAdminClient()}catch{return NextResponse.json({items:[],databaseAvailable:false})}const items:any[]=[];
 const{data:anns}=await admin.from("lingxifield_announcements").select("id,version_label,platform,title_zh,body_zh,published_at").eq("is_active",true).order("published_at",{ascending:false}).limit(8);
 for(const a of anns||[])items.push({id:`announcement:${a.id}`,kind:"announcement",version:a.version_label,title:a.title_zh,body:a.body_zh,createdAt:a.published_at,href:"/release"});
 let supabase;try{supabase=createClient()}catch{return NextResponse.json({items})}
 const{data:{user}}=await supabase.auth.getUser().catch(()=>({data:{user:null}} as any));if(!user)return NextResponse.json({items});
 const[{data:orders},{data:refunds},{data:withdrawals}]=await Promise.all([
  admin.from("orders").select("id,product_id,amount_rmb,paid_at,status").eq("user_id",user.id).eq("status","paid").not("paid_at","is",null).order("paid_at",{ascending:false}).limit(10),
  admin.from("ai_refund_requests").select("id,amount_fen,status,updated_at,created_at").eq("user_id",user.id).order("updated_at",{ascending:false}).limit(10),
  admin.from("balance_withdrawals").select("id,currency,amount_minor,status,provider_status,updated_at,created_at,completed_at").eq("user_id",user.id).order("updated_at",{ascending:false}).limit(10)
 ]);
 for(const o of orders||[])items.push({id:`payment:${o.id}`,kind:"payment",title:o.product_id?.startsWith("ai-balance-")?"充值已到账":"支付成功",createdAt:o.paid_at,href:o.product_id?.startsWith("ai-balance-")?"/ai-wallet":"/account/orders",amountRmb:Number(o.amount_rmb||0)});
 for(const r of refunds||[]){const done=["completed","succeeded","refunded","success"].includes(String(r.status).toLowerCase());items.push({id:`refund:${r.id}:${r.status}`,kind:"refund",title:done?"退款处理完成":"退款进度已更新",createdAt:r.updated_at||r.created_at,href:"/ai-wallet",status:r.status,amountRmb:Number(r.amount_fen||0)/100});}
 for(const w of withdrawals||[]){const st=String(w.status||w.provider_status||"").toLowerCase(),done=["completed","succeeded","success","paid"].includes(st),failed=["failed","rejected","cancelled"].includes(st);items.push({id:`withdrawal:${w.id}:${st}`,kind:"withdrawal",title:done?"提现处理完成":failed?"提现未完成":"提现进度已更新",createdAt:w.completed_at||w.updated_at||w.created_at,href:"/withdraw",status:st,currency:w.currency,amountMinor:Number(w.amount_minor||0)});}
 items.sort((a,b)=>new Date(b.createdAt||0).getTime()-new Date(a.createdAt||0).getTime());
 return NextResponse.json({items:items.slice(0,30)},{headers:{"Cache-Control":"private, no-store"}});
}