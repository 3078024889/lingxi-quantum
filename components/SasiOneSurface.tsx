"use client";
import {sasiCommonText} from "@/lib/sasi/common-ui-copy";

import {useEffect,useState,type ReactNode} from "react";
import {useSearchParams} from "next/navigation";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import LingxiMiniIcon,{type LingxiIconName} from "@/components/LingxiMiniIcon";
import{sasiModeLabel}from"@/lib/platform/brand-glossary";
import SasiModeHost from "@/components/SasiModeHost";
import{SasiUnifiedConversationProvider}from"@/components/SasiUnifiedConversationProvider";

type Mode="drama"|"website"|"book"|"learning"|"research";


const MODES:Array<{id:Mode;icon:LingxiIconName}>=[
 {id:"drama",icon:"drama"},
 {id:"website",icon:"website"},
 {id:"book",icon:"book"},
 {id:"learning",icon:"learning"},
 {id:"research",icon:"research"},
];

function normalize(value:string|null):Mode{
 return value==="website"||value==="book"||value==="learning"||value==="research"||value==="drama"?value:"drama";
}

export default function SasiOneSurface(){
 const params=useSearchParams();
 const{lang}=useLingxiLang();
 const[mode,setMode]=useState<Mode>(()=>normalize(params.get("mode")));

 useEffect(()=>{setMode(normalize(params.get("mode")))},[params]);

 function switchMode(next:Mode){
  setMode(next);
  const url=new URL(window.location.href);
  url.searchParams.set("mode",next);
  window.history.replaceState({},"",`${url.pathname}?${url.searchParams.toString()}`);
 }

 const modeBar:ReactNode=<nav
   className="lx-sasi-modebar-reference mt-4 flex w-full max-w-full items-center justify-start gap-5 overflow-x-auto px-0 pb-1 text-[13px] sm:gap-6"
   aria-label={sasiCommonText(lang,"modes")}
  >
   {MODES.map(item=><button
    key={item.id}
    type="button"
    onClick={()=>switchMode(item.id)}
    aria-pressed={mode===item.id}
    className={[
      "flex shrink-0 items-center gap-2 rounded-xl px-0 py-1.5 transition",
      mode===item.id
        ?"font-semibold text-[var(--lx-ink)]"
        :"text-[var(--lx-faint)] hover:text-[var(--lx-ink)]"
    ].join(" ")}
   >
    <LingxiMiniIcon name={item.icon} size="nav"/>
    <span>{sasiModeLabel(lang,item.id)}</span>
   </button>)}
  </nav>;

 return <main className="lx11-page min-h-[calc(100vh-64px)]">
  <div className="mx-auto max-w-[1440px] px-3 sm:px-5">
   <SasiUnifiedConversationProvider><SasiModeHost mode={mode} modeBar={modeBar}/></SasiUnifiedConversationProvider>
  </div>
 </main>;
}
