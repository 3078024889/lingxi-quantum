import {createHash,randomUUID} from "node:crypto";
import {compileVisualBrief} from "@/lib/sasi/creation-methods";
import {validateSeriesShots} from "@/lib/sasi/series-plan";
import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {reviewSasiProductionInput} from "@/lib/sasi/safety";
import {applyProjectMemory,loadProjectMemory} from "@/lib/sasi/load-project-memory";
import {loadVideoReferences,type VideoReference} from "@/lib/sasi/video-references";
import {submitSeedanceByok,pollSeedanceByok,type SeedanceRequest} from "@/lib/sasi/seedance-byok";
import {selectUserVideoConnection,submitUserVideo,pollUserVideo,type VideoProvider} from "@/lib/sasi/intelligence/user-video";
import {decryptProviderKey} from "@/lib/sasi/credential-vault";
import {videoChargeMinor} from "@/lib/sasi/pricing-v49";
import {chargeCompletedSasiUsage,requireSasiBalance,userSasiCurrency} from "@/lib/sasi/unified-balance";

export const runtime="nodejs";export const dynamic="force-dynamic";export const maxDuration=30;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PUBLIC_FIELDS="id,project_id,provider,state,request,estimated_fen,price_source,expires_at,approved_at,provider_task_id,output,created_at,updated_at";
const reply=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{"Cache-Control":"no-store"}});
function version(provider:string,model:string,resolution:string){return createHash("sha256").update(`${provider}:${model}:${resolution}:supplier-direct:v1`).digest("hex")}
function profilesFor(c:Awaited<ReturnType<typeof selectUserVideoConnection>>|null){if(!c)return[];const model=c.videoModel.toLowerCase();let resolutions:Array<"720p"|"1080p"|"4k">=["720p","1080p"];if(c.provider==="volcengine"){const is20=/seedance.*2[._-]?0/.test(model);const limited=/(fast|mini)/.test(model);if(is20&&limited)resolutions=["720p"];else if(is20)resolutions=["720p","1080p","4k"];else resolutions=["720p","1080p"]}else if(c.provider==="xai"&&!/1[._-]?5/.test(model))resolutions=["720p"];return resolutions.map(resolution=>({id:version(c.provider,c.videoModel,resolution),provider:c.provider,model:c.videoModel,resolution,generateAudio:c.provider==="volcengine",maxDuration:12,priceSource:"lingxifield-v49",imageMode:c.provider==="volcengine"?"reference_image":"none"}))}
function specAllowed(provider:VideoProvider,duration:number,ratio:string){if(provider==="openai")return[4,8,12].includes(duration)&&ratio!=="1:1";return duration>=4&&duration<=12&&["16:9","9:16","1:1"].includes(ratio)}

export async function GET(request:NextRequest){
 const{data:{user}}=await createClient().auth.getUser();if(!user)return reply({error:"AUTH_REQUIRED",enabled:false},401);
 const projectId=request.nextUrl.searchParams.get("projectId")??"";if(!UUID.test(projectId))return reply({error:"INVALID_PROJECT"},400);
 const admin=createAdminClient();const{data:project}=await admin.from("sasi_projects").select("id").eq("id",projectId).eq("user_id",user.id).maybeSingle();if(!project)return reply({error:"PROJECT_NOT_FOUND"},404);
 const connection=await selectUserVideoConnection(user.id).catch(()=>null),profiles=profilesFor(connection),profile=profiles[0]??null;
 const[tasks,assets]=await Promise.all([admin.from("sasi_byok_video_tasks").select(PUBLIC_FIELDS).eq("user_id",user.id).eq("project_id",projectId).order("created_at",{ascending:false}).limit(180),admin.from("sasi_assets").select("id,original_name,status,verified_size").eq("user_id",user.id).eq("project_id",projectId).in("status",["ready","external_scan_required"]).order("created_at",{ascending:false}).limit(100)]);
 if(tasks.error||assets.error)return reply({error:"BYOK_FOUNDATION_UNAVAILABLE"},503);
 return reply({enabled:Boolean(connection),connected:Boolean(connection),profile,profiles,tasks:tasks.data,assets:(assets.data??[]).filter(row=>/\.(png|jpe?g|webp)$/i.test(row.original_name)&&Number(row.verified_size)<=10*1024*1024),billing:"supplier_direct",provider:connection?.provider??null,reason:connection?null:"VIDEO_CONNECTION_REQUIRED"});
}

