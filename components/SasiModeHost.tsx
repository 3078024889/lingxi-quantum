"use client";
import {useState} from "react";
import SasiChatCreationStudio from "@/components/SasiChatCreationStudio";
import KnowledgeWorkspace from "@/components/KnowledgeWorkspace";
import {SASI_MODE_ADAPTERS} from "@/lib/sasi/skills/mode-adapters";
import type {SasiMode} from "@/lib/sasi/core/session-contract";
import type{SasiSkillId}from"@/lib/sasi/skills/types";
export default function SasiModeHost({mode,initialPrompt="",initialFiles=[],initialSkillIds=[],autoStart=false,onSwitch}:{mode:SasiMode;initialPrompt?:string;initialFiles?:File[];initialSkillIds?:SasiSkillId[];autoStart?:boolean;onSwitch:(mode:SasiMode|"chat"|"image",prompt?:string)=>void}){
 const [drafts,setDrafts]=useState(()=>({[mode]:{initialPrompt,initialFiles,initialSkillIds,autoStart}}));
 if(!drafts[mode])setDrafts(previous=>({...previous,[mode]:{initialPrompt,initialFiles,initialSkillIds,autoStart}}));
 return <>{(Object.keys(drafts) as SasiMode[]).map(id=>{
  const draft=drafts[id],adapter=SASI_MODE_ADAPTERS[id];
  return <div key={id} hidden={id!==mode} data-sasi-task={id}>{adapter.input==="creation"?<SasiChatCreationStudio mode={id as "drama"|"website"} {...draft} onRedirect={(next,prompt)=>onSwitch(next,prompt)}/>:<KnowledgeWorkspace mode={id as "book"|"learning"|"research"} {...draft} onRedirect={(next,prompt)=>onSwitch(next,prompt)}/>}</div>;
 })}</>;
}
