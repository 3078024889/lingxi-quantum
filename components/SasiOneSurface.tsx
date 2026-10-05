"use client";

import {useEffect,useState} from "react";
import {useSearchParams} from "next/navigation";
import SasiModeHost from "@/components/SasiModeHost";
import SasiUnifiedLauncher from "@/components/SasiUnifiedLauncher";
import {SasiUnifiedConversationProvider} from "@/components/SasiUnifiedConversationProvider";
import type {SasiMode} from "@/lib/sasi/core/session-contract";

function normalize(value:string|null):SasiMode|null{
 return value==="website"||value==="book"||value==="learning"||value==="research"||value==="drama"?value:null;
}

export default function SasiOneSurface(){
 const params=useSearchParams();
 const[mode,setMode]=useState<SasiMode|null>(()=>normalize(params.get("mode")));
 const[initialPrompt,setInitialPrompt]=useState("");
 const[initialFiles,setInitialFiles]=useState<File[]>([]);

 useEffect(()=>{
  const next=normalize(params.get("mode"));
  if(next)setMode(next);
 },[params]);

 function enter(next:SasiMode,prompt="",files:File[]=[]){
  setInitialPrompt(prompt);
  setInitialFiles(files);
  setMode(next);
  const url=new URL(window.location.href);
  url.searchParams.set("mode",next);
  window.history.replaceState({},"",`${url.pathname}?${url.searchParams.toString()}`);
 }

 return <main className="lx11-page min-h-[calc(100vh-64px)]">
  <div className="mx-auto max-w-[1440px] px-3 sm:px-5">
   <SasiUnifiedConversationProvider>
    {mode
      ?<SasiModeHost mode={mode} initialPrompt={initialPrompt} initialFiles={initialFiles}/>
      :<SasiUnifiedLauncher onStart={enter}/>}
   </SasiUnifiedConversationProvider>
  </div>
 </main>;
}
