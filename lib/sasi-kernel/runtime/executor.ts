import "server-only";
import type {SupabaseClient} from "@supabase/supabase-js";
import {submitWorkerTask} from "@/lib/sasi-kernel/worker/client";
import type {SasiExecutionPlan,SasiExecutionNode} from "./plan";

export type RuntimeExecutorInput={taskId:string;userId:string;plan:SasiExecutionPlan;input:Record<string,unknown>};
export type RuntimeExecutorResult={status:"succeeded"|"failed";output?:unknown;nodeResults:Array<{nodeId:string;capabilityId:string;status:string;attempts:number}>;error?:string};

function workerCapability(node:SasiExecutionNode){
 const id=String(node.capabilityId);
 const map:Record<string,string>={
  "image-generate-native":"image.generate.diffusion","image-generate":"image.generate.procedural","layout-generate":"layout.generate",
  "video-generate-native":"video.generate.model","video-render":"video.render","video-compose":"video.compose","subtitle-process":"subtitle.process",
  "knowledge-retrieve":"knowledge.retrieve","knowledge-rank":"knowledge.rank","knowledge-validate":"knowledge.validate",
  "semantic-reason-native":"semantic.reason.native","semantic-reason":"semantic.reason","semantic-write":"semantic.write",
  "document-parse":"document.parse","file-convert":"file.convert","ocr":"vision.ocr","image-process":"image.process","audio-process":"audio.process",
  "director-native":"director.native","multimodal-generate":"multimodal.generate"
 };
 return map[id]||id;
}

async function event(admin:SupabaseClient,input:{taskId:string;userId:string;index:number;type:string;nodeId?:string;data?:Record<string,unknown>}){
 const {error}=await admin.from("sasi_task_events").insert({task_id:input.taskId,user_id:input.userId,event_index:input.index,event_type:input.type,node_id:input.nodeId||null,data:input.data||{}});
 if(error)throw new Error(`SASI_TASK_EVENT_FAILED:${error.code||"db"}`);
}

async function nodeState(admin:SupabaseClient,input:{taskId:string;userId:string;nodeId:string;state:string;patch?:Record<string,unknown>}){
 const {error}=await admin.from("sasi_task_nodes").update({state:input.state,updated_at:new Date().toISOString(),...(input.patch||{})}).eq("task_id",input.taskId).eq("node_id",input.nodeId).eq("user_id",input.userId);
 if(error)throw new Error(`SASI_TASK_NODE_UPDATE_FAILED:${error.code||"db"}`);
}

export async function executeSasiPlan(admin:SupabaseClient,input:RuntimeExecutorInput):Promise<RuntimeExecutorResult>{
 const results:RuntimeExecutorResult["nodeResults"]=[]; let eventIndex=1; let current:unknown=input.input;
 for(const node of input.plan.nodes){
  await nodeState(admin,{taskId:input.taskId,userId:input.userId,nodeId:node.nodeId,state:"running",patch:{started_at:new Date().toISOString(),input:{...input.input,previous:current}}});
  await event(admin,{taskId:input.taskId,userId:input.userId,index:eventIndex++,type:"node.started",nodeId:node.nodeId,data:{capabilityId:node.capabilityId}});
  const candidates=[node.capabilityId,...node.fallbackIds]; let succeeded=false; let lastError="CAPABILITY_FAILED"; let attempts=0;
  for(const candidate of candidates){
   const max=Math.max(1,node.maxRetries+1);
   for(let attempt=1;attempt<=max;attempt++){
    attempts++;
    try{
     const result=await submitWorkerTask({requestId:crypto.randomUUID(),taskId:input.taskId,nodeId:node.nodeId,capabilityId:workerCapability({...node,capabilityId:candidate}),input:{...input.input,previous:current,attempt,candidate}});
     if(result.status==="succeeded"){
      current=result; succeeded=true;
      await nodeState(admin,{taskId:input.taskId,userId:input.userId,nodeId:node.nodeId,state:"succeeded",patch:{output:{result},completed_at:new Date().toISOString(),retry_count:Math.max(0,attempts-1)}});
      await event(admin,{taskId:input.taskId,userId:input.userId,index:eventIndex++,type:"node.succeeded",nodeId:node.nodeId,data:{capabilityId:candidate,attempts}});
      break;
     }
     lastError="CAPABILITY_NOT_COMPLETED";
    }catch(e){lastError=e instanceof Error?e.message:"CAPABILITY_FAILED";}
    await event(admin,{taskId:input.taskId,userId:input.userId,index:eventIndex++,type:"node.retry",nodeId:node.nodeId,data:{capabilityId:candidate,attempt,lastError}}).catch(()=>undefined);
   }
   if(succeeded)break;
   await event(admin,{taskId:input.taskId,userId:input.userId,index:eventIndex++,type:"node.fallback",nodeId:node.nodeId,data:{from:node.capabilityId,to:candidate,lastError}}).catch(()=>undefined);
  }
  results.push({nodeId:node.nodeId,capabilityId:String(node.capabilityId),status:succeeded?"succeeded":"failed",attempts});
  if(!succeeded){
   await nodeState(admin,{taskId:input.taskId,userId:input.userId,nodeId:node.nodeId,state:"failed",patch:{error:{message:lastError},completed_at:new Date().toISOString(),retry_count:Math.max(0,attempts-1)}}).catch(()=>undefined);
   await admin.from("sasi_tasks").update({state:"failed",error:{message:lastError,nodeId:node.nodeId},updated_at:new Date().toISOString(),completed_at:new Date().toISOString()}).eq("id",input.taskId).eq("user_id",input.userId);
   await event(admin,{taskId:input.taskId,userId:input.userId,index:eventIndex++,type:"task.failed",nodeId:node.nodeId,data:{message:lastError}}).catch(()=>undefined);
   return {status:"failed",nodeResults:results,error:lastError};
  }
  const done=results.length,total=input.plan.nodes.length;
  await admin.from("sasi_tasks").update({progress:done/total,updated_at:new Date().toISOString()}).eq("id",input.taskId).eq("user_id",input.userId);
 }
 const now=new Date().toISOString();
 await admin.from("sasi_tasks").update({state:"succeeded",progress:1,result:{result:current,nodes:results},completed_at:now,updated_at:now}).eq("id",input.taskId).eq("user_id",input.userId);
 await event(admin,{taskId:input.taskId,userId:input.userId,index:eventIndex,type:"task.succeeded",data:{nodes:results.length}});
 return {status:"succeeded",output:current,nodeResults:results};
}
