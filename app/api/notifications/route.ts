import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(){
 const items:any[]=[
  {id:"announcement:web-v14.49.2",kind:"announcement",announcementKey:"web",version:"V14.49.2",createdAt:"2026-09-24T11:15:00.000Z",href:"/tools"},
  {id:"announcement:privacy-tools",kind:"announcement",announcementKey:"privacy",createdAt:"2026-09-24T11:10:00.000Z",href:"/tools"},
  {id:"announcement:mini-program-next",kind:"announcement",announcementKey:"mini",createdAt:"2026-09-24T11:05:00.000Z",href:"/products"}
 ];
 let supabase;try{supabase=createClient()}catch{return NextResponse.json({items})}
 const{data:{user}}=await supabase.auth.getUser().catch(()=>({data:{user:null}} as any));if(!user)return NextResponse.json({items});
 const admin=createAdminClient();
 const[{data:orders},{data:refunds}]=await Promise.all([
  admin.from("orders").select("id,product_id,amount_rmb,paid_at").eq("user_id",user.id).eq("status","paid").not("paid_at","is",null).order("paid_at",{ascending:false}).limit(8),
  admin.from("ai_refund_requests").select("id,amount_fen,status,updated_at,created_at").eq("user_id",user.id).order("updated_at",{ascending:false}).limit(8)
 ]);
 for(const o of orders??[])items.push({id:`payment:${o.id}`,kind:"payment",createdAt:o.paid_at,href:o.product_id?.startsWith("ai-balance-")?"/ai-wallet":"/account/orders",amountRmb:Number(o.amount_rmb||0)});
 for(const r of refunds??[])items.push({id:`refund:${r.id}:${r.status}`,kind:"refund",createdAt:r.updated_at||r.created_at,href:"/ai-wallet",status:r.status,amountRmb:Number(r.amount_fen||0)/100});
 items.sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());return NextResponse.json({items:items.slice(0,16)});
}
