"use client";
import {SasiTaskNavigation} from './SasiTaskToolbar';
import {useEffect,useState} from "react";
import {useSearchParams} from "next/navigation";
import SasiModeHost from "@/components/SasiModeHost";
import SasiPromptConversation from "@/components/SasiPromptConversation";
import SasiUnifiedLauncher,{type SasiEntryMode} from "@/components/SasiUnifiedLauncher";
import {SasiUnifiedConversationProvider} from "@/components/SasiUnifiedConversationProvider";
import type {SasiMode} from "@/lib/sasi/core/session-contract";
import type{SasiSkillId}from"@/lib/sasi/skills/types";
import {inferSasiMode} from '@/lib/sasi/core/intent-router';
function normalize(value:string|null):SasiEntryMode|null{return value==="chat"||value==="image"||value==="website"||value==="book"||value==="learning"||value==="research"||value==="drama"?value:null}
export default function SasiOneSurface(){const params=useSearchParams();const intent=(params.get('intent')||'').slice(0,16000);const[mode,setMode]=useState<SasiEntryMode|null>(()=>normalize(params.get("mode"))||inferSasiMode(intent));const[initialPrompt,setInitialPrompt]=useState(intent);const[autoStart,setAutoStart]=useState(false);const[initialFiles,setInitialFiles]=useState<File[]>([]);const[initialSkillIds,setInitialSkillIds]=useState<SasiSkillId[]>([]);
 useEffect(()=>{const next=normalize(params.get("mode"));if(next)setMode(next)},[params]);
 function setUrl(next:SasiEntryMode|null){const url=new URL(window.location.href);if(next)url.searchParams.set("mode",next);else url.searchParams.delete("mode");url.searchParams.delete("projectId");window.history.replaceState({},"",url.pathname+(url.searchParams.toString()?`?${url.searchParams.toString()}`:""))}
 function enter(next:SasiEntryMode,prompt="",files:File[]=[],skillIds:SasiSkillId[]=[]){setAutoStart(true);setInitialPrompt(prompt);setInitialFiles(files);setInitialSkillIds(skillIds);setMode(next);setUrl(next)}
 function switchMode(next:SasiEntryMode){setAutoStart(false);setInitialPrompt("");setInitialFiles([]);setInitialSkillIds([]);setMode(next);setUrl(next)}
 return <main className="lx11-page min-h-[calc(100vh-64px)]"><div className="mx-auto max-w-[1440px] px-3 sm:px-5"><SasiUnifiedConversationProvider><SasiTaskNavigation current={mode} onSelect={switchMode}>{mode==="chat"||mode==="image"?<SasiPromptConversation key={mode} onTask={(task,prompt)=>enter(task,prompt)} autoStart={autoStart} task={mode} initialPrompt={initialPrompt} onFiles={(files,prompt)=>enter("book",prompt,files)}/>:mode?<SasiModeHost autoStart={autoStart} mode={mode} initialPrompt={initialPrompt} initialFiles={initialFiles} initialSkillIds={initialSkillIds} onSwitch={switchMode}/>:<SasiUnifiedLauncher initialPrompt={intent} onStart={enter}/>}</SasiTaskNavigation></SasiUnifiedConversationProvider></div></main>}
