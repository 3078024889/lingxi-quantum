import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
export const runtime="nodejs";
export async function POST(req:Request){
 const supabase=createClient();const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"请先登录"},{status:401});
 const {code}=await req.json(),clean=String(code||"").trim().toUpperCase();
 if(!clean)return NextResponse.json({error:"邀请码无效"},{status:400});
 const admin=createAdminClient();
 const {data:wallet}=await admin.from("ai_wallets").select("lifetime_topup_fen").eq("user_id",user.id).maybeSingle();
 if(Number(wallet?.lifetime_topup_fen||0)>0)return NextResponse.json({error:"已充值账户不能再绑定邀请关系"},{status:409});
 const {data:owner}=await admin.from("ai_referral_codes").select("user_id,code").eq("code",clean).single();
 if(!owner)return NextResponse.json({error:"邀请码不存在"},{status:404});
 if(owner.user_id===user.id)return NextResponse.json({error:"不能邀请自己"},{status:400});
 const {data:existing}=await admin.from("ai_referrals").select("inviter_user_id").eq("referred_user_id",user.id).maybeSingle();
 if(existing)return NextResponse.json({ok:true,alreadyClaimed:true});
 const {error}=await admin.from("ai_referrals").insert({referred_user_id:user.id,inviter_user_id:owner.user_id,code:owner.code});
 if(error)return NextResponse.json({error:"绑定邀请关系失败"},{status:500});
 return NextResponse.json({ok:true});
}
