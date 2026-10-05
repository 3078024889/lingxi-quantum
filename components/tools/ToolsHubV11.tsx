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

export default function ToolsHubV11(){
 const{lang,t}=useLingxiLang();
 const[q,setQ]=useState("");
 const[category,setCategory]=useState<ToolDisplayCategory>("all");
 useEffect(()=>{try{
  const params=new URLSearchParams(window.location.search);
  const fromUrl=(params.get("q")||"").trim(),fromGlobal=(sessionStorage.getItem("lx-global-search")||"").trim();
  const incoming=fromUrl||fromGlobal;if(incoming)setQ(incoming);if(fromGlobal)sessionStorage.removeItem("lx-global-search");
 }catch{}},[]);
 const tools=useMemo(()=>publicToolSurface(),[]);
 const list=useMemo<PublicToolSurfaceItem[]>(()=>searchToolItems(
  tools,q,category,(item:PublicToolSurfaceItem)=>item.category,
  (item:PublicToolSurfaceItem)=>[
   toolTitle(lang,item.slug,lang==="zh"?item.titleZh:item.titleEn),
   toolCardLine(lang,item.slug,item.kind,item.descZh,item.descEn),
   toolCategoryLabel(lang,item.category)
  ].filter(Boolean).join(" ")
 ),[tools,q,category,lang]);

 return <main className="lx11-page lx11-tools-page lx-tools-v124"><div className="lx11-wrap">
  <section className="lx11-tools-hero"><div><span>{toolHubCopy(lang,"kicker")}</span><h1>{toolHubCopy(lang,"title")}</h1><p>{toolHubCopy(lang,"subtitle")}</p></div></section>
  <section className="lx11-tool-searchbar lx-tools-v124-search">
   <div className="lx11-tool-searchbox"><span>⌕</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder={toolHubCopy(lang,"search")}/></div>
   <div className="lx-tools-v124-categories">{TOOL_DISPLAY_CATEGORIES.map(id=><button type="button" key={id} className={category===id?"is-active":""} onClick={()=>setCategory(id)} aria-pressed={category===id}>{toolCategoryLabel(lang,id)}</button>)}</div>
  </section>
  <RecentTools/>
  <section className="lx11-tool-group"><div className="lx11-tool-grid lx-tools-v124-grid">
   {list.map(item=>{
    const title=toolTitle(lang,item.slug,lang==="zh"?item.titleZh:item.titleEn);
    const summary=toolCardLine(lang,item.slug,item.kind,item.descZh,item.descEn);
    return <Link href={item.href} key={item.href} className="lx11-tool-card lx-tools-v124-card">
     <div className="lx11-tool-cover"><ToolGlyph kind={item.kind} slug={item.slug}/></div>
     <div className="lx11-tool-copy"><div className="lx11-tool-title-row"><h3>{title}</h3></div>
      {summary?<p className="lx-tools-v124-desc">{summary}</p>:null}
      <span className={`lx-tool-kind lx-tool-kind-${item.category}`}>{toolCategoryLabel(lang,item.category)}</span>
      <span className="lx-tool-card-arrow" aria-hidden="true">→</span>
     </div>
    </Link>
   })}
  </div></section>
  {!list.length&&<div className="lx11-tool-empty"><b>{t("noTool")}</b><p>{t("noToolLead")}</p></div>}
 </div></main>;
}
