"use client";

import {Fragment,useMemo,useState} from "react";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import {localizedCategory} from "../lingxifield-ai-market/lib/market-home-i18n";
import {localizedProductSummary} from "../lingxifield-ai-market/lib/market-product-locale";
import {localizedCatalogFact} from "../lingxifield-ai-market/lib/market-fact-locale";
import {globalRegionSummary} from "../lingxifield-ai-market/lib/region-presentation";
import {commercialEvidence} from "../lingxifield-ai-market/lib/market-commercial-evidence";
import {localizedPaymentName} from "../lingxifield-ai-market/lib/market-localized-payment";
import {SIAI_FACET_WORDS} from "../lib/siai-home-facet-labels";
import {filterMarketRows,toggleMarketComparison,MAX_COMPARISONS,TASK_FACETS,PAYMENT_FACETS,EVIDENCE_FACETS,SORT_OPTIONS,
 type TaskFacet,type PaymentFacet,type EvidenceFacet,type MarketOrder} from "../lib/siai-home-facets";

export type SiaiHomeRow={
 id:string;name:string;company:string;legal:string|null;legalScope:"service_operator"|"group_parent"|null;
 kind:"company"|"open_source_project"|"software_library";listing:"listed_parent"|"unconfirmed"|"not_applicable";
 ipoFiling:boolean;year:string|null;companySource:string|null;legalSource:string|null;listingSource:string|null;yearSource:string|null;
 category:string;about:string;strength:string;features:string[];searchTerms:string[];free:string;freeSource:string|null;
 price:string;priceSource:string|null;region:string;regionSource:string|null;payment:string;paymentSource:string|null;
 models:string;modelsSource:string|null;commercial:string;commercialSource:string|null;website:string;checkedAt:string|null;
};

