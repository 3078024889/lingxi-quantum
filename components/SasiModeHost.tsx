"use client";

import SasiChatCreationStudio from "@/components/SasiChatCreationStudio";
import KnowledgeWorkspace from "@/components/KnowledgeWorkspace";
import {SASI_MODE_ADAPTERS} from "@/lib/sasi/skills/mode-adapters";
import type {SasiMode} from "@/lib/sasi/core/session-contract";

export default function SasiModeHost({mode,initialPrompt="",initialFiles=[]}:{mode:SasiMode;initialPrompt?:string;initialFiles?:File[]}){
 const adapter=SASI_MODE_ADAPTERS[mode];
 if(adapter.input==="creation"){
  return <SasiChatCreationStudio mode={mode as "drama"|"website"} initialPrompt={initialPrompt} initialFiles={initialFiles}/>;
 }
 return <KnowledgeWorkspace mode={mode as "book"|"learning"|"research"} initialPrompt={initialPrompt} initialFiles={initialFiles}/>;
}
