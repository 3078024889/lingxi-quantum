import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {buildGroundedReasoningPrompt,deterministicGroundedAnswer,validateGroundedAnswer,type GroundedEvidence,type IntelligenceTier,type KnowledgeMode} from "@/lib/sasi-kernel/cognition/grounded-answer";
import{compileSasiSkillGuidance,validateSasiSkillIds}from"@/lib/sasi/skills/router";
import{experienceRegionFromHost}from"@/lib/sasi/experience/free-provider-config";
import{runKnowledgeText}from"@/lib/sasi/knowledge/durable-knowledge";
import{DurableStepBusyError}from"@/lib/sasi/durable/step-store";

export const runtime="nodejs";export const maxDuration=60;
const system="你是灵犀场资料理解助手。只根据用户提供的证据回答；不得把外部知识伪装成证据。引用必须保留证据编号。资料不足时明确说明不足。";

function publicSources(evidence:GroundedEvidence[]){
 return evidence.map(item=>({index:item.index,title:item.title,locator:item.locator||""}));
}

export async function POST(req:NextRequest){
 const contentLength=Number(req.headers.get("content-length")||0);
 if(Number.isFinite(contentLength)&&contentLength>384*1024)return NextResponse.json({error:"这次资料太多，请减少引用内容后再试。"},{status:413});
 if(!isSameOriginMutation(req))return NextResponse.json({error:"请求来源无效。"},{status:403});

 const body:Record<string,unknown>=await req.json().catch(()=>({}));
 const question=String(body.question||"").trim().slice(0,4000);
 const mode:KnowledgeMode=body.mode==="research"?"research":body.mode==="learning"?"learning":"book";
 const intelligence:IntelligenceTier=body.intelligence==="light"?"light":body.intelligence==="high"?"high":"standard";

 // Connected supplier/SASI billing is never entered by default.
 // It requires BOTH an enabled choice and explicit consent from the current request.
 const allowConnected=body.useConnectedService===true&&body.acceptConnectedBilling===true;

 const skillIds=validateSasiSkillIds(body.skillIds,mode);
 const skillGuidance=compileSasiSkillGuidance(skillIds);
 const rawEvidence:unknown[]=Array.isArray(body.evidence)?body.evidence:[];
 const limit=intelligence==="high"?14:intelligence==="light"?5:9;
 const evidence:GroundedEvidence[]=rawEvidence.slice(0,limit).map((raw,i)=>{
  const e=raw&&typeof raw==="object"?raw as Record<string,unknown>:{};
  return{index:Number(e.index)||i+1,title:String(e.title||"资料").slice(0,240),locator:String(e.locator||"").slice(0,240),text:String(e.text||"").slice(0,8000)}
 }).filter(e=>e.text.trim().length>0);

 if(!question||!evidence.length)return NextResponse.json({error:"请先输入问题并加入相关资料。"},{status:400});

 const fallback=deterministicGroundedAnswer({question,mode,intelligence,evidence});
 const sources=publicSources(evidence);
 const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();

 if(!user)return NextResponse.json({
  answer:fallback.answer,intelligence,evidenceCount:evidence.length,citations:fallback.citations,
  confidence:fallback.confidence,sources,execution:"grounded-fallback",connectedServiceUsed:false,
  experienceExhausted:false,reasoningLevel:intelligence,runId:null,durableExecution:false
 },{headers:{"Cache-Control":"no-store"}});

 const abuse=await enforceAbuseGuard(req,{scope:"knowledge-reason",userId:user.id,accountLimit:60,ipLimit:180,windowSeconds:3600});
 if(!abuse.ok)return NextResponse.json({
  answer:fallback.answer,intelligence,evidenceCount:evidence.length,citations:fallback.citations,
  confidence:fallback.confidence,sources,execution:"grounded-fallback",connectedServiceUsed:false,
  experienceExhausted:false,runId:null,durableExecution:false
 },{headers:{"Cache-Control":"no-store"}});

 const prompt=buildGroundedReasoningPrompt({question,mode,intelligence,evidence});
 const sessionKey=String(body.sessionKey||body.projectId||`knowledge:${mode}`).slice(0,160);
 const clientTurnId=String(body.clientTurnId||req.headers.get("idempotency-key")||"").trim();
 const idempotencyKey=(clientTurnId||`${user.id}:${sessionKey}:${question.slice(0,180)}`).slice(0,160);

 try{
  const execution=await runKnowledgeText({
   userId:user.id,
   region:experienceRegionFromHost(req.headers.get("host")),
   task:mode==="research"?"research":"knowledge",
   messages:[{role:"system",content:`${system}\n${skillGuidance}`},{role:"user",content:prompt}],
   maxOutputTokens:intelligence==="high"?4096:intelligence==="light"?1536:2560,
   allowConnected,
   sessionKey,
   idempotencyKey
  });

  const out=execution.out;
  if(out.kind==="answer"){
   const checked=validateGroundedAnswer(out.answer,evidence);
   if(checked.ok)return NextResponse.json({
    answer:out.answer,intelligence,evidenceCount:evidence.length,citations:checked.refs,confidence:null,sources,
    execution:out.source,connectedServiceUsed:out.source==="connected",experienceExhausted:out.experienceExhausted,
    reasoningLevel:intelligence,runId:execution.runId,durableExecution:execution.durable,replayed:execution.replayed
   },{headers:{"Cache-Control":"no-store"}});
  }

  return NextResponse.json({
   answer:fallback.answer,intelligence,evidenceCount:evidence.length,citations:fallback.citations,
   confidence:fallback.confidence,sources,execution:"grounded-fallback",connectedServiceUsed:false,
   experienceExhausted:out.kind==="needs-connection"&&out.experienceExhausted,
   needsConnection:out.kind==="needs-connection",
   runId:execution.runId,durableExecution:execution.durable,replayed:execution.replayed
  },{headers:{"Cache-Control":"no-store"}});
 }catch(e){
  if(e instanceof DurableStepBusyError){
   return NextResponse.json({
    state:"running",runId:e.runId,durableExecution:true,retryAfterMs:1200
   },{status:202,headers:{"Cache-Control":"no-store","Retry-After":"1"}});
  }
  // A durable-layer fault must not make grounded knowledge unusable.
  return NextResponse.json({
   answer:fallback.answer,intelligence,evidenceCount:evidence.length,citations:fallback.citations,
   confidence:fallback.confidence,sources,execution:"grounded-fallback",connectedServiceUsed:false,
   experienceExhausted:false,reasoningLevel:intelligence,runId:null,durableExecution:false
  },{headers:{"Cache-Control":"no-store"}});
 }
}
