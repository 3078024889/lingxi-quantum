import os from "node:os";
export type RuntimeBudget={cpuCount:number;totalMemoryMB:number;freeMemoryMB:number;maxConcurrentHeavy:number;allowGpu:boolean};
let activeHeavy=0;
export function currentBudget():RuntimeBudget{const cpuCount=Math.max(1,os.cpus()?.length||1),totalMemoryMB=Math.round(os.totalmem()/1048576),freeMemoryMB=Math.round(os.freemem()/1048576);return{cpuCount,totalMemoryMB,freeMemoryMB,maxConcurrentHeavy:Math.max(1,Math.min(4,Math.floor(cpuCount/2),Math.floor(freeMemoryMB/2048))),allowGpu:process.env.LINGXI_ENGINE_GPU==="1"};}
export function runtimeLoad(){return{activeHeavy,...currentBudget()}}
export function acquireHeavySlot(){const b=currentBudget();if(activeHeavy>=b.maxConcurrentHeavy)throw new Error("ENGINE_BUSY");if(b.freeMemoryMB<1024)throw new Error("ENGINE_LOW_MEMORY");activeHeavy++;let released=false;return()=>{if(!released){released=true;activeHeavy=Math.max(0,activeHeavy-1)}}}
export function chooseLane(inputBytes:number,kind:"light"|"ocr"|"media"|"vision"|"pdf"){const b=currentBudget();if(kind==="light")return{lane:"local",budget:b};if(inputBytes>512*1024*1024)return{lane:"reject",budget:b,reason:"INPUT_TOO_LARGE"};if(b.freeMemoryMB<1024)return{lane:"defer",budget:b,reason:"LOW_MEMORY"};return{lane:"self-hosted",budget:b};}