export async function POST(request:NextRequest){
 if(!isSameOriginMutation(request))return reply({error:"ORIGIN_REJECTED"},403);const{data:{user}}=await createClient().auth.getUser();if(!user)return reply({error:"AUTH_REQUIRED"},401);
 const body=await request.json().catch(()=>null) as any;if(!body||!["quote","quote-series","confirm","refresh"].includes(body.action))return reply({error:"INVALID_ACTION"},400);
 const admin=createAdminClient();const abuse=await enforceAbuseGuard(request,{scope:"byok-video",userId:user.id,accountLimit:120,ipLimit:300});if(!abuse.ok)return reply({error:abuse.error},abuse.status);
 const currency=await userSasiCurrency(user.id);
 const selected=await selectUserVideoConnection(user.id,typeof body.provider==="string"?body.provider:null).catch(()=>null);if(!selected)return reply({error:"VIDEO_CONNECTION_REQUIRED"},409);
 const profiles=profilesFor(selected),profile=body.profileId?profiles.find(p=>p.id===body.profileId):profiles[0];if(!profile)return reply({error:"VIDEO_PROFILE_UNAVAILABLE"},409);

 if(body.action==="quote-series"){
  if(!UUID.test(String(body.projectId))||!["16:9","9:16","1:1"].includes(body.ratio))return reply({error:"INVALID_VIDEO_INPUT"},400);
  const{data:project}=await admin.from("sasi_projects").select("id").eq("id",body.projectId).eq("user_id",user.id).eq("kind","drama").maybeSingle();if(!project)return reply({error:"PROJECT_NOT_FOUND"},404);
  try{const shots=validateSeriesShots(body.shots,profile.maxDuration),memory=await loadProjectMemory(admin,user.id,body.projectId),batchId=randomUUID(),rows=[];
   for(const[index,shot]of shots.entries()){
    if(!specAllowed(selected.provider,shot.duration,body.ratio))return reply({error:"VIDEO_SPEC_UNSUPPORTED"},422);
    const safety=reviewSasiProductionInput({prompt:shot.prompt,rightsConfirmed:body.rightsConfirmed,aiLabelAcknowledged:body.aiLabelAcknowledged});if(!safety.ok)return reply({error:safety.error},422);
    if(shot.assetIds.length&&selected.provider!=="volcengine")return reply({error:"REFERENCE_REQUIRES_COMPATIBLE_VIDEO_CONNECTION"},422);
    const refs=shot.assetIds.length?await loadVideoReferences(admin,user.id,body.projectId,shot.assetIds):[];
    const chargeMinor=videoChargeMinor(shot.duration,profile.resolution,currency);
    rows.push({user_id:user.id,project_id:body.projectId,provider:selected.provider,request:{model:selected.videoModel,...compileVisualBrief("video",applyProjectMemory(shot.prompt,memory.active),body.functions),originalPrompt:shot.prompt,duration:shot.duration,ratio:body.ratio,resolution:profile.resolution,generateAudio:profile.generateAudio,references:refs.map(({assetId,name,sha256})=>({assetId,name,sha256})),imageMode:refs.length?"reference_image":"none",batchId,batchShotCount:shots.length,episode:shot.episode,shotIndex:index,billingCurrency:currency,platformChargeMinor:chargeMinor},profile_version:profile.id,memory_version:memory.version,key_fingerprint:selected.fingerprint,estimated_fen:chargeMinor,price_source:"lingxifield-v49",expires_at:new Date(Date.now()+600000).toISOString()});
   }
   const saved=await admin.from("sasi_byok_video_tasks").insert(rows).select(PUBLIC_FIELDS);return saved.error?reply({error:"QUOTE_SAVE_FAILED"},503):reply({batchId,tasks:saved.data,billing:"supplier_direct"},201);
  }catch{return reply({error:"INVALID_SERIES_OR_REFERENCES"},422)}
 }
 if(body.action==="quote"){
  const projectId=String(body.projectId??""),prompt=typeof body.prompt==="string"?body.prompt.trim():"";if(!UUID.test(projectId)||prompt.length<8||prompt.length>3000||!Number.isInteger(body.duration)||!specAllowed(selected.provider,body.duration,body.ratio))return reply({error:"INVALID_VIDEO_INPUT"},400);
  const assetIds=Array.isArray(body.assetIds)?body.assetIds:[];if(assetIds.some((id:unknown)=>typeof id!=="string"))return reply({error:"INVALID_REFERENCE_SELECTION"},400);if(assetIds.length&&selected.provider!=="volcengine")return reply({error:"REFERENCE_REQUIRES_COMPATIBLE_VIDEO_CONNECTION"},422);
  const safety=reviewSasiProductionInput({prompt,rightsConfirmed:body.rightsConfirmed,aiLabelAcknowledged:body.aiLabelAcknowledged});if(!safety.ok)return reply({error:safety.error},422);
  const{data:project}=await admin.from("sasi_projects").select("id").eq("id",projectId).eq("user_id",user.id).eq("kind","drama").maybeSingle();if(!project)return reply({error:"PROJECT_NOT_FOUND"},404);
  try{const memory=await loadProjectMemory(admin,user.id,projectId),refs=assetIds.length?await loadVideoReferences(admin,user.id,projectId,assetIds):[];const input={model:selected.videoModel,...compileVisualBrief("video",applyProjectMemory(prompt,memory.active),body.functions),originalPrompt:prompt,duration:body.duration,ratio:body.ratio,resolution:profile.resolution,generateAudio:profile.generateAudio,references:refs.map(({assetId,name,sha256})=>({assetId,name,sha256})),imageMode:refs.length?"reference_image":"none"};
   const chargeMinor=videoChargeMinor(body.duration,profile.resolution,currency);
   const{data,error}=await admin.from("sasi_byok_video_tasks").insert({user_id:user.id,project_id:projectId,provider:selected.provider,request:{...input,billingCurrency:currency,platformChargeMinor:chargeMinor},profile_version:profile.id,memory_version:memory.version,key_fingerprint:selected.fingerprint,estimated_fen:chargeMinor,price_source:"lingxifield-v49",expires_at:new Date(Date.now()+600000).toISOString()}).select(PUBLIC_FIELDS).single();return error?reply({error:"QUOTE_SAVE_FAILED"},503):reply({task:data,billing:{supplier:"supplier_direct",platform:{currency,chargeMinor,pricingVersion:"2026-10-02-v49"}}},201);
  }catch{return reply({error:"PROJECT_CONTEXT_UNAVAILABLE_OR_TOO_LARGE"},422)}
 }
 const taskId=String(body.taskId??"");if(!UUID.test(taskId))return reply({error:"INVALID_TASK"},400);const{data:task,error}=await admin.from("sasi_byok_video_tasks").select("*").eq("id",taskId).eq("user_id",user.id).maybeSingle();if(error||!task)return reply({error:"TASK_NOT_FOUND"},404);
 const taskConnection=await selectUserVideoConnection(user.id,task.provider).catch(()=>null);if(!taskConnection||task.key_fingerprint!==taskConnection.fingerprint)return reply({error:"ORIGINAL_CONNECTION_REQUIRED"},409);
 if(body.action==="confirm"){
  if(body.acceptSupplierBilling!==true)return reply({error:"BUDGET_CONFIRMATION_REQUIRED"},422);if(task.state!=="quoted")return reply({taskId:task.id,state:task.state});if(Date.parse(task.expires_at)<=Date.now())return reply({error:"REQUOTE_REQUIRED"},409);
  const billingCurrency=(task.request?.billingCurrency==="USD"?"USD":"CNY") as "CNY"|"USD";const platformChargeMinor=Number(task.request?.platformChargeMinor||videoChargeMinor(task.request.duration,task.request.resolution,billingCurrency));
  try{await requireSasiBalance(user.id,billingCurrency,platformChargeMinor)}catch{return reply({error:"SASI_BALANCE_INSUFFICIENT",requiredMinor:platformChargeMinor,currency:billingCurrency},402)}
  let memory;try{memory=await loadProjectMemory(admin,user.id,task.project_id)}catch{return reply({error:"PROJECT_CONTEXT_UNAVAILABLE"},503)}if(memory.version!==task.memory_version)return reply({error:"REQUOTE_REQUIRED"},409);
  const claimed=await admin.from("sasi_byok_video_tasks").update({state:"submitting",approved_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",task.id).eq("user_id",user.id).eq("state","quoted").select("id").maybeSingle();if(claimed.error)return reply({error:"TASK_CLAIM_FAILED"},503);if(!claimed.data)return reply({taskId:task.id,state:"submitting"},202);
  try{let supplierId="";
   if(task.provider==="volcengine"&&Array.isArray(task.request.references)&&task.request.references.length){const key=decryptProviderKey(user.id,"volcengine",taskConnection.encrypted_credential),snapshots=task.request.references as VideoReference[],fresh=await loadVideoReferences(admin,user.id,task.project_id,snapshots.map(ref=>ref.assetId));if(fresh.some((ref,index)=>ref.sha256!==snapshots[index].sha256))return reply({error:"REFERENCE_CONTENT_CHANGED_REQUOTE"},409);const images=fresh.map(ref=>({url:ref.url,role:"reference_image" as const}));supplierId=await submitSeedanceByok(key,task.request as SeedanceRequest,images)}
   else{const submitted=await submitUserVideo({userId:user.id,connection:taskConnection,prompt:task.request.prompt,duration:task.request.duration,ratio:task.request.ratio,resolution:task.request.resolution,taskId:task.id});supplierId=submitted.jobId}
   const saved=await admin.from("sasi_byok_video_tasks").update({state:"queued",provider_task_id:supplierId,updated_at:new Date().toISOString()}).eq("id",task.id).eq("user_id",user.id);return saved.error?reply({error:"SUBMITTED_RECONCILIATION_REQUIRED",taskId:task.id,providerTaskId:supplierId},503):reply({taskId:task.id,state:"queued"},202);
  }catch{await admin.from("sasi_byok_video_tasks").update({state:"uncertain",updated_at:new Date().toISOString()}).eq("id",task.id).eq("user_id",user.id);return reply({error:"SUBMISSION_UNCERTAIN_CHECK_SUPPLIER",taskId:task.id},409)}
 }
 if(!["queued","running"].includes(task.state)||!task.provider_task_id)return reply({taskId:task.id,state:task.state});
 try{const result=task.provider==="volcengine"&&Array.isArray(task.request.references)&&task.request.references.length?await pollSeedanceByok(decryptProviderKey(user.id,"volcengine",taskConnection.encrypted_credential),task.provider_task_id):await pollUserVideo({userId:user.id,connection:taskConnection,jobId:task.provider_task_id});
 const billingCurrency=(task.request?.billingCurrency==="USD"?"USD":"CNY") as "CNY"|"USD";const platformChargeMinor=Number(task.request?.platformChargeMinor||videoChargeMinor(task.request.duration,task.request.resolution,billingCurrency));
 let billing:any=null;if(result.state==="succeeded")billing=await chargeCompletedSasiUsage({userId:user.id,currency:billingCurrency,amountMinor:platformChargeMinor,referenceId:`video:${task.id}`,kind:"video",metadata:{duration:task.request.duration,resolution:task.request.resolution,provider:task.provider}});
 const mergedOutput=result.state==="succeeded"?{...(result.output||{}),billing:{currency:billingCurrency,chargedMinor:platformChargeMinor,pricingVersion:"2026-10-02-v49"}}:result.output;const saved=await admin.from("sasi_byok_video_tasks").update({state:result.state,output:mergedOutput,updated_at:new Date().toISOString()}).eq("id",task.id).eq("user_id",user.id).in("state",["queued","running"]);return saved.error?reply({error:"TASK_STATUS_SAVE_FAILED"},503):reply({taskId:task.id,state:result.state,billing:billing?{currency:billingCurrency,chargedMinor:platformChargeMinor,alreadyCharged:Boolean(billing.alreadyCharged)}:null})}catch{return reply({error:"SUPPLIER_QUERY_UNAVAILABLE"},503)}
}
