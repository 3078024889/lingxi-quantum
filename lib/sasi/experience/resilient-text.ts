import "server-only";
import {randomUUID} from "node:crypto";
import {runExperienceText} from "./free-text-router";
import {reserveExperience,settleExperience} from "./daily-budget";
import type{ExperienceRegion,ExperienceTask}from"./free-provider-config";
import {runUserText,selectUserTextConnection} from "@/lib/sasi/intelligence/user-text";
import type{TextMessage}from"@/lib/sasi/ark-text";
import{coalesce,coalesceKey}from"./request-coalescer";

export type ResilientTextOutcome=
 |{kind:"answer";answer:string;source:"experience"|"connected";experienceExhausted:boolean}
 |{kind:"needs-connection";experienceExhausted:boolean};

const units:Record<ExperienceTask,number>={chat:8,knowledge:18,research:28,website:36,drama:32};

export async function resilientText(input:{
 userId:string;region:ExperienceRegion;task:ExperienceTask;messages:TextMessage[];
 maxOutputTokens?:number;allowConnected?:boolean;sessionKey?:string;
 validateAnswer?:(answer:string)=>void;
 onDelta?:(delta:string)=>void;onReset?:()=>void;
}):Promise<ResilientTextOutcome>{
 const sessionKey=String(input.sessionKey||"default").slice(0,160);
 const dedupe=coalesceKey([input.userId,input.region,input.task,sessionKey,input.messages,input.maxOutputTokens,Boolean(input.validateAnswer),input.allowConnected]);
 const work=async()=>{
 const referenceId=randomUUID(),claim=await reserveExperience(input.userId,referenceId,units[input.task]);
 if(claim.ok){
  try{
   const out=await runExperienceText({region:input.region,task:input.task,messages:input.messages,maxOutputTokens:input.maxOutputTokens,userId:input.userId,sessionKey,onDelta:input.onDelta,onReset:input.onReset});
   input.validateAnswer?.(out.text);
   await settleExperience(input.userId,referenceId,claim.units,true,claim.soft);
   return {kind:"answer",answer:out.text,source:"experience",experienceExhausted:false};
  }catch{
   // Provider failure never consumes the user's daily experience allowance.
   await settleExperience(input.userId,referenceId,claim.units,false,claim.soft);
  }
 }

 if(input.allowConnected!==false){
  try{
   const connection=await selectUserTextConnection(input.userId);
   if(connection){
    const out=await runUserText({userId:input.userId,taskId:randomUUID(),messages:input.messages,maxOutputTokens:input.maxOutputTokens});
    input.onDelta?.(out.answer);
    return {kind:"answer",answer:out.answer,source:"connected",experienceExhausted:!claim.ok};
   }
  }catch{
   // Connected-service failure is converted into a calm recovery state; no raw provider error leaks to UI.
  }
 }
 return {kind:"needs-connection",experienceExhausted:!claim.ok};
 };
 return input.onDelta?work():coalesce(dedupe,work);
}
