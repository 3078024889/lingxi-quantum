import {NextRequest,NextResponse,after} from 'next/server';
import {createHash} from 'node:crypto';
import {createClient} from '@/lib/supabase/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {boundedRequestJson} from '@/lib/security/bounded-request-json';
import {isSameOriginMutation} from '@/lib/sasi/request-security';
import {enforceAbuseGuard} from '@/lib/security/abuse-guard';
import {seriesSpecification} from '@/lib/sasi/series-specification';
import {beginDurableRun} from '@/lib/sasi/durable/run-store';
import {enqueueDurableJob} from '@/lib/sasi/durable/job-queue';
import {experienceRegionFromHost} from '@/lib/sasi/experience/free-provider-config';
import {conversationUuid} from '@/lib/sasi/core/conversation-store';
import {runOneDetachedJob} from '@/lib/sasi/durable/detached-worker';
import {approvedScriptPreview,approvedEpisodeShots} from '@/lib/sasi/approved-script-preview';
import {seriesProgressState} from '@/lib/sasi/series-progress-state';
export const runtime='nodejs';export const dynamic='force-dynamic';export const maxDuration=180;
const reply=(value:unknown,status=200)=>NextResponse.json(value,{status,headers:{'Cache-Control':'private, no-store'}});

export async function GET(request:NextRequest){
 const {data:{user}}=await createClient().auth.getUser();if(!user)return reply({error:'AUTH_REQUIRED'},401);
 const id=request.nextUrl.searchParams.get('id');if(!id||!conversationUuid.test(id))return reply({error:'INVALID_SERIES'},400);
 const db=createAdminClient();
 const {data:production,error}=await db.from('sasi_series_productions_v78').select('*').eq('user_id',user.id).eq('id',id).maybeSingle();
 if(error)return reply({error:'SERIES_UNAVAILABLE'},503);if(!production)return reply({error:'SERIES_NOT_FOUND'},404);
 const ids=(production.plan_runs||[]).map((row:any)=>row.runId);
 const runs=ids.length?await db.from('sasi_durable_runs').select('id,state,output_json').eq('user_id',user.id).in('id',ids):{data:[],error:null};
 if(runs.error)return reply({error:'SERIES_PROGRESS_UNAVAILABLE'},503);
 const outputs=(runs.data||[]).map(row=>row.output_json as any);
 const ready=outputs.filter(row=>row?.state==='ready');
 // Older completed runs may have exhausted free inference. Recover already
 // approved, sufficiently detailed episodes without requeueing or paid calls.
 for(let episode=1;episode<=production.specification.episodes;episode++){if(ready.some(row=>row.episode===episode))continue;const shots=approvedEpisodeShots(production.approved_script,episode,production.specification.episodes,production.specification.seconds);if(shots)ready.push({state:'ready',episode,shots,source:'approved-script'});}
 const state=seriesProgressState(ready.length,production.specification.episodes,runs.data||[]);
 // Progress reads compute status without writing stale snapshots over workers.
 return reply({id,projectId:production.project_id,specification:production.specification,state,readyEpisodes:ready.length,completedEpisodes:(runs.data||[]).filter(run=>['succeeded','failed','cancelled','expired'].includes(run.state)).length,shots:ready.flatMap(row=>row.shots).sort((a:any,b:any)=>a.episode-b.episode),preview:approvedScriptPreview(production.approved_script,production.specification.episodes)});
}

