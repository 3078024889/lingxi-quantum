import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { claimPaidToolJob,completePaidToolJob,failPaidToolJob } from "@/lib/tools/paid-job-server";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { enforceAbuseGuard } from "@/lib/security/abuse-guard";
import { toolRuntimeState } from "@/lib/tools/service-readiness";
import { analyzeFoodWithQwen } from "@/lib/tools/qwen-vision";

export const runtime="nodejs";
export const maxDuration=60;

export async function POST(req:NextRequest){
  if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  const runtimeState=toolRuntimeState("food-calorie");
  if(!runtimeState.ready)return NextResponse.json({error:"TOOL_SERVICE_UNAVAILABLE"},{status:503});

  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"请先登录"},{status:401});

  const abuse=await enforceAbuseGuard(req,{scope:"ai-food-analyze",userId:user.id,accountLimit:120,ipLimit:300});
  if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status});

  const form=await req.formData();
  const file=form.get("file");
  const quoteId=String(form.get("quote_id")||"");
  const itemKey=String(form.get("item_key")||"meal-0");
  if(!(file instanceof File))return NextResponse.json({error:"FILE_REQUIRED"},{status:400});
  if(file.size>10*1024*1024)return NextResponse.json({error:"FILE_TOO_LARGE"},{status:413});
  if(!quoteId)return NextResponse.json({error:"PAYMENT_REQUIRED"},{status:402});

  const claim=await claimPaidToolJob({quoteId,userId:user.id,toolId:"food-calorie",itemKey,units:1});
  if(!claim.ok)return NextResponse.json({error:claim.error||"PAYMENT_REQUIRED"},{status:claim.error==="JOB_ALREADY_PROCESSING"?409:402});
  if(claim.status==="completed"&&claim.result)return NextResponse.json(claim.result);
  const jobId=claim.jobId!;

  try{
    const b64=Buffer.from(await file.arrayBuffer()).toString("base64");
    const prompt=`请保守分析这张食物照片，用于日常饮食记录。只返回 JSON，不要 Markdown：
{"items":[{"name":"","estimatedPortion":"","estimatedWeightG":0,"caloriesMin":0,"caloriesMax":0,"proteinG":0,"carbsG":0,"fatG":0}],"totals":{"caloriesMin":0,"caloriesMax":0,"proteinG":0,"carbsG":0,"fatG":0},"uncertainty":[],"note":""}
视觉信息不足时必须给区间并写入 uncertainty；不要声称医疗、临床或实验室精度。`;
    const qwen=await analyzeFoodWithQwen({
      dataUrl:`data:${file.type||"image/jpeg"};base64,${b64}`,
      prompt,
    });
    let result:any;
    try{result=JSON.parse(qwen.text.replace(/^\`\`\`json\s*|\`\`\`$/g,"").trim())}
    catch{result={raw:qwen.text}}
    result._runtime={provider:"aliyun-model-studio",model:qwen.model,usage:qwen.usage};
    await completePaidToolJob(jobId,result);
    return NextResponse.json(result);
  }catch(e){
    const msg=e instanceof Error?e.message:String(e);
    await failPaidToolJob(jobId,msg);
    return NextResponse.json({error:"AI_FAILED"},{status:502});
  }
}
