import "server-only";
import {experienceProviders,type ExperienceProvider,type ExperienceRegion,type ExperienceTask} from "./free-provider-config";
import {providerStates,recordProviderRun} from "./provider-state";
import {getSessionAffinity,setSessionAffinity} from "./session-affinity";
import {canaryAllowed} from "./canary";

type Message={role:"system"|"user"|"assistant";content:string};
export type ExperienceResult={text:string;providerId:string;model:string;attempts:number;estimatedTokens:number};

function statusOf(e:any){return Number(e?.status||String(e?.message||"").match(/HTTP_(\d+)/)?.[1]||0)}
function retryable(status:number,message:string){return status===408||status===409||status===425||status===429||status>=500||/timeout|fetch failed|empty/i.test(message)}
function retryAfterSeconds(headers:Headers){
 const raw=headers.get("retry-after");
 if(raw){
  const n=Number(raw);if(Number.isFinite(n)&&n>=0)return Math.min(900,Math.ceil(n));
  const t=Date.parse(raw);if(Number.isFinite(t))return Math.min(900,Math.max(1,Math.ceil((t-Date.now())/1000)));
 }
 for(const name of ["x-ratelimit-reset","ratelimit-reset","x-rate-limit-reset"]){
  const v=headers.get(name);if(!v)continue;
  const n=Number(v);if(!Number.isFinite(n))continue;
  const seconds=n>1e12?Math.ceil((n-Date.now())/1000):n>1e9?Math.ceil(n-Date.now()/1000):Math.ceil(n);
  if(seconds>0)return Math.min(900,seconds);
 }
 return 0;
}
function tokenEstimate(messages:Message[],answer=""){return Math.max(1,Math.ceil((messages.reduce((n,m)=>n+m.content.length,0)+answer.length)/3))}
function successRate(s:{successCount:number;failureCount:number}){const n=s.successCount+s.failureCount;return n?Math.max(.05,s.successCount/n):.85}
function cooled(until:string|null){return Boolean(until&&Date.parse(until)>Date.now())}

async function candidates(region:ExperienceRegion,task:ExperienceTask,userId:string,sessionKey:string){
 const affinity=await getSessionAffinity(userId,sessionKey);

 const all=experienceProviders(region).filter(p=>p.tasks.includes(task)&&canaryAllowed(`${userId}:${sessionKey}:${p.id}`,p.canaryPercent));
 const states=await providerStates(all.map(x=>x.id));
 return all.map(p=>{
  const s=states[p.id]||{providerId:p.id,requestCount:0,successCount:0,failureCount:0,estimatedTokens:0,latencyEwmaMs:null,cooldownUntil:null};
  const normalizedUse=s.requestCount/Math.max(.1,p.dailyShare);
  // Water-filling first: favor the least-used share. Then quality, health, speed and observed latency.
  const fairness=120/(1+normalizedUse);
  const health=45*successRate(s);
  const latency=s.latencyEwmaMs==null?12:Math.max(-20,20-s.latencyEwmaMs/250);
  const quality=32*p.quality;
  const speed=18*p.speed;
  const priorityPenalty=Math.min(20,p.priority/10);
  const total=s.successCount+s.failureCount;
  const breakerOpen=total>=4&&s.failureCount/total>=0.5;
  const affinityBonus=affinity===p.id?28:0;
  return {p,s,breakerOpen,score:fairness+health+latency+quality+speed+affinityBonus-priorityPenalty};
 }).filter(x=>!x.breakerOpen&&!cooled(x.s.cooldownUntil)).sort((a,b)=>b.score-a.score);
}

