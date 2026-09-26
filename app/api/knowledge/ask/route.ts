import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { enforceAbuseGuard } from "@/lib/security/abuse-guard";
import {
  buildGroundedReasoningPrompt,
  deterministicGroundedAnswer,
  validateGroundedAnswer,
  type GroundedEvidence,
  type IntelligenceTier,
  type KnowledgeMode,
} from "@/lib/sasi-kernel/cognition/grounded-answer";
import { runNativeReasoningAndWait } from "@/lib/sasi-kernel/compute/await-job";

export const runtime="nodejs";
export const maxDuration=30;

function resultText(job:unknown){
  if(!job||typeof job!=="object")return"";
  const result=(job as {result?:unknown}).result;
  if(!result||typeof result!=="object")return"";
  return typeof (result as {text?:unknown}).text==="string"?(result as {text:string}).text.trim():"";
}

export async function POST(req:NextRequest){
  const contentLength=Number(req.headers.get("content-length")||0);
  if(Number.isFinite(contentLength)&&contentLength>384*1024){
    return NextResponse.json({error:"这次资料太多，请减少引用内容后再试。"},{status:413});
  }
  if(!isSameOriginMutation(req))return NextResponse.json({error:"请求来源无效。"},{status:403});

  const body:Record<string,unknown>=await req.json().catch(()=>({}));
  const question=String(body.question||"").trim().slice(0,4000);
  const mode:KnowledgeMode=body.mode==="research"?"research":body.mode==="learning"?"learning":"book";
  const intelligence:IntelligenceTier=body.intelligence==="light"?"light":body.intelligence==="high"?"high":"standard";
  const rawEvidence:unknown[]=Array.isArray(body.evidence)?body.evidence:[];
  const limit=intelligence==="high"?14:intelligence==="light"?5:9;
  const evidence:GroundedEvidence[]=rawEvidence.slice(0,limit).map((raw,i)=>{
    const e=raw&&typeof raw==="object"?raw as Record<string,unknown>:{};
    return{
      index:Number(e.index)||i+1,
      title:String(e.title||"资料").slice(0,240),
      locator:String(e.locator||"").slice(0,240),
      text:String(e.text||"").slice(0,8000),
    };
  }).filter(e=>e.text.trim().length>0);

  if(!question||!evidence.length)return NextResponse.json({error:"请先输入问题并加入相关资料。"},{status:400});

  const fallback=deterministicGroundedAnswer({question,mode,intelligence,evidence});
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();

  if(user){
    const abuse=await enforceAbuseGuard(req,{
      scope:"knowledge-reason",
      userId:user.id,
      accountLimit:60,
      ipLimit:180,
      windowSeconds:3600,
    });
    if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status});

    try{
      const prompt=buildGroundedReasoningPrompt({question,mode,intelligence,evidence});
      const timeoutMs=intelligence==="high"?25_000:intelligence==="standard"?18_000:10_000;
      const job=await runNativeReasoningAndWait({
        taskId:randomUUID(),
        ownerId:user.id,
        prompt,
        deep:intelligence==="high",
        timeoutMs,
      });
      if(job?.state==="succeeded"){
        const answer=resultText(job);
        const checked=validateGroundedAnswer(answer,evidence);
        if(checked.ok){
          return NextResponse.json({
            answer,
            intelligence,
            evidenceCount:evidence.length,
            citations:checked.refs,
            confidence:null,
            sources:evidence.map(item=>({index:item.index,title:item.title,locator:item.locator||""})),
            execution:"native-reasoning",
            reasoningLevel:intelligence,
            chargedRmb:null,
            chargedUsd:null,
            chargedCurrency:null,
            learningEventId:null,
          },{headers:{"Cache-Control":"no-store"}});
        }
      }
    }catch(error){
      console.warn("[knowledge ask] native reasoning unavailable",error instanceof Error?error.message:"unknown");
    }
  }

  return NextResponse.json({
    answer:fallback.answer,
    intelligence,
    evidenceCount:evidence.length,
    citations:fallback.citations,
    confidence:fallback.confidence,
    sources:evidence.map(item=>({index:item.index,title:item.title,locator:item.locator||""})),
    execution:"grounded-fallback",
    reasoningLevel:intelligence,
    chargedRmb:null,
    chargedUsd:null,
    chargedCurrency:null,
    learningEventId:null,
  },{headers:{"Cache-Control":"no-store"}});
}
