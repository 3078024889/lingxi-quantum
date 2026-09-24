import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { claimPaidToolJob,completePaidToolJob,failPaidToolJob } from "@/lib/tools/paid-job-server";
export const runtime="nodejs";export const maxDuration=120;
export async function POST(req:Request){
 const key=process.env.OPENAI_API_KEY;if(!key)return NextResponse.json({error:"OPENAI_NOT_CONFIGURED"},{status:503});
 const supabase=createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:"请先登录"},{status:401});
 const form=await req.formData(),file=form.get("file"),quoteId=String(form.get("quote_id")||""),itemKey=String(form.get("item_key")||"id-photo-0"),background=String(form.get("background")||"white");
 if(!(file instanceof File))return NextResponse.json({error:"FILE_REQUIRED"},{status:400});
 if(file.size>12*1024*1024)return NextResponse.json({error:"FILE_TOO_LARGE"},{status:413});
 const claim=await claimPaidToolJob({quoteId,userId:user.id,toolId:"id-photo-ai",itemKey,units:1});
 if(!claim.ok)return NextResponse.json({error:claim.error||"PAYMENT_REQUIRED"},{status:claim.error==="JOB_ALREADY_PROCESSING"?409:402});
 if(claim.status==="completed"&&claim.result)return NextResponse.json(claim.result);
 const jobId=claim.jobId!;
 try{
  const fd=new FormData();fd.set("model",process.env.OPENAI_IMAGE_EDIT_MODEL||"gpt-image-2");fd.set("image",file,file.name||"photo.jpg");
  fd.set("prompt",`Create a clean ID-photo style edit of the same person. Preserve identity, facial features, hairstyle, skin tone, clothing and natural proportions. Replace only the background with a flat ${background} studio background. Center the head and shoulders with even passport-photo lighting. Do not beautify, change age, change expression, add accessories, logos, text, stamps, or alter identity.`);
  fd.set("size","1024x1024");fd.set("quality","high");
  const r=await fetch("https://api.openai.com/v1/images/edits",{method:"POST",headers:{Authorization:`Bearer ${key}`},body:fd});
  const data=await r.json();if(!r.ok)throw new Error(`IDPHOTO_${r.status}:${JSON.stringify(data).slice(0,600)}`);
  const item=data.data?.[0],result={b64:item?.b64_json||null,url:item?.url||null,background};
  await completePaidToolJob(jobId,result);return NextResponse.json(result);
 }catch(e){const msg=e instanceof Error?e.message:String(e);await failPaidToolJob(jobId,msg);return NextResponse.json({error:"ID_PHOTO_FAILED"},{status:502})}
}
