import {routeSasiTask} from "@/lib/sasi-kernel/policy/router";
import {sasiCapability} from "@/lib/sasi-kernel/policy/capability-graph";
import type {SasiAutonomyTask,SasiAutonomousCapabilityId} from "@/lib/sasi-kernel/policy/types";

export type SasiExecutionNode={
  nodeId:string; capabilityId:SasiAutonomousCapabilityId; dependsOn:string[];
  executionClass:string; localFirst:boolean; browserEligible:boolean; deterministic:boolean;
  fallbackIds:SasiAutonomousCapabilityId[]; maxRetries:number;
};
export type SasiExecutionPlan={
  task:SasiAutonomyTask; executionClass:string; externalModelRequired:boolean;
  reasons:string[]; nodes:SasiExecutionNode[];
};

export function buildSasiExecutionPlan(task:SasiAutonomyTask):SasiExecutionPlan{
  const route=routeSasiTask(task);
  const nodes=route.primary.map((capabilityId,index)=>{
    const capability=sasiCapability(capabilityId);
    return {
      nodeId:`n${index+1}-${capabilityId}`,
      capabilityId,
      dependsOn:index===0?[]:[`n${index}-${route.primary[index-1]}`],
      executionClass:capability.executionClass,
      localFirst:capability.localFirst,
      browserEligible:capability.browserEligible,
      deterministic:capability.deterministic,
      fallbackIds:[...capability.fallbackIds],
      maxRetries:capability.deterministic?1:2,
    };
  });
  return {task,executionClass:route.executionClass,externalModelRequired:route.externalModelRequired,reasons:[...route.reasons],nodes};
}
