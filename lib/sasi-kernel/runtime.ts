import { randomUUID } from "node:crypto";
import { findExecutableCapability } from "./registry";
import { buildTaskPlan } from "./planner";
import { validateKernelResult } from "./validation";
import type { SasiCapabilityContext, SasiKernelResult, SasiKernelTask } from "./types";

export async function executeSasiKernel(input:Omit<SasiKernelTask,"id">&{id?:string}, partial?:Partial<SasiCapabilityContext>):Promise<SasiKernelResult>{
  const task:SasiKernelTask={...input,id:input.id??randomUUID(),createdAt:input.createdAt??new Date().toISOString()};
  const ctx:SasiCapabilityContext={now:partial?.now??(()=>new Date()),signal:partial?.signal,log:partial?.log??((event,data)=>console.info(`[SASI kernel] ${event}`,data??{}))};
  const capability=findExecutableCapability(task);
  if(!capability) return {ok:false,taskId:task.id,engine:"sasi-kernel",capability:"none",artifacts:[],error:{code:"NO_EXECUTABLE_CAPABILITY",message:"这个任务暂时还没有可执行能力。"}};
  try {
    const plan=buildTaskPlan(task);ctx.log("task.plan.created",{taskId:task.id,planId:plan.id,capability:capability.manifest.id});
    return validateKernelResult(await capability.execute(task,ctx));
  } catch(error) {
    ctx.log("task.failed",{taskId:task.id,error:error instanceof Error?error.message:String(error)});
    return {ok:false,taskId:task.id,engine:"sasi-kernel",capability:capability.manifest.id,artifacts:[],error:{code:"KERNEL_EXECUTION_FAILED",message:"处理没有完成，请重新尝试。"}};
  }
}
export const executeSasi=executeSasiKernel;
