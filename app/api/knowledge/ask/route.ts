import {randomUUID} from "node:crypto";
import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {buildGroundedReasoningPrompt,deterministicGroundedAnswer,validateGroundedAnswer,type GroundedEvidence,type IntelligenceTier,type KnowledgeMode} from "@/lib/sasi-kernel/cognition/grounded-answer";
import {runUserText,selectUserTextConnection} from "@/lib/sasi/intelligence/user-text";

export const runtime="nodejs";export const maxDuration=60;
const system="你是灵犀场资料理解助手。只根据用户提供的证据回答；不得把外部知识伪装成证据。引用必须保留证据编号。资料不足时明确说明不足。";

export async function POST(req:NextRequest){
 const contentLength=Number(req.headers.get("content-length")||0);if(Number.isFinite(contentLength)&&contentLength>384*1024)return NextResponse.json({error:"这次资料太多，请减少引用内容后再试。"},{status:413});
 if(!isSameOriginMutation(req))return NextResponse.json({error:"请求来源无效。"},{status:403});
 const body:Record<string,unknown>=await req.json().catch(()=>({}));const question=String(body.question||"").trim().slice(0,4000);const mode:KnowledgeMode=body.mode==="research"?"research":body.mode==="learning"?"learning":"book";const intelligence:IntelligenceTier=body.intelligence==="light"?"light":body.intelligence==="high"?"high":"standard";const useConnectedService=body.useConnectedService!==false;
 const rawEvidence:unknown[]=Array.isArray(body.evidence)?body.evidence:[];const limit=intelligence==="high"?14:intelligence==="light"?5:9;const evidence:GroundedEvidence[]=rawEvidence.slice(0,limit).map((raw,i)=>{const e=raw&&typeof raw==="object"?raw as Record<string,unknown>:{};return{index:Number(e.index)||i+1,title:String(e.title||"资料").slice(0,240),locator:String(e.locator||"").slice(0,240),text:String(e.text||"").slice(0,8000)}}).filter(e=>e.text.trim().length>0);
 if(!question||!evidence.length)return NextResponse.json({error:"请先输入问题并加入相关资料。"},{status:400});
 const fallback=deterministicGroundedAnswer({question,mode,intelligence,evidence});const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();
 if(user){
  const abuse=await enforceAbuseGuard(req,{scope:"knowledge-reason",userId:user.id,accountLimit:60,ipLimit:180,windowSeconds:3600});if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status});
  const prompt=buildGroundedReasoningPrompt({question,mode,intelligence,evidence});
  if(useConnectedService){
   try{
    const connection=await selectUserTextConnection(user.id);
    if(connection){
      const out=await runUserText({userId:user.id,taskId:randomUUID(),messages:[{role:"system",content:system},{role:"user",content:prompt}],maxOutputTokens:intelligence==="high"?4096:intelligence==="light"?1536:2560});
      const checked=validateGroundedAnswer(out.answer,evidence);
      if(checked.ok)return NextResponse.json({answer:out.answer,intelligence,evidenceCount:evidence.length,citations:checked.refs,confidence:null,sources:evidence.map(item=>({index:item.index,title:item.title,locator:item.locator||""})),execution:"connected-service",provider:out.provider,model:out.model,reasoningLevel:intelligence,billing:out.billing,learningEventId:null},{headers:{"Cache-Control":"no-store"}});
    }
   }catch(error){console.warn("[knowledge ask] connected service unavailable",error instanceof Error?error.message:"unknown")}
  }
 }
 return NextResponse.json({answer:fallback.answer,intelligence,evidenceCount:evidence.length,citations:fallback.citations,confidence:fallback.confidence,sources:evidence.map(item=>({index:item.index,title:item.title,locator:item.locator||""})),execution:"grounded-fallback",connectedServiceUsed:false,reasoningLevel:intelligence,chargedRmb:null,chargedUsd:null,chargedCurrency:null,learningEventId:null},{headers:{"Cache-Control":"no-store"}});
}
