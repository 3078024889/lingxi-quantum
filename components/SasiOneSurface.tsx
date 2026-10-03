"use client";

import {useEffect,useMemo,useState} from "react";
import {useSearchParams} from "next/navigation";
import LingxiMiniIcon,{type LingxiIconName} from "@/components/LingxiMiniIcon";
import SasiChatCreationStudio from "@/components/SasiChatCreationStudio";
import KnowledgeWorkspace from "@/components/KnowledgeWorkspace";

type Mode="drama"|"website"|"book"|"learning"|"research";

const MODES:Array<{id:Mode;zh:string;en:string;icon:LingxiIconName}>=[
 {id:"drama",zh:"短剧",en:"Drama",icon:"drama"},
 {id:"website",zh:"网站",en:"Website",icon:"website"},
 {id:"book",zh:"书本",en:"Book",icon:"book"},
 {id:"learning",zh:"学习",en:"Learning",icon:"learning"},
 {id:"research",zh:"科研",en:"Research",icon:"research"},
];

function normalize(value:string|null):Mode{
 return value==="website"||value==="book"||value==="learning"||value==="research"||value==="drama"?value:"drama";
}

export default function SasiOneSurface(){
 const params=useSearchParams();
 const initial=normalize(params.get("mode"));
 const [mode,setMode]=useState<Mode>(initial);

 useEffect(()=>{setMode(normalize(params.get("mode")))},[params]);

 function switchMode(next:Mode){
   setMode(next);
   const url=new URL(window.location.href);
   url.searchParams.set("mode",next);
   window.history.replaceState({},"",url.pathname+"?"+url.searchParams.toString());
 }

 const content=useMemo(()=>{
   if(mode==="drama") return <SasiChatCreationStudio mode="drama"/>;
   if(mode==="website") return <SasiChatCreationStudio mode="website"/>;
   if(mode==="book") return <KnowledgeWorkspace mode="book"/>;
   if(mode==="learning") return <KnowledgeWorkspace mode="learning"/>;
   return <KnowledgeWorkspace mode="research"/>;
 },[mode]);

 return <main className="lx11-page">
   <div className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6">
     <section className="min-h-[62vh]">{content}</section>

     <nav
       className="sticky bottom-3 z-30 mx-auto mt-4 flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-2xl border border-[var(--lx-line)] bg-[color:var(--lx-panel)/.96] p-2 shadow-lg backdrop-blur"
       aria-label="SASI modes"
     >
       {MODES.map(item=><button
         key={item.id}
         type="button"
         onClick={()=>switchMode(item.id)}
         className={[
           "flex min-w-[76px] flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs transition",
           mode===item.id?"bg-[var(--lx-ink)] text-[var(--lx-bg)]":"text-[var(--lx-muted)] hover:bg-[var(--lx-soft)]"
         ].join(" ")}
         aria-pressed={mode===item.id}
       >
         <LingxiMiniIcon name={item.icon} size="tiny"/>
         <span className="font-medium">{item.zh}</span>
       </button>)}
     </nav>
   </div>
 </main>;
}
