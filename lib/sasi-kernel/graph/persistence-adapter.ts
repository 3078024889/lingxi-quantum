import type{ExecutionGraph}from"./capability-graph";
export type PersistedNodeSeed={task_id:string;user_id:string;node_id:string;capability_id:string;state:"queued";depends_on:string[];retry_count:number;max_retries:number;input:Record<string,never>};
export function graphNodeSeeds(taskId:string,userId:string,graph:ExecutionGraph):PersistedNodeSeed[]{
 return graph.nodes.map(n=>({task_id:taskId,user_id:userId,node_id:n.id,capability_id:n.capability,state:"queued",depends_on:[...n.dependsOn],retry_count:0,max_retries:Math.max(0,n.maxAttempts-1),input:{}}));
}
export function eventRows(taskId:string,userId:string,events:{event:string;nodeId?:string;attempt?:number;at:string;data?:Record<string,unknown>}[]){
 return events.slice(0,500).map((e,i)=>({task_id:taskId,user_id:userId,event_index:i,event_type:e.event,node_id:e.nodeId??null,attempt:e.attempt??null,data:e.data??{},occurred_at:e.at}));
}
