import type{LingxiTaskState}from"@/lib/tasks/task-contract";
import{createUnifiedTask,publicTaskView,transitionUnifiedTask,type UnifiedTaskRecord}from"@/lib/tasks/unified-task";

type DurableRunRow={id:unknown;task?:unknown;state?:unknown;current_step?:unknown;attempt?:unknown;created_at?:unknown;updated_at?:unknown;output_json?:unknown;error_code?:unknown;};
const stateMap:Record<string,LingxiTaskState>={created:"created",running:"running",waiting:"waiting",succeeded:"succeeded",failed:"failed",cancelled:"cancelled"};
export function durableRunToUnifiedTask(row:DurableRunRow):UnifiedTaskRecord{
 const state=stateMap[String(row.state||"created")]||"failed";
 const createdAt=typeof row.created_at==="string"&&row.created_at?row.created_at:typeof row.updated_at==="string"&&row.updated_at?row.updated_at:new Date().toISOString();
 const id=String(row.id||"").trim();
 let task=createUnifiedTask({id,domain:"sasi",capability:"sasi:"+String(row.task||"run").slice(0,120),billing:"unknown",createdAt,metadata:{currentStep:row.current_step?String(row.current_step):null,attempt:Number(row.attempt||0)}});
 if(state==="created")return task;
 if(state==="running")return transitionUnifiedTask(task,"running",{progress:50,recovery:"partial",updatedAt:String(row.updated_at||createdAt)});
 if(state==="waiting"){task=transitionUnifiedTask(task,"running",{progress:50,recovery:"partial",updatedAt:String(row.updated_at||createdAt)});return transitionUnifiedTask(task,"waiting",{progress:50,recovery:"ready",updatedAt:String(row.updated_at||createdAt)});}
 if(state==="succeeded"){task=transitionUnifiedTask(task,"running",{progress:85,recovery:"partial",updatedAt:String(row.updated_at||createdAt)});task=transitionUnifiedTask(task,"validating",{progress:95,recovery:"partial",updatedAt:String(row.updated_at||createdAt)});return transitionUnifiedTask(task,"succeeded",{progress:100,recovery:row.output_json==null?"none":"ready",updatedAt:String(row.updated_at||createdAt)});}
 if(state==="cancelled")return transitionUnifiedTask(task,"cancelled",{progress:100,recovery:"none",updatedAt:String(row.updated_at||createdAt)});
 return transitionUnifiedTask(task,"failed",{progress:100,recovery:"partial",safeError:row.error_code?String(row.error_code):"SASI_RUN_FAILED",updatedAt:String(row.updated_at||createdAt)});
}
export function publicDurableRunTask(row:DurableRunRow){return publicTaskView(durableRunToUnifiedTask(row))}
