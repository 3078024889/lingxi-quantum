"use client";
import {useState} from "react";
import {useSearchParams} from "next/navigation";
import SasiModeHost from "@/components/SasiModeHost";
import SasiPromptConversation from "@/components/SasiPromptConversation";
import SasiUnifiedLauncher,{type SasiEntryMode} from "@/components/SasiUnifiedLauncher";
import {SasiUnifiedConversationProvider} from "@/components/SasiUnifiedConversationProvider";
import type{SasiSkillId}from"@/lib/sasi/skills/types";

function legacyMode(value:string|null):SasiEntryMode|null{
 return value==="chat"||value==="image"||value==="website"||value==="book"||value==="learning"||value==="research"||value==="drama"?value:null;
}
export default function SasiOneSurface(){
 const params=useSearchParams();
 const intent=(params.get("intent")||"").slice(0,16000);
 const legacy=legacyMode(params.get("mode"));
 const [mode,setMode]=useState<SasiEntryMode|null>(()=>intent?"chat":legacy);
 const [initialPrompt,setInitialPrompt]=useState(intent);
 const [autoStart,setAutoStart]=useState(Boolean(intent));
 const [initialFiles,setInitialFiles]=useState<File[]>([]);
 const [initialSkillIds,setInitialSkillIds]=useState<SasiSkillId[]>([]);
 function cleanRoute(dropProject:boolean){
  const url=new URL(window.location.href);
  url.searchParams.delete("mode");url.searchParams.delete("intent");
  if(dropProject)url.searchParams.delete("projectId");
  window.history.replaceState({},"",url.pathname+(url.searchParams.toString()?"?"+url.searchParams.toString():""));
 }
 function enter(next:SasiEntryMode,prompt="",files:File[]=[],skillIds:SasiSkillId[]=[]){
  // Keep natural-language requests in one dialogue. A workspace opens only by explicit user choice.
  if(next!=="chat"&&next!=="image"&&!files.length&&prompt.trim()){next="chat"}
  setAutoStart(Boolean(prompt)||files.length>0);setInitialPrompt(prompt);setInitialFiles(files);setInitialSkillIds(skillIds);setMode(next);cleanRoute(next!==mode);
 }
 function switchMode(next:SasiEntryMode,prompt=""){
  setAutoStart(Boolean(prompt));setInitialPrompt(prompt);setInitialFiles([]);setInitialSkillIds([]);setMode(next);cleanRoute(next!==mode);
 }
 return <main className="lx11-page min-h-[calc(100vh-64px)]"><div className="mx-auto max-w-[1440px] px-3 sm:px-5"><SasiUnifiedConversationProvider>
 {mode==="chat"||mode==="image"?<SasiPromptConversation key={mode} onTask={(task,prompt)=>enter(task,prompt)} autoStart={autoStart} task={mode} initialPrompt={initialPrompt} onFiles={(files,prompt)=>enter("book",prompt,files)}/>:mode?<SasiModeHost autoStart={autoStart} mode={mode} initialPrompt={initialPrompt} initialFiles={initialFiles} initialSkillIds={initialSkillIds} onSwitch={switchMode}/>:<SasiUnifiedLauncher initialPrompt={intent} onStart={enter}/>}
 </SasiUnifiedConversationProvider></div></main>;
}
