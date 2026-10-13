import 'server-only';
import {createHash,randomUUID} from "node:crypto";
import {compileVisualBrief} from "@/lib/sasi/creation-methods";
import {validateSeriesShots} from "@/lib/sasi/series-plan";
import {NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {reviewSasiProductionInput} from "@/lib/sasi/safety";
import {applyProjectMemory,loadProjectMemory} from "@/lib/sasi/load-project-memory";
import {loadVideoReferences,type VideoReference} from "@/lib/sasi/video-references";
import {submitSeedanceByok,pollSeedanceByok,type SeedanceRequest} from "@/lib/sasi/seedance-byok";
import {selectUserVideoConnection,submitUserVideo,pollUserVideo,downloadOriginalUserVideo,type VideoProvider} from "@/lib/sasi/intelligence/user-video";
import {decryptProviderKey} from "@/lib/sasi/credential-vault";
import {videoChargeMinor} from "@/lib/sasi/pricing-v49";
import {requireSasiBalance,userSasiCurrency} from "@/lib/sasi/unified-balance";
import {compileSasiSkillGuidance,validateSasiSkillIds} from "@/lib/sasi/skills/router";
import {beginDurableRun,checkpointRun,type DurableRun} from '@/lib/sasi/durable/run-store';
import {archiveGeneratedMedia,generatedArchiveReady} from '@/lib/sasi/intelligence/archive-generated-media';

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PUBLIC_FIELDS="id,project_id,provider,state,request,estimated_fen,price_source,expires_at,approved_at,provider_task_id,output,created_at,updated_at";
const reply=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{"Cache-Control":"no-store"}});
function version(provider:string,model:string,resolution:string,baseUrl:string){return createHash("sha256").update(`${provider}:${model}:${resolution}:${baseUrl}:supplier-direct:v2`).digest("hex")}
export function profilesFor(c:Awaited<ReturnType<typeof selectUserVideoConnection>>|null){if(!c)return[];const model=c.videoModel.toLowerCase();let resolutions:Array<"720p"|"1080p"|"4k">=["720p","1080p"];if(c.provider==="volcengine"){const is20=/seedance.*2[._-]?0/.test(model);const limited=/(fast|mini)/.test(model);if(is20&&limited)resolutions=["720p"];else if(is20)resolutions=["720p","1080p","4k"];else resolutions=["720p","1080p"]}else if(c.provider==="xai"&&!/1[._-]?5/.test(model))resolutions=["720p"];return resolutions.map(resolution=>({id:version(c.provider,c.videoModel,resolution,c.base_url||""),provider:c.provider,model:c.videoModel,resolution,generateAudio:c.provider==="volcengine",maxDuration:12,priceSource:"lingxifield-v49",imageMode:c.provider==="volcengine"?"reference_image":"none"}))}
function specAllowed(provider:VideoProvider,duration:number,ratio:string){if(provider==="openai")return[4,8,12].includes(duration)&&ratio!=="1:1";return duration>=4&&duration<=12&&["16:9","9:16","1:1"].includes(ratio)}
function submissionRun(userId:string,task:{id:string;project_id:string;provider:string;request:unknown;key_fingerprint:string}){
 return beginDurableRun({userId,sessionKey:task.project_id,task:'byok-video-submit',idempotencyKey:'byok-video-submit:'+task.id,inputHash:createHash('sha256').update(JSON.stringify({id:task.id,provider:task.provider,request:task.request,keyFingerprint:task.key_fingerprint})).digest('hex')});
}