const labels:Record<LingxiLang,{title:string,subtitle:string,search:string,all:string,tool:string,company:string,legal:string,parent:string,listed:string,founded:string,
 strength:string,free:string,price:string,region:string,payment:string,models:string,license:string,action:string,official:string,details:string,close:string,
 noResults:string,notConfirmed:string,listedParent:string,ipoFiled:string,na:string,project:string,source:string,sourceHeading:string,oldHome:string}>={
 zh:{title:"全球 SIAI 排行榜",subtitle:"一眼看懂全球 AI 工具与厂商：能做什么、免费额度、实际价格、地区、付款及商用授权。",search:"搜索 AI 工具、公司、功能或问题",all:"全部平台",tool:"AI 工具 / 厂商",company:"公司名称",legal:"法人主体",parent:"集团法人主体",listed:"是否上市",founded:"成立时间",strength:"擅长做什么",free:"免费额度",price:"真实价格",region:"地区可用",payment:"付款方式",models:"代表模型",license:"商用授权",action:"操作",official:"访问官网",details:"详情",close:"收起",noResults:"没有找到匹配的工具，换一个关键词试试。",notConfirmed:"未确认上市",listedParent:"所属集团已上市",ipoFiled:"已申请上市，尚未挂牌",na:"不适用",project:"维护方",source:"官方资料",sourceHeading:"官方依据",oldHome:"工具首页"},
 en:{title:"Global SIAI Rankings",subtitle:"Compare AI tools and publishers: capabilities, free plans, pricing, regions, payments and licensing.",search:"Search AI tools, publishers and tasks",all:"All platforms",tool:"Tool / Publisher",company:"Company",legal:"Legal entity",parent:"Parent entity",listed:"Listing",founded:"Founded",strength:"Best for",free:"Free usage",price:"Price",region:"Regions",payment:"Payment",models:"Models",license:"Commercial use",action:"Actions",official:"Official site",details:"Details",close:"Close",noResults:"No matching tools.",notConfirmed:"Not confirmed listed",listedParent:"Listed parent",ipoFiled:"IPO filed; not listed",na:"N/A",project:"Maintainer",source:"Official source",sourceHeading:"Official references",oldHome:"Tools home"},
 ja:{title:"世界の SIAI ランキング",subtitle:"AIツールの機能、無料枠、料金、地域、支払い、商用条件を比較。",search:"AIツール・会社・用途を検索",all:"すべて",tool:"ツール / 提供元",company:"会社名",legal:"法人名",parent:"親会社法人",listed:"上場状況",founded:"設立",strength:"得意分野",free:"無料枠",price:"料金",region:"地域",payment:"支払",models:"モデル",license:"商用",action:"操作",official:"公式サイト",details:"詳細",close:"閉じる",noResults:"該当するツールがありません。",notConfirmed:"未確認",listedParent:"上場親会社",ipoFiled:"IPO申請中",na:"対象外",project:"管理者",source:"公式資料",sourceHeading:"公式情報",oldHome:"ツールのホーム"},
 ko:{title:"글로벌 SIAI 순위",subtitle:"AI 도구의 기능, 무료 사용, 가격, 지역, 결제 및 상업 라이선스를 비교합니다.",search:"AI 도구·회사 검색",all:"전체",tool:"도구 / 회사",company:"회사명",legal:"법인",parent:"모기업",listed:"상장",founded:"설립",strength:"주요 기능",free:"무료",price:"가격",region:"지역",payment:"결제",models:"모델",license:"상업적 이용",action:"작업",official:"공식 사이트",details:"상세",close:"닫기",noResults:"검색 결과가 없습니다.",notConfirmed:"미확인",listedParent:"상장 그룹",ipoFiled:"IPO 신청 중",na:"해당 없음",project:"관리 주체",source:"공식 자료",sourceHeading:"공식 출처",oldHome:"도구 홈"},
 fr:{title:"Classement mondial SIAI",subtitle:"Comparez les outils IA, les offres gratuites, les tarifs, les régions et les licences.",search:"Rechercher un outil ou une entreprise",all:"Tous",tool:"Outil / Éditeur",company:"Entreprise",legal:"Entité juridique",parent:"Société mère",listed:"Cotation",founded:"Fondation",strength:"Atouts",free:"Gratuit",price:"Prix",region:"Régions",payment:"Paiement",models:"Modèles",license:"Commercial",action:"Actions",official:"Site officiel",details:"Détails",close:"Fermer",noResults:"Aucun résultat.",notConfirmed:"Non confirmé",listedParent:"Groupe coté",ipoFiled:"IPO déposée",na:"Sans objet",project:"Responsable",source:"Source officielle",sourceHeading:"Sources",oldHome:"Accueil outils"},
 de:{title:"Globales SIAI-Ranking",subtitle:"KI-Tools, kostenlose Nutzung, Preise, Regionen, Zahlungen und Lizenzen vergleichen.",search:"KI-Tool oder Anbieter suchen",all:"Alle",tool:"Tool / Anbieter",company:"Unternehmen",legal:"Rechtsträger",parent:"Muttergesellschaft",listed:"Börse",founded:"Gründung",strength:"Stärken",free:"Kostenlos",price:"Preis",region:"Regionen",payment:"Zahlung",models:"Modelle",license:"Gewerblich",action:"Aktion",official:"Offizielle Seite",details:"Details",close:"Schließen",noResults:"Keine Ergebnisse.",notConfirmed:"Nicht bestätigt",listedParent:"Börsennotierte Mutter",ipoFiled:"IPO beantragt",na:"Nicht zutreffend",project:"Betreiber",source:"Offizielle Quelle",sourceHeading:"Quellen",oldHome:"Werkzeuge"},
 es:{title:"Ranking mundial SIAI",subtitle:"Compare herramientas de IA, precios, planes gratis, países y licencias.",search:"Buscar herramientas y empresas",all:"Todas",tool:"Herramienta / Empresa",company:"Empresa",legal:"Entidad jurídica",parent:"Empresa matriz",listed:"Cotización",founded:"Fundación",strength:"Ventajas",free:"Gratis",price:"Precio",region:"Regiones",payment:"Pago",models:"Modelos",license:"Comercial",action:"Acciones",official:"Sitio oficial",details:"Detalles",close:"Cerrar",noResults:"Sin resultados.",notConfirmed:"Sin confirmar",listedParent:"Matriz cotizada",ipoFiled:"IPO presentada",na:"No aplica",project:"Responsable",source:"Fuente oficial",sourceHeading:"Fuentes",oldHome:"Inicio herramientas"},
 pt:{title:"Ranking global SIAI",subtitle:"Compare ferramentas de IA, preços, cotas gratuitas, países e licenças.",search:"Pesquisar ferramentas e empresas",all:"Todos",tool:"Ferramenta / Empresa",company:"Empresa",legal:"Entidade legal",parent:"Empresa controladora",listed:"Listagem",founded:"Fundação",strength:"Vantagens",free:"Grátis",price:"Preço",region:"Regiões",payment:"Pagamento",models:"Modelos",license:"Comercial",action:"Ações",official:"Site oficial",details:"Detalhes",close:"Fechar",noResults:"Sem resultados.",notConfirmed:"Não confirmado",listedParent:"Controladora listada",ipoFiled:"IPO solicitada",na:"Não se aplica",project:"Responsável",source:"Fonte oficial",sourceHeading:"Fontes",oldHome:"Início ferramentas"},
 ar:{title:"ترتيب SIAI العالمي",subtitle:"قارن أدوات الذكاء الاصطناعي والميزات المجانية والأسعار والمناطق والتراخيص.",search:"ابحث عن أدوات وشركات الذكاء الاصطناعي",all:"جميع المنصات",tool:"الأداة / الشركة",company:"الشركة",legal:"الكيان القانوني",parent:"الشركة الأم",listed:"الإدراج",founded:"التأسيس",strength:"المزايا",free:"المجاني",price:"السعر",region:"المناطق",payment:"الدفع",models:"النماذج",license:"الاستخدام التجاري",action:"إجراءات",official:"الموقع الرسمي",details:"التفاصيل",close:"إغلاق",noResults:"لا نتائج.",notConfirmed:"غير مؤكد",listedParent:"الشركة الأم مدرجة",ipoFiled:"طلب إدراج مقدم",na:"غير منطبق",project:"الجهة المطورة",source:"مصدر رسمي",sourceHeading:"المصادر",oldHome:"الرئيسية للأدوات"}
};

