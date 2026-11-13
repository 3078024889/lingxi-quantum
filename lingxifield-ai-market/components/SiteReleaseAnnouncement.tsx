"use client";

import {useEffect,useRef,useState} from "react";
import styles from "./SiteReleaseAnnouncement.module.css";

type Site="main"|"market";
type Announcement={enabled:boolean;version:string;site:Site};
const translations:Record<string,{eyebrow:string;title:string;market:string;main:string;action:string;later:string;close:string}>={
 zh:{eyebrow:"LINGXIFIELD · 升级公告",title:"双站焕新，全球 SIAI 排行榜已开放",market:"全球 SIAI 排行榜现已支持 .cn 与 .com 双域名访问。九语言查询、厂商资料与功能对比持续更新，已核实与研究中的信息分别标注。",main:"灵犀场网站迎来更新。全球 SIAI 排行榜双域名已开放，PDF、图片、视频与创作工具可从首页快速进入。",action:"查看全球 SIAI 排行榜",later:"我知道了",close:"关闭公告"},
 en:{eyebrow:"LINGXIFIELD · RELEASE",title:"Global SIAI rankings across two domains",market:"The Global SIAI rankings are available on .cn and .com, with nine-language discovery and clearly labeled reviewed versus research-only information.",main:"LINGXIFIELD has been updated. Browse the Global SIAI rankings on .cn or .com, or continue to the practical tools and creative workspace.",action:"Explore the rankings",later:"Got it",close:"Close announcement"},
 ja:{eyebrow:"LINGXIFIELD · お知らせ",title:"グローバル SIAI ランキングを公開",market:"グローバル SIAI ランキングは .cn と .com から利用できます。9言語に対応し、確認済み情報と調査中の情報を区別しています。",main:"LINGXIFIELD が更新されました。グローバル SIAI ランキングと実用ツールをお試しください。",action:"ランキングを見る",later:"確認しました",close:"閉じる"},
 ko:{eyebrow:"LINGXIFIELD · 업데이트",title:"글로벌 SIAI 순위 서비스 오픈",market:"글로벌 SIAI 순위는 .cn 및 .com에서 이용할 수 있습니다. 9개 언어를 지원하며 검증된 정보와 조사 중인 정보를 구분합니다.",main:"LINGXIFIELD 웹사이트가 업데이트되었습니다. 글로벌 SIAI 순위 및 도구를 살펴보세요.",action:"순위 보기",later:"확인",close:"닫기"},
 fr:{eyebrow:"LINGXIFIELD · Actualités",title:"Classement mondial SIAI en ligne",market:"Le classement mondial SIAI est accessible via .cn et .com en neuf langues. Les données vérifiées et les recherches en cours sont distinctes.",main:"LINGXIFIELD a été mis à jour. Découvrez le classement SIAI mondial et les outils pratiques.",action:"Voir le classement",later:"Compris",close:"Fermer"},
 de:{eyebrow:"LINGXIFIELD · Neuigkeiten",title:"Globales SIAI-Ranking gestartet",market:"Das globale SIAI-Ranking ist unter .cn und .com in neun Sprachen erreichbar. Bestätigte und noch geprüfte Angaben sind getrennt.",main:"LINGXIFIELD wurde aktualisiert. Entdecken Sie globale SIAI-Rankings und praktische Werkzeuge.",action:"Ranking ansehen",later:"Verstanden",close:"Schließen"},
 es:{eyebrow:"LINGXIFIELD · Novedades",title:"Clasificación mundial SIAI disponible",market:"La clasificación mundial SIAI está disponible en .cn y .com, en nueve idiomas, distinguiendo los datos verificados de los que están en revisión.",main:"LINGXIFIELD se ha actualizado. Explora la clasificación mundial SIAI y las herramientas prácticas.",action:"Ver clasificación",later:"Entendido",close:"Cerrar"},
 pt:{eyebrow:"LINGXIFIELD · Novidades",title:"Ranking global SIAI disponível",market:"O ranking global SIAI está disponível em .cn e .com, em nove idiomas, com distinção entre dados verificados e em análise.",main:"O LINGXIFIELD foi atualizado. Explore o ranking global SIAI e as ferramentas práticas.",action:"Ver ranking",later:"Entendi",close:"Fechar"},
 ar:{eyebrow:"LINGXIFIELD · تحديث",title:"إطلاق التصنيف العالمي لـ SIAI",market:"أصبح التصنيف العالمي لـ SIAI متاحًا على نطاقي .cn و .com بتسع لغات، مع تمييز المعلومات المؤكدة عن قيد المراجعة.",main:"تم تحديث LINGXIFIELD. استكشف التصنيف العالمي لـ SIAI والأدوات العملية.",action:"عرض التصنيف",later:"فهمت",close:"إغلاق"},
};

