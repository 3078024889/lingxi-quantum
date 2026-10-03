"use client";

import {useEffect,useState,type ReactNode} from "react";
import {useSearchParams} from "next/navigation";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import LingxiMiniIcon,{type LingxiIconName} from "@/components/LingxiMiniIcon";
import SasiModeHost from "@/components/SasiModeHost";

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
   aria-label="SASI modes"
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
    <span>{MODE_LABELS[lang]?.[item.id]??MODE_LABELS.en[item.id]}</span>
   </button>)}
  </nav>;

 return <main className="lx11-page min-h-[calc(100vh-64px)]">
  <div className="mx-auto max-w-[1440px] px-3 sm:px-5">
   <SasiModeHost mode={mode} modeBar={modeBar}/>
  </div>
 </main>;
}
