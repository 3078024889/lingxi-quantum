import "server-only";
import{resilientText,type ResilientTextOutcome}from"@/lib/sasi/experience/resilient-text";
import type{ExperienceRegion,ExperienceTask}from"@/lib/sasi/experience/free-provider-config";
import type{TextMessage}from"@/lib/sasi/ark-text";
import{durableStep}from"./step-store";
import{checkpointRun,appendRunEvent}from"./run-store";

type KnowledgePayload={
 region:ExperienceRegion;task:ExperienceTask;messages:TextMessage[];
 maxOutputTokens:number;allowConnected:boolean;sessionKey:string;
};

function validPayload(v:Record<string,unknown>):KnowledgePayload{
 const task=v.task==="research"?"research":"knowledge";
 const region:ExperienceRegion=(v.region==="china"||v.region==="cn")?"china":"global";
 const messages=Array.isArray(v.messages)?v.messages.filter(x=>x&&typeof x==="object").slice(0,32) as TextMessage[]:[];
 if(!messages.length)throw new Error("INVALID_KNOWLEDGE_JOB_PAYLOAD");
 return{
  region,task,messages,
  maxOutputTokens:Math.max(256,Math.min(8192,Number(v.maxOutputTokens||2560))),
  allowConnected:v.allowConnected===true,
  sessionKey:String(v.sessionKey||"default").slice(0,160)
 };
}

export async function executeKnowledgeJob(input:{runId:string;userId:string;payload:Record<string,unknown>}){
 const p=validPayload(input.payload);
 await checkpointRun({runId:input.runId,step:"knowledge.generate.v1",state:"running",payload:{detached:true}});
 await appendRunEvent({runId:input.runId,kind:"STEP_STARTED",step:"knowledge.generate.v1",metadata:{label:"knowledge.generate",state:"running"}});
 const step=await durableStep<ResilientTextOutcome>({
  runId:input.runId,stepId:"knowledge.generate.v1",
  input:{task:p.task,messages:p.messages,maxOutputTokens:p.maxOutputTokens,allowConnected:p.allowConnected,sessionKey:p.sessionKey},
  leaseSeconds:120,
  execute:()=>resilientText({
   userId:input.userId,region:p.region,task:p.task,messages:p.messages,
   maxOutputTokens:p.maxOutputTokens,allowConnected:p.allowConnected,sessionKey:p.sessionKey
  })
 });
 const out=step.value;
 await checkpointRun({runId:input.runId,step:"complete",state:"succeeded",payload:out});
 await appendRunEvent({runId:input.runId,kind:"STEP_FINISHED",step:"knowledge.generate.v1",metadata:{state:"succeeded"}});
 await appendRunEvent({runId:input.runId,kind:"RUN_COMPLETED",metadata:{state:"succeeded"}});
 return out;
}
