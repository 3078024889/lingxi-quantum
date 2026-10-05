import "server-only";
import {createAdminClient} from "@/lib/supabase/admin";

export type ProviderDailyState={
 providerId:string; requestCount:number; successCount:number; failureCount:number;
 estimatedTokens:number; latencyEwmaMs:number|null; cooldownUntil:string|null;
};

const memory=new Map<string,ProviderDailyState>();
function day(){return new Date().toISOString().slice(0,10)}
function key(providerId:string){return `${day()}:${providerId}`}
function mem(providerId:string){return memory.get(key(providerId))||{providerId,requestCount:0,successCount:0,failureCount:0,estimatedTokens:0,latencyEwmaMs:null,cooldownUntil:null}}

export async function providerStates(ids:string[]):Promise<Record<string,ProviderDailyState>>{
 const out:Record<string,ProviderDailyState>={};
 ids.forEach(id=>out[id]=mem(id));
 try{
  const admin=createAdminClient();
  const {data,error}=await admin.from("sasi_experience_provider_daily")
   .select("provider_id,request_count,success_count,failure_count,estimated_tokens,latency_ewma_ms,cooldown_until")
   .eq("usage_day",day()).in("provider_id",ids);
  if(error)throw error;
  for(const r of data||[])out[String(r.provider_id)]={
   providerId:String(r.provider_id),requestCount:Number(r.request_count||0),successCount:Number(r.success_count||0),
   failureCount:Number(r.failure_count||0),estimatedTokens:Number(r.estimated_tokens||0),
   latencyEwmaMs:r.latency_ewma_ms==null?null:Number(r.latency_ewma_ms),cooldownUntil:r.cooldown_until?String(r.cooldown_until):null
  };
 }catch{}
 return out;
}

export async function recordProviderRun(input:{providerId:string;ok:boolean;tokens:number;latencyMs:number;cooldownSeconds?:number}){
 const current=mem(input.providerId);
 const nextLatency=current.latencyEwmaMs==null?input.latencyMs:Math.round(current.latencyEwmaMs*.75+input.latencyMs*.25);
 const next:ProviderDailyState={...current,requestCount:current.requestCount+1,successCount:current.successCount+(input.ok?1:0),failureCount:current.failureCount+(input.ok?0:1),estimatedTokens:current.estimatedTokens+Math.max(0,Math.floor(input.tokens||0)),latencyEwmaMs:nextLatency,cooldownUntil:input.cooldownSeconds?new Date(Date.now()+input.cooldownSeconds*1000).toISOString():null};
 memory.set(key(input.providerId),next);
 try{
  const admin=createAdminClient();
  await admin.rpc("record_sasi_experience_provider_run_v90",{
   p_provider_id:input.providerId,p_ok:input.ok,p_estimated_tokens:Math.max(0,Math.floor(input.tokens||0)),
   p_latency_ms:Math.max(0,Math.floor(input.latencyMs||0)),p_cooldown_seconds:Math.max(0,Math.floor(input.cooldownSeconds||0))
  });
 }catch{}
}
