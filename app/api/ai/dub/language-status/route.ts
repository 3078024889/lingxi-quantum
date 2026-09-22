import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
export const runtime="nodejs";
export async function GET(req:Request){
 const key=process.env.ELEVENLABS_API_KEY;if(!key)return NextResponse.json({error:"ELEVENLABS_NOT_CONFIGURED"},{status:503});
 const supabase=createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:"请先登录"},{status:401});
 const u=new URL(req.url),projectId=u.searchParams.get("project_id"),languageId=u.searchParams.get("language_id"),quoteId=u.searchParams.get("quote_id");
 if(!projectId||!languageId||!quoteId)return NextResponse.json({error:"IDS_REQUIRED"},{status:400});
 const admin=createAdminClient();const {data:job}=await admin.from("tool_paid_jobs").select("id,result").eq("user_id",user.id).eq("quote_id",quoteId).eq("provider_ref",projectId).single();
 if(!job||String((job.result as any)?.language_id||"")!==languageId)return NextResponse.json({error:"PROJECT_NOT_OWNED"},{status:403});
 const r=await fetch(`https://api.elevenlabs.io/v1/dubbing/project/${encodeURIComponent(projectId)}/language/${encodeURIComponent(languageId)}`,{headers:{"xi-api-key":key},cache:"no-store"});
 const data=await r.json();return NextResponse.json(data,{status:r.status});
}
