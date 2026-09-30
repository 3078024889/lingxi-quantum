export type CapabilityNode={
 id:string;capability:string;dependsOn:string[];inputKeys:string[];outputKeys:string[];
 validate:string[];maxAttempts:number;fallback?:string;parallelGroup?:string;
};
export type ExecutionGraph={version:"sasi-capability-graph-v1";nodes:CapabilityNode[]};
export function validateGraph(g:ExecutionGraph){
 const ids=new Set(g.nodes.map(n=>n.id));
 if(ids.size!==g.nodes.length)throw new Error("SASI_GRAPH_DUPLICATE_NODE");
 for(const n of g.nodes){
  if(!n.id||!n.capability||n.maxAttempts<1||n.maxAttempts>3)throw new Error("SASI_GRAPH_NODE_INVALID");
  for(const d of n.dependsOn)if(!ids.has(d)||d===n.id)throw new Error("SASI_GRAPH_DEPENDENCY_INVALID");
 }
 const visiting=new Set<string>(),done=new Set<string>(),map=new Map(g.nodes.map(n=>[n.id,n]));
 const visit=(id:string)=>{if(done.has(id))return;if(visiting.has(id))throw new Error("SASI_GRAPH_CYCLE");visiting.add(id);for(const d of map.get(id)!.dependsOn)visit(d);visiting.delete(id);done.add(id)};
 for(const n of g.nodes)visit(n.id);
 return g;
}
export function readyNodes(g:ExecutionGraph,completed:Set<string>,running:Set<string>){
 return g.nodes.filter(n=>!completed.has(n.id)&&!running.has(n.id)&&n.dependsOn.every(d=>completed.has(d)));
}
export function graphProgress(g:ExecutionGraph,completed:Set<string>){return g.nodes.length?Math.min(.98,completed.size/g.nodes.length):0}
