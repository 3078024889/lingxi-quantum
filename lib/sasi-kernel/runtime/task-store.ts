import "server-only";
import type {SupabaseClient} from "@supabase/supabase-js";
import type {SasiExecutionPlan} from "./plan";

export async function createRuntimeTask(admin:SupabaseClient,input:{taskId:string;userId:string;kind:string;action:string;prompt:string;plan:SasiExecutionPlan}){
 const now=new Date().toISOString();
 const {error}=await admin.from("sasi_tasks").insert({
  id:input.taskId,user_id:input.userId,kind:input.kind,action:input.action,
  intent:{task:input.plan.task},input:{prompt:input.prompt},constraints:{},plan:input.plan,
  execution_graph:{nodes:input.plan.nodes},state:"running",progress:0,started_at:now,updated_at:now,
 });
 if(error)throw new Error(`SASI_TASK_CREATE_FAILED:${error.code||"db"}`);
 if(input.plan.nodes.length){
  const {error:nodeError}=await admin.from("sasi_task_nodes").insert(input.plan.nodes.map((n,index)=>({
   task_id:input.taskId,user_id:input.userId,node_id:n.nodeId,capability_id:n.capabilityId,
   state:index===0?"running":"queued",depends_on:n.dependsOn,max_retries:n.maxRetries,
   runtime_target:n.localFirst?"local-first":"managed",input:index===0?{prompt:input.prompt}:{},
   started_at:index===0?now:null,updated_at:now,
  })));
  if(nodeError)throw new Error(`SASI_TASK_NODES_CREATE_FAILED:${nodeError.code||"db"}`);
 }
 await appendRuntimeEvent(admin,{taskId:input.taskId,userId:input.userId,eventIndex:0,eventType:"task.started",data:{task:input.plan.task}});
}

export async function appendRuntimeEvent(admin:SupabaseClient,input:{taskId:string;userId:string;eventIndex:number;eventType:string;nodeId?:string;data?:Record<string,unknown>}){
 const {error}=await admin.from("sasi_task_events").insert({task_id:input.taskId,user_id:input.userId,event_index:input.eventIndex,event_type:input.eventType,node_id:input.nodeId||null,data:input.data||{}});
 if(error)throw new Error(`SASI_TASK_EVENT_FAILED:${error.code||"db"}`);
}

export async function completeRuntimeTask(admin:SupabaseClient,input:{taskId:string;userId:string;nodeId:string;result:unknown;capabilityId:string}){
 const now=new Date().toISOString();
 const {error:nodeError}=await admin.from("sasi_task_nodes").update({state:"succeeded",output:{result:input.result},completed_at:now,updated_at:now}).eq("task_id",input.taskId).eq("node_id",input.nodeId).eq("user_id",input.userId);
 if(nodeError)throw new Error(`SASI_TASK_NODE_COMPLETE_FAILED:${nodeError.code||"db"}`);
 const {error:taskError}=await admin.from("sasi_tasks").update({state:"succeeded",progress:1,result:{result:input.result},completed_at:now,updated_at:now}).eq("id",input.taskId).eq("user_id",input.userId);
 if(taskError)throw new Error(`SASI_TASK_COMPLETE_FAILED:${taskError.code||"db"}`);
 await appendRuntimeEvent(admin,{taskId:input.taskId,userId:input.userId,eventIndex:1,eventType:"task.succeeded",nodeId:input.nodeId,data:{capabilityId:input.capabilityId}});
}

export async function failRuntimeTask(admin:SupabaseClient,input:{taskId:string;userId:string;nodeId:string;message:string}){
 const now=new Date().toISOString();
 await admin.from("sasi_task_nodes").update({state:"failed",error:{message:input.message},completed_at:now,updated_at:now}).eq("task_id",input.taskId).eq("node_id",input.nodeId).eq("user_id",input.userId);
 await admin.from("sasi_tasks").update({state:"failed",error:{message:input.message},completed_at:now,updated_at:now}).eq("id",input.taskId).eq("user_id",input.userId);
 await appendRuntimeEvent(admin,{taskId:input.taskId,userId:input.userId,eventIndex:1,eventType:"task.failed",nodeId:input.nodeId,data:{message:input.message}}).catch(()=>undefined);
}
