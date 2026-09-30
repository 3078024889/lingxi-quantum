export interface Checkpoint<T=unknown>{checkpointId:string;projectId:string;taskId:string;stepId:string;state:T;createdAt:string}
export function createCheckpoint<T>(projectId:string,taskId:string,stepId:string,state:T):Checkpoint<T>{return {checkpointId:crypto.randomUUID(),projectId,taskId,stepId,state,createdAt:new Date().toISOString()}}
export function latestCheckpoint<T>(rows:Checkpoint<T>[]){return [...rows].sort((a,b)=>b.createdAt.localeCompare(a.createdAt))[0]}
