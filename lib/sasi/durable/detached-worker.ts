import "server-only";
import{appendRunEvent,checkpointRun}from"./run-store";
import{claimDurableJob,completeDurableJob,createWorkerId,failDurableJob,renewDurableJob}from"./job-queue";
import{currentWorkerBuild,workerSupports}from"./worker-version";
import{executeKnowledgeJob}from"./knowledge-job-handler";

function classifyRetryable(e:unknown){
 const m=(e instanceof Error?e.message:String(e)).toUpperCase();
 if(m.includes("INVALID_")||m.includes("IDEMPOTENCY_INPUT_MISMATCH")||m.includes("UNSUPPORTED_WORKFLOW_VERSION"))return false;
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
  }else throw new Error("UNSUPPORTED_JOB_KIND");
  await completeDurableJob(job.id,workerId);
  return{claimed:true,jobId:job.id,runId:job.runId,state:"succeeded",workerBuild:currentWorkerBuild()};
 }catch(e){
  const errorCode=e instanceof Error?e.message:"DETACHED_JOB_FAILED";
  const retryable=classifyRetryable(e);
  const result=await failDurableJob(job.id,workerId,errorCode,retryable).catch(()=>({state:"unknown"}));
  if((result as Record<string,unknown>).state==="failed"){
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
