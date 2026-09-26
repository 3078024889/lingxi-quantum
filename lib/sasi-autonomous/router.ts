import type {Capability,CapabilityContext,SasiResult,SasiTask} from "./types";
import {knowledgeAnswerCapability,knowledgeSummaryCapability} from "./knowledge/capability";
import {imageRenderCapability} from "./image/capability";
import {videoPlanCapability,videoStoryboardCapability} from "./video/capability";
import {utilityOrganizeCapability,utilityStatsCapability} from "./utility/capability";
import {validateResult} from "./validation";

const capabilities:Capability[]=[
 knowledgeAnswerCapability,knowledgeSummaryCapability,imageRenderCapability,
 videoPlanCapability,videoStoryboardCapability,utilityOrganizeCapability,utilityStatsCapability,
];
export function registeredCapabilities(){return capabilities.map((x)=>x.id);}
export async function runAutonomousTask(task:SasiTask,partial?:Partial<CapabilityContext>):Promise<SasiResult>{
 const ctx:CapabilityContext={now:partial?.now??(()=>new Date()),signal:partial?.signal,log:partial?.log??((event,data)=>console.info(`[SASI autonomous] ${event}`,data??{}))};
 const capability=capabilities.find((x)=>x.canRun(task));
 if(!capability)return{ok:false,taskId:task.id,engine:"autonomous",capability:"utility.text.organize",artifacts:[],error:{code:"NO_AUTONOMOUS_CAPABILITY",message:"这个任务暂时还没有自主执行能力。"}};
 try{return validateResult(await capability.run(task,ctx));}
 catch(error){ctx.log("task.failed",{taskId:task.id,error:error instanceof Error?error.message:String(error)});return{ok:false,taskId:task.id,engine:"autonomous",capability:capability.id,artifacts:[],error:{code:"AUTONOMOUS_EXECUTION_FAILED",message:"处理没有完成，请重新尝试。"}};}
}
