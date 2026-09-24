import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { claimPaidToolJob,completePaidToolJob,failPaidToolJob } from "@/lib/tools/paid-job-server";
export const runtime="nodejs";export const maxDuration=60;

function outputText(data:any){
 return (data.output||[]).flatMap((x:any)=>x.content||[]).map((x:any)=>x.text||"").join("").trim();
}
export async function POST(req:Request){
 const key=process.env.OPENAI_API_KEY;if(!key)return NextResponse.json({error:"OPENAI_NOT_CONFIGURED"},{status:503});
 const supabase=createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:"请先登录"},{status:401});
 const form=await req.formData();const file=form.get("file"),quoteId=String(form.get("quote_id")||""),itemKey=String(form.get("item_key")||"meal-0");
 if(!(file instanceof File))return NextResponse.json({error:"FILE_REQUIRED"},{status:400});
 if(file.size>10*1024*1024)return NextResponse.json({error:"FILE_TOO_LARGE"},{status:413});
 if(!quoteId)return NextResponse.json({error:"PAYMENT_REQUIRED"},{status:402});
 const claim=await claimPaidToolJob({quoteId,userId:user.id,toolId:"food-calorie",itemKey,units:1});
 if(!claim.ok)return NextResponse.json({error:claim.error||"PAYMENT_REQUIRED"},{status:claim.error==="JOB_ALREADY_PROCESSING"?409:402});
 if(claim.status==="completed"&&claim.result)return NextResponse.json(claim.result);
 const jobId=claim.jobId!;

 try{
  const b64=Buffer.from(await file.arrayBuffer()).toString("base64");
  const prompt=`Analyze this meal image conservatively for food logging. Return JSON only:
{"items":[{"name":"","estimatedPortion":"","estimatedWeightG":0,"caloriesMin":0,"caloriesMax":0,"proteinG":0,"carbsG":0,"fatG":0,"per100g":{"calories":0,"proteinG":0,"carbsG":0,"fatG":0}}],"totals":{"caloriesMin":0,"caloriesMax":0,"proteinG":0,"carbsG":0,"fatG":0},"uncertainty":[],"note":""}
Use ranges when visual uncertainty is material. Do not claim medical or laboratory precision.`;
  const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({
   model:process.env.OPENAI_VISION_MODEL||"gpt-6-astra",
   input:[{role:"user",content:[{type:"input_text",text:prompt},{type:"input_image",image_url:`data:${file.type||"image/jpeg"};base64,${b64}`}]}]
  })});
  const data=await r.json();if(!r.ok)throw new Error(`OPENAI_${r.status}:${JSON.stringify(data).slice(0,600)}`);
  const text=outputText(data);let result:any;try{result=JSON.parse(text.replace(/^```json\s*|```$/g,""))}catch{result={raw:text}};
  await completePaidToolJob(jobId,result);
  return NextResponse.json(result);
 }catch(e){
  const msg=e instanceof Error?e.message:String(e);await failPaidToolJob(jobId,msg);
  return NextResponse.json({error:"AI_FAILED"},{status:502});
 }
}
