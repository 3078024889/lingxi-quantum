import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
export const runtime="nodejs";
export async function GET(){
 const supabase=createClient();const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"请先登录"},{status:401});
 const admin=createAdminClient(),{data,error}=await admin.rpc("ai_wallet_snapshot",{p_user_id:user.id});
 if(error||!data)return NextResponse.json({error:"余额读取失败"},{status:500});
 const d=data as any,total=Number(d.total_available_fen||0),basis=Number(d.basis_fen||0);
 const percent=basis>0?Math.max(0,Math.min(100,Math.round(total/basis*100))):0;
 return NextResponse.json({
  balanceRmb:total/100,
  principalRmb:Number(d.principal_fen||0)/100,
  bonusRmb:Number(d.bonus_fen||0)/100,
  refundableRmb:Number(d.refundable_fen||0)/100,
  remainingPercent:percent,
  basisRmb:basis/100,
  lifetimeTopupRmb:Number(d.lifetime_topup_fen||0)/100
 });
}
