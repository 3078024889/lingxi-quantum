import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { claimPaidToolJob,completePaidToolJob,failPaidToolJob } from "@/lib/tools/paid-job-server";

export const runtime="nodejs";
export const maxDuration=120;

function srtTime(sec:number){
  const ms=Math.max(0,Math.round(sec*1000));
  const h=Math.floor(ms/3600000),m=Math.floor((ms%3600000)/60000),s=Math.floor((ms%60000)/1000),x=ms%1000;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")},${String(x).padStart(3,"0")}`;
}
function vttTime(sec:number){return srtTime(sec).replace(",",".");}

export async function POST(req:Request){
  const apiKey=process.env.OPENAI_API_KEY;
  if(!apiKey)return NextResponse.json({error:"OPENAI_NOT_CONFIGURED"},{status:503});

  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"请先登录"},{status:401});

  const form=await req.formData();
  const file=form.get("file");
  const quoteId=String(form.get("quote_id")||"");
  const itemKey=String(form.get("item_key")||"transcribe-0");
  const paidMinutes=Number(form.get("paid_minutes"));
  const toolId=String(form.get("tool_id")||"audio-transcription");
  const language=String(form.get("language")||"").trim();

  if(!(file instanceof File))return NextResponse.json({error:"FILE_REQUIRED"},{status:400});
  if(!["audio-transcription","video-transcription"].includes(toolId))return NextResponse.json({error:"BAD_TOOL"},{status:400});
  if(!quoteId||!Number.isFinite(paidMinutes)||paidMinutes<=0)return NextResponse.json({error:"PAYMENT_REQUIRED"},{status:402});
  if(file.size>25*1024*1024)return NextResponse.json({error:"FILE_TOO_LARGE_25MB"},{status:413});

  const claim=await claimPaidToolJob({quoteId,userId:user.id,toolId,itemKey,units:paidMinutes});
  if(!claim.ok)return NextResponse.json({error:claim.error||"PAYMENT_REQUIRED"},{status:claim.error==="JOB_ALREADY_PROCESSING"?409:402});
  if(claim.status==="completed"&&claim.result)return NextResponse.json(claim.result);
  const jobId=claim.jobId!;

  try{
    const fd=new FormData();
    fd.set("file",file,file.name);
    fd.set("model",process.env.OPENAI_TRANSCRIBE_MODEL||"whisper-1");
    fd.set("response_format","verbose_json");
    fd.append("timestamp_granularities[]","segment");
    if(language)fd.set("language",language);

    const r=await fetch("https://api.openai.com/v1/audio/transcriptions",{
      method:"POST",headers:{Authorization:`Bearer ${apiKey}`},body:fd
    });
    const data=await r.json();
    if(!r.ok)throw new Error(`TRANSCRIBE_${r.status}:${JSON.stringify(data).slice(0,700)}`);

    const segments=Array.isArray(data.segments)?data.segments:[];
    const srt=segments.map((s:any,i:number)=>`${i+1}\n${srtTime(Number(s.start||0))} --> ${srtTime(Number(s.end||0))}\n${String(s.text||"").trim()}`).join("\n\n");
    const vtt="WEBVTT\n\n"+segments.map((s:any)=>`${vttTime(Number(s.start||0))} --> ${vttTime(Number(s.end||0))}\n${String(s.text||"").trim()}`).join("\n\n");
    const result={text:String(data.text||""),srt,vtt,language:data.language||null,duration:data.duration||null,segments:segments.length};
    await completePaidToolJob(jobId,result);
    return NextResponse.json(result);
  }catch(e){
    const msg=e instanceof Error?e.message:String(e);
    await failPaidToolJob(jobId,msg);
    return NextResponse.json({error:"TRANSCRIPTION_FAILED"},{status:502});
  }
}
