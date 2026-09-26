import {engineById} from "./catalog";
import {graphForTool} from "./stage-graph";
import type {EngineProbe,RoutedToolGraph} from "./types";

export function routeToolGraph(toolId:string,probes:EngineProbe[]):RoutedToolGraph{
 const graph=graphForTool(toolId);if(!graph)return{toolId,stages:[],blocked:true,degraded:true,missing:["NO_TOOL_GRAPH"],resultChecks:[]};
 const availability=new Map(probes.map(p=>[p.id,p]));const stages=[];const allMissing:string[]=[];let degraded=false,blocked=false;
 for(const stage of graph.stages){
  const selected:Record<string,string>={};const missing:string[]=[];
  for(const need of stage.requires){
   const primary=need.primary.find(id=>availability.get(id)?.available&&engineById(id));
   if(primary){selected[need.capability]=primary;continue}
   const fallback=(need.fallback||[]).find(id=>availability.get(id)?.available&&engineById(id));
   if(fallback){selected[need.capability]=fallback;degraded=true;continue}
   if(!need.optional){missing.push(need.capability);allMissing.push(`${stage.id}:${need.capability}`);blocked=true}else degraded=true;
  }
  stages.push({stageId:stage.id,selected,missing,degraded:missing.length>0});
 }
 return{toolId,stages,blocked,degraded,missing:allMissing,resultChecks:graph.resultChecks};
}

export function routeToolEngines(toolId:string,availability:Array<{id:string;available:boolean;reason?:string}>){return routeToolGraph(toolId,availability.map(x=>({...x,runtime:engineById(x.id)?.runtime})));}
