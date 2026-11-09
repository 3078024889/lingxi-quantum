"use client";
import Link from "next/link";
import {useEffect,useMemo,useState}from"react";
import ToolGlyph from "./ToolGlyph";
import {publicToolSurface,type PublicToolSurfaceItem}from"@/lib/tools/public-surface";
import {useLingxiLang}from"@/lib/lingxi-i18n";
import {toolTitle}from"@/lib/tools/card-i18n";
import {toolCategoryLabel,toolHubCopy,toolCardLine}from"@/lib/tools/hub-copy-v1470";
import {TOOL_DISPLAY_CATEGORIES,type ToolDisplayCategory}from"@/lib/tools/display-taxonomy";
import {searchToolItems}from"@/lib/tools/search-intents-v44r2.mjs";
import RecentTools from"@/components/tools/RecentTools";
import {isAnonymousLocalTool,localFreeCopy} from '@/lib/tools/local-free-tools';

export default function ToolsHubV11(){
 const{lang,t}=useLingxiLang();
 const[q,setQ]=useState("");
 const[category,setCategory]=useState<ToolDisplayCategory>("all");
 const[freeOnly,setFreeOnly]=useState(false);const access=localFreeCopy(lang);
 useEffect(()=>{try{
  const params=new URLSearchParams(window.location.search);
  setFreeOnly(params.get('access')==='local');
  const fromUrl=(params.get("q")||"").trim(),fromGlobal=(sessionStorage.getItem("lx-global-search")||"").trim();
  const incoming=fromUrl||fromGlobal;if(incoming)setQ(incoming);if(fromGlobal)sessionStorage.removeItem("lx-global-search");
 }catch{}},[]);
 const tools=useMemo(()=>publicToolSurface(),[]);
 const list=useMemo<PublicToolSurfaceItem[]>(()=>searchToolItems(
  freeOnly?tools.filter(isAnonymousLocalTool):tools,q,category,(item:PublicToolSurfaceItem)=>item.category,
  (item:PublicToolSurfaceItem)=>[
   toolTitle(lang,item.slug,lang==="zh"?item.titleZh:item.titleEn),
   toolCardLine(lang,item.slug,item.kind,item.descZh,item.descEn),
   toolCategoryLabel(lang,item.category)
  ].filter(Boolean).join(" ")
 ),[tools,q,category,lang,freeOnly]);


 return <main className="lx11-page lx11-tools-page lx-tools-v124 lx-tools-compact lx26-tools-page"><div className="lx11-wrap">
  <section className="lx11-tools-hero lx26-tools-stage">
   <div className="lx26-tools-command">
    <span className="lx26-overline">{toolHubCopy(lang,"kicker")}</span>
    <div className="lx26-tools-heading"><h1>{toolHubCopy(lang,"title")}</h1><p>{toolHubCopy(lang,"subtitle")}</p></div>
    <div className="lx11-tool-searchbox lx26-tools-search"><span aria-hidden="true">⌕</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder={toolHubCopy(lang,"search")} aria-label={toolHubCopy(lang,"search")}/><kbd>⌘ K</kbd></div>
    <div className="lx-tools-v124-categories lx26-tools-categories">{TOOL_DISPLAY_CATEGORIES.map(id=><button type="button" key={id} className={category===id?"is-active":""} onClick={()=>setCategory(id)} aria-pressed={category===id}>{toolCategoryLabel(lang,id)}</button>)}</div>
    <div className="lx26-tools-filters">
     <div className="lx-tools-v124-categories" role="group" aria-label={access[3]}>{[false,true].map(value=><button type="button" key={String(value)} className={freeOnly===value?'is-active':''} aria-pressed={freeOnly===value} onClick={()=>setFreeOnly(value)}>{access[value?1:0]}</button>)}</div>
     <Link href="/partners" className="lx26-tools-partner-link">{({zh:"免费嵌入网站",en:"Embed on your site",ja:"サイトに埋め込む",ko:"사이트에 삽입",fr:"Intégrer au site",de:"Auf Website einbetten",es:"Integrar en web",pt:"Incorporar no site",ar:"تضمين في موقعك"} as Record<typeof lang,string>)[lang]}</Link>
    </div>
   </div>
   <aside className="lx26-tools-aside" aria-label="Recent tools and plans">
    <RecentTools/>
    <Link href="/tools/pass" className="lx26-tools-pass-link">
     <span className="lx26-pass-glyph" aria-hidden="true">◇</span>
     <span><strong>{({zh:"全场 100+ 实用工具包",en:"100+ Tools Pass",ja:"100以上のツールパス",ko:"100+ 도구 이용권",fr:"Pass 100+ outils",de:"100+ Werkzeuge Pass",es:"Pase de 100+ herramientas",pt:"Passe de 100+ ferramentas",ar:"باقة أكثر من 100 أداة"} as Record<typeof lang,string>)[lang]}</strong><small>{({zh:"所有工具，一次畅用",en:"One pass for all tools",ja:"全ツールが対象",ko:"모든 도구 이용 가능",fr:"Tous les outils inclus",de:"Alle Werkzeuge",es:"Todas las herramientas",pt:"Todas as ferramentas",ar:"جميع الأدوات"} as Record<typeof lang,string>)[lang]}</small></span>
     <span className="lx26-tools-pass-arrow" aria-hidden="true">›</span>
    </Link>
   </aside>
  </section>
  <section className="lx11-tool-group"><div className="lx11-tool-grid lx-tools-v124-grid">
   {list.map(item=>{
    const title=toolTitle(lang,item.slug,lang==="zh"?item.titleZh:item.titleEn);
    const summary=toolCardLine(lang,item.slug,item.kind,item.descZh,item.descEn);
    return <Link href={item.href} key={item.href} className="lx11-tool-card lx-tools-v124-card" data-tool-slug={item.slug}>
     <div className="lx11-tool-cover"><ToolGlyph kind={item.kind} slug={item.slug}/></div>
     <div className="lx11-tool-copy"><div className="lx11-tool-title-row"><h3>{title}</h3></div>
      {summary?<p className="lx-tools-v124-desc">{summary}</p>:null}
      <div className="lx-tools-compact-badges">
       <span className={`lx-tool-kind lx-tool-kind-${item.category}`}>{toolCategoryLabel(lang,item.category)}</span>
       {isAnonymousLocalTool(item)&&<span className="lx-tool-kind">{access[2]}</span>}
      </div>
      <span className="lx-tool-card-arrow" aria-hidden="true">→</span>
     </div>
    </Link>
   })}
  </div></section>
  {!list.length&&<div className="lx11-tool-empty"><b>{t("noTool")}</b><p>{t("noToolLead")}</p></div>}
 </div></main>;
}
