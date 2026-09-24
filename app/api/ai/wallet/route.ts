import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
export const runtime="nodejs";
export async function GET(){
 const supabase=createClient();const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"请先登录"},{status:401});
 const admin=createAdminClient(),rmb=await admin.rpc("ai_wallet_snapshot",{p_user_id:user.id});
 if(rmb.error||!rmb.data)return NextResponse.json({error:"余额读取失败"},{status:500});
 const d=rmb.data as any,total=Number(d.total_available_fen||0),basis=Number(d.basis_fen||0);
 const usdResult=await admin.rpc("ai_usd_wallet_snapshot",{p_user_id:user.id});const usd=usdResult.error?null:usdResult.data as any;
 return NextResponse.json({
  balanceRmb:total/100,principalRmb:Number(d.principal_fen||0)/100,bonusRmb:Number(d.bonus_fen||0)/100,refundableRmb:Number(d.refundable_fen||0)/100,
  remainingPercent:basis>0?Math.max(0,Math.min(100,Math.round(total/basis*100))):0,basisRmb:basis/100,lifetimeTopupRmb:Number(d.lifetime_topup_fen||0)/100,
  balanceUsd:Number(usd?.available_cents||0)/100,refundableUsd:Number(usd?.refundable_cents||0)/100,lifetimeTopupUsd:Number(usd?.lifetime_topup_cents||0)/100
 });
}
