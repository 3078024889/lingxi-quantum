import "server-only";
import{createHash}from"node:crypto";
import{beginDurableRun,appendRunEvent}from"./run-store";
import{enqueueDurableJob}from"./job-queue";
import type{ExperienceRegion,ExperienceTask}from"@/lib/sasi/experience/free-provider-config";
import type{TextMessage}from"@/lib/sasi/ark-text";

function hash(v:unknown){return createHash("sha256").update(JSON.stringify(v)).digest("hex")}

export async function enqueueKnowledgeDetached(input:{
 userId:string;sessionKey:string;idempotencyKey:string;region:ExperienceRegion;task:ExperienceTask;
 messages:TextMessage[];maxOutputTokens:number;allowConnected:boolean;
}){
 const payload={
  region:input.region,task:input.task,messages:input.messages,
  maxOutputTokens:input.maxOutputTokens,allowConnected:input.allowConnected,
  sessionKey:input.sessionKey
 };
 const run=await beginDurableRun({
  userId:input.userId,sessionKey:input.sessionKey,task:`knowledge.${input.task}`,
  inputHash:hash(payload),idempotencyKey:input.idempotencyKey
 });
 if(run.state==="succeeded")return{runId:run.id,state:"succeeded",replayed:true};
 const job=await enqueueDurableJob({
  runId:run.id,userId:input.userId,jobKind:"knowledge.generate",workflowVersion:"knowledge.v1",
  payload,priority:input.task==="research"?2:1,maxAttempts:4,
  deadlineAt:new Date(Date.now()+15*60_000).toISOString()
 });
 await appendRunEvent({runId:run.id,kind:"RUN_WAITING",metadata:{state:"queued",reason:"detached-worker"}});
 return{runId:run.id,state:job.state,replayed:false};
}