async function openai(p:ExperienceProvider,messages:Message[],maxTokens:number,signal:AbortSignal){
 const r=await fetch(`${p.baseUrl.replace(/\/$/,"")}/chat/completions`,{method:"POST",cache:"no-store",redirect:"error",signal,
  headers:{"content-type":"application/json",authorization:`Bearer ${p.apiKey}`,...(p.id==="openrouter-free"?{"HTTP-Referer":"https://lingxifield.com","X-Title":"LINGXIFIELD SASI"}:{})},
  body:JSON.stringify({model:p.model,messages,max_tokens:maxTokens,stream:false})});
 const data=await r.json().catch(()=>({}));
 if(!r.ok){const e:any=new Error(`EXPERIENCE_PROVIDER_HTTP_${r.status}`);e.status=r.status;e.retryAfterSeconds=retryAfterSeconds(r.headers);throw e}
 const text=String(data?.choices?.[0]?.message?.content||"").trim();if(!text)throw new Error("EXPERIENCE_PROVIDER_EMPTY");return text;
}
async function gemini(p:ExperienceProvider,messages:Message[],maxTokens:number,signal:AbortSignal){
 const system=messages.filter(x=>x.role==="system").map(x=>x.content).join("\n\n");
 const contents=messages.filter(x=>x.role!=="system").map(x=>({role:x.role==="assistant"?"model":"user",parts:[{text:x.content}]}));
 const r=await fetch(`${p.baseUrl.replace(/\/$/,"")}/models/${encodeURIComponent(p.model.replace(/^models\//,""))}:generateContent`,{method:"POST",cache:"no-store",redirect:"error",signal,
  headers:{"content-type":"application/json","x-goog-api-key":p.apiKey},
  body:JSON.stringify({system_instruction:system?{parts:[{text:system}]}:undefined,contents,generationConfig:{maxOutputTokens:maxTokens}})});
 const data=await r.json().catch(()=>({}));if(!r.ok){const e:any=new Error(`EXPERIENCE_PROVIDER_HTTP_${r.status}`);e.status=r.status;e.retryAfterSeconds=retryAfterSeconds(r.headers);throw e}
 const text=(data?.candidates?.[0]?.content?.parts||[]).map((x:any)=>x?.text||"").join("").trim();if(!text)throw new Error("EXPERIENCE_PROVIDER_EMPTY");return text;
}
async function cloudflare(p:ExperienceProvider,messages:Message[],maxTokens:number,signal:AbortSignal){
 if(!p.accountId)throw new Error("EXPERIENCE_CLOUDFLARE_ACCOUNT_MISSING");
 const r=await fetch(`${p.baseUrl}/accounts/${encodeURIComponent(p.accountId)}/ai/run/${p.model}`,{method:"POST",cache:"no-store",redirect:"error",signal,
  headers:{"content-type":"application/json",authorization:`Bearer ${p.apiKey}`},body:JSON.stringify({messages,max_tokens:maxTokens,options:{rejectIfBusy:true}})});
 const data=await r.json().catch(()=>({}));if(!r.ok){const e:any=new Error(`EXPERIENCE_PROVIDER_HTTP_${r.status}`);e.status=r.status;e.retryAfterSeconds=retryAfterSeconds(r.headers);throw e}
 const text=String(data?.result?.response??data?.result?.text??"").trim();if(!text)throw new Error("EXPERIENCE_PROVIDER_EMPTY");return text;
}
async function call(p:ExperienceProvider,messages:Message[],maxTokens:number,timeoutMs:number){
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);
 try{
  if(p.wire==="gemini")return await gemini(p,messages,maxTokens,controller.signal);
  if(p.wire==="cloudflare")return await cloudflare(p,messages,maxTokens,controller.signal);
  return await openai(p,messages,maxTokens,controller.signal);
 }finally{clearTimeout(timer)}
}

/**
 * Adaptive water-filling router:
 * 1) spread usage by each source's configured dailyShare
 * 2) favor higher observed success and lower latency
 * 3) task affinity and quality/speed weights
 * 4) 429/5xx/timeout -> provider cooldown + immediate next source
 * 5) bounded attempts; no provider failure is returned directly to the UI
 */
export async function runExperienceText(input:{region:ExperienceRegion;task:ExperienceTask;messages:Message[];maxOutputTokens?:number;userId:string;sessionKey:string}):Promise<ExperienceResult>{
 const list=await candidates(input.region,input.task,input.userId,input.sessionKey);
 if(!list.length)throw new Error("EXPERIENCE_POOL_UNAVAILABLE");
 const maxTokens=Math.max(256,Math.min(4096,Number(input.maxOutputTokens||1536)));
 let attempts=0,last:unknown;
 // Keep total fallback latency below the 60s route limit, including DB settlement overhead.
 const deadline=Date.now()+42_000;
 for(const {p} of list.slice(0,5)){
  const remaining=deadline-Date.now();
  if(remaining<5_000)break;
  attempts++;const started=Date.now();
  try{
   const text=await call(p,input.messages,maxTokens,Math.min(12_000,Math.max(5_000,remaining-1_000)));const latency=Date.now()-started;const tokens=tokenEstimate(input.messages,text);
   await recordProviderRun({providerId:p.id,ok:true,tokens,latencyMs:latency});
   await setSessionAffinity(input.userId,input.sessionKey,p.id);
   return {text,providerId:p.id,model:p.model,attempts,estimatedTokens:tokens};
  }catch(e:any){
   last=e;const latency=Date.now()-started,status=statusOf(e),message=e instanceof Error?e.message:String(e);
   const transient=retryable(status,message);
   const providerRetryAfter=Math.max(0,Number(e?.retryAfterSeconds||0));
   const cooldown=providerRetryAfter>0?providerRetryAfter:(status===429?120:(transient?30:600));
   await recordProviderRun({providerId:p.id,ok:false,tokens:tokenEstimate(input.messages),latencyMs:latency,cooldownSeconds:cooldown});
   continue;
  }
 }
 throw last instanceof Error?last:new Error("EXPERIENCE_POOL_FAILED");
}