export async function POST(request:NextRequest){
 if(!isSameOriginMutation(request))return reply({error:'ORIGIN_REJECTED'},403);
 const {data:{user}}=await createClient().auth.getUser();if(!user)return reply({error:'AUTH_REQUIRED'},401);
 const guard=await enforceAbuseGuard(request,{scope:'sasi-series-plan',userId:user.id,accountLimit:30,ipLimit:90});if(!guard.ok)return reply({error:'RATE_LIMITED'},429);
 const body:any=await boundedRequestJson(request,256*1024).catch(()=>null);
 if(!body||!conversationUuid.test(String(body.projectId))||typeof body.text!=='string'||!body.text.trim()||body.text.length>24000||typeof body.approvedScript!=='string'||body.approvedScript.length>32768)return reply({error:'INVALID_SERIES'},400);
 const db=createAdminClient();
 const project=await db.from('sasi_projects').select('id').eq('id',body.projectId).eq('user_id',user.id).eq('kind','drama').maybeSingle();
 if(project.error||!project.data)return reply({error:'PROJECT_NOT_FOUND'},404);
 if(body.threadId){const thread=await db.from('sasi_conversation_threads').select('id').eq('id',body.threadId).eq('user_id',user.id).maybeSingle();if(thread.error||!thread.data)return reply({error:'HISTORY_NOT_FOUND'},404)}
 let specification;try{specification=seriesSpecification(body.text)}catch{return reply({error:'SERIES_SPEC_UNSUPPORTED'},422)}
 const inputHash=createHash('sha256').update(JSON.stringify({text:body.text,script:body.approvedScript,specification})).digest('hex');
 const existing=await db.from('sasi_series_productions_v78').select('*').eq('user_id',user.id).eq('project_id',body.projectId).eq('input_hash',inputHash).maybeSingle();
 if(existing.error)return reply({error:'SERIES_UNAVAILABLE'},503);
 let production=existing.data;
 if(!production){
  const created=await db.from('sasi_series_productions_v78').upsert({user_id:user.id,project_id:body.projectId,thread_id:body.threadId||null,input_hash:inputHash,brief:body.text,approved_script:body.approvedScript,specification},{onConflict:'user_id,project_id,input_hash',ignoreDuplicates:true}).select('*').maybeSingle();
  if(created.error)return reply({error:'SERIES_UNAVAILABLE'},503);
  production=created.data||(await db.from('sasi_series_productions_v78').select('*').eq('user_id',user.id).eq('project_id',body.projectId).eq('input_hash',inputHash).maybeSingle()).data;
 }
 if(!production)return reply({error:'SERIES_UNAVAILABLE'},503);
 // Planning with a user's own account requires explicit cost consent. Normal preparation uses included allowance only.
 const acceptOwnModelCosts=body.acceptOwnModelCosts===true;
 const revision=acceptOwnModelCosts?production.revision+1:production.revision;
 if(!acceptOwnModelCosts&&production.revision>0)return reply({id:production.id,state:production.state,replayed:true});
 const plans=[];
 try{
  for(let episode=1;episode<=specification.episodes;episode++){
   const previous=(production.plan_runs||[]).find((row:any)=>row.episode===episode);
   if(previous){
    const completed=await db.from('sasi_durable_runs').select('state,output_json').eq('id',previous.runId).eq('user_id',user.id).maybeSingle();
    if(completed.data?.output_json?.state==='ready'||completed.data?.state==='running'){plans.push(previous);continue}
    if(acceptOwnModelCosts)await db.from('sasi_durable_jobs').update({state:'cancelled',updated_at:new Date().toISOString()}).eq('run_id',previous.runId).eq('user_id',user.id).in('state',['queued','waiting']);
   }
   const payload={productionId:production.id,episode,seconds:specification.seconds,region:experienceRegionFromHost(request.headers.get('host')),acceptOwnModelCosts};
   const hash=createHash('sha256').update(JSON.stringify(payload)).digest('hex');
   const run=await beginDurableRun({userId:user.id,sessionKey:production.id,task:'drama.episode',inputHash:hash,idempotencyKey:`series:${production.id}:${revision}:${episode}`});
   await enqueueDurableJob({runId:run.id,userId:user.id,jobKind:'drama.plan',workflowVersion:'drama.plan.v78',payload,priority:1,maxAttempts:acceptOwnModelCosts?1:3,deadlineAt:new Date(Date.now()+2*3600000).toISOString()});
   plans.push({episode,runId:run.id});
  }
  const saved=await db.from('sasi_series_productions_v78').update({plan_runs:plans,revision,state:'planning',updated_at:new Date().toISOString()}).eq('id',production.id).eq('user_id',user.id).lte('revision',revision);
  if(saved.error)return reply({error:'SERIES_PROGRESS_SAVE_FAILED'},503);
 }catch{return reply({error:'SERIES_ENQUEUE_FAILED',id:production.id},503)}
 after(async()=>{await runOneDetachedJob().catch(()=>{})});
 return reply({id:production.id,state:'planning',specification},202);
}
