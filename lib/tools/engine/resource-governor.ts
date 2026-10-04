import "server-only";
import os from"node:os";
import{rankExecutionLanes}from"@/lib/tasks/smart-execution";

export type HeavyWorkKind="ocr"|"media"|"vision"|"pdf";
export type RuntimeBudget={
 cpuCount:number;totalMemoryMB:number;freeMemoryMB:number;reserveMemoryMB:number;usableMemoryMB:number;
 maxConcurrentHeavy:number;allowGpu:boolean;
};
let activeHeavy=0;

function intEnv(name:string,fallback:number){const value=Number(process.env[name]);return Number.isFinite(value)&&value>0?Math.floor(value):fallback}
function reserveFor(totalMemoryMB:number){
 const configured=intEnv("LINGXI_ENGINE_MEMORY_RESERVE_MB",0);
 if(configured)return Math.min(Math.max(512,configured),Math.max(512,totalMemoryMB-256));
 return Math.min(1024,Math.max(640,Math.round(totalMemoryMB*.35)));
}
function worksetFor(kind:HeavyWorkKind){
 const defaults:Record<HeavyWorkKind,number>={ocr:768,media:896,vision:896,pdf:640};
 return intEnv(`LINGXI_ENGINE_${kind.toUpperCase()}_WORKSET_MB`,defaults[kind]);
}

export function currentBudget():RuntimeBudget{
 const cpuCount=Math.max(1,os.cpus()?.length||1);
 const totalMemoryMB=Math.round(os.totalmem()/1048576),freeMemoryMB=Math.round(os.freemem()/1048576);
 const reserveMemoryMB=reserveFor(totalMemoryMB),usableMemoryMB=Math.max(0,freeMemoryMB-reserveMemoryMB);
 const defaultWorkset=worksetFor("media");
 const memorySlots=Math.floor(usableMemoryMB/defaultWorkset),cpuSlots=Math.max(1,Math.floor(cpuCount/2));
 const configured=intEnv("LINGXI_ENGINE_MAX_HEAVY",2);
 const maxConcurrentHeavy=Math.max(0,Math.min(2,configured,cpuSlots,memorySlots));
 return{cpuCount,totalMemoryMB,freeMemoryMB,reserveMemoryMB,usableMemoryMB,maxConcurrentHeavy,allowGpu:process.env.LINGXI_ENGINE_GPU==="1"};
}
export function runtimeLoad(){return{activeHeavy,...currentBudget()}}
export function acquireHeavySlot(kind:HeavyWorkKind="media"){
 const b=currentBudget(),needed=worksetFor(kind);
 if(b.usableMemoryMB<needed)throw new Error("ENGINE_LOW_MEMORY");
 if(activeHeavy>=b.maxConcurrentHeavy)throw new Error("ENGINE_BUSY");
 activeHeavy++;let released=false;return()=>{if(!released){released=true;activeHeavy=Math.max(0,activeHeavy-1)}};
}
export function chooseLane(inputBytes:number,kind:"light"|HeavyWorkKind){
 const b=currentBudget();
 const needed=kind==="light"?0:worksetFor(kind);
 const ranked=rankExecutionLanes({browserEligible:kind==="light",deterministic:true,needsNetwork:false,serverAvailable:kind==="light"||(b.usableMemoryMB>=needed&&b.maxConcurrentHeavy>0),externalAllowed:false,inputBytes,maxInputBytes:kind==="light"?Number.MAX_SAFE_INTEGER:512*1024*1024});
 const first=ranked[0];
 if(first==="reject")return{lane:"reject" as const,budget:b,reason:"INPUT_TOO_LARGE"};
 if(first==="browser")return{lane:"local" as const,budget:b};
 if(first==="self-hosted")return{lane:"self-hosted" as const,budget:b};
 return{lane:"defer" as const,budget:b,reason:"LOW_MEMORY"};
}
