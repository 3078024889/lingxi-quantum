import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
export const runtime="nodejs";
export async function GET(req:Request){
 const supabase=createClient(); const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"请先登录"},{status:401});
 const quoteId=new URL(req.url).searchParams.get("quoteId"); if(!quoteId)return NextResponse.json({error:"缺少quoteId"},{status:400});
 const admin=createAdminClient();
 const {data}=await admin.from("tool_export_grants").select("id,tool_id,quantity,unit_name,amount_rmb,created_at").eq("quote_id",quoteId).eq("user_id",user.id).maybeSingle();
 return NextResponse.json({paid:!!data,grant:data||null});
}
