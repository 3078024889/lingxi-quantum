import type{LingxiTaskState}from"@/lib/tasks/task-contract";

export type TaskState="planned"|"running"|"validating"|"repairing"|"completed"|"failed";
export type StepState="pending"|"running"|"completed"|"failed"|"skipped";
export interface TaskStep{id:string;capability:string;dependsOn:string[];state:StepState;attempts:number;fallback?:string[];output?:unknown;error?:string}
export interface SASITask{taskId:string;projectId:string;intent:string;state:TaskState;progress:number;steps:TaskStep[];artifacts:string[];validation?:{pass:boolean;score:number;issues:string[]};result?:unknown;error?:string;history:{at:string;state:TaskState;note?:string}[]}

export function legacyTaskStateToUnified(state:TaskState):LingxiTaskState{
 if(state==="planned")return"planning";
 if(state==="repairing")return"retrying";
 if(state==="completed")return"succeeded";
 return state;
}
export function unifiedTaskStateToLegacy(state:LingxiTaskState):TaskState{
 if(state==="created"||state==="queued"||state==="planning"||state==="waiting")return"planned";
 if(state==="retrying")return"repairing";
 if(state==="succeeded")return"completed";
 if(state==="cancelled"||state==="expired")return"failed";
 return state==="validating"?"validating":state==="running"?"running":"failed";
}

export function createTask(projectId:string,intent:string,steps:Omit<TaskStep,"state"|"attempts">[]):SASITask{return {taskId:crypto.randomUUID(),projectId,intent,state:"planned",progress:0,steps:steps.map(s=>({...s,state:"pending",attempts:0})),artifacts:[],history:[{at:new Date().toISOString(),state:"planned"}]}}
export function readySteps(task:SASITask){return task.steps.filter(s=>s.state==="pending"&&s.dependsOn.every(id=>task.steps.find(x=>x.id===id)?.state==="completed"))}
export function taskProgress(task:SASITask){if(!task.steps.length)return task.state==="completed"?1:0;return task.steps.filter(s=>s.state==="completed"||s.state==="skipped").length/task.steps.length}
