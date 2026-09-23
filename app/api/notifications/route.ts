import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
export const runtime="nodejs";
export async function GET(){
 const items:any[]=[{id:"announcement:v105-account",kind:"announcement",createdAt:"2026-09-23T01:30:00.000Z",href:"/account"}];
 const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({items});
 const admin=createAdminClient();
 const[{data:orders},{data:refunds}]=await Promise.all([
  admin.from("orders").select("id,product_id,amount_rmb,paid_at").eq("user_id",user.id).eq("status","paid").not("paid_at","is",null).order("paid_at",{ascending:false}).limit(8),
  admin.from("ai_refund_requests").select("id,amount_fen,status,updated_at,created_at").eq("user_id",user.id).order("updated_at",{ascending:false}).limit(8)
 ]);
 for(const o of orders??[])items.push({id:`payment:${o.id}`,kind:"payment",createdAt:o.paid_at,href:o.product_id?.startsWith("ai-balance-")?"/ai-wallet":"/account/orders",amountRmb:Number(o.amount_rmb||0)});
 for(const r of refunds??[])items.push({id:`refund:${r.id}:${r.status}`,kind:"refund",createdAt:r.updated_at||r.created_at,href:"/ai-wallet",status:r.status,amountRmb:Number(r.amount_fen||0)/100});
 items.sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());
 return NextResponse.json({items:items.slice(0,16)});
}
