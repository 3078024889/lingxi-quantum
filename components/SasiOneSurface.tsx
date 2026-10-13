"use client";
import {useState,useEffect,useRef} from "react";
import {useSearchParams} from "next/navigation";
import SasiModeHost from "@/components/SasiModeHost";
import SasiPromptConversation from "@/components/SasiPromptConversation";
import SasiUnifiedLauncher,{type SasiEntryMode} from "@/components/SasiUnifiedLauncher";
import {SasiUnifiedConversationProvider,useSasiUnifiedConversation} from "@/components/SasiUnifiedConversationProvider";
import type{SasiSkillId}from"@/lib/sasi/skills/types";
import {inferUnifiedSasiIntent} from "@/lib/sasi/core/unified-intent";
import {SasiAssistantText} from './SasiResultCore';
import {SasiUserMessage} from './SasiComposerCore';

function legacyMode(value:string|null):SasiEntryMode|null{
 return value==="chat"||value==="image"||value==="website"||value==="book"||value==="learning"||value==="research"||value==="drama"?value:null;
}
export default function SasiOneSurface(){return <SasiUnifiedConversationProvider><SasiOneSurfaceBody/></SasiUnifiedConversationProvider>}
function SasiOneSurfaceBody(){
 const continuity=useSasiUnifiedConversation();
 const params=useSearchParams();
 const intent=(params.get("intent")||"").slice(0,16000);
 const legacy=legacyMode(params.get("mode"));
 const [mode,setMode]=useState<SasiEntryMode|null>(()=>intent?(inferUnifiedSasiIntent(intent,false)==="image"?"image":"chat"):legacy);
 const [initialPrompt,setInitialPrompt]=useState(intent);
 const [autoStart,setAutoStart]=useState(Boolean(intent));
 const [initialFiles,setInitialFiles]=useState<File[]>([]);
 const [initialSkillIds,setInitialSkillIds]=useState<SasiSkillId[]>([]);
 const didRestore=useRef(false);
 useEffect(()=>{if(legacy&&!intent)setMode(legacy)},[legacy,intent]);
 useEffect(()=>{
  if(!continuity.restored||didRestore.current)return;didRestore.current=true;
  if(!intent&&!legacy&&legacyMode(continuity.workspace.mode)){
   setMode(continuity.workspace.mode);setInitialPrompt(continuity.workspace.initialPrompt||'');setAutoStart(false);
  }
 },[continuity.restored,continuity.workspace,intent,legacy]);
 function cleanRoute(next:SasiEntryMode,dropProject:boolean){
  const url=new URL(window.location.href);
  url.searchParams.delete("intent");
  url.searchParams.set('mode',next);
  if(continuity.threadId)url.searchParams.set('threadId',continuity.threadId);
  if(dropProject)url.searchParams.delete("projectId");
  window.history.replaceState({},"",url.pathname+(url.searchParams.toString()?"?"+url.searchParams.toString():""));
 }
 function enter(next:SasiEntryMode,prompt="",files:File[]=[],skillIds:SasiSkillId[]=[]){
  // Keep natural-language requests in one dialogue. A workspace opens only by explicit user choice.
  if(next!=="chat"&&next!=="image"&&!files.length&&!skillIds.length&&prompt.trim()){next="chat"}
  setAutoStart(Boolean(prompt)||files.length>0);setInitialPrompt(prompt);setInitialFiles(files);setInitialSkillIds(skillIds);setMode(next);cleanRoute(next,next!==mode);
  continuity.updateWorkspace({mode:next,initialPrompt:prompt,projectId:null});
 }
 function switchMode(next:SasiEntryMode,prompt=""){
  setAutoStart(Boolean(prompt));setInitialPrompt(prompt);setInitialFiles([]);setInitialSkillIds([]);setMode(next);cleanRoute(next,false);
  continuity.updateWorkspace({mode:next,initialPrompt:prompt});
 }
 if(!continuity.restored)return <main className="lx11-page" aria-busy="true"/>;
 return <main className="lx11-page min-h-[calc(100vh-64px)]"><div className="mx-auto max-w-[1440px] px-3 sm:px-5">
 {mode&&mode!=='chat'&&mode!=='image'&&continuity.workspace.chatHistory?.length>0&&<section className="lx-sasi-layout pt-8" data-sasi-continuation-history="true">{continuity.workspace.chatHistory.map((turn:any,index:number)=><div className="mb-8" key={index}><SasiUserMessage>{turn.question}</SasiUserMessage>{turn.answer&&<SasiAssistantText>{turn.answer}</SasiAssistantText>}</div>)}<button type="button" onClick={()=>switchMode('chat')} className="rounded-full border px-4 py-2 text-sm">返回对话</button></section>}
 {(mode==='chat'||mode==='image'||continuity.workspace.chatOpened)&&<div hidden={mode!=='chat'&&mode!=='image'}><SasiPromptConversation key={mode==='image'?'image':'chat'} onTask={(task,prompt)=>switchMode(task,prompt)} autoStart={autoStart&&(mode==='chat'||mode==='image')} task={mode==='image'?'image':'chat'} initialPrompt={initialPrompt} onFiles={(files,prompt)=>enter("book",prompt,files)}/></div>}
 {mode&&mode!=='chat'&&mode!=='image'?<SasiModeHost autoStart={autoStart} mode={mode} initialPrompt={initialPrompt} initialFiles={initialFiles} initialSkillIds={initialSkillIds} onSwitch={switchMode}/>:!mode?<SasiUnifiedLauncher initialPrompt={intent} onStart={enter}/>:null}
 </div></main>;
}
