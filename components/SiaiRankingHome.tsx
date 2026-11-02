"use client";

import {useMemo,useState} from "react";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import {localizedCategory} from "../lingxifield-ai-market/lib/market-home-i18n";

export type SiaiHomeRow={
 id:string;name:string;company:string;legal:string|null;legalScope:"service_operator"|"group_parent"|null;
 kind:"company"|"open_source_project"|"software_library";listing:"listed_parent"|"unconfirmed"|"not_applicable";
 ipoFiling:boolean;year:string|null;companySource:string|null;legalSource:string|null;listingSource:string|null;yearSource:string|null;
 category:string;about:string;strength:string;features:string[];free:string;freeSource:string|null;
 price:string;priceSource:string|null;region:string;regionSource:string|null;payment:string;
 models:string;modelsSource:string|null;commercial:string;commercialSource:string|null;website:string;
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

function short(s:string,max=150){return s.length>max?s.slice(0,max-1).trimEnd()+"…":s;}
function Source({href,label}:{href:string|null;label:string}){return href&&/^https:\/\//.test(href)?<a href={href} target="_blank" rel="nofollow noopener noreferrer" className="siai-source">{label} ↗</a>:null;}

export default function SiaiRankingHome({rows}:{rows:SiaiHomeRow[]}){
 const {lang}=useLingxiLang(),t=labels[lang];const [query,setQuery]=useState(""),[category,setCategory]=useState("*"),[expanded,setExpanded]=useState<string|null>(null);
 const categories=useMemo(()=>[...new Set(rows.map(r=>r.category))], [rows]);
 const shown=useMemo(()=>{const q=query.trim().toLocaleLowerCase();return rows.filter(r=>(category==="*"||r.category===category)&&(!q||[r.name,r.company,r.legal||"",r.about,r.strength,r.category,...r.features,r.models].join(" ").toLocaleLowerCase().includes(q)));},[rows,category,query]);
 return <main className="siai-home" lang={lang==="zh"?"zh-CN":lang} dir={lang==="ar"?"rtl":"ltr"} id="siai-market">
  <header className="siai-home-head"><p className="siai-kicker">LINGXIFIELD · GLOBAL SI AI</p><h1>{t.title}</h1><p>{t.subtitle}</p></header>
  <div className="siai-home-controls">
   <label className="siai-home-search"><span aria-hidden="true">⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.search} aria-label={t.search}/></label>
   <span className="siai-home-count">{shown.length} / {rows.length}</span>
  </div>
  <nav className="siai-home-categories" aria-label={t.all}>
   <button type="button" aria-pressed={category==="*"} className={category==="*"?"selected":""} onClick={()=>setCategory("*")}>{t.all}</button>
   {categories.map(c=><button key={c} type="button" aria-pressed={category===c} className={category===c?"selected":""} onClick={()=>setCategory(c)}>{localizedCategory(lang,c)}</button>)}
  </nav>
  <div className="siai-home-table-scroll" tabIndex={0} aria-label={t.title}>
   <table className="siai-home-table">
    <thead><tr><th scope="col">{lang==="zh"?"序号":"#"}</th><th scope="col">{t.tool}</th><th scope="col">{t.strength}</th><th scope="col">{t.free}</th><th scope="col">{t.price}</th><th scope="col">{t.region}</th><th scope="col">{t.payment}</th><th scope="col">{t.models}</th><th scope="col">{t.license}</th><th scope="col">{t.action}</th></tr></thead>
    <tbody>
     {shown.map((p,i)=>{
       const listing=p.kind!=="company"?t.na:p.ipoFiling?t.ipoFiled:p.listing==="listed_parent"?t.listedParent:t.notConfirmed;
       return <tr key={p.id} className="siai-home-tr">
        <td>{i+1}</td>
        <td className="siai-home-identity"><strong>{p.name}</strong><dl>
         <div><dt>{p.kind==="company"?t.company:t.project}</dt><dd>{p.company}</dd></div>
         <div><dt>{p.legalScope==="group_parent"?t.parent:t.legal}</dt><dd>{p.kind==="company"?(p.legal||"—"):t.na}</dd></div>
         <div><dt>{t.listed}</dt><dd>{listing}</dd></div>
         <div><dt>{t.founded}</dt><dd>{p.year||"—"}</dd></div>
        </dl></td>
        <td><strong className="siai-cell-preview" title={p.strength||p.about}>{short(p.strength||p.about,100)}</strong></td>
        <td><span className="siai-cell-preview" title={p.free}>{short(p.free,100)}</span><Source href={p.freeSource} label={t.source}/></td>
        <td><span className="siai-cell-preview" title={p.price}>{short(p.price,110)}</span><Source href={p.priceSource} label={t.source}/></td>
        <td><span className="siai-cell-preview" title={p.region}>{short(p.region,100)}</span><Source href={p.regionSource} label={t.source}/></td>
        <td><span className="siai-cell-preview" title={p.payment}>{short(p.payment,88)}</span></td>
        <td><span className="siai-cell-preview" title={p.models}>{short(p.models,95)}</span></td>
        <td><span className="siai-cell-preview" title={p.commercial}>{short(p.commercial,100)}</span><Source href={p.commercialSource} label={t.source}/></td>
        <td className="siai-home-actions"><a className="siai-open" href={p.website} target="_blank" rel="noopener noreferrer">{t.official} ↗</a><button type="button" onClick={()=>setExpanded(expanded===p.id?null:p.id)} aria-expanded={expanded===p.id}>{expanded===p.id?t.close:t.details}</button></td>
       </tr>;
     })}
    </tbody>
   </table>
  </div>
  {shown.length===0&&<p className="siai-home-empty">{t.noResults}</p>}
  {expanded&&shown.some(p=>p.id===expanded)&&(()=>{
   const p=shown.find(x=>x.id===expanded)!;
   return <section className="siai-home-detail" aria-live="polite"><div><h2>{p.name}</h2><button type="button" onClick={()=>setExpanded(null)} aria-label={t.close}>×</button></div>
    <p>{p.about}</p><p>{p.features.join(" · ")}</p>
    <dl><div><dt>{t.free}</dt><dd>{p.free}</dd></div><div><dt>{t.price}</dt><dd>{p.price}</dd></div><div><dt>{t.region}</dt><dd>{p.region}</dd></div><div><dt>{t.payment}</dt><dd>{p.payment}</dd></div><div><dt>{t.models}</dt><dd>{p.models}</dd></div><div><dt>{t.license}</dt><dd>{p.commercial}</dd></div></dl>
    <h3>{t.sourceHeading}</h3><div className="siai-home-sources">{[[p.companySource,t.company],[p.legalSource,t.legal],[p.listingSource,t.listed],[p.yearSource,t.founded],[p.freeSource,t.free],[p.priceSource,t.price],[p.regionSource,t.region],[p.modelsSource,t.models],[p.commercialSource,t.license]].filter((x):x is [string,string]=>typeof x[0]==="string"&&/^https:\/\//.test(x[0])).map(([href,label])=><a key={label+href} href={href} target="_blank" rel="noopener noreferrer">{label} ↗</a>)}</div>
   </section>;
  })()}
 </main>;
}
