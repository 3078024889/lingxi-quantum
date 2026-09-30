import{readyNodes,graphProgress,validateGraph,type ExecutionGraph,type CapabilityNode}from"./capability-graph";
export type GraphArtifact={nodeId:string;kind:string;value?:unknown;path?:string;metadata?:Record<string,unknown>};
export type GraphEvent={event:string;nodeId?:string;attempt?:number;at:string;data?:Record<string,unknown>};
export type NodeExecutionResult={ok:boolean;artifacts?:GraphArtifact[];error?:{code:string;message:string};data?:unknown};
export type GraphExecutor=(node:CapabilityNode,input:{taskId:string;taskInput:unknown;previous:Record<string,unknown>;attempt:number})=>Promise<NodeExecutionResult>;
export type GraphRunResult={ok:boolean;progress:number;artifacts:GraphArtifact[];history:GraphEvent[];nodeResults:Record<string,NodeExecutionResult>};

export async function executeCapabilityGraph(args:{taskId:string;graph:ExecutionGraph;input:unknown;execute:GraphExecutor;now?:()=>Date}):Promise<GraphRunResult>{
 const graph=validateGraph(args.graph),completed=new Set<string>(),running=new Set<string>(),failed=new Set<string>();
 const results:Record<string,NodeExecutionResult>={},artifacts:GraphArtifact[]=[],history:GraphEvent[]=[];
 const now=args.now??(()=>new Date()); const emit=(event:string,nodeId?:string,attempt?:number,data?:Record<string,unknown>)=>history.push({event,nodeId,attempt,at:now().toISOString(),data});
 emit("task.planned",undefined,undefined,{nodes:graph.nodes.length});
 while(completed.size+failed.size<graph.nodes.length){
  const ready=readyNodes(graph,completed,running).filter(n=>!failed.has(n.id));
  if(!ready.length){emit("task.blocked");return{ok:false,progress:graphProgress(graph,completed),artifacts,history,nodeResults:results}}
  const batch=await Promise.all(ready.map(async node=>{
   running.add(node.id);emit("node.started",node.id);
   let last:NodeExecutionResult={ok:false,error:{code:"NOT_RUN",message:"没有完成"}};
   for(let attempt=1;attempt<=node.maxAttempts;attempt++){
    emit("node.attempt",node.id,attempt);
    try{last=await args.execute(node,{taskId:args.taskId,taskInput:args.input,previous:Object.fromEntries(node.dependsOn.map(id=>[id,results[id]?.data])),attempt})}
    catch(e){last={ok:false,error:{code:"EXECUTION_ERROR",message:e instanceof Error?e.message:"没有完成"}}}
    if(last.ok)break;
    if(attempt<node.maxAttempts)emit("node.retry",node.id,attempt,{code:last.error?.code});
   }
   running.delete(node.id);results[node.id]=last;
   if(last.ok){completed.add(node.id);for(const a of last.artifacts??[])artifacts.push({...a,nodeId:node.id});emit("node.succeeded",node.id)}
   else{failed.add(node.id);emit("node.failed",node.id,undefined,{code:last.error?.code})}
   return last.ok;
  }));
  if(batch.some(ok=>!ok)){
   const blocked=graph.nodes.filter(n=>n.dependsOn.some(d=>failed.has(d)));
   for(const n of blocked){failed.add(n.id);results[n.id]={ok:false,error:{code:"DEPENDENCY_FAILED",message:"前一步没有完成"}};emit("node.skipped",n.id)}
  }
 }
 const ok=failed.size===0;emit(ok?"task.succeeded":"task.failed",undefined,undefined,{completed:completed.size,failed:failed.size});
 return{ok,progress:ok?1:graphProgress(graph,completed),artifacts,history,nodeResults:results};
}
