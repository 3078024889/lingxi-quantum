"use client";

import type{ReactNode}from"react";
import SasiChatCreationStudio from"@/components/SasiChatCreationStudio";
import KnowledgeWorkspace from"@/components/KnowledgeWorkspace";
import{SASI_MODE_ADAPTERS}from"@/lib/sasi/skills/mode-adapters";
import type{SasiMode}from"@/lib/sasi/core/session-contract";
import SasiStartGuide from "@/components/SasiStartGuide";

export default function SasiModeHost({mode,modeBar}:{mode:SasiMode;modeBar:ReactNode}){
 const adapter=SASI_MODE_ADAPTERS[mode];
 if(adapter.input==="creation"){
  return <><SasiStartGuide mode={mode}/><SasiChatCreationStudio mode={mode as"drama"|"website"} modeBar={modeBar}/></>;
 }
 return <><SasiStartGuide mode={mode}/><KnowledgeWorkspace mode={mode as"book"|"learning"|"research"} modeBar={modeBar}/></>;
}
