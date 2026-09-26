import {serverAdapter} from "./adapter-registry";
import {probeEngine} from "./probe";
import {engineById} from "../catalog";
import {acquireHeavySlot} from "../resource-governor";
import {validatePathArgs} from "./safe-path";
import {operationFor} from "../operation-map";
import {validateArtifact,type Validation} from "../validators";

export type ExecuteRequest={engineId:string;operation:string;args:Record<string,unknown>;heavy?:boolean};

function isHeavyEngine(id:string){return new Set(["ffmpeg","whispercpp","faster-whisper","paddleocr","opencv","gotenberg","real-esrgan","gfpgan"]).has(id)}

export async function executeServerEngine(req:ExecuteRequest){
 const d=engineById(req.engineId);if(!d)throw new Error("UNKNOWN_ENGINE");
 if(d.licenseRisk==="deny"||d.license.commercialUse==="denied")throw new Error("ENGINE_LICENSE_DENIED");
 if(d.runtime==="browser"||d.runtime==="database")throw new Error(`ENGINE_NOT_SERVER_EXECUTABLE:${d.runtime}`);
 const probe=await probeEngine(req.engineId);if(!probe.available)throw new Error(`ENGINE_UNAVAILABLE:${req.engineId}:${probe.reason||"unknown"}`);
 const fn=serverAdapter(req.engineId,req.operation);if(!fn)throw new Error(`ENGINE_OPERATION_UNSUPPORTED:${req.engineId}:${req.operation}`);
 validatePathArgs(req.args);
 const release=(req.heavy??isHeavyEngine(req.engineId))?acquireHeavySlot():()=>{};
 try{
  const started=Date.now();const result=await fn(req.args);
  return{ok:true,engineId:req.engineId,operation:req.operation,elapsedMs:Date.now()-started,result};
 }finally{release()}
}

export type RequirementAttempt={
 engineId:string;ok:boolean;operation?:string;error?:string;elapsedMs?:number;validation?:Validation[];
};
export type ExecuteRequirementRequest={
 capability:string;engines:string[];argsByEngine?:Record<string,Record<string,unknown>>;checks?:string[];
 validationContext?:{inputPaths?:string[];outputPaths?:string[];text?:string;expected?:Record<string,unknown>};
};

export async function executeRequirement(req:ExecuteRequirementRequest){
 const attempts:RequirementAttempt[]=[];
 for(const engineId of req.engines){
  const d=engineById(engineId);
  if(!d){attempts.push({engineId,ok:false,error:"UNKNOWN_ENGINE"});continue}
  if(d.runtime==="browser"||d.runtime==="database"){
   attempts.push({engineId,ok:false,error:`NON_SERVER_RUNTIME:${d.runtime}`});continue;
  }
  const operation=operationFor(engineId,req.capability);
  if(!operation){attempts.push({engineId,ok:false,error:"NO_OPERATION_MAPPING"});continue}
  try{
   const run=await executeServerEngine({engineId,operation,args:req.argsByEngine?.[engineId]||{},heavy:isHeavyEngine(engineId)});
   const validation:Validation[]=[];
   for(const check of req.checks||[])validation.push(await validateArtifact(check,req.validationContext||{}));
   if(validation.some(x=>!x.ok)){
    attempts.push({engineId,operation,ok:false,elapsedMs:run.elapsedMs,validation,error:"VALIDATION_FAILED"});continue;
   }
   attempts.push({engineId,operation,ok:true,elapsedMs:run.elapsedMs,validation});
   return{ok:true,engineId,operation,result:run.result,attempts};
  }catch(e){
   attempts.push({engineId,operation,ok:false,error:e instanceof Error?e.message:String(e)});
  }
 }
 return{ok:false,attempts,error:"ALL_ENGINES_FAILED"};
}
