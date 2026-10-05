import "server-only";
import{createHash}from"node:crypto";
import{durableExecute}from"@/lib/sasi/durable/orchestrator";
import{durableRuntimeAvailable}from"@/lib/sasi/durable/runtime-capability";
import{durableStep}from"@/lib/sasi/durable/step-store";
import{resilientText,type ResilientTextOutcome}from"@/lib/sasi/experience/resilient-text";
import type{ExperienceRegion,ExperienceTask}from"@/lib/sasi/experience/free-provider-config";
import type{TextMessage}from"@/lib/sasi/ark-text";

function stable(value:unknown){return createHash("sha256").update(JSON.stringify(value)).digest("hex")}

export async function runKnowledgeText(input:{
 userId:string;
 sessionKey:string;
 idempotencyKey:string;
 region:ExperienceRegion;
 task:ExperienceTask;
 messages:TextMessage[];
 maxOutputTokens:number;
 allowConnected:boolean;
}):Promise<{out:ResilientTextOutcome;runId:string|null;durable:boolean;replayed:boolean}>{
 const payload={
  task:input.task,messages:input.messages,maxOutputTokens:input.maxOutputTokens,
  allowConnected:input.allowConnected,sessionKey:input.sessionKey
 };
 if(!(await durableRuntimeAvailable())){
  const out=await resilientText({
   userId:input.userId,region:input.region,task:input.task,messages:input.messages,
   maxOutputTokens:input.maxOutputTokens,allowConnected:input.allowConnected,sessionKey:input.sessionKey
  });
  return{out,runId:null,durable:false,replayed:false};
 }

 const run=await durableExecute<ResilientTextOutcome>({
  userId:input.userId,
  sessionKey:input.sessionKey,
  task:`knowledge.${input.task}`,
  idempotencyKey:input.idempotencyKey,
  payload,
  maxAttempts:2,
  execute:async({runId})=>{
   const step=await durableStep<ResilientTextOutcome>({
    runId,
    stepId:"knowledge.generate.v1",
    input:{fingerprint:stable(payload)},
    leaseSeconds:55,
    execute:()=>resilientText({
     userId:input.userId,region:input.region,task:input.task,messages:input.messages,
     maxOutputTokens:input.maxOutputTokens,allowConnected:input.allowConnected,sessionKey:input.sessionKey
    })
   });
   return step.value;
  },
  verify:value=>({pass:value.kind==="answer"||value.kind==="needs-connection",retryable:false,score:1,reasons:[]})
 });
 return{out:run.value,runId:run.runId,durable:true,replayed:run.replayed};
}
