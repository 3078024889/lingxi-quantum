import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
export const runtime="nodejs";
export async function POST(req:Request){
 const supabase=createClient(); const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"请先登录"},{status:401});
 const {quoteId}=await req.json(); const admin=createAdminClient();
 const {data:g}=await admin.from("tool_export_grants").select("*").eq("quote_id",quoteId).eq("user_id",user.id).single();
 if(!g)return NextResponse.json({error:"没有可用的导出权限"},{status:403});
 if(g.consumed_at)return NextResponse.json({error:"本次导出权限已经使用"},{status:409});
 const {error}=await admin.from("tool_export_grants").update({consumed_at:new Date().toISOString()}).eq("id",g.id).is("consumed_at",null);
 if(error)return NextResponse.json({error:"导出权限确认失败"},{status:500});
 return NextResponse.json({ok:true});
}
