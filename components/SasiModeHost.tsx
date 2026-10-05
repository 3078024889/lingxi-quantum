"use client";

import SasiChatCreationStudio from "@/components/SasiChatCreationStudio";
import KnowledgeWorkspace from "@/components/KnowledgeWorkspace";
import {SASI_MODE_ADAPTERS} from "@/lib/sasi/skills/mode-adapters";
import type {SasiMode} from "@/lib/sasi/core/session-contract";
import type{SasiSkillId}from"@/lib/sasi/skills/types";

export default function SasiModeHost({mode,initialPrompt="",initialFiles=[],initialSkillIds=[]}:{mode:SasiMode;initialPrompt?:string;initialFiles?:File[];initialSkillIds?:SasiSkillId[]}){
 const adapter=SASI_MODE_ADAPTERS[mode];
 if(adapter.input==="creation"){
  return <SasiChatCreationStudio mode={mode as "drama"|"website"} initialPrompt={initialPrompt} initialFiles={initialFiles} initialSkillIds={initialSkillIds}/>;
 }
 return <KnowledgeWorkspace mode={mode as "book"|"learning"|"research"} initialPrompt={initialPrompt} initialFiles={initialFiles} initialSkillIds={initialSkillIds}/>;
}
