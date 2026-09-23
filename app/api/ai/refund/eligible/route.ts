import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
export const runtime="nodejs";
export async function GET(){
 const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
 const admin=createAdminClient();
 const[{data:snapshot},{data:orders},{data:reqs}]=await Promise.all([
  admin.rpc("ai_wallet_snapshot",{p_user_id:user.id}),
  admin.from("orders").select("id,product_id,amount_rmb,paid_at").eq("user_id",user.id).eq("status","paid").like("product_id","ai-balance-%").order("paid_at",{ascending:false}).limit(30),
  admin.from("ai_refund_requests").select("order_id,amount_fen,status").eq("user_id",user.id).in("status",["requested","approved","completed"])
 ]);
 const used=new Map<string,number>();for(const r of reqs??[])used.set(r.order_id,(used.get(r.order_id)||0)+Number(r.amount_fen||0));
 const list=(orders??[]).map(o=>({id:o.id,amountRmb:Number(o.amount_rmb||0),paidAt:o.paid_at,alreadyRequestedRmb:(used.get(o.id)||0)/100})).filter(o=>o.amountRmb-o.alreadyRequestedRmb>0.009);
 return NextResponse.json({refundableRmb:Number((snapshot as any)?.refundable_fen||0)/100,orders:list});
}
