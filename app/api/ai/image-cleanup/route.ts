import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { claimPaidToolJob,completePaidToolJob,failPaidToolJob } from "@/lib/tools/paid-job-server";
export const runtime="nodejs";export const maxDuration=120;

export async function POST(req:Request){
 const key=process.env.OPENAI_API_KEY;if(!key)return NextResponse.json({error:"OPENAI_NOT_CONFIGURED"},{status:503});
 const supabase=createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:"请先登录"},{status:401});
 const form=await req.formData();const image=form.get("image"),mask=form.get("mask"),quoteId=String(form.get("quote_id")||""),itemKey=String(form.get("item_key")||"image-0");
 if(!(image instanceof File)||!(mask instanceof File))return NextResponse.json({error:"IMAGE_AND_MASK_REQUIRED"},{status:400});
 if(!quoteId)return NextResponse.json({error:"PAYMENT_REQUIRED"},{status:402});
 const toolId=(await (async()=>{const {createAdminClient}=await import("@/lib/supabase/admin");const a=createAdminClient();const {data}=await a.from("tool_payment_quotes").select("tool_id").eq("id",quoteId).eq("user_id",user.id).single();return data?.tool_id})()) as string|undefined;
 if(!toolId||!["image-watermark-remover","batch-image-watermark-remover"].includes(toolId))return NextResponse.json({error:"INVALID_PAID_TOOL"},{status:403});
 const claim=await claimPaidToolJob({quoteId,userId:user.id,toolId,itemKey,units:1});
 if(!claim.ok)return NextResponse.json({error:claim.error||"PAYMENT_REQUIRED"},{status:402});
 if(claim.status==="completed"&&claim.result)return NextResponse.json(claim.result);
 const jobId=claim.jobId!;
 try{
  const out=new FormData();out.set("model",process.env.OPENAI_IMAGE_EDIT_MODEL||"gpt-image-2.5-sunburst");out.set("image",image,image.name||"image.png");out.set("mask",mask,mask.name||"mask.png");
  out.set("prompt",String(form.get("prompt")||"Edit the masked region only. Remove the marked overlaid text, object, or user-owned watermark and reconstruct the underlying background naturally. Preserve everything outside the masked area. Do not add text, logos, marks, signatures, or new objects."));
  out.set("quality","high");
  const r=await fetch("https://api.openai.com/v1/images/edits",{method:"POST",headers:{Authorization:`Bearer ${key}`},body:out});
  const data=await r.json();if(!r.ok)throw new Error(`IMAGE_${r.status}:${JSON.stringify(data).slice(0,600)}`);
  const item=data.data?.[0],result={b64:item?.b64_json||null,url:item?.url||null};
  await completePaidToolJob(jobId,result);
  return NextResponse.json(result);
 }catch(e){
  const msg=e instanceof Error?e.message:String(e);await failPaidToolJob(jobId,msg);
  return NextResponse.json({error:"IMAGE_EDIT_FAILED"},{status:502});
 }
}
