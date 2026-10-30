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
import LxText from "@/components/LxText";
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

 return <main className="lx11-page lx11-tools-page lx-tools-v124"><div className="lx11-wrap">
  <section className="lx11-tools-hero"><div><span>{toolHubCopy(lang,"kicker")}</span><h1>{toolHubCopy(lang,"title")}</h1><p>{toolHubCopy(lang,"subtitle")}</p></div></section>
  <div style={{display:"flex",flexWrap:"wrap",gap:10,alignItems:"center",margin:"8px 0 18px"}}>
    <Link href="/ai-market" className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
      <LxText zh="全球 AI / SI 工具行情与排名 →" en="Global AI / SI market rankings →" ja="世界の AI / SI ツールランキング →" ko="글로벌 AI / SI 도구 순위 →" fr="Classement mondial des outils IA / SI →" de="Globale KI / SI Tool-Rankings →" es="Ranking global de herramientas IA / SI →" pt="Ranking mundial de ferramentas IA / SI →" ar="ترتيب أدوات AI / SI العالمية ←"/>
    </Link>
    <span style={{fontSize:12,color:"#64748b"}}><LxText zh="已有工具继续在这里使用；行情页用于比较全球 AI 产品。" en="Keep using existing tools here; compare external AI products in the market." ja="既存ツールはここで利用し、AI 製品は市場で比較できます。" ko="기존 도구는 여기서, 외부 AI 제품 비교는 마켓에서 이용하세요." fr="Utilisez vos outils ici, comparez les produits IA dans le marché." de="Tools hier nutzen und KI-Produkte im Markt vergleichen." es="Usa tus herramientas aquí y compara productos IA en el mercado." pt="Use suas ferramentas aqui e compare produtos IA no mercado." ar="استخدم أدواتك هنا وقارن منتجات AI في السوق."/></span>
  </div>
  <section className="lx11-tool-searchbar lx-tools-v124-search">
   <div className="lx11-tool-searchbox"><span>⌕</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder={toolHubCopy(lang,"search")}/></div>
   <div className="lx-tools-v124-categories">{TOOL_DISPLAY_CATEGORIES.map(id=><button type="button" key={id} className={category===id?"is-active":""} onClick={()=>setCategory(id)} aria-pressed={category===id}>{toolCategoryLabel(lang,id)}</button>)}</div>
   <div className="lx-tools-v124-categories" role="group" aria-label={access[3]}>{[false,true].map(value=><button type="button" key={String(value)} className={freeOnly===value?'is-active':''} aria-pressed={freeOnly===value} onClick={()=>setFreeOnly(value)}>{access[value?1:0]}</button>)}</div>
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
      {isAnonymousLocalTool(item)&&<span className="lx-tool-kind">{access[2]}</span>}
      <span className="lx-tool-card-arrow" aria-hidden="true">→</span>
     </div>
    </Link>
   })}
  </div></section>
  {!list.length&&<div className="lx11-tool-empty"><b>{t("noTool")}</b><p>{t("noToolLead")}</p></div>}
 </div></main>;
}
