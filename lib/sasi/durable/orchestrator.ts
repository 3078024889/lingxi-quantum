import "server-only";
import {createHash,randomUUID}from"node:crypto";
import{beginDurableRun,checkpointRun,appendRunEvent}from"./run-store";
import{startSpan,endSpan}from"./trace";

function hash(value:unknown){return createHash("sha256").update(JSON.stringify(value)).digest("hex")}
export async function durableExecute<T>(input:{
 userId:string;sessionKey:string;task:string;idempotencyKey?:string;payload:unknown;
 execute:(ctx:{runId:string;attempt:number})=>Promise<T>;
 verify?:(value:T)=>{pass:boolean;retryable?:boolean;score?:number;reasons?:string[]};
 maxAttempts?:number;
}):Promise<{runId:string;value:T;replayed:boolean}>{
 const inputHash=hash(input.payload),idempotencyKey=input.idempotencyKey||hash([input.userId,input.sessionKey,input.task,inputHash]).slice(0,48);
 const run=await beginDurableRun({userId:input.userId,sessionKey:input.sessionKey,task:input.task,inputHash,idempotencyKey});
 if(run.state==="succeeded"&&run.output!=null)return {runId:run.id,value:run.output as T,replayed:true};
 await appendRunEvent({runId:run.id,kind:"RUN_STARTED",metadata:{state:"running"}});
 const max=Math.max(1,Math.min(3,Number(input.maxAttempts||2)));let last:unknown;
 for(let attempt=Math.max(1,run.attempt+1);attempt<=max;attempt++){
  const span=startSpan("sasi.run.attempt",{runId:run.id,task:input.task,attempt});
  await checkpointRun({runId:run.id,step:"execute",state:"running",payload:{attempt}});
  await appendRunEvent({runId:run.id,kind:"STEP_STARTED",step:"execute",metadata:{attempt,label:"execute"}});
  const started=Date.now();
  try{
   const value=await input.execute({runId:run.id,attempt});
   const verification=input.verify?.(value)??{pass:true};
   await appendRunEvent({runId:run.id,kind:"attempt.completed",step:"execute",latencyMs:Date.now()-started,metadata:{attempt,verification}});
   if(verification.pass){
    await checkpointRun({runId:run.id,step:"complete",state:"succeeded",payload:value});
    await appendRunEvent({runId:run.id,kind:"STEP_FINISHED",step:"execute",metadata:{attempt}});
    await appendRunEvent({runId:run.id,kind:"RUN_COMPLETED",metadata:{state:"succeeded"}});
    await endSpan(span,"ok",{verification});
    return {runId:run.id,value,replayed:false};
   }
   last=new Error("OUTCOME_VERIFICATION_FAILED");
   await endSpan(span,"error",{verification});
   if(!verification.retryable)break;
  }catch(e){
   last=e;await appendRunEvent({runId:run.id,kind:"attempt.failed",step:"execute",latencyMs:Date.now()-started,metadata:{attempt,error:e instanceof Error?e.message:String(e)}});
   await endSpan(span,"error",{error:e instanceof Error?e.message:String(e)});
  }
 }
 await checkpointRun({runId:run.id,step:"complete",state:"failed",errorCode:last instanceof Error?last.message:"DURABLE_RUN_FAILED"});
 await appendRunEvent({runId:run.id,kind:"RUN_FAILED",metadata:{state:"failed",recoverable:false}});
 throw last instanceof Error?last:new Error("DURABLE_RUN_FAILED");
}
