import { findExecutableCapability } from "./registry";
import type { SasiKernelTask, SasiTaskPlan } from "./types";
export function buildTaskPlan(task:SasiKernelTask):SasiTaskPlan {
  const capability=findExecutableCapability(task);
  if(!capability) throw new Error(`NO_EXECUTABLE_CAPABILITY:${task.kind}:${task.action}`);
  return {id:`plan:${task.id}`,taskId:task.id,executionClass:capability.manifest.executionClass,externalModelRequired:false,nodes:[{id:"execute",capabilityId:capability.manifest.id,dependsOn:[],timeoutMs:120000,maxRetries:capability.manifest.deterministic?1:0}],createdAt:new Date().toISOString()};
}