const REVIEWED_COPY:Record<LingxiLang,string>={zh:"官方资料复核",en:"Source checked",ja:"公式情報の確認日",ko:"공식 출처 확인일",fr:"Vérification de la source",de:"Quellen geprüft",es:"Fuente revisada",pt:"Fonte verificada",ar:"تاريخ فحص المصدر"};
function short(s:string,max=150){return s.length>max?s.slice(0,max-1).trimEnd()+"…":s;}
function Source({href,label}:{href:string|null;label:string}){return href&&/^https:\/\//.test(href)?<a href={href} target="_blank" rel="nofollow noopener noreferrer" className="siai-source">{label} ↗</a>:null;}

export default function SiaiRankingHome({rows}:{rows:SiaiHomeRow[]}){
 const {lang}=useLingxiLang(),t=labels[lang],ui=SIAI_FACET_WORDS[lang];
 const [query,setQuery]=useState(""),[category,setCategory]=useState("*"),[expanded,setExpanded]=useState<string|null>(null);
 const [task,setTask]=useState<TaskFacet>("all"),[payment,setPayment]=useState<PaymentFacet>("any");
 const [evidence,setEvidence]=useState<EvidenceFacet>("all"),[sort,setSort]=useState<MarketOrder>("catalog");
 const [compareIds,setCompareIds]=useState<string[]>([]),[comparisonOpen,setComparisonOpen]=useState(false);
 const categories=useMemo(()=>[...new Set(rows.map(r=>r.category))], [rows]);
 const localizedRows=useMemo(()=>rows.map(p=>({...p,localizedSummary:localizedProductSummary(p.id,lang)||"",
  localizedCategory:localizedCategory(lang,p.category)})),[rows,lang]);
 const shown=useMemo(()=>filterMarketRows(localizedRows,{query,category,task,payment,evidence,sort},lang),
  [localizedRows,query,category,task,payment,evidence,sort,lang]);
 const compared=rows.filter(p=>compareIds.includes(p.id));
 const toggleCompare=(id:string)=>setCompareIds(current=>toggleMarketComparison(current,id,rows.map(p=>p.id)));
 const displayFact=(p:SiaiHomeRow,scope:"price"|"free"|"models")=>localizedCatalogFact(p.id,lang,scope,p[scope]);
 const displayStrength=(p:SiaiHomeRow)=>localizedProductSummary(p.id,lang)||p.strength||p.about;
 const displayRegion=(p:SiaiHomeRow)=>lang==='zh'?p.region:globalRegionSummary(p.id,lang);
 const displayCommercial=(p:SiaiHomeRow)=>lang==='zh'?p.commercial:commercialEvidence(p.id,lang)?.condition||p.commercial;
 const displayPayment=(p:SiaiHomeRow)=>lang==='zh'?p.payment:p.payment.split(' · ').map(s=>localizedPaymentName(s,lang)).join(' · ');
 const displayAbout=(p:SiaiHomeRow)=>lang==='zh'?p.about:localizedProductSummary(p.id,lang)||p.name;
 const detailPanel=(p:SiaiHomeRow)=><section id={"siai-detail-"+p.id} className="siai-home-detail" aria-live="polite"><div><h2>{p.name}</h2><button type="button" onClick={()=>setExpanded(null)} aria-label={t.close}>×</button></div>
    <p>{displayAbout(p)}</p>{p.checkedAt&&<p className="siai-checked-date">{REVIEWED_COPY[lang]}: <time dateTime={p.checkedAt}>{p.checkedAt}</time></p>}{lang==="zh"&&<p>{p.features.join(" · ")}</p>}
    <dl><div><dt>{t.free}</dt><dd>{displayFact(p,"free")}</dd></div><div><dt>{t.price}</dt><dd>{displayFact(p,"price")}</dd></div><div><dt>{t.region}</dt><dd>{displayRegion(p)}</dd></div><div><dt>{t.payment}</dt><dd>{displayPayment(p)}</dd></div><div><dt>{t.models}</dt><dd>{displayFact(p,"models")}</dd></div><div><dt>{t.license}</dt><dd>{displayCommercial(p)}</dd></div></dl>
    <h3>{t.sourceHeading}</h3><div className="siai-home-sources">{[[p.companySource,t.company],[p.legalSource,t.legal],[p.listingSource,t.listed],[p.yearSource,t.founded],[p.freeSource,t.free],[p.priceSource,t.price],[p.regionSource,t.region],[p.paymentSource,t.payment],[p.modelsSource,t.models],[p.commercialSource,t.license]].filter((x):x is [string,string]=>typeof x[0]==="string"&&/^https:\/\//.test(x[0])).map(([href,label])=><a key={label+href} href={href} target="_blank" rel="noopener noreferrer">{label} ↗</a>)}</div>
    <a className="siai-detail-primary-link" href={"/siai/"+lang+"/"+encodeURIComponent(p.id)}>{ui.fullDetails} ↗</a>
   </section>;
 return <main className="siai-home" lang={lang==="zh"?"zh-CN":lang} dir={lang==="ar"?"rtl":"ltr"} id="siai-market">
  <header className="siai-home-head"><p className="siai-kicker">LINGXIFIELD · GLOBAL SI AI</p><h1>{t.title}</h1><p>{t.subtitle}</p></header>
  <div className="siai-home-controls">
   <label className="siai-home-search"><span aria-hidden="true">⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.search} aria-label={t.search}/></label>
   <span className="siai-home-count">{shown.length} / {rows.length}</span>
  </div>
  <div className="siai-home-four-filters">
   <nav className="siai-filter-line" aria-label={ui.category}><strong>{ui.category}</strong><div className="siai-filter-options">
    <button type="button" aria-pressed={category==="*"} className={category==="*"?"selected":""} onClick={()=>setCategory("*")}>{t.all}</button>
    {categories.map(c=><button key={c} type="button" aria-pressed={category===c} className={category===c?"selected":""} onClick={()=>setCategory(c)}>{localizedCategory(lang,c)}</button>)}
   </div></nav>
   <nav className="siai-filter-line" aria-label={ui.task}><strong>{ui.task}</strong><div className="siai-filter-options">
    {TASK_FACETS.map(v=><button key={v} type="button" aria-pressed={task===v} className={task===v?"selected":""} onClick={()=>setTask(v)}>{ui.taskLabels[v]}</button>)}
   </div></nav>
   <nav className="siai-filter-line" aria-label={ui.payment}><strong>{ui.payment}</strong><div className="siai-filter-options">
    {PAYMENT_FACETS.map(v=><button key={v} type="button" aria-pressed={payment===v} className={payment===v?"selected":""} onClick={()=>setPayment(v)}>{ui.paymentLabels[v]}</button>)}
   </div></nav>
   <nav className="siai-filter-line" aria-label={ui.evidence}><strong>{ui.evidence}</strong><div className="siai-filter-options">
    {EVIDENCE_FACETS.map(v=><button key={v} type="button" aria-pressed={evidence===v} className={evidence===v?"selected":""} onClick={()=>setEvidence(v)}>{ui.evidenceLabels[v]}</button>)}
    <label className="siai-sort-label">{ui.sort}
     <select aria-label={ui.sort} value={sort} onChange={e=>setSort(e.target.value as MarketOrder)}>{SORT_OPTIONS.map(v=><option value={v} key={v}>{ui.sortLabels[v]}</option>)}</select>
    </label>
   </div></nav>
  </div>
  {compareIds.length>0&&<aside className="siai-compare-toolbar" aria-label={ui.selected}>
   <strong>{ui.selected} ({compareIds.length}/{MAX_COMPARISONS})</strong>
   <div>{compared.map(p=><button key={p.id} type="button" onClick={()=>toggleCompare(p.id)} aria-label={ui.remove+" "+p.name}>{p.name} ×</button>)}</div>
   <button type="button" disabled={compareIds.length<2} onClick={()=>setComparisonOpen(v=>!v)}>
    {comparisonOpen?ui.closeCompare:ui.compareNow}</button>
   <button type="button" onClick={()=>{setCompareIds([]);setComparisonOpen(false);}}>{ui.clear}</button>
   {compareIds.length<2&&<small>{ui.compareHint}</small>}
  </aside>}
  {comparisonOpen&&compared.length>=2&&<section className="siai-compare-section" id="siai-comparison" aria-label={ui.comparison}>
   <h2>{ui.comparison}</h2>
   <div className="siai-compare-scroller"><table><thead><tr><th scope="col">{ui.evidence}</th>
    {compared.map(p=><th scope="col" key={p.id}>{p.name}<a href={p.website} target="_blank" rel="noopener noreferrer">{t.official} ↗</a></th>)}
   </tr></thead><tbody>
    {([
     [t.strength,(p:SiaiHomeRow)=>displayStrength(p),(_p:SiaiHomeRow)=>null],
     [t.free,(p:SiaiHomeRow)=>displayFact(p,"free"),(p:SiaiHomeRow)=>p.freeSource],
     [t.price,(p:SiaiHomeRow)=>displayFact(p,"price"),(p:SiaiHomeRow)=>p.priceSource],
     [t.region,(p:SiaiHomeRow)=>displayRegion(p),(p:SiaiHomeRow)=>p.regionSource],
     [t.payment,(p:SiaiHomeRow)=>displayPayment(p),(p:SiaiHomeRow)=>p.paymentSource],
     [t.models,(p:SiaiHomeRow)=>displayFact(p,"models"),(p:SiaiHomeRow)=>p.modelsSource],
     [t.license,(p:SiaiHomeRow)=>displayCommercial(p),(p:SiaiHomeRow)=>p.commercialSource],
     [t.legal,(p:SiaiHomeRow)=>p.legal||"—",(p:SiaiHomeRow)=>p.legalSource],
     [t.founded,(p:SiaiHomeRow)=>p.year||"—",(p:SiaiHomeRow)=>p.yearSource]
    ] as const).map(([label,value,source])=><tr key={label}><th scope="row">{label}</th>
     {compared.map(p=><td key={p.id}>{value(p)}<Source href={source(p)} label={t.source}/></td>)}</tr>)}
   </tbody></table></div>
  </section>}
  <div className="siai-home-table-scroll" tabIndex={0} aria-label={t.title}>
   <table className="siai-home-table">
    <thead><tr><th scope="col">{lang==="zh"?"序号":"#"}</th><th scope="col">{t.tool}</th><th scope="col">{t.strength}</th><th scope="col">{t.free}</th><th scope="col">{t.price}</th><th scope="col">{t.region}</th><th scope="col">{t.payment}</th><th scope="col">{t.models}</th><th scope="col">{t.license}</th><th scope="col">{t.action}</th></tr></thead>
    <tbody>
     {shown.map((p,i)=>{
       const listing=p.kind!=="company"?t.na:p.ipoFiling?t.ipoFiled:p.listing==="listed_parent"?t.listedParent:t.notConfirmed;
       return <Fragment key={p.id}><tr className="siai-home-tr">
        <td>{i+1}</td>
        <td className="siai-home-identity"><strong>{p.name}</strong><dl>
         <div><dt>{p.kind==="company"?t.company:t.project}</dt><dd>{p.company}</dd></div>
         <div><dt>{p.legalScope==="group_parent"?t.parent:t.legal}</dt><dd>{p.kind==="company"?(p.legal||"—"):t.na}</dd></div>
         <div><dt>{t.listed}</dt><dd>{listing}</dd></div>
         <div><dt>{t.founded}</dt><dd>{p.year||"—"}</dd></div>
         {p.checkedAt&&<div><dt>{REVIEWED_COPY[lang]}</dt><dd><time dateTime={p.checkedAt}>{p.checkedAt}</time></dd></div>}
        </dl></td>
        <td><strong className="siai-cell-preview" title={displayStrength(p)}>{short(displayStrength(p),100)}</strong></td>
        <td><span className="siai-cell-preview" title={displayFact(p,"free")}>{short(displayFact(p,"free"),100)}</span><Source href={p.freeSource} label={t.source}/></td>
        <td><span className="siai-cell-preview" title={displayFact(p,"price")}>{short(displayFact(p,"price"),110)}</span><Source href={p.priceSource} label={t.source}/></td>
        <td><span className="siai-cell-preview" title={displayRegion(p)}>{short(displayRegion(p),100)}</span><Source href={p.regionSource} label={t.source}/></td>
        <td><span className="siai-cell-preview" title={displayPayment(p)}>{short(displayPayment(p),88)}</span><Source href={p.paymentSource} label={t.source}/></td>
        <td><span className="siai-cell-preview" title={displayFact(p,"models")}>{short(displayFact(p,"models"),95)}</span></td>
        <td><span className="siai-cell-preview" title={displayCommercial(p)}>{short(displayCommercial(p),100)}</span><Source href={p.commercialSource} label={t.source}/></td>
        <td className="siai-home-actions"><a className="siai-open" href={p.website} target="_blank" rel="noopener noreferrer">{t.official} ↗</a><button type="button" onClick={()=>setExpanded(expanded===p.id?null:p.id)} aria-expanded={expanded===p.id} aria-controls={"siai-detail-"+p.id}>{expanded===p.id?t.close:t.details}</button>
        <button type="button" className={compareIds.includes(p.id)?"siai-compare-selected":""} onClick={()=>toggleCompare(p.id)}
         disabled={!compareIds.includes(p.id)&&compareIds.length>=MAX_COMPARISONS}
         aria-pressed={compareIds.includes(p.id)}>{compareIds.includes(p.id)?ui.remove:ui.compare}</button></td>
       </tr>
        {expanded===p.id&&<tr className="siai-home-expanded-row"><td colSpan={10}>{detailPanel(p)}</td></tr>}
       </Fragment>;
     })}
    </tbody>
   </table>
  </div>
  {shown.length===0&&<p className="siai-home-empty">{t.noResults}</p>}

 </main>;
}
