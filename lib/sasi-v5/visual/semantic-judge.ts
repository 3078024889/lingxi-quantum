import "server-only";
import type {SasiV5QualityVector} from "@/lib/sasi-v5/types";

function baseUrl(){
  const raw=process.env.SASI_VISUAL_JUDGE_BASE_URL?.trim().replace(/\/$/,"")??"";
  if(!raw)return"";
  try{
    const u=new URL(raw);
    if(u.protocol!=="https:"||u.username||u.password||u.search||u.hash)return"";
    return u.toString().replace(/\/$/,"");
  }catch{return""}
}
function apiKey(){return process.env.SASI_VISUAL_JUDGE_API_KEY?.trim()??""}
function model(){return process.env.SASI_VISUAL_JUDGE_MODEL?.trim()??""}
export function visualSemanticJudgeReady(){return Boolean(baseUrl()&&apiKey()&&model())}

function number(v:unknown){const n=Number(v);return Number.isFinite(n)?Math.max(0,Math.min(1,n)):0}
function parseJsonText(value:string){
  const cleaned=value.trim().replace(/^```json\s*/i,"").replace(/```$/,"").trim();
  return JSON.parse(cleaned) as Record<string,unknown>;
}

export async function judgeVisual(input:{
  kind:"image"|"video";
  instruction:string;
  imageDataUrls:string[];
  identityCritical?:boolean;
  typographyCritical?:boolean;
  motionCritical?:boolean;
}):Promise<{vector:SasiV5QualityVector;reasons:string[];model:string}>{
  if(!visualSemanticJudgeReady())throw new Error("SASI_VISUAL_JUDGE_NOT_CONFIGURED");
  if(input.imageDataUrls.length<1||input.imageDataUrls.length>8)throw new Error("SASI_VISUAL_JUDGE_INPUT_INVALID");
  const prompt=`You are a production visual QA judge. Return JSON only.
Score 0..1: overall,instruction,reliability,continuity,identity,typography,motion,physics.
Judge against the user's instruction and visual consistency. Do not reward style alone.
If evidence is insufficient, lower reliability.
User instruction: ${input.instruction.slice(0,4000)}
Kind: ${input.kind}
Identity critical: ${Boolean(input.identityCritical)}
Typography critical: ${Boolean(input.typographyCritical)}
Motion critical: ${Boolean(input.motionCritical)}
Return {"overall":0,"instruction":0,"reliability":0,"continuity":0,"identity":0,"typography":0,"motion":0,"physics":0,"reasons":["..."]}`;
  const content:any[]=[{type:"text",text:prompt},...input.imageDataUrls.map(url=>({type:"image_url",image_url:{url}}))];
  const response=await fetch(`${baseUrl()}/chat/completions`,{
    method:"POST",headers:{Authorization:`Bearer ${apiKey()}`,"Content-Type":"application/json"},
    body:JSON.stringify({model:model(),temperature:0,response_format:{type:"json_object"},messages:[{role:"user",content}]}),
    cache:"no-store",signal:AbortSignal.timeout(45_000),
  });
  const payload=await response.json().catch(()=>({})) as any;
  if(!response.ok)throw new Error(`SASI_VISUAL_JUDGE_HTTP_${response.status}`);
  const text=String(payload.choices?.[0]?.message?.content??"");
  const parsed=parseJsonText(text);
  return{
    vector:{
      overall:number(parsed.overall),instruction:number(parsed.instruction),reliability:number(parsed.reliability),
      continuity:number(parsed.continuity),identity:number(parsed.identity),typography:number(parsed.typography),
      motion:number(parsed.motion),physics:number(parsed.physics),
    },
    reasons:Array.isArray(parsed.reasons)?parsed.reasons.slice(0,12).map(x=>String(x).slice(0,160)):[],
    model:model(),
  };
}
