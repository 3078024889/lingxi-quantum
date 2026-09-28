import {createHash} from "node:crypto";

export type SasiExperimentStage="shadow"|"canary"|"stable";
function bucket(input:string){
 const hash=createHash("sha256").update(input).digest();
 return hash.readUInt32BE(0)/0xffffffff;
}
export function experimentAssignment(input:{experimentId:string;subjectId:string;stage:SasiExperimentStage;trafficShare:number}){
 const share=Math.max(0,Math.min(1,input.trafficShare));
 if(input.stage==="stable")return{assigned:true,bucket:0,stage:input.stage};
 const b=bucket(`${input.experimentId}:${input.subjectId}`);
 return{assigned:b<share,bucket:b,stage:input.stage};
}
export function canUseProductionContentForShadow(input:{scope:"public-benchmark"|"user-private"|"user-opt-in";optedIn?:boolean}){
 if(input.scope==="public-benchmark")return true;
 return input.scope==="user-opt-in"&&input.optedIn===true;
}
