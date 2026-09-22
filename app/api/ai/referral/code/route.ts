import crypto from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
export const runtime="nodejs";
export async function GET(){
 const supabase=createClient();const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"请先登录"},{status:401});
 const admin=createAdminClient();let {data}=await admin.from("ai_referral_codes").select("code").eq("user_id",user.id).maybeSingle();
 if(!data){
  for(let i=0;i<4&&!data;i++){
   const code=crypto.randomBytes(5).toString("base64url").toUpperCase();
   const x=await admin.from("ai_referral_codes").insert({user_id:user.id,code}).select("code").single();
   if(!x.error)data=x.data;
  }
 }
 if(!data)return NextResponse.json({error:"邀请码生成失败"},{status:500});
 return NextResponse.json({code:data.code,url:`https://lingxifield.com/ai-wallet?ref=${encodeURIComponent(data.code)}`});
}
