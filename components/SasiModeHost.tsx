"use client";

import type{ReactNode}from"react";
import SasiChatCreationStudio from"@/components/SasiChatCreationStudio";
import KnowledgeWorkspace from"@/components/KnowledgeWorkspace";
import{SASI_MODE_ADAPTERS}from"@/lib/sasi/skills/mode-adapters";
import type{SasiMode}from"@/lib/sasi/core/session-contract";

export default function SasiModeHost({mode,modeBar}:{mode:SasiMode;modeBar:ReactNode}){
 const adapter=SASI_MODE_ADAPTERS[mode];
 if(adapter.input==="creation"){
  return <SasiChatCreationStudio mode={mode as"drama"|"website"} modeBar={modeBar}/>;
 }
 return <KnowledgeWorkspace mode={mode as"book"|"learning"|"research"} modeBar={modeBar}/>;
}
