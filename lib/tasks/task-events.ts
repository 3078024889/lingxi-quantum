import type{LingxiArtifact,LingxiRecoveryState,LingxiTaskSnapshot,LingxiTaskState}from"./task-contract";

export const LINGXI_TASK_EVENT_TYPES=[
 "task.created","task.queued","task.planning","task.running","task.waiting","task.validating","task.retrying",
 "task.succeeded","task.failed","task.cancelled","task.expired","artifact.attached","recovery.changed","checkpoint.saved"
]as const;
export type LingxiTaskEventType=typeof LINGXI_TASK_EVENT_TYPES[number];

export type LingxiTaskEvent={
 taskId:string;
 sequence:number;
 type:LingxiTaskEventType;
 at:string;
 operationId?:string;
 data?:Record<string,unknown>;
};

const STATE_BY_EVENT:Partial<Record<LingxiTaskEventType,LingxiTaskState>>={
 "task.created":"created","task.queued":"queued","task.planning":"planning","task.running":"running","task.waiting":"waiting",
 "task.validating":"validating","task.retrying":"retrying","task.succeeded":"succeeded","task.failed":"failed",
 "task.cancelled":"cancelled","task.expired":"expired"
};

export function assertMonotonicTaskEvents(events:readonly LingxiTaskEvent[]){
 let previous=-1;
 for(const event of events){
  if(!Number.isInteger(event.sequence)||event.sequence<0||event.sequence<=previous)throw new Error("LINGXI_TASK_EVENT_SEQUENCE_INVALID");
  previous=event.sequence;
 }
}

export function foldTaskEvents(events:readonly LingxiTaskEvent[]):LingxiTaskSnapshot|null{
 if(!events.length)return null;
 assertMonotonicTaskEvents(events);
 const first=events[0],taskId=first.taskId;
 if(events.some(event=>event.taskId!==taskId))throw new Error("LINGXI_TASK_EVENT_TASK_MISMATCH");
 let state:LingxiTaskState="created",progress=0,recovery:LingxiRecoveryState="none";
 const artifacts=new Map<string,LingxiArtifact>();
 for(const event of events){
  const next=STATE_BY_EVENT[event.type];if(next)state=next;
  if(typeof event.data?.progress==="number")progress=Math.max(0,Math.min(1,event.data.progress));
  if(event.type==="task.succeeded")progress=1;
  if(event.type==="artifact.attached"){
   const artifact=event.data?.artifact as LingxiArtifact|undefined;
   if(artifact?.id)artifacts.set(artifact.id,artifact);
  }
  if(event.type==="recovery.changed"){
   const value=event.data?.recovery;
   if(value==="none"||value==="ready"||value==="partial"||value==="ghost"||value==="expired")recovery=value;
  }
 }
 return{id:taskId,state,progress,createdAt:first.at,updatedAt:events[events.length-1].at,artifacts:[...artifacts.values()],recovery};
}
