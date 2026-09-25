import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { claimPaidToolJob,completePaidToolJob,failPaidToolJob } from "@/lib/tools/paid-job-server";
import { enforceAbuseGuard } from "@/lib/security/abuse-guard";
export const runtime="nodejs";export const maxDuration=60;
function outputText(data:any){return (data.output||[]).flatMap((x:any)=>x.content||[]).map((x:any)=>x.text||"").join("").trim();}
export async function POST(req:Request){
 const key=process.env.OPENAI_API_KEY;if(!key)return NextResponse.json({error:"OPENAI_NOT_CONFIGURED"},{status:503});
 const supabase=createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:"请先登录"},{status:401});
 const abuse=await enforceAbuseGuard(req,{scope:"ai-subtitle-translate",userId:user.id,accountLimit:120,ipLimit:300});if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status});
 const {quoteId,itemKey="subtitle-0",targetLanguage,text}=await req.json();
 if(typeof text!=="string"||!text.trim())return NextResponse.json({error:"TEXT_REQUIRED"},{status:400});
 if(text.length>150000)return NextResponse.json({error:"SUBTITLE_TOO_LARGE"},{status:413});
 const claim=await claimPaidToolJob({quoteId:String(quoteId||""),userId:user.id,toolId:"subtitle-translate",itemKey:String(itemKey),units:1});
 if(!claim.ok)return NextResponse.json({error:claim.error||"PAYMENT_REQUIRED"},{status:claim.error==="JOB_ALREADY_PROCESSING"?409:402});
 if(claim.status==="completed"&&claim.result)return NextResponse.json(claim.result);
 const jobId=claim.jobId!;
 try{
  const prompt=`Translate the following subtitle file into ${String(targetLanguage||"Chinese")}.
Preserve every cue number and timestamp exactly. Translate only subtitle text. Do not add markdown or commentary. Return the complete subtitle file only.\n\n${text}`;
  const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.OPENAI_TEXT_MODEL||"gpt-5.6-luna",input:prompt})});
  const data=await r.json();if(!r.ok)throw new Error(`TRANSLATE_${r.status}:${JSON.stringify(data).slice(0,600)}`);
  const result={text:outputText(data),targetLanguage:String(targetLanguage||"Chinese")};
  await completePaidToolJob(jobId,result);return NextResponse.json(result);
 }catch(e){const msg=e instanceof Error?e.message:String(e);await failPaidToolJob(jobId,msg);return NextResponse.json({error:"TRANSLATION_FAILED"},{status:502})}
}
