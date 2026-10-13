import "server-only";
import{appendRunEvent,checkpointRun}from"./run-store";
import{claimDurableJob,completeDurableJob,createWorkerId,failDurableJob,renewDurableJob}from"./job-queue";
import{currentWorkerBuild,workerSupports}from"./worker-version";
import{executeKnowledgeJob}from"./knowledge-job-handler";
import {executeDramaEpisodeJob} from './drama-episode-job';
import {executeVideoAdvanceJob} from './video-advance-job';
import {executeVideoComposeJob} from './video-compose-job';
import {createAdminClient} from '@/lib/supabase/admin';

function classifyRetryable(e:unknown){
 const m=(e instanceof Error?e.message:String(e)).toUpperCase();
 if(m.includes("INVALID_")||m.includes("IDEMPOTENCY_INPUT_MISMATCH")||m.includes("UNSUPPORTED_WORKFLOW_VERSION")||m.includes('UNCERTAIN'))return false;
 return true;
}

export async function runOneDetachedJob(){
 const workerId=createWorkerId(),job=await claimDurableJob(workerId,90);
 if(!job)return{claimed:false,workerBuild:currentWorkerBuild()};

 if(!workerSupports(job.jobKind,job.workflowVersion)){
  await failDurableJob(job.id,workerId,"UNSUPPORTED_WORKFLOW_VERSION",false);
  await checkpointRun({runId:job.runId,step:"worker.dispatch",state:"failed",errorCode:"UNSUPPORTED_WORKFLOW_VERSION"});
  await appendRunEvent({runId:job.runId,kind:"RUN_FAILED",metadata:{state:"failed",recoverable:false}});
  return{claimed:true,jobId:job.id,runId:job.runId,state:"failed",reason:"unsupported-version",workerBuild:currentWorkerBuild()};
 }

 let stopped=false;
 const heartbeat=setInterval(()=>{if(!stopped)void renewDurableJob(job.id,workerId,90)},20_000);
 heartbeat.unref?.();

 try{
  await appendRunEvent({runId:job.runId,kind:"RUN_STARTED",metadata:{state:"running"}});
  if(job.jobKind==="knowledge.generate"){
   await executeKnowledgeJob({runId:job.runId,userId:job.userId,payload:job.payload});
  }else if(job.jobKind==='drama.plan'){
   await executeDramaEpisodeJob({runId:job.runId,userId:job.userId,payload:job.payload});
  }else if(job.jobKind==='video.advance'){
   await executeVideoAdvanceJob({runId:job.runId,userId:job.userId,payload:job.payload});
  }else if(job.jobKind==='video.compose'){
   await executeVideoComposeJob({runId:job.runId,userId:job.userId,payload:job.payload});
  }else throw new Error("UNSUPPORTED_JOB_KIND");
  await completeDurableJob(job.id,workerId);
  return{claimed:true,jobId:job.id,runId:job.runId,state:"succeeded",workerBuild:currentWorkerBuild()};
 }catch(e){
  const errorCode=e instanceof Error?e.message:"DETACHED_JOB_FAILED";
  if((job.jobKind==='video.advance'&&errorCode==='VIDEO_TASK_PENDING')||(job.jobKind==='video.compose'&&['EPISODE_ASSEMBLY_BUSY','GENERATION_ARCHIVE_BUSY'].includes(errorCode))){
   const deferred=await createAdminClient().rpc('defer_sasi_video_poll_v78',{p_job_id:job.id,p_worker_id:workerId});
   if(deferred.error||!deferred.data?.ok)return{claimed:true,jobId:job.id,runId:job.runId,state:'lease-lost',workerBuild:currentWorkerBuild()};
   const state=deferred.data.state==='waiting'?'waiting':'failed';
   await checkpointRun({runId:job.runId,step:job.jobKind==='video.compose'?'media.resources':'supplier.rendering',state,errorCode:state==='failed'?'VIDEO_POLL_DEADLINE':undefined});
   return{claimed:true,jobId:job.id,runId:job.runId,state,workerBuild:currentWorkerBuild()};
  }
  const retryable=classifyRetryable(e);
  const result=await failDurableJob(job.id,workerId,errorCode,retryable).catch(()=>({state:"unknown"}));
  if((result as Record<string,unknown>).state==="failed"){
   if(job.jobKind==='video.advance'&&typeof job.payload.taskId==='string'){
    try{await createAdminClient().rpc('fail_quoted_sasi_video_v78',{p_user_id:job.userId,p_task_id:job.payload.taskId,p_error:errorCode})}catch{}
   }
   await checkpointRun({runId:job.runId,step:"worker.execute",state:"failed",errorCode});
   await appendRunEvent({runId:job.runId,kind:"RUN_FAILED",metadata:{state:"failed",recoverable:false}});
  }else{
   await checkpointRun({runId:job.runId,step:"worker.retry",state:"waiting",errorCode});
   await appendRunEvent({runId:job.runId,kind:"RUN_WAITING",metadata:{state:"waiting",reason:"retry"}});
  }
  return{claimed:true,jobId:job.id,runId:job.runId,state:String((result as Record<string,unknown>).state||"waiting"),workerBuild:currentWorkerBuild()};
 }finally{
  stopped=true;clearInterval(heartbeat);
 }
}
