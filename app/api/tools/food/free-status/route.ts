import {NextRequest,NextResponse} from "next/server";
import {createHash} from "node:crypto";import {createClient} from "@/lib/supabase/server";import {createAdminClient} from "@/lib/supabase/admin";
export const runtime="nodejs";export const dynamic="force-dynamic";
function ip(req:NextRequest){return(req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||req.headers.get("x-real-ip")?.trim()||"unknown").slice(0,128)}
export async function GET(req:NextRequest){
 const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();const admin=createAdminClient(),day=new Date().toISOString().slice(0,10),hash=createHash("sha256").update(ip(req)).digest("hex");
 let q=admin.from("food_calorie_daily_free_usage").select("usage_day",{count:"exact",head:true}).eq("usage_day",day).eq("ip_hash",hash);const ipUsed=await q;
 if(ipUsed.error)return NextResponse.json({available:false,error:'STATUS_UNAVAILABLE'},{status:503});
 let accountUsed=false;if(user){const a=await admin.from("food_calorie_daily_free_usage").select("usage_day",{count:"exact",head:true}).eq("usage_day",day).eq("account_id",user.id);if(a.error)return NextResponse.json({available:false,error:'STATUS_UNAVAILABLE'},{status:503});accountUsed=(a.count||0)>0}
 return NextResponse.json({available:(ipUsed.count||0)===0&&!accountUsed,resetAt:new Date(Date.parse(day+'T00:00:00Z')+86400000).toISOString()},{headers:{"Cache-Control":"private, no-store"}});
}
