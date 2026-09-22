import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
export const runtime="nodejs";export const maxDuration=30;

export async function GET(req:Request){
 const key=process.env.ELEVENLABS_API_KEY;if(!key)return NextResponse.json({error:"ELEVENLABS_NOT_CONFIGURED"},{status:503});
 const supabase=createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:"请先登录"},{status:401});
 const u=new URL(req.url),id=u.searchParams.get("project_id"),quoteId=u.searchParams.get("quote_id");
 if(!id||!quoteId)return NextResponse.json({error:"PROJECT_AND_QUOTE_REQUIRED"},{status:400});
 const admin=createAdminClient();
 const {data:job}=await admin.from("tool_paid_jobs").select("*").eq("user_id",user.id).eq("quote_id",quoteId).eq("provider_ref",id).single();
 if(!job)return NextResponse.json({error:"PROJECT_NOT_OWNED"},{status:403});
 const r=await fetch(`https://api.elevenlabs.io/v1/dubbing/project/${encodeURIComponent(id)}`,{headers:{"xi-api-key":key},cache:"no-store"});const data=await r.json();
 if(!r.ok)return NextResponse.json({error:"DUB_STATUS_FAILED"},{status:r.status});
 const stored=(job.result||{}) as Record<string,any>,paidMinutes=Number(stored.paid_minutes||job.units||0),target=String(stored.target_language||"en");
 const duration=Number(data.media?.duration_s||0),required=duration>0?Math.max(1,Math.ceil(duration/60)):0;
 if(required>paidMinutes)return NextResponse.json({...data,error:"TOPUP_REQUIRED",required_minutes:required,paid_minutes:paidMinutes},{status:200});
 let languageId=stored.language_id||null;
 if(data.status==="ready"&&!languageId){
  const lr=await fetch(`https://api.elevenlabs.io/v1/dubbing/project/${encodeURIComponent(id)}/language`,{method:"POST",headers:{"xi-api-key":key,"Content-Type":"application/json"},body:JSON.stringify({target_language:target})});
  const ld=await lr.json();if(!lr.ok)return NextResponse.json({error:"LANGUAGE_CREATE_FAILED",detail:ld},{status:502});
  languageId=ld.language_id;
  const next={...stored,language_id:languageId,actual_duration_s:duration,actual_minutes:required};
  await admin.from("tool_paid_jobs").update({result:next,updated_at:new Date().toISOString()}).eq("id",job.id);
 }
 return NextResponse.json({...data,language_id:languageId,required_minutes:required||undefined,paid_minutes:paidMinutes});
}
