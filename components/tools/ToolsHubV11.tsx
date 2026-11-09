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

 return <main className="lx11-page lx11-tools-page lx-tools-v124 lx-tools-compact lx-cel-tools-page"><div className="lx11-wrap">
  <section className="lx11-tools-hero lx-cel-tools-hero">
   <div className="lx-cel-tools-intro">
    <span className="lx-cel-tools-eyebrow">{toolHubCopy(lang,"kicker")}</span>
    <h1>{toolHubCopy(lang,"title")}</h1>
    <p>{toolHubCopy(lang,"subtitle")}</p>
    <div className="lx-cel-tools-main-search"><span aria-hidden="true">⌕</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder={toolHubCopy(lang,"search")} aria-label={toolHubCopy(lang,"search")}/><kbd>⌘ K</kbd></div>
   </div>
   <aside className="lx-cel-tools-side"><RecentTools/>
   <div className="lx-cel-tools-starters"><h2>{lang==="zh"?"快速开始":"Quick access"}</h2><div>{tools.slice(0,2).map(item=><Link key={item.href} href={item.href}><ToolGlyph kind={item.kind} slug={item.slug}/><span>{toolTitle(lang,item.slug,lang==="zh"?item.titleZh:item.titleEn)}</span><b aria-hidden="true">→</b></Link>)}</div></div>
   <Link href="/tools/pass" className="lx-cel-tools-pass-link"><span className="lx-cel-tools-pass-icon">◈</span><span><b>{lang==="zh"?"全场 100+ 实用工具包":"100+ Tools Pass"}</b><small>{lang==="zh"?"一个通用包，覆盖现有及新增工具":"Current and future practical tools"}</small></span><span aria-hidden="true">→</span></Link></aside>
  </section>
  <section className="lx11-tool-searchbar lx-tools-v124-search">
   <div className="lx-tools-v124-categories">{TOOL_DISPLAY_CATEGORIES.map(id=><button type="button" key={id} className={category===id?"is-active":""} onClick={()=>setCategory(id)} aria-pressed={category===id}>{toolCategoryLabel(lang,id)}</button>)}</div>
   <div className="lx-tools-v124-categories" role="group" aria-label={access[3]}>{[false,true].map(value=><button type="button" key={String(value)} className={freeOnly===value?'is-active':''} aria-pressed={freeOnly===value} onClick={()=>setFreeOnly(value)}>{access[value?1:0]}</button>)}</div>
  </section>
  <p style={{margin:"8px 0 8px",fontSize:15,textAlign:"right"}}><Link href="/tools/pass" style={{color:"#1658a9",fontWeight:700,textDecoration:"underline",textUnderlineOffset:3}}>{({
   zh:"全场100+实用工具包 · 7天 / 月 / 季 / 年",en:"All-tools pass · 7 days / month / quarter / year",
   ja:"全ツール共通パス · 7日 / 月 / 四半期 / 年",ko:"모든 도구 이용권 · 7일 / 월 / 분기 / 년",
   fr:"Pass tous outils · 7 jours / mois / trimestre / an",de:"Alle Werkzeuge · 7 Tage / Monat / Quartal / Jahr",
   es:"Pase de herramientas · 7 días / mes / trimestre / año",pt:"Passe ferramentas · 7 dias / mês / trimestre / ano",
   ar:"باقة الأدوات · 7 أيام / شهر / ربع سنة / سنة"
  } as Record<typeof lang,string>)[lang]}</Link></p>
  <p style={{margin:"8px 0 18px",fontSize:15,textAlign:"right"}}><Link href="/partners" style={{color:"#245bd5",fontWeight:700,textDecoration:"underline",textUnderlineOffset:3}}>{({
   zh:"免费将灵犀场工具嵌入你的网站",en:"Add free LINGXIFIELD tools to your website",
   ja:"LINGXIFIELDツールをサイトに無料で埋め込む",ko:"LINGXIFIELD 도구를 사이트에 무료로 추가",
   fr:"Intégrer gratuitement nos outils sur votre site",de:"Unsere Tools kostenlos einbinden",
   es:"Integra nuestras herramientas gratis en tu web",pt:"Incorpore nossas ferramentas grátis",
   ar:"أضف أدوات LINGXIFIELD إلى موقعك مجاناً"
  } as Record<typeof lang,string>)[lang]}</Link></p>
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
