import "server-only";
import {createAdminClient} from "@/lib/supabase/admin";
import {decryptProviderKey, type ByokProvider, validByokProvider} from "@/lib/sasi/credential-vault";
import {defaultBaseUrl, providerDefaults} from "./provider-defaults";
import {validateProviderBaseUrl} from "@/lib/sasi/gateway/ssrf-guard";
import type {TextMessage} from "@/lib/sasi/ark-text";
import {errorCode,recordConnectionFailure,recordConnectionSuccess} from "./runtime-health";
import {recordIntelligenceRun} from "./telemetry";
import {textChargeMinor} from "@/lib/sasi/pricing-v49";
import {chargeCompletedSasiUsage,requireSasiBalance,userSasiCurrency} from "@/lib/sasi/unified-balance";
import {providerJsonProbe} from "@/lib/security/provider-json-probe";

export type UserTextConnection={
  id:string; provider:ByokProvider; encrypted_credential:string; fingerprint:string;
  base_url:string; model_id:string; capabilities:unknown; health_status:string; enabled:boolean;
  capability_checked_at?:string|null;cooldown_until?:string|null;last_success_at?:string|null;last_latency_ms?:number|null;updated_at?:string|null;
};

function caps(value:unknown):string[]{
  if(Array.isArray(value))return value.filter(x=>typeof x==="string") as string[];
  if(value&&typeof value==="object"){
    const v=value as Record<string,unknown>;
    if(Array.isArray(v.available))return v.available.filter(x=>typeof x==="string") as string[];
  }
  return [];
}
function ts(value?:string|null){const n=value?Date.parse(value):0;return Number.isFinite(n)?n:0}
function usableNow(c:UserTextConnection){return !c.cooldown_until||ts(c.cooldown_until)<=Date.now()}
function score(c:UserTextConnection){
  const fresh=ts(c.capability_checked_at)>Date.now()-30*24*3600_000?1000:0;
  const success=ts(c.last_success_at)>Date.now()-7*24*3600_000?500:0;
  const latency=Number.isFinite(c.last_latency_ms)?Math.max(0,3000-Number(c.last_latency_ms))/10:0;
  return fresh+success+latency+ts(c.updated_at)/1e13;
}
export async function listUserTextConnections(userId:string):Promise<UserTextConnection[]>{
  const admin=createAdminClient();
  const {data,error}=await admin.from("sasi_provider_connections")
    .select("id,provider,encrypted_credential,fingerprint,base_url,model_id,capabilities,health_status,enabled,capability_checked_at,cooldown_until,last_success_at,last_latency_ms,updated_at")
    .eq("user_id",userId).eq("health_status","healthy").eq("enabled",true).order("updated_at",{ascending:false});
  if(error)throw new Error("CONNECTION_LOOKUP_FAILED");
  return ((data??[]).filter((r:any)=>validByokProvider(r.provider)) as UserTextConnection[])
    .filter(r=>providerDefaults(r.provider).textWire&&(caps(r.capabilities).includes("text")||providerDefaults(r.provider).capabilities.includes("text"))&&String(r.model_id||"").trim())
    .sort((a,b)=>(usableNow(b)?1:0)-(usableNow(a)?1:0)||score(b)-score(a));
}
export async function selectUserTextConnection(userId:string, preferredProvider?:string|null):Promise<UserTextConnection|null>{
  const usable=await listUserTextConnections(userId),available=usable.filter(usableNow);
  const preferred=preferredProvider?available.find(r=>r.provider===preferredProvider):null;
  return preferred||available[0]||usable[0]||null;
}
function safeBase(connection:UserTextConnection){
  const raw=String(connection.base_url||"").trim()||defaultBaseUrl(connection.provider);
  const guard=validateProviderBaseUrl(raw);if(!guard.pass||!guard.normalized)throw new Error("SERVICE_ADDRESS_INVALID");
  return guard.normalized.replace(/\/$/,"");
}
async function json(url:string, init:RequestInit){
  const r=await providerJsonProbe(url,Object.fromEntries(new Headers(init.headers).entries()),60_000,2*1024*1024,{method:init.method==="POST"?"POST":"GET",body:typeof init.body==="string"?init.body:undefined});
  if(!r.ok)throw new Error(`PROVIDER_HTTP_${r.status}`);return r.payload as any;
}
export async function runUserText(input:{userId:string;messages:TextMessage[];maxOutputTokens?:number;preferredProvider?:string|null;taskId?:string|null;connection?:UserTextConnection;billingCurrency?:"CNY"|"USD";validateAnswer?:(answer:string)=>void;additionalCharge?:{maximumMinor:number;actualMinor:(answer:string)=>number;kind:string}}){
  const connection=input.connection??await selectUserTextConnection(input.userId,input.preferredProvider);if(!connection)throw new Error("CONNECTION_REQUIRED");
  const started=Date.now(),key=decryptProviderKey(input.userId,connection.provider,connection.encrypted_credential),model=String(connection.model_id||"").trim();
  const currency=input.billingCurrency??await userSasiCurrency(input.userId);
  const estimatedTokens=Math.max(1,Math.ceil(input.messages.reduce((n,m)=>n+m.content.length,0)/3)+Math.max(256,Math.min(8192,Number(input.maxOutputTokens||2048))));
  await requireSasiBalance(input.userId,currency,textChargeMinor(estimatedTokens,currency)+(input.additionalCharge?.maximumMinor??0));
  if(!model)throw new Error("MODEL_REQUIRED");
  const base=safeBase(connection),wire=providerDefaults(connection.provider).textWire,limit=Math.max(256,Math.min(8192,Number(input.maxOutputTokens||2048)));
  try{
    let body:any,answer="",usage:{inputTokens:number|null;outputTokens:number|null}={inputTokens:null,outputTokens:null};
    if(wire==="anthropic"){
      const system=input.messages.filter(m=>m.role==="system").map(m=>m.content).join("\n\n");
      const messages=input.messages.filter(m=>m.role!=="system").map(m=>({role:m.role,content:m.content}));
      body=await json(`${base}/messages`,{method:"POST",headers:{"content-type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01"},body:JSON.stringify({model,system,messages,max_tokens:limit})});
      answer=(body.content||[]).map((x:any)=>x?.type==="text"?x.text:"").join("").trim();usage={inputTokens:body.usage?.input_tokens??null,outputTokens:body.usage?.output_tokens??null};
    }else if(wire==="gemini"){
      const system=input.messages.filter(m=>m.role==="system").map(m=>m.content).join("\n\n");
      const contents=input.messages.filter(m=>m.role!=="system").map(m=>({role:m.role==="assistant"?"model":"user",parts:[{text:m.content}]}));
      body=await json(`${base}/models/${encodeURIComponent(model.replace(/^models\//,""))}:generateContent`,{method:"POST",headers:{"content-type":"application/json","x-goog-api-key":key},body:JSON.stringify({system_instruction:system?{parts:[{text:system}]}:undefined,contents,generationConfig:{maxOutputTokens:limit}})});
      answer=(body.candidates?.[0]?.content?.parts||[]).map((x:any)=>x?.text||"").join("").trim();usage={inputTokens:body.usageMetadata?.promptTokenCount??null,outputTokens:body.usageMetadata?.candidatesTokenCount??null};
    }else{
      const tokenField=connection.provider==="openai"?{max_completion_tokens:limit}:{max_tokens:limit};
      body=await json(`${base}/chat/completions`,{method:"POST",headers:{"content-type":"application/json",Authorization:`Bearer ${key}`},body:JSON.stringify({model,messages:input.messages,...tokenField,stream:false})});
      answer=String(body.choices?.[0]?.message?.content||"").trim();usage={inputTokens:body.usage?.prompt_tokens??body.usage?.input_tokens??null,outputTokens:body.usage?.completion_tokens??body.usage?.output_tokens??null};
    }
    if(!answer)throw new Error("PROVIDER_EMPTY_ANSWER");
    input.validateAnswer?.(answer);
    const additionalMinor=input.additionalCharge?.actualMinor(answer)??0;
    if(!Number.isSafeInteger(additionalMinor)||additionalMinor<0||additionalMinor>(input.additionalCharge?.maximumMinor??0))throw new Error('SASI_ADDITIONAL_CHARGE_INVALID');
    const latencyMs=Date.now()-started;
    await Promise.allSettled([
      recordConnectionSuccess({userId:input.userId,connectionId:connection.id,latencyMs}),
      recordIntelligenceRun({userId:input.userId,taskId:input.taskId,capability:"text",provider:connection.provider,model,connectionId:connection.id,status:"succeeded",latencyMs,inputTokens:usage.inputTokens,outputTokens:usage.outputTokens}),
    ]);
    const totalTokens=(usage.inputTokens??Math.ceil(input.messages.reduce((n,m)=>n+m.content.length,0)/3))+(usage.outputTokens??Math.ceil(answer.length/3));
    const textMinor=textChargeMinor(totalTokens,currency),chargedMinor=textMinor+additionalMinor;
    const billing=await chargeCompletedSasiUsage({userId:input.userId,currency,amountMinor:chargedMinor,referenceId:`text:${input.taskId||connection.id+":"+started}`,kind:input.additionalCharge?.kind??"text",metadata:{provider:connection.provider,model,totalTokens,textMinor,additionalMinor}});
    return {answer,provider:connection.provider,model,connectionId:connection.id,usage:{...usage,totalTokens},billing:{currency,chargedMinor,textMinor,additionalMinor,pricingVersion:"2026-10-02-v49",alreadyCharged:Boolean(billing.alreadyCharged)}};
  }catch(error){
    const code=errorCode(error),latencyMs=Date.now()-started;
    const billingError=/^SASI_/.test(code);
    await Promise.allSettled([
      billingError?Promise.resolve():recordConnectionFailure({userId:input.userId,connectionId:connection.id,code,latencyMs}),
      recordIntelligenceRun({userId:input.userId,taskId:input.taskId,capability:"text",provider:connection.provider,model,connectionId:connection.id,status:billingError?"uncertain":/^(PROVIDER_HTTP_|PROVIDER_EMPTY_ANSWER|MODEL_REQUIRED|SERVICE_ADDRESS_INVALID)/.test(code)?"failed":"uncertain",latencyMs,errorCode:code}),
    ]);
    throw error;
  }
}
