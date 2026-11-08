"use client";

import {useEffect,useRef,useState} from "react";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";

type Notice={id:string;version:string;titleZh:string;titleEn:string;bodyZh:string;bodyEn:string};
const VERSION="web-cn-upgrade-20261108";
const COPY={
 zh:{label:"灵犀场 · 网站焕新",title:"灵犀场中国站焕新上线",body:"11月6日至8日，灵犀场完成中国站重要升级。全球 SIAI 排行榜、实用工具、SASI 智能软件和公告中心以新版面貌呈现。",action:"查看本次更新",close:"我知道了"},
 en:{label:"LINGXIFIELD · WHAT'S NEW",title:"LINGXIFIELD China site refreshed",body:"Between November 6 and 8, the China site received a major upgrade, refreshing the SIAI rankings, practical tools, SASI software, and announcements.",action:"View update",close:"Got it"},
 ja:{label:"LINGXIFIELD · 更新情報",title:"中国サイトが新しくなりました",body:"11月6日から8日にかけて、中国サイトを更新しました。SIAIランキング、実用ツール、SASIソフトウェア、お知らせが新しくなりました。",action:"更新を見る",close:"閉じる"},
 ko:{label:"LINGXIFIELD · 업데이트",title:"중국 사이트 새 단장",body:"11월 6일부터 8일까지 중국 사이트를 개편했습니다. SIAI 순위, 실용 도구, SASI 소프트웨어 및 공지 페이지를 새롭게 선보입니다.",action:"업데이트 보기",close:"닫기"},
 fr:{label:"LINGXIFIELD · ACTUALITÉS",title:"Le site chinois fait peau neuve",body:"Du 6 au 8 novembre, le site chinois a été rénové : classement SIAI, outils pratiques, logiciels SASI et annonces.",action:"Voir la nouveauté",close:"Fermer"},
 de:{label:"LINGXIFIELD · NEUIGKEITEN",title:"China-Website neu gestaltet",body:"Vom 6. bis 8. November wurde die chinesische Website aktualisiert: SIAI-Ranking, Werkzeuge, SASI-Software und Mitteilungen.",action:"Änderungen ansehen",close:"Schließen"},
 es:{label:"LINGXIFIELD · NOVEDADES",title:"El sitio de China se renueva",body:"Del 6 al 8 de noviembre se renovó el sitio de China, incluidos SIAI, herramientas prácticas, software SASI y anuncios.",action:"Ver novedades",close:"Cerrar"},
 pt:{label:"LINGXIFIELD · NOVIDADES",title:"Site da China renovado",body:"De 6 a 8 de novembro, o site da China foi renovado, incluindo SIAI, ferramentas práticas, software SASI e anúncios.",action:"Ver atualização",close:"Fechar"},
 ar:{label:"LINGXIFIELD · جديد المنصة",title:"تحديث موقع الصين",body:"من 6 إلى 8 نوفمبر، تم تحديث موقع الصين، بما في ذلك تصنيفات SIAI والأدوات العملية وبرامج SASI والإعلانات.",action:"عرض التحديث",close:"إغلاق"}
} as const;

export default function PublicUpgradeAnnouncementModal(){
 const {lang}=useLingxiLang();
 const c=COPY[lang]||COPY.en;
 const [notice,setNotice]=useState<Notice|null>(null);
 const closeRef=useRef<HTMLButtonElement>(null);
 const storageKey="lx-public-upgrade:"+VERSION;

 useEffect(()=>{
  if(location.hostname.toLowerCase()!=="lingxifield.cn")return;
  if(/^\/(?:checkout|checkout-usd|account|pay|billing|api)(?:\/|$)/.test(location.pathname))return;
  try{if(localStorage.getItem(storageKey)==="closed")return;}catch{}
  const controller=new AbortController();
  fetch("/api/site-announcements",{signal:controller.signal,cache:"no-store",credentials:"same-origin"})
   .then(response=>response.ok?response.json():null)
   .then(data=>{
    const entry=Array.isArray(data?.items)?data.items.find((item:Notice)=>item.version===VERSION):null;
    if(entry?.id&&typeof entry.titleZh==="string"&&typeof entry.bodyZh==="string"){
     setNotice(entry);
    }
   }).catch(()=>{});
  return()=>controller.abort();
 },[]);

 useEffect(()=>{
  if(!notice)return;
  const prevOverflow=document.body.style.overflow;
  const prevFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
  document.body.style.overflow="hidden";
  closeRef.current?.focus();
  const onKey=(event:KeyboardEvent)=>{
   if(event.key==="Escape"){event.preventDefault();dismiss();}
   if(event.key==="Tab"){
    const elements=Array.from(document.querySelectorAll<HTMLElement>("#lx-upgrade-announcement-modal a, #lx-upgrade-announcement-modal button"));
    if(!elements.length)return;
    if(event.shiftKey&&document.activeElement===elements[0]){event.preventDefault();elements[elements.length-1].focus();}
    else if(!event.shiftKey&&document.activeElement===elements[elements.length-1]){event.preventDefault();elements[0].focus();}
   }
  };
  window.addEventListener("keydown",onKey);
  return()=>{window.removeEventListener("keydown",onKey);document.body.style.overflow=prevOverflow;prevFocus?.focus();};
 },[notice]);

 function dismiss(){
  try{localStorage.setItem(storageKey,"closed");}catch{}
  setNotice(null);
 }
 if(!notice)return null;
 const other=lang!=="zh"&&lang!=="en";
 const title=other?c.title:lang==="zh"?notice.titleZh:notice.titleEn||notice.titleZh;
 const body=other?c.body:lang==="zh"?notice.bodyZh:notice.bodyEn||notice.bodyZh;
 return <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/50 px-4 py-8">
  <section id="lx-upgrade-announcement-modal" role="dialog" aria-modal="true" aria-labelledby="lx-upgrade-title" aria-describedby="lx-upgrade-body"
   dir={lang==="ar"?"rtl":"ltr"} className="relative w-full max-w-xl rounded-3xl border border-white/50 bg-[var(--lx-panel)] p-6 shadow-2xl md:p-9">
   <button ref={closeRef} type="button" aria-label={c.close} onClick={dismiss} className="absolute right-5 top-5 rounded-full border border-[var(--lx-line)] px-3 py-1.5 text-lg text-[var(--lx-muted)] hover:text-[var(--lx-ink)]">×</button>
   <p className="text-xs font-semibold tracking-[.18em] text-violet-600">{c.label}</p>
   <h2 id="lx-upgrade-title" className="mt-5 pr-7 font-display text-2xl font-bold leading-snug text-[var(--lx-ink)] md:text-3xl">{title}</h2>
   <p className="mt-5 text-sm leading-8 text-[var(--lx-muted)]" id="lx-upgrade-body">{body}</p>
   <div className="mt-7 flex flex-wrap gap-3">
    <Link href="/announcements" onClick={dismiss} className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700">{c.action}</Link>
    <button type="button" onClick={dismiss} className="rounded-xl border border-[var(--lx-line)] px-5 py-3 text-sm font-semibold text-[var(--lx-ink)]">{c.close}</button>
   </div>
  </section>
 </div>;
}
