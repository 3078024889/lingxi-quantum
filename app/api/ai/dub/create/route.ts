import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { claimPaidToolJob,completePaidToolJob,failPaidToolJob } from "@/lib/tools/paid-job-server";
export const runtime="nodejs";export const maxDuration=60;

export async function POST(req:Request){
 const key=process.env.ELEVENLABS_API_KEY;if(!key)return NextResponse.json({error:"ELEVENLABS_NOT_CONFIGURED"},{status:503});
 const supabase=createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:"请先登录"},{status:401});
 const input=await req.formData();const target=String(input.get("target_language")||"en"),sourceUrl=input.get("source_url"),file=input.get("file"),quoteId=String(input.get("quote_id")||""),itemKey=String(input.get("item_key")||"dub-0"),paidMinutes=Number(input.get("paid_minutes"));
 if(!quoteId||!Number.isFinite(paidMinutes)||paidMinutes<=0)return NextResponse.json({error:"PAYMENT_REQUIRED"},{status:402});
 if(typeof sourceUrl==="string"&&sourceUrl.trim()){try{const u=new URL(sourceUrl.trim());if(u.protocol!=="https:")return NextResponse.json({error:"HTTPS_SOURCE_REQUIRED"},{status:400})}catch{return NextResponse.json({error:"BAD_SOURCE_URL"},{status:400})}}
 if(!(file instanceof File)&&!(typeof sourceUrl==="string"&&sourceUrl.trim()))return NextResponse.json({error:"SOURCE_REQUIRED"},{status:400});
 const claim=await claimPaidToolJob({quoteId,userId:user.id,toolId:"video-dubbing",itemKey,units:paidMinutes});
 if(!claim.ok)return NextResponse.json({error:claim.error||"PAYMENT_REQUIRED"},{status:claim.error==="JOB_ALREADY_PROCESSING"?409:402});
 if(claim.status==="completed"&&claim.result)return NextResponse.json(claim.result);
 const jobId=claim.jobId!;
 try{
  const form=new FormData();
  form.set("source_language",String(input.get("source_language")||"auto"));
  form.set("model_id","dubbing_v2");
  // 不在创建项目时添加 target_language：
  // 等 ElevenLabs 识别出真实 duration 后再次核对已付分钟数，再创建第一个语言目标。
  if(typeof sourceUrl==="string"&&sourceUrl.trim())form.set("source_url",sourceUrl.trim());
  else if(file instanceof File)form.set("file",file,file.name);
  const r=await fetch("https://api.elevenlabs.io/v1/dubbing/project",{method:"POST",headers:{"xi-api-key":key},body:form});
  const data=await r.json();if(!r.ok)throw new Error(`ELEVEN_${r.status}:${JSON.stringify(data).slice(0,600)}`);
  const result={project_id:data.project_id,status:data.status||"queued",target_language:target,paid_minutes:paidMinutes,language_id:null};
  await completePaidToolJob(jobId,result,data.project_id||null);
  return NextResponse.json(result,{status:201});
 }catch(e){
  const msg=e instanceof Error?e.message:String(e);await failPaidToolJob(jobId,msg);
  return NextResponse.json({error:"DUB_CREATE_FAILED"},{status:502});
 }
}