export default function SiteReleaseAnnouncement({site}:{site:Site}){
 const[version,setVersion]=useState("");
 const[show,setShow]=useState(false);
 const[lang,setLang]=useState("zh");
 const closeRef=useRef<HTMLButtonElement>(null);
 useEffect(()=>{
  // Do not interrupt account verification, payment, or embedded mini-programs.
  if(site==="main"&&(/^\/account(?:\/|$)/.test(location.pathname)||/^\/checkout(?:\/|$)/.test(location.pathname)))return;
  if(new URLSearchParams(location.search).get("mini")==="1")return;
  const locale=new URLSearchParams(location.search).get("lang")||
   location.pathname.split("/").find(v=>Object.prototype.hasOwnProperty.call(translations,v))||"zh";
  setLang(locale in translations?locale:"zh");
  const controller=new AbortController();
  fetch("/api/site-release-announcement",{signal:controller.signal,cache:"no-store",credentials:"same-origin"})
   .then(async r=>r.ok?await r.json() as Announcement:null)
   .then(x=>{
     if(!x||x.enabled!==true||x.site!==site||!/^[a-z0-9-]{5,80}$/i.test(x.version))return;
     const key="lx-release-notice:"+site+":"+x.version;
     try{if(window.localStorage.getItem(key)==="dismissed")return;}catch{}
     setVersion(x.version);
     setShow(true);
   }).catch(()=>{});
  return()=>controller.abort();
 },[site]);
 useEffect(()=>{
  if(!show)return;
  const prev=document.activeElement instanceof HTMLElement?document.activeElement:null;
  closeRef.current?.focus();
  const keyHandler=(ev:KeyboardEvent)=>{
    if(ev.key==="Escape"){ev.preventDefault();dismiss();}
    if(ev.key==="Tab"){
      const dialog=document.querySelector('[data-lx-release-dialog="true"]');
      if(!dialog)return;
      const focusable=Array.from(dialog.querySelectorAll<HTMLElement>("button, a[href]"));
      if(focusable.length===0)return;
      const first=focusable[0],last=focusable[focusable.length-1];
      if(ev.shiftKey&&document.activeElement===first){ev.preventDefault();last.focus();}
      else if(!ev.shiftKey&&document.activeElement===last){ev.preventDefault();first.focus();}
    }
  };
  window.addEventListener("keydown",keyHandler);
  return()=>{window.removeEventListener("keydown",keyHandler);prev?.focus();};
 },[show,version,site]);
 function dismiss(){
  try{localStorage.setItem("lx-release-notice:"+site+":"+version,"dismissed");}catch{}
  setShow(false);
 }
 if(!show)return null;
 const copy=translations[lang]||translations.zh;
 const ranking=site==="market"?"/zh/ai":"/siai";
 return <div className={styles.shade} data-lx-release-dialog="true">
  <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="lx-release-title"
   aria-describedby="lx-release-description" dir={lang==="ar"?"rtl":"ltr"}>
   <button ref={closeRef} type="button" aria-label={copy.close} className={styles.close} onClick={dismiss}>×</button>
   <span className={styles.eyebrow}>{copy.eyebrow}</span>
   <div className={styles.orb} aria-hidden="true">✦</div>
   <h2 id="lx-release-title" className={styles.title}>{copy.title}</h2>
   <p id="lx-release-description" className={styles.description}>{copy[site]}</p>
   <div className={styles.domainRow}><span>globalsiai.cn</span><span>globalsiai.com</span></div>
   <div className={styles.actions}>
    <a className={styles.primary} href={ranking} onClick={dismiss}>{copy.action}</a>
    <button type="button" className={styles.secondary} onClick={dismiss}>{copy.later}</button>
   </div>
   <small className={styles.credit}>Celestial 小仙女 · LINGXIFIELD</small>
  </div>
 </div>;
}
