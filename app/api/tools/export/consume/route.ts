import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { enforceAbuseGuard } from "@/lib/security/abuse-guard";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 const supabase=createClient(); const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"请先登录"},{status:401});
 const abuse=await enforceAbuseGuard(req,{scope:"tool-export-consume",userId:user.id,accountLimit:120,ipLimit:300});
 if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status});
 const contentLength=Number(req.headers.get("content-length")||0);
 if(Number.isFinite(contentLength)&&contentLength>16*1024)return NextResponse.json({error:"REQUEST_TOO_LARGE"},{status:413});
 const {quoteId}=await req.json().catch(()=>({})); const admin=createAdminClient();
 if(typeof quoteId!=="string"||!quoteId)return NextResponse.json({error:"QUOTE_REQUIRED"},{status:400});
 const {data:g}=await admin.from("tool_export_grants").select("id,consumed_at").eq("quote_id",quoteId).eq("user_id",user.id).maybeSingle();
 if(!g)return NextResponse.json({error:"没有可用的导出权限"},{status:403});
 if(g.consumed_at)return NextResponse.json({error:"本次导出权限已经使用"},{status:409});
 const claimed=await admin.from("tool_export_grants")
   .update({consumed_at:new Date().toISOString()})
   .eq("id",g.id).eq("user_id",user.id).is("consumed_at",null)
   .select("id").maybeSingle();
 if(claimed.error)return NextResponse.json({error:"导出权限确认失败"},{status:500});
 if(!claimed.data)return NextResponse.json({error:"本次导出权限已经使用"},{status:409});
 return NextResponse.json({ok:true});
}
