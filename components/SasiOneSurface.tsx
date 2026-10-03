"use client";

import {useEffect,useMemo,useState} from "react";
import {useSearchParams} from "next/navigation";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import SasiChatCreationStudio from "@/components/SasiChatCreationStudio";
import KnowledgeWorkspace from "@/components/KnowledgeWorkspace";

type Mode="drama"|"website"|"book"|"learning"|"research";

const MODE_LABELS:Record<LingxiLang,Record<Mode,string>>={
 zh:{drama:"短剧",website:"网站",book:"书本",learning:"学习",research:"科研"},
 en:{drama:"Drama",website:"Website",book:"Book",learning:"Learning",research:"Research"},
 ja:{drama:"短編",website:"サイト",book:"本",learning:"学習",research:"研究"},
 ko:{drama:"드라마",website:"웹사이트",book:"책",learning:"학습",research:"연구"},
 fr:{drama:"Série",website:"Site",book:"Livre",learning:"Apprentissage",research:"Recherche"},
 de:{drama:"Drama",website:"Website",book:"Buch",learning:"Lernen",research:"Forschung"},
 es:{drama:"Drama",website:"Web",book:"Libro",learning:"Aprendizaje",research:"Investigación"},
 pt:{drama:"Drama",website:"Site",book:"Livro",learning:"Aprendizado",research:"Pesquisa"},
 ar:{drama:"دراما",website:"موقع",book:"كتاب",learning:"تعلم",research:"بحث"},
};

const MODES:Mode[]=["drama","website","book","learning","research"];

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

 const content=useMemo(()=>{
   if(mode==="drama")return <SasiChatCreationStudio mode="drama"/>;
   if(mode==="website")return <SasiChatCreationStudio mode="website"/>;
   if(mode==="book")return <KnowledgeWorkspace mode="book"/>;
   if(mode==="learning")return <KnowledgeWorkspace mode="learning"/>;
   return <KnowledgeWorkspace mode="research"/>;
 },[mode]);

 return <main className="lx11-page min-h-[calc(100vh-64px)]">
   <div className="mx-auto max-w-[1440px] px-3 pb-20 sm:px-5">
     {content}
   </div>

   <nav
     className="fixed bottom-2 left-1/2 z-40 flex max-w-[calc(100vw-24px)] -translate-x-1/2 items-center justify-center gap-1 rounded-full bg-[color:var(--lx-bg)/.88] px-2 py-1.5 text-xs backdrop-blur-xl lg:left-[calc(50%+108px)]"
     aria-label="SASI modes"
   >
     {MODES.map(item=><button
       key={item}
       type="button"
       onClick={()=>switchMode(item)}
       className={`rounded-full px-3 py-1.5 transition ${mode===item?"font-semibold text-[var(--lx-ink)]":"text-[var(--lx-faint)] hover:text-[var(--lx-ink)]"}`}
       aria-pressed={mode===item}
     >
       {MODE_LABELS[lang]?.[item]??MODE_LABELS.en[item]}
     </button>)}
   </nav>
 </main>;
}