export async function executeOwnedVideoAction(userId:string,body:any){
 const user={id:userId},admin=createAdminClient();
 if(body.action!=='refresh'&&!generatedArchiveReady())return reply({error:'GENERATION_STORAGE_UNAVAILABLE'},503);
 const currency=await userSasiCurrency(user.id);
 async function deliverVideo(task:any,result:{state:'succeeded'|'failed';output:any},connection:Awaited<ReturnType<typeof selectUserVideoConnection>>){
  let output:Record<string,unknown>=result.output||{};
  if(result.state==='succeeded'){
   if(typeof output.videoUrl!=='string')return reply({error:'VIDEO_RESULT_INVALID'},503);
   const receipt=await admin.from('sasi_byok_video_tasks').update({output:{supplierResult:output},updated_at:new Date().toISOString()}).eq('id',task.id).eq('user_id',user!.id).in('state',['queued','running']);if(receipt.error)return reply({error:'SUPPLIER_RESULT_SAVE_FAILED'},503);
   if(output.requiresAuthDownload===true&&!connection)return reply({error:'ORIGINAL_CONNECTION_REQUIRED'},409);
   try{
    const asset=await archiveGeneratedMedia({userId:user!.id,taskId:task.id,projectId:task.project_id,kind:'video',url:output.videoUrl,expectedDuration:task.request.duration,expectedRatio:task.request.ratio,minSide:task.request.resolution==='4k'?2160:task.request.resolution==='1080p'?1080:720,originalDownload:output.requiresAuthDownload===true?()=>downloadOriginalUserVideo({userId:user!.id,connection:connection!,jobId:task.provider_task_id}):undefined});
    output={assetId:asset.assetId,videoUrl:'/api/sasi/generated-assets/'+asset.assetId,aiGenerated:true,verification:asset.verification,sha256:asset.sha256,width:asset.width,height:asset.height,durationSeconds:asset.duration_seconds};
   }catch(e){
    const code=e instanceof Error?e.message:'';
    if(/^VIDEO_(FORMAT_INVALID|DURATION_MISMATCH|RESOLUTION_MISMATCH|RATIO_MISMATCH|DECODE_INVALID)$/.test(code)){
     const failed=await admin.rpc('complete_sasi_byok_video_v64',{p_user_id:user!.id,p_task_id:task.id,p_provider_task_id:task.provider_task_id,p_state:'failed',p_output:{deliveryError:code}});
     return failed.error||!failed.data?.ok?reply({error:'TASK_RESULT_COMMIT_FAILED'},503):reply({error:'VIDEO_DELIVERY_INVALID_NOT_CHARGED',taskId:task.id,state:failed.data.state},422);
    }
    return reply({error:'VIDEO_ARCHIVE_PENDING_RETRY_SAVE',taskId:task.id},503);
   }
  }
  const completed=await admin.rpc('complete_sasi_byok_video_v64',{p_user_id:user!.id,p_task_id:task.id,p_provider_task_id:task.provider_task_id,p_state:result.state,p_output:output});
  if(completed.error)return reply({error:'TASK_RESULT_COMMIT_FAILED'},503);
  if(!completed.data?.ok)return reply({error:completed.data?.error||'TASK_RESULT_COMMIT_FAILED'},409);
  return reply({taskId:task.id,state:completed.data.state,billing:completed.data.billing?{currency:task.request?.billingCurrency==='USD'?'USD':'CNY',chargedMinor:Number(task.estimated_fen),alreadyCharged:Boolean(completed.data.billing.alreadyCharged)}:null});
 }
 const selected=body.action==='refresh'?null:await selectUserVideoConnection(user.id,typeof body.provider==="string"?body.provider:null).catch(()=>null);if(body.action!=='refresh'&&!selected)return reply({error:"VIDEO_CONNECTION_REQUIRED"},409);
 const profiles=profilesFor(selected),profile=body.profileId?profiles.find(p=>p.id===body.profileId):profiles[0];if(body.action!=='refresh'&&!profile)return reply({error:"VIDEO_PROFILE_UNAVAILABLE"},409);

 if(body.action==="quote-series"){
  if(!selected||!profile)return reply({error:'VIDEO_PROFILE_UNAVAILABLE'},409);
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
  if(!selected||!profile)return reply({error:'VIDEO_PROFILE_UNAVAILABLE'},409);
  const projectId=String(body.projectId??""),prompt=typeof body.prompt==="string"?body.prompt.trim():"";if(!UUID.test(projectId)||prompt.length<8||prompt.length>3000||!Number.isInteger(body.duration)||!specAllowed(selected.provider,body.duration,body.ratio))return reply({error:"INVALID_VIDEO_INPUT"},400);
  const assetIds=Array.isArray(body.assetIds)?body.assetIds:[];if(assetIds.some((id:unknown)=>typeof id!=="string"))return reply({error:"INVALID_REFERENCE_SELECTION"},400);if(assetIds.length&&selected.provider!=="volcengine")return reply({error:"REFERENCE_REQUIRES_COMPATIBLE_VIDEO_CONNECTION"},422);
  const safety=reviewSasiProductionInput({prompt,rightsConfirmed:body.rightsConfirmed,aiLabelAcknowledged:body.aiLabelAcknowledged});if(!safety.ok)return reply({error:safety.error},422);
  const{data:project}=await admin.from("sasi_projects").select("id").eq("id",projectId).eq("user_id",user.id).eq("kind","drama").maybeSingle();if(!project)return reply({error:"PROJECT_NOT_FOUND"},404);
  const skillIds=validateSasiSkillIds(body.skillIds,"drama"),guidance=compileSasiSkillGuidance(skillIds);
  try{const memory=await loadProjectMemory(admin,user.id,projectId),refs=assetIds.length?await loadVideoReferences(admin,user.id,projectId,assetIds):[];const input={model:selected.videoModel,...compileVisualBrief("video",applyProjectMemory(prompt,memory.active)+"\n"+guidance,body.functions),skillIds,originalPrompt:prompt,duration:body.duration,ratio:body.ratio,resolution:profile.resolution,generateAudio:profile.generateAudio,references:refs.map(({assetId,name,sha256})=>({assetId,name,sha256})),imageMode:refs.length?"reference_image":"none"};
   const chargeMinor=videoChargeMinor(body.duration,profile.resolution,currency);
   const{data,error}=await admin.from("sasi_byok_video_tasks").insert({user_id:user.id,project_id:projectId,provider:selected.provider,request:{...input,billingCurrency:currency,platformChargeMinor:chargeMinor},profile_version:profile.id,memory_version:memory.version,key_fingerprint:selected.fingerprint,estimated_fen:chargeMinor,price_source:"lingxifield-v49",expires_at:new Date(Date.now()+600000).toISOString()}).select(PUBLIC_FIELDS).single();return error?reply({error:"QUOTE_SAVE_FAILED"},503):reply({task:data,billing:{supplier:"supplier_direct",platform:{currency,chargeMinor,pricingVersion:"2026-10-02-v49"}}},201);
  }catch{return reply({error:"PROJECT_CONTEXT_UNAVAILABLE_OR_TOO_LARGE"},422)}
 }
 const taskId=String(body.taskId??"");if(!UUID.test(taskId))return reply({error:"INVALID_TASK"},400);const{data:task,error}=await admin.from("sasi_byok_video_tasks").select("*").eq("id",taskId).eq("user_id",user.id).maybeSingle();if(error||!task)return reply({error:"TASK_NOT_FOUND"},404);
 if(body.action==='refresh'){
  if(['succeeded','failed'].includes(task.state))return reply({taskId:task.id,state:task.state});
  const receipt=task.output?.supplierResult;
  if(['queued','running'].includes(task.state)&&typeof receipt?.videoUrl==='string'&&receipt.requiresAuthDownload!==true)return deliverVideo(task,{state:'succeeded',output:receipt},null);
 }
 const taskConnection=await selectUserVideoConnection(user.id,task.provider).catch(()=>null);if(!taskConnection||task.key_fingerprint!==taskConnection.fingerprint)return reply({error:"ORIGINAL_CONNECTION_REQUIRED"},409);
 if(body.action==="confirm"){
  if(body.acceptSupplierBilling!==true)return reply({error:"BUDGET_CONFIRMATION_REQUIRED"},422);if(task.state!=="quoted")return reply({taskId:task.id,state:task.state});if(Date.parse(task.expires_at)<=Date.now())return reply({error:"REQUOTE_REQUIRED"},409);
  const billingCurrency=(task.request?.billingCurrency==="USD"?"USD":"CNY") as "CNY"|"USD";const platformChargeMinor=Number(task.request?.platformChargeMinor||videoChargeMinor(task.request.duration,task.request.resolution,billingCurrency));
  let requiredMinor=platformChargeMinor;
  if(task.request?.batchId){const batch=await admin.from("sasi_byok_video_tasks").select("state,estimated_fen,request").eq("user_id",user.id).eq("project_id",task.project_id).contains("request",{batchId:task.request.batchId});if(batch.error||!batch.data?.length)return reply({error:"BATCH_UNAVAILABLE"},503);const pending=batch.data.filter(row=>row.state==="quoted");if(pending.some(row=>row.request?.billingCurrency!==billingCurrency||!Number.isSafeInteger(Number(row.estimated_fen))||Number(row.estimated_fen)<0))return reply({error:"QUOTE_INVALID"},409);requiredMinor=pending.reduce((sum,row)=>sum+Number(row.estimated_fen),0)}
  if(task.balance_reservation?.state!=='held')try{await requireSasiBalance(user.id,billingCurrency,requiredMinor)}catch{return reply({error:"SASI_BALANCE_INSUFFICIENT",requiredMinor,currency:billingCurrency},402)}
  let memory;try{memory=await loadProjectMemory(admin,user.id,task.project_id)}catch{return reply({error:"PROJECT_CONTEXT_UNAVAILABLE"},503)}if(memory.version!==task.memory_version)return reply({error:"REQUOTE_REQUIRED"},409);
  let referenceImages:Array<{url:string;role:"reference_image"}>|null=null;
  if(task.provider==="volcengine"&&Array.isArray(task.request.references)&&task.request.references.length){
   const snapshots=task.request.references as VideoReference[];
   let fresh:Awaited<ReturnType<typeof loadVideoReferences>>;try{fresh=await loadVideoReferences(admin,user.id,task.project_id,snapshots.map(ref=>ref.assetId))}catch{return reply({error:"REFERENCE_CONTEXT_UNAVAILABLE"},503)}
   if(fresh.length!==snapshots.length||fresh.some((ref,index)=>ref.assetId!==snapshots[index].assetId||ref.sha256!==snapshots[index].sha256))return reply({error:"REFERENCE_CONTENT_CHANGED_REQUOTE"},409);
   referenceImages=fresh.map(ref=>({url:ref.url,role:"reference_image" as const}));
  }
  let run:DurableRun;try{run=await submissionRun(user.id,task)}catch{return reply({error:'SUBMISSION_JOURNAL_UNAVAILABLE'},503)}
  const claimed=await admin.rpc('claim_sasi_byok_video_v64',{p_user_id:user.id,p_task_id:task.id});
  if(claimed.error)return reply({error:'TASK_CLAIM_FAILED'},503);
  if(!claimed.data?.ok)return reply({error:claimed.data?.error||'TASK_CLAIM_FAILED'},claimed.data?.error==='SASI_BALANCE_INSUFFICIENT'?402:409);
  if(!claimed.data.claimed)return reply({taskId:task.id,state:claimed.data.state},202);
  try{let supplierId="";
   // No retry loop around an external effect: an ambiguous submission must be reconciled.
   await checkpointRun({runId:run.id,step:'supplier-submit',state:'running'});
   if(referenceImages){const key=decryptProviderKey(user.id,"volcengine",taskConnection.encrypted_credential);supplierId=await submitSeedanceByok(key,task.request as SeedanceRequest,referenceImages)}
   else{const submitted=await submitUserVideo({userId:user.id,connection:taskConnection,prompt:task.request.prompt,duration:task.request.duration,ratio:task.request.ratio,resolution:task.request.resolution,taskId:task.id});supplierId=submitted.jobId}
   if(!supplierId)throw new Error('SUPPLIER_JOB_ID_MISSING');
   // Persist the supplier receipt independently before updating the task's read model.
   await checkpointRun({runId:run.id,step:'supplier-accepted',state:'succeeded',payload:{taskId:task.id,provider:task.provider,providerTaskId:supplierId}});
   const saved=await admin.from("sasi_byok_video_tasks").update({state:"queued",provider_task_id:supplierId,updated_at:new Date().toISOString()}).eq("id",task.id).eq("user_id",user.id).eq('state','submitting');return saved.error?reply({error:"SUBMITTED_RECONCILIATION_REQUIRED",taskId:task.id,providerTaskId:supplierId},503):reply({taskId:task.id,state:"queued"},202);
  }catch{await admin.from("sasi_byok_video_tasks").update({state:"uncertain",updated_at:new Date().toISOString()}).eq("id",task.id).eq("user_id",user.id);return reply({error:"SUBMISSION_UNCERTAIN_CHECK_SUPPLIER",taskId:task.id},409)}
 }
 if(['submitting','uncertain'].includes(task.state)){
  let run:DurableRun;try{run=await submissionRun(user.id,task)}catch{return reply({error:'SUBMISSION_JOURNAL_UNAVAILABLE'},503)}
  const receipt=run.output as {taskId?:unknown;provider?:unknown;providerTaskId?:unknown}|null;
  if(run.state!=='succeeded'||!receipt||receipt.taskId!==task.id||receipt.provider!==task.provider||typeof receipt.providerTaskId!=='string'||!receipt.providerTaskId)return reply({error:'SUBMISSION_UNCERTAIN_CHECK_SUPPLIER',taskId:task.id,state:task.state},409);
  const recovered=await admin.from('sasi_byok_video_tasks').update({state:'queued',provider_task_id:receipt.providerTaskId,updated_at:new Date().toISOString()}).eq('id',task.id).eq('user_id',user.id).in('state',['submitting','uncertain']).select('id').maybeSingle();
  if(recovered.error)return reply({error:'SUBMITTED_RECONCILIATION_REQUIRED',taskId:task.id},503);
  // This refresh restores a persisted receipt; it never creates another supplier job.
  return reply({taskId:task.id,state:recovered.data?'queued':task.state,recovered:Boolean(recovered.data)},202);
 }
 if(!["queued","running"].includes(task.state)||!task.provider_task_id)return reply({taskId:task.id,state:task.state});
 try{const result=task.provider==="volcengine"&&Array.isArray(task.request.references)&&task.request.references.length?await pollSeedanceByok(decryptProviderKey(user.id,"volcengine",taskConnection.encrypted_credential),task.provider_task_id):await pollUserVideo({userId:user.id,connection:taskConnection,jobId:task.provider_task_id});
 if(result.state==='succeeded'||result.state==='failed'){
  return deliverVideo(task,{state:result.state,output:result.output},taskConnection);
 }
 const saved=await admin.from("sasi_byok_video_tasks").update({state:result.state,output:result.output,updated_at:new Date().toISOString()}).eq("id",task.id).eq("user_id",user.id).in("state",["queued","running"]);return saved.error?reply({error:"TASK_STATUS_SAVE_FAILED"},503):reply({taskId:task.id,state:result.state,billing:null})}catch{return reply({error:"SUPPLIER_QUERY_UNAVAILABLE"},503)}
}
