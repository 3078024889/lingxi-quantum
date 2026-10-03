import "server-only";
import {createAdminClient} from "@/lib/supabase/admin";
import {decryptProviderKey,type ByokProvider} from "@/lib/sasi/credential-vault";
import {defaultBaseUrl} from "./provider-defaults";
import {validateProviderBaseUrl} from "@/lib/sasi/gateway/ssrf-guard";
import {errorCode,recordConnectionFailure,recordConnectionSuccess} from "./runtime-health";
import {recordIntelligenceRun} from "./telemetry";

export type VideoProvider="volcengine"|"xai"|"openai"|"aliyun";
export type UserVideoConnection={id:string;provider:VideoProvider;encrypted_credential:string;fingerprint:string;model_id:string;discovered_models:unknown;health_status:string;enabled:boolean;base_url?:string|null;cooldown_until?:string|null;last_success_at?:string|null;last_latency_ms?:number|null;updated_at?:string|null};
export type SelectedUserVideoConnection=UserVideoConnection&{videoModel:string};
function listModels(value:unknown){return Array.isArray(value)?value.filter(x=>typeof x==="string") as string[]:[]}
function chooseVideoModel(provider:VideoProvider,models:string[],fallback:string){const re=provider==="volcengine"?/seedance/i:provider==="aliyun"?/wan/i:provider==="openai"?/sora|video/i:/grok.*video|imagine.*video|video/i;return models.find(x=>re.test(x))||(re.test(fallback)?fallback:"")}
function stamp(v?:string|null){const n=v?Date.parse(v):0;return Number.isFinite(n)?n:0}
function available(c:UserVideoConnection){return !c.cooldown_until||stamp(c.cooldown_until)<=Date.now()}
function score(c:UserVideoConnection){const success=stamp(c.last_success_at)>Date.now()-7*24*3600_000?500:0;const latency=Number.isFinite(c.last_latency_ms)?Math.max(0,3000-Number(c.last_latency_ms))/10:0;return success+latency+stamp(c.updated_at)/1e13}
export async function selectUserVideoConnection(userId:string,preferred?:string|null):Promise<SelectedUserVideoConnection|null>{
 const {data,error}=await createAdminClient().from("sasi_provider_connections").select("id,provider,encrypted_credential,fingerprint,model_id,discovered_models,health_status,enabled,base_url,cooldown_until,last_success_at,last_latency_ms,updated_at").eq("user_id",userId).eq("health_status","healthy").eq("enabled",true).in("provider",["volcengine","xai","openai","aliyun"]).order("updated_at",{ascending:false});
 if(error)throw new Error("VIDEO_CONNECTION_LOOKUP_FAILED");
 const rows=(data??[]) as UserVideoConnection[];
 const mapped=rows.map(row=>({...row,videoModel:chooseVideoModel(row.provider,listModels(row.discovered_models),String(row.model_id||""))})).filter((row):row is SelectedUserVideoConnection=>Boolean(row.videoModel)).sort((a,b)=>(available(b)?1:0)-(available(a)?1:0)||score(b)-score(a));
 const live=mapped.filter(available);return (preferred?live.find(x=>x.provider===preferred):null)||live[0]||mapped[0]||null;
}
function authKey(userId:string,c:UserVideoConnection){return decryptProviderKey(userId,c.provider as ByokProvider,c.encrypted_credential)}
function safeBase(c:UserVideoConnection){const raw=String(c.base_url||"").trim()||defaultBaseUrl(c.provider as ByokProvider);const g=validateProviderBaseUrl(raw);if(!g.pass||!g.normalized)throw new Error("SERVICE_ADDRESS_INVALID");return g.normalized.replace(/\/$/,"")}
async function requestJson(url:string,init:RequestInit){const r=await fetch(url,{...init,cache:"no-store",redirect:"error",signal:AbortSignal.timeout(30_000)});const b=await r.json().catch(()=>({}));if(!r.ok)throw new Error(`VIDEO_PROVIDER_HTTP_${r.status}`);return b as any}
function httpsUrl(value:unknown){if(typeof value!=="string")return"";try{const u=new URL(value);return u.protocol==="https:"&&!u.username&&!u.password?u.toString():""}catch{return""}}
export async function submitUserVideo(input:{userId:string;connection:Awaited<ReturnType<typeof selectUserVideoConnection>>;prompt:string;duration:number;ratio:"16:9"|"9:16"|"1:1";resolution:"720p"|"1080p"|"4k";taskId?:string|null}){
 const c=input.connection;if(!c)throw new Error("VIDEO_CONNECTION_REQUIRED");const started=Date.now(),key=authKey(input.userId,c),model=c.videoModel,base=safeBase(c);
 try{
  let jobId="";
  if(c.provider==="volcengine"){
   const b=await requestJson(`${base}/contents/generations/tasks`,{method:"POST",headers:{Authorization:`Bearer ${key}`,"content-type":"application/json"},body:JSON.stringify({model,content:[{type:"text",text:input.prompt}],ratio:input.ratio,duration:input.duration,resolution:input.resolution,generate_audio:true,watermark:true})});jobId=typeof b.id==="string"?b.id:"";
  }else if(c.provider==="xai"){
   const b=await requestJson(`${base}/videos/generations`,{method:"POST",headers:{Authorization:`Bearer ${key}`,"content-type":"application/json"},body:JSON.stringify({model,prompt:input.prompt,duration:input.duration,aspect_ratio:input.ratio,resolution:input.resolution})});jobId=typeof b.request_id==="string"?b.request_id:"";
  }else if(c.provider==="openai"){
   if(![4,8,12].includes(input.duration)||input.ratio==="1:1")throw new Error("VIDEO_SPEC_UNSUPPORTED");const form=new FormData();form.set("model",model);form.set("prompt",input.prompt);form.set("seconds",String(input.duration));form.set("size",input.ratio==="9:16"?(input.resolution==="1080p"?"1024x1792":"720x1280"):(input.resolution==="1080p"?"1792x1024":"1280x720"));const b=await requestJson(`${base}/videos`,{method:"POST",headers:{Authorization:`Bearer ${key}`},body:form});jobId=typeof b.id==="string"?b.id:"";
  }else{
   const b=await requestJson(`${base.replace(/\/compatible-mode\/v1$/,'')}/api/v1/services/aigc/video-generation/video-synthesis`,{method:"POST",headers:{Authorization:`Bearer ${key}`,"content-type":"application/json","X-DashScope-Async":"enable"},body:JSON.stringify({model,input:{prompt:input.prompt},parameters:{resolution:input.resolution.toUpperCase(),ratio:input.ratio,duration:input.duration,prompt_extend:true,watermark:false}})});jobId=typeof b.output?.task_id==="string"?b.output.task_id:"";
  }
  if(!jobId)throw new Error("VIDEO_TASK_ID_INVALID");const latencyMs=Date.now()-started;
  await Promise.allSettled([recordConnectionSuccess({userId:input.userId,connectionId:c.id,latencyMs}),recordIntelligenceRun({userId:input.userId,taskId:input.taskId,capability:"video",provider:c.provider,model,connectionId:c.id,status:"succeeded",latencyMs})]);
  return{provider:c.provider,model,jobId};
 }catch(error){const code=errorCode(error),latencyMs=Date.now()-started;await Promise.allSettled([recordConnectionFailure({userId:input.userId,connectionId:c.id,code,latencyMs}),recordIntelligenceRun({userId:input.userId,taskId:input.taskId,capability:"video",provider:c.provider,model,connectionId:c.id,status:"failed",latencyMs,errorCode:code})]);throw error}
}
export async function pollUserVideo(input:{userId:string;connection:Awaited<ReturnType<typeof selectUserVideoConnection>>;jobId:string}){
 const c=input.connection;if(!c)throw new Error("VIDEO_CONNECTION_REQUIRED");const key=authKey(input.userId,c),base=safeBase(c);let b:any,status="";
 if(c.provider==="volcengine"){b=await requestJson(`${base}/contents/generations/tasks/${encodeURIComponent(input.jobId)}`,{headers:{Authorization:`Bearer ${key}`}});status=String(b.status||"").toLowerCase();if(status==="succeeded")return{state:"succeeded" as const,output:{videoUrl:httpsUrl(b.content?.video_url),aiGenerated:true}};}
 else if(c.provider==="xai"){b=await requestJson(`${base}/videos/${encodeURIComponent(input.jobId)}`,{headers:{Authorization:`Bearer ${key}`}});status=String(b.status||b.state||"").toLowerCase();if(["done","completed","succeeded"].includes(status))return{state:"succeeded" as const,output:{videoUrl:httpsUrl(b.video?.url||b.url),aiGenerated:true}};}
 else if(c.provider==="openai"){b=await requestJson(`${base}/videos/${encodeURIComponent(input.jobId)}`,{headers:{Authorization:`Bearer ${key}`}});status=String(b.status||"").toLowerCase();if(["completed","succeeded"].includes(status))return{state:"succeeded" as const,output:{videoUrl:`${base}/videos/${encodeURIComponent(input.jobId)}/content`,requiresAuthDownload:true,aiGenerated:true}};}
 else {const apiBase=base.replace(/\/compatible-mode\/v1$/,'');b=await requestJson(`${apiBase}/api/v1/tasks/${encodeURIComponent(input.jobId)}`,{headers:{Authorization:`Bearer ${key}`}});status=String(b.output?.task_status||b.status||"").toLowerCase();if(["succeeded","success"].includes(status))return{state:"succeeded" as const,output:{videoUrl:httpsUrl(b.output?.video_url||b.output?.results?.[0]?.url),aiGenerated:true}};}
 if(["failed","expired","cancelled","canceled","error"].includes(status))return{state:"failed" as const,output:{supplierStatus:status}};
 return{state:(["queued","pending","created"].includes(status)?"queued":"running") as "queued"|"running",output:{}};
}
