"use client";

import {Fragment,useMemo,useRef,useEffect,useState} from "react";
import {SiaiSearchDiscovery} from "@/components/SiaiSearchDiscovery";
import MarketCostEstimator from "../lingxifield-ai-market/app/market-cost-estimator";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import {localizedCategory} from "../lingxifield-ai-market/lib/market-home-i18n";
import {capabilityProfile} from "../lingxifield-ai-market/lib/capability-profiles";
import {productAnswerHeadline} from "../lingxifield-ai-market/lib/market-result-headlines";
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
 creator:{en:string;zh:string;role:'founder'|'project_creator'|'lead_author';source:string}|null;
 kind:"company"|"open_source_project"|"software_library";listing:"listed_parent"|"unconfirmed"|"not_applicable";
 ipoFiling:boolean;year:string|null;companySource:string|null;legalSource:string|null;listingSource:string|null;yearSource:string|null;
 category:string;about:string;strength:string;features:string[];searchTerms:string[];free:string;freeSource:string|null;
 price:string;priceSource:string|null;region:string;regionSource:string|null;payment:string;paymentSource:string|null;
 models:string;modelsSource:string|null;commercial:string;commercialSource:string|null;website:string;checkedAt:string|null;brandSource?:string|null;recordStatus?:"source_preview";verifiedPaymentRails?:readonly PaymentFacet[];
};

const labels:Record<LingxiLang,{title:string,subtitle:string,search:string,all:string,tool:string,company:string,legal:string,parent:string,listed:string,founded:string,founder:string,projectCreator:string,leadAuthor:string,
 strength:string,free:string,price:string,region:string,payment:string,models:string,license:string,action:string,official:string,details:string,close:string,
 noResults:string,notConfirmed:string,listedParent:string,ipoFiled:string,na:string,project:string,source:string,sourceHeading:string,oldHome:string}>={
 zh:{title:"全球 SIAI 排行榜",subtitle:"SI / AI 工具越多，越难选？先看它能替你完成什么，再看真实价格、免费额度、地区、支付与商用条件。",search:"搜索 SI/AI 工具、公司、功能或问题",all:"全部平台",tool:"SI / AI 工具 / 厂商",company:"公司名称",legal:"法律注册名称",parent:"集团注册名称",listed:"是否上市",founded:"成立时间",founder:"主要创始人",projectCreator:"项目原作者",leadAuthor:"初始研发者",strength:"擅长做什么",free:"免费额度",price:"真实价格",region:"地区可用",payment:"付款方式",models:"代表模型",license:"商用授权",action:"操作",official:"访问官网",details:"详情",close:"收起",noResults:"没有找到匹配的工具，换一个关键词试试。",notConfirmed:"未确认上市",listedParent:"所属集团已上市",ipoFiled:"已申请上市，尚未挂牌",na:"不适用",project:"维护方",source:"官方资料",sourceHeading:"官方依据",oldHome:"工具首页"},
 en:{title:"Global SIAI Rankings",subtitle:"More SI/AI tools, harder choices? Start with real tasks, then compare prices, free quotas, regions, checkout and commercial rights.",search:"Search SI/AI tools, publishers and tasks",all:"All platforms",tool:"Tool / Publisher",company:"Company",legal:"Legal entity",parent:"Parent entity",listed:"Listing",founded:"Founded",founder:"Founders",projectCreator:"Original creator",leadAuthor:"Initial authors",strength:"Best for",free:"Free usage",price:"Price",region:"Regions",payment:"Payment",models:"Models",license:"Commercial use",action:"Actions",official:"Official site",details:"Details",close:"Close",noResults:"No matching tools.",notConfirmed:"Not confirmed listed",listedParent:"Listed parent",ipoFiled:"IPO filed; not listed",na:"N/A",project:"Maintainer",source:"Official source",sourceHeading:"Official references",oldHome:"Tools home"},
 ja:{title:"世界の SIAI ランキング",subtitle:"SI/AIツールが多すぎて選べない？まず実際の用途、次に料金・無料枠・地域・支払い・商用条件を比較。",search:"SI/AIツール・会社・用途を検索",all:"すべて",tool:"ツール / 提供元",company:"会社名",legal:"法人名",parent:"親会社法人",listed:"上場状況",founded:"設立",founder:"主な創業者",projectCreator:"原作者",leadAuthor:"初期開発者",strength:"得意分野",free:"無料枠",price:"料金",region:"地域",payment:"支払",models:"モデル",license:"商用",action:"操作",official:"公式サイト",details:"詳細",close:"閉じる",noResults:"該当するツールがありません。",notConfirmed:"未確認",listedParent:"上場親会社",ipoFiled:"IPO申請中",na:"対象外",project:"管理者",source:"公式資料",sourceHeading:"公式情報",oldHome:"ツールのホーム"},
 ko:{title:"글로벌 SIAI 순위",subtitle:"SI/AI 도구가 많아도 정답은 작업에 있습니다. 실제 용도부터 무료 한도·가격·지역·결제·상업적 이용까지 확인하세요.",search:"SI/AI 도구·회사 검색",all:"전체",tool:"도구 / 회사",company:"회사명",legal:"법인",parent:"모기업",listed:"상장",founded:"설립",founder:"주요 창업자",projectCreator:"원작자",leadAuthor:"초기 개발자",strength:"주요 기능",free:"무료",price:"가격",region:"지역",payment:"결제",models:"모델",license:"상업적 이용",action:"작업",official:"공식 사이트",details:"상세",close:"닫기",noResults:"검색 결과가 없습니다.",notConfirmed:"미확인",listedParent:"상장 그룹",ipoFiled:"IPO 신청 중",na:"해당 없음",project:"관리 주체",source:"공식 자료",sourceHeading:"공식 출처",oldHome:"도구 홈"},
 fr:{title:"Classement mondial SIAI",subtitle:"Trop d’outils SI/IA ? Commencez par la tâche à accomplir, puis comparez tarifs, quotas, régions et droits commerciaux.",search:"Rechercher un outil ou une entreprise",all:"Tous",tool:"Outil / Éditeur",company:"Entreprise",legal:"Entité juridique",parent:"Société mère",listed:"Cotation",founded:"Fondation",founder:"Fondateurs",projectCreator:"Créateur original",leadAuthor:"Auteurs initiaux",strength:"Atouts",free:"Gratuit",price:"Prix",region:"Régions",payment:"Paiement",models:"Modèles",license:"Commercial",action:"Actions",official:"Site officiel",details:"Détails",close:"Fermer",noResults:"Aucun résultat.",notConfirmed:"Non confirmé",listedParent:"Groupe coté",ipoFiled:"IPO déposée",na:"Sans objet",project:"Responsable",source:"Source officielle",sourceHeading:"Sources",oldHome:"Accueil outils"},
 de:{title:"Globales SIAI-Ranking",subtitle:"Mehr KI-Tools, schwierigere Wahl? Erst konkrete Aufgaben prüfen, dann Preise, Freikontingente, Regionen und Nutzungsrechte.",search:"KI-Tool oder Anbieter suchen",all:"Alle",tool:"Tool / Anbieter",company:"Unternehmen",legal:"Rechtsträger",parent:"Muttergesellschaft",listed:"Börse",founded:"Gründung",founder:"Gründer",projectCreator:"Projekturheber",leadAuthor:"Erstautoren",strength:"Stärken",free:"Kostenlos",price:"Preis",region:"Regionen",payment:"Zahlung",models:"Modelle",license:"Gewerblich",action:"Aktion",official:"Offizielle Seite",details:"Details",close:"Schließen",noResults:"Keine Ergebnisse.",notConfirmed:"Nicht bestätigt",listedParent:"Börsennotierte Mutter",ipoFiled:"IPO beantragt",na:"Nicht zutreffend",project:"Betreiber",source:"Offizielle Quelle",sourceHeading:"Quellen",oldHome:"Werkzeuge"},
 es:{title:"Ranking mundial SIAI",subtitle:"¿Demasiadas herramientas de SI/IA? Empieza por la tarea real y compara precios, límites gratis, países y derechos de uso.",search:"Buscar herramientas y empresas",all:"Todas",tool:"Herramienta / Empresa",company:"Empresa",legal:"Entidad jurídica",parent:"Empresa matriz",listed:"Cotización",founded:"Fundación",founder:"Fundadores",projectCreator:"Creador original",leadAuthor:"Autores iniciales",strength:"Ventajas",free:"Gratis",price:"Precio",region:"Regiones",payment:"Pago",models:"Modelos",license:"Comercial",action:"Acciones",official:"Sitio oficial",details:"Detalles",close:"Cerrar",noResults:"Sin resultados.",notConfirmed:"Sin confirmar",listedParent:"Matriz cotizada",ipoFiled:"IPO presentada",na:"No aplica",project:"Responsable",source:"Fuente oficial",sourceHeading:"Fuentes",oldHome:"Inicio herramientas"},
 pt:{title:"Ranking global SIAI",subtitle:"Ferramentas de IA demais? Comece pela tarefa real e compare preço, limites grátis, regiões e direitos comerciais.",search:"Pesquisar ferramentas e empresas",all:"Todos",tool:"Ferramenta / Empresa",company:"Empresa",legal:"Entidade legal",parent:"Empresa controladora",listed:"Listagem",founded:"Fundação",founder:"Fundadores",projectCreator:"Criador original",leadAuthor:"Autores iniciais",strength:"Vantagens",free:"Grátis",price:"Preço",region:"Regiões",payment:"Pagamento",models:"Modelos",license:"Comercial",action:"Ações",official:"Site oficial",details:"Detalhes",close:"Fechar",noResults:"Sem resultados.",notConfirmed:"Não confirmado",listedParent:"Controladora listada",ipoFiled:"IPO solicitada",na:"Não se aplica",project:"Responsável",source:"Fonte oficial",sourceHeading:"Fontes",oldHome:"Início ferramentas"},
 ar:{title:"ترتيب SIAI العالمي",subtitle:"أدوات ذكاء اصطناعي كثيرة وقرار أصعب؟ ابدأ بالمهمة الفعلية ثم قارن الأسعار والحدود المجانية والمناطق وحقوق الاستخدام.",search:"ابحث عن أدوات وشركات الذكاء الاصطناعي",all:"جميع المنصات",tool:"الأداة / الشركة",company:"الشركة",legal:"الكيان القانوني",parent:"الشركة الأم",listed:"الإدراج",founded:"التأسيس",founder:"المؤسسون",projectCreator:"المنشئ الأصلي",leadAuthor:"المؤلفون الأصليون",strength:"المزايا",free:"المجاني",price:"السعر",region:"المناطق",payment:"الدفع",models:"النماذج",license:"الاستخدام التجاري",action:"إجراءات",official:"الموقع الرسمي",details:"التفاصيل",close:"إغلاق",noResults:"لا نتائج.",notConfirmed:"غير مؤكد",listedParent:"الشركة الأم مدرجة",ipoFiled:"طلب إدراج مقدم",na:"غير منطبق",project:"الجهة المطورة",source:"مصدر رسمي",sourceHeading:"المصادر",oldHome:"الرئيسية للأدوات"}
};

const RANKING_NEW_UI:Record<LingxiLang,Record<string,string>>={
 zh:{},
 en:{"厂商认领":"Claim product","找到":"Results:","项":"","厂商认领 · 提交 SI/AI 平台":"Claim or submit an SI/AI platform","视频／短剧和 API 费用计算器（点击展开）":"Video, short-film and API cost estimator","横向查看全部栏目":"Scroll across all columns","顶部横向滚动条":"Top horizontal scrollbar"},
 ja:{"厂商认领":"この製品を認証","找到":"検索結果","项":"件","厂商认领 · 提交 SI/AI 平台":"SI/AI製品の登録・認証","视频／短剧和 API 费用计算器（点击展开）":"動画・短編とAPIの料金計算","横向查看全部栏目":"横スクロールで全列を見る","顶部横向滚动条":"上部の横スクロール"},
 ko:{"厂商认领":"제품 인증","找到":"검색 결과","项":"개","厂商认领 · 提交 SI/AI 平台":"SI/AI 제품 등록·인증","视频／短剧和 API 费用计算器（点击展开）":"영상·단편 및 API 비용 계산기","横向查看全部栏目":"가로로 이동해 모든 항목 보기","顶部横向滚动条":"상단 가로 스크롤"},
 fr:{"厂商认领":"Revendiquer ce produit","找到":"Résultats :","项":"","厂商认领 · 提交 SI/AI 平台":"Revendiquer ou proposer une plateforme SI/IA","视频／短剧和 API 费用计算器（点击展开）":"Coûts vidéo, court-métrage et API","横向查看全部栏目":"Défiler pour toutes les colonnes","顶部横向滚动条":"Défilement horizontal supérieur"},
 de:{"厂商认领":"Produkt beanspruchen","找到":"Ergebnisse:","项":"","厂商认领 · 提交 SI/AI 平台":"SI/KI-Produkt beanspruchen oder einreichen","视频／短剧和 API 费用计算器（点击展开）":"Video- und API-Kostenrechner","横向查看全部栏目":"Alle Spalten horizontal anzeigen","顶部横向滚动条":"Obere horizontale Scrollleiste"},
 es:{"厂商认领":"Reclamar producto","找到":"Resultados:","项":"","厂商认领 · 提交 SI/AI 平台":"Reclamar o enviar plataforma SI/IA","视频／短剧和 API 费用计算器（点击展开）":"Coste de vídeo, cortometraje y API","横向查看全部栏目":"Desplazar para ver todas las columnas","顶部横向滚动条":"Barra de desplazamiento superior"},
 pt:{"厂商认领":"Reivindicar produto","找到":"Resultados:","项":"","厂商认领 · 提交 SI/AI 平台":"Reivindicar ou enviar plataforma SI/IA","视频／短剧和 API 费用计算器（点击展开）":"Custos de vídeo, curta e API","横向查看全部栏目":"Rolar para ver todas as colunas","顶部横向滚动条":"Rolagem horizontal superior"},
 ar:{"厂商认领":"المطالبة بهذا المنتج","找到":"النتائج:","项":"","厂商认领 · 提交 SI/AI 平台":"المطالبة بمنصة SI/AI أو تقديمها","视频／短剧和 API 费用计算器（点击展开）":"حاسبة تكلفة الفيديو و API","横向查看全部栏目":"مرر أفقياً لعرض جميع الأعمدة","顶部横向滚动条":"شريط التمرير العلوي"},
};
const CANDIDATE_CATEGORIES:Record<LingxiLang,Record<string,string>>={
 zh:{"编程":"编程","设计":"设计","演示":"演示文稿","视频":"视频","图片":"图片","文档":"文档","视频剪辑":"视频剪辑","综合助手":"综合助手","聚合模型":"聚合模型","图片视频":"图片与视频","图片设计":"图片设计","多模态创作":"多模态创作","AI视频":"SI/AI 视频","学术研究":"学术研究","模型API":"模型 API"},
 en:{"编程":"Coding","设计":"Design","演示":"Presentations","视频":"Video","图片":"Images","文档":"Documents","视频剪辑":"Video editing","综合助手":"General assistant","聚合模型":"Model aggregator","图片视频":"Images & video","图片设计":"Image design","多模态创作":"Multimodal creation","AI视频":"SI/AI video","学术研究":"Academic research","模型API":"Model APIs"},
 ja:{"编程":"プログラミング","设计":"デザイン","演示":"プレゼン","视频":"動画","图片":"画像","文档":"文書","视频剪辑":"動画編集","综合助手":"総合アシスタント","聚合模型":"モデル統合","图片视频":"画像と動画","图片设计":"画像デザイン","多模态创作":"マルチモーダル制作","AI视频":"SI/AI動画","学术研究":"学術研究","模型API":"モデルAPI"},
 ko:{"编程":"코딩","设计":"디자인","演示":"프레젠테이션","视频":"동영상","图片":"이미지","文档":"문서","视频剪辑":"동영상 편집","综合助手":"범용 어시스턴트","聚合模型":"모델 통합","图片视频":"이미지·동영상","图片设计":"이미지 디자인","多模态创作":"멀티모달 제작","AI视频":"SI/AI 동영상","学术研究":"학술 연구","模型API":"모델 API"},
 fr:{"编程":"Programmation","设计":"Design","演示":"Présentations","视频":"Vidéo","图片":"Images","文档":"Documents","视频剪辑":"Montage vidéo","综合助手":"Assistant général","聚合模型":"Agrégateur de modèles","图片视频":"Images et vidéo","图片设计":"Design d’images","多模态创作":"Création multimodale","AI视频":"Vidéo SI/AI","学术研究":"Recherche académique","模型API":"API de modèles"},
 de:{"编程":"Programmierung","设计":"Design","演示":"Präsentationen","视频":"Video","图片":"Bilder","文档":"Dokumente","视频剪辑":"Videobearbeitung","综合助手":"Allgemeiner Assistent","聚合模型":"Modell-Aggregator","图片视频":"Bilder und Video","图片设计":"Bildgestaltung","多模态创作":"Multimodale Erstellung","AI视频":"SI/AI-Video","学术研究":"Wissenschaftliche Forschung","模型API":"Modell-APIs"},
 es:{"编程":"Programación","设计":"Diseño","演示":"Presentaciones","视频":"Vídeo","图片":"Imágenes","文档":"Documentos","视频剪辑":"Edición de vídeo","综合助手":"Asistente general","聚合模型":"Agregador de modelos","图片视频":"Imagen y vídeo","图片设计":"Diseño de imágenes","多模态创作":"Creación multimodal","AI视频":"Vídeo SI/AI","学术研究":"Investigación académica","模型API":"API de modelos"},
 pt:{"编程":"Programação","设计":"Design","演示":"Apresentações","视频":"Vídeo","图片":"Imagens","文档":"Documentos","视频剪辑":"Edição de vídeo","综合助手":"Assistente geral","聚合模型":"Agregador de modelos","图片视频":"Imagens e vídeo","图片设计":"Design de imagens","多模态创作":"Criação multimodal","AI视频":"Vídeo SI/AI","学术研究":"Pesquisa acadêmica","模型API":"APIs de modelos"},
 ar:{"编程":"البرمجة","设计":"التصميم","演示":"العروض التقديمية","视频":"الفيديو","图片":"الصور","文档":"المستندات","视频剪辑":"تحرير الفيديو","综合助手":"مساعد عام","聚合模型":"مجمع نماذج","图片视频":"الصور والفيديو","图片设计":"تصميم الصور","多模态创作":"إنشاء متعدد الوسائط","AI视频":"فيديو SI/AI","学术研究":"بحث أكاديمي","模型API":"واجهات النماذج"}
};
const PREVIEW_COPY:Record<LingxiLang,string>={zh:"新增资料预览 · 尚未完成实际使用测试",en:"New research preview · real use untested",ja:"新規資料プレビュー・実利用テスト未完了",ko:"신규 자료 미리보기 · 실제 사용 테스트 미완료",fr:"Nouvelle fiche préliminaire · usage non testé",de:"Neue Datenvorschau · Praxistest ausstehend",es:"Nueva ficha preliminar · uso sin probar",pt:"Nova ficha preliminar · uso não testado",ar:"معاينة معلومات جديدة · لم تُختبر فعليًا"};
const PREVIEW_DATE:Record<LingxiLang,string>={zh:"官网资料记录日期",en:"Publisher-source observation date",ja:"公式資料記録日",ko:"공식 자료 기록일",fr:"Date de relevé de la source",de:"Datum der Quellenrecherche",es:"Fecha del registro oficial",pt:"Data do registro oficial",ar:"تاريخ تسجيل المصدر"};
const PREVIEW_FIELD:Record<LingxiLang,string>={zh:"原始资料（中文摘要），以官网为准",en:"Source notes are in Chinese; consult linked publisher terms",ja:"資料原文は中国語。公式リンクをご参照ください",ko:"원문 요약은 중국어입니다. 공식 링크를 참조하세요",fr:"Résumé en chinois ; consulter la source officielle",de:"Zusammenfassung auf Chinesisch; Originalquelle öffnen",es:"Resumen en chino; consulte la fuente oficial",pt:"Resumo em chinês; consulte a fonte oficial",ar:"الملخص بالصينية؛ راجع المصدر الرسمي"};
const REVIEWED_COPY:Record<LingxiLang,string>={zh:"官方资料复核",en:"Source checked",ja:"公式情報の確認日",ko:"공식 출처 확인일",fr:"Vérification de la source",de:"Quellen geprüft",es:"Fuente revisada",pt:"Fonte verificada",ar:"تاريخ فحص المصدر"};
function short(s:string,max=150){return s.length>max?s.slice(0,max-1).trimEnd()+"…":s;}
function Source({href,label}:{href:string|null;label:string}){return href&&/^https:\/\//.test(href)?<a href={href} target="_blank" rel="nofollow noopener noreferrer" className="siai-source">{label} ↗</a>:null;}

export default function SiaiRankingHome({rows}:{rows:SiaiHomeRow[]}){
 const {lang}=useLingxiLang(),t=labels[lang],ui=SIAI_FACET_WORDS[lang];
 const topRef=useRef<HTMLDivElement>(null),gridRef=useRef<HTMLDivElement>(null),dialogRef=useRef<HTMLDivElement>(null);
 const [tableWidth,setTableWidth]=useState(2200);
 const [query,setQuery]=useState(""),[category,setCategory]=useState("*"),[expanded,setExpanded]=useState<string|null>(null);
 const [task,setTask]=useState<TaskFacet>("all"),[payment,setPayment]=useState<PaymentFacet>("any");
 const [evidence,setEvidence]=useState<EvidenceFacet>("all"),[sort,setSort]=useState<MarketOrder>("oldest");
 const [compareIds,setCompareIds]=useState<string[]>([]),[comparisonOpen,setComparisonOpen]=useState(false);
 const categoryName=(name:string)=>CANDIDATE_CATEGORIES[lang][name]||localizedCategory(lang,name);
 const categories=useMemo(()=>[...new Set(rows.map(r=>r.category))], [rows]);
 const localizedRows=useMemo(()=>rows.map(p=>({...p,localizedSummary:localizedProductSummary(p.id,lang)||"",
  localizedCategory:categoryName(p.category)})),[rows,lang]);
 const shown=useMemo(()=>filterMarketRows(localizedRows,{query,category,task,payment,evidence,sort},lang),
  [localizedRows,query,category,task,payment,evidence,sort,lang]);
 const compared=rows.filter(p=>compareIds.includes(p.id));
 const selectedRow=expanded?rows.find(p=>p.id===expanded):null;
 const claimUrl=(p?:SiaiHomeRow)=>"/siai/claim?lang="+lang+(p?"&product="+encodeURIComponent(p.id)+"&name="+encodeURIComponent(p.name):"");
 const label=(zh:string,en:string)=>lang==="zh"?zh:(RANKING_NEW_UI[lang]?.[zh]||en);
 const sync=(from:"top"|"table")=>{const a=from==="top"?topRef.current:gridRef.current,b=from==="top"?gridRef.current:topRef.current;if(a&&b&&Math.abs(a.scrollLeft-b.scrollLeft)>1)b.scrollLeft=a.scrollLeft;};
 useEffect(()=>{const v=gridRef.current;if(!v)return;const measure=()=>setTableWidth(v.scrollWidth);measure();const ro=typeof ResizeObserver==="undefined"?null:new ResizeObserver(measure);ro?.observe(v);if(v.firstElementChild)ro?.observe(v.firstElementChild);window.addEventListener("resize",measure);return()=>{ro?.disconnect();window.removeEventListener("resize",measure);};},[shown.length,lang]);
 useEffect(()=>{if(!expanded)return;dialogRef.current?.focus();const esc=(e:KeyboardEvent)=>{if(e.key==="Escape")setExpanded(null)};window.addEventListener("keydown",esc);return()=>window.removeEventListener("keydown",esc);},[expanded]);
 const toggleCompare=(id:string)=>setCompareIds(current=>toggleMarketComparison(current,id,rows.map(p=>p.id)));
 const displayFact=(p:SiaiHomeRow,scope:"price"|"free"|"models")=>p.recordStatus==="source_preview"?(lang==="zh"?p[scope]:PREVIEW_FIELD[lang]+" · "+p[scope]):localizedCatalogFact(p.id,lang,scope,p[scope]);
 const displayStrength=(p:SiaiHomeRow)=>p.recordStatus==="source_preview"?(lang==="zh"?p.strength:p.name+" · "+PREVIEW_COPY[lang]):localizedProductSummary(p.id,lang)||p.strength||p.about;
 const displayRegion=(p:SiaiHomeRow)=>p.recordStatus==='source_preview'?(lang==='zh'?p.region:PREVIEW_FIELD[lang]):lang==='zh'?p.region:globalRegionSummary(p.id,lang);
 const displayCommercial=(p:SiaiHomeRow)=>p.recordStatus==='source_preview'?(lang==='zh'?p.commercial:PREVIEW_FIELD[lang]):lang==='zh'?p.commercial:commercialEvidence(p.id,lang)?.condition||p.commercial;
 const displayPayment=(p:SiaiHomeRow)=>p.recordStatus==='source_preview'?(lang==='zh'?p.payment:PREVIEW_FIELD[lang]):lang==='zh'?p.payment:p.payment.split(' · ').map(s=>localizedPaymentName(s,lang)).join(' · ');
 const displayAbout=(p:SiaiHomeRow)=>p.recordStatus==='source_preview'?(lang==='zh'?p.about:p.name+' · '+PREVIEW_COPY[lang]):lang==='zh'?p.about:localizedProductSummary(p.id,lang)||p.name;
 const detailPanel=(p:SiaiHomeRow)=><section id={"siai-detail-"+p.id} className="siai-home-detail" aria-live="polite"><div><h2>{p.name}</h2><button type="button" onClick={()=>setExpanded(null)} aria-label={t.close}>×</button></div>
    <p>{displayAbout(p)}</p>{p.recordStatus==="source_preview"&&<p className="siai-checked-date" role="status">{PREVIEW_COPY[lang]}</p>}{p.checkedAt&&<p className="siai-checked-date">{p.recordStatus==="source_preview"?PREVIEW_DATE[lang]:REVIEWED_COPY[lang]}: <time dateTime={p.checkedAt}>{p.checkedAt}</time></p>}{lang==="zh"&&capabilityProfile(p.id)&&<div className="siai-quick-answer">
     <strong>{productAnswerHeadline(p.id)||capabilityProfile(p.id)?.headline}</strong>
     <p>{capabilityProfile(p.id)?.differentiator}</p>
     <p><b>适合谁：</b>{capabilityProfile(p.id)?.audience}</p>
     {capabilityProfile(p.id)?.capabilities.slice(0,3).map((cap,i)=><p key={i}><b>{cap.name}：</b>{cap.outcome}</p>)}
     <a href={capabilityProfile(p.id)?.capabilities[0].source} target="_blank" rel="noopener noreferrer">查看官方功能说明 ↗</a>
    </div>}
    <dl>{p.legal&&<div><dt>{p.legalScope==="group_parent"?t.parent:t.legal}</dt><dd>{p.legal}</dd></div>}<div><dt>{t.free}</dt><dd>{displayFact(p,"free")}</dd></div><div><dt>{t.price}</dt><dd>{displayFact(p,"price")}</dd></div><div><dt>{t.region}</dt><dd>{displayRegion(p)}</dd></div><div><dt>{t.payment}</dt><dd>{displayPayment(p)}</dd></div><div><dt>{t.models}</dt><dd>{displayFact(p,"models")}</dd></div><div><dt>{t.license}</dt><dd>{displayCommercial(p)}</dd></div></dl>
    <h3>{t.sourceHeading}</h3><div className="siai-home-sources">{[[p.brandSource,t.official],[p.companySource,t.company],[p.creator?.source,t.founder],[p.legalSource,t.legal],[p.listingSource,t.listed],[p.yearSource,t.founded],[p.freeSource,t.free],[p.priceSource,t.price],[p.regionSource,t.region],[p.paymentSource,t.payment],[p.modelsSource,t.models],[p.commercialSource,t.license]].filter((x):x is [string,string]=>typeof x[0]==="string"&&/^https:\/\//.test(x[0])).map(([href,label])=><a key={label+href} href={href} target="_blank" rel="noopener noreferrer">{label} ↗</a>)}</div>
    <div className="siai-detail-actions"><a className="siai-detail-primary-link" href={p.website} target="_blank" rel="noopener noreferrer">{t.official} ↗</a><a className="siai-detail-primary-link" href={claimUrl(p)}>{label("厂商认领","Claim product")} ↗</a></div>
   </section>;
 return <main className="siai-home" lang={lang==="zh"?"zh-CN":lang} dir={lang==="ar"?"rtl":"ltr"} id="siai-market">
  <header className="siai-home-head"><p className="siai-kicker">LINGXIFIELD · GLOBAL SI AI</p><h1>{t.title}</h1><p>{t.subtitle}</p></header>
  <div className="siai-home-controls">
   <label className="siai-home-search"><span aria-hidden="true">⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.search} aria-label={t.search}/></label>
   <div className="siai-home-quicklinks"><span className="siai-home-count">{label("找到","Results:")} {shown.length} {label("项","")}</span><a className="siai-home-claim" href={claimUrl()}>{label("厂商认领 · 提交 SI/AI 平台","Claim or submit SI/AI platform")} ↗</a></div>
  </div>
  <div className="siai-home-four-filters">
   <nav className="siai-filter-line" aria-label={ui.category}><strong>{ui.category}</strong><div className="siai-filter-options">
    <button type="button" aria-pressed={category==="*"} className={category==="*"?"selected":""} onClick={()=>setCategory("*")}>{t.all}</button>
    {categories.map(c=><button key={c} type="button" aria-pressed={category===c} className={category===c?"selected":""} onClick={()=>setCategory(c)}>{categoryName(c)}</button>)}
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
  <details className="siai-home-cost-accordion"><summary>{label("视频／短剧和 API 费用计算器（点击展开）","Video, short-film and API cost estimator")}</summary><div className="siai-home-cost-inner"><MarketCostEstimator language={lang} currency={lang==="zh"?"CNY":"USD"}/></div></details>
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
     [t.founder,(p:SiaiHomeRow)=>p.creator?(lang==="zh"?p.creator.zh:p.creator.en):"—",(p:SiaiHomeRow)=>p.creator?.source||null],
     [t.founded,(p:SiaiHomeRow)=>p.year||"—",(p:SiaiHomeRow)=>p.yearSource]
    ] as const).map(([label,value,source])=><tr key={label}><th scope="row">{label}</th>
     {compared.map(p=><td key={p.id}>{value(p)}<Source href={source(p)} label={t.source}/></td>)}</tr>)}
   </tbody></table></div>
  </section>}
  <SiaiSearchDiscovery variant="ranking"/>
  <div className="siai-home-top-track"><span aria-hidden="true">↔</span><span className="siai-scroll-hint">{label("横向查看全部栏目","Scroll horizontally to see all columns")}</span><div className="siai-home-top-scroll" ref={topRef} onScroll={()=>sync("top")} tabIndex={0} aria-label={label("顶部横向滚动条","Top horizontal scrollbar")}><div style={{width:tableWidth,height:1}}/></div></div>
  <div className="siai-home-table-scroll" ref={gridRef} onScroll={()=>sync("table")} tabIndex={0} aria-label={t.title}>
   <table className="siai-home-table">
    <thead><tr><th scope="col">{lang==="zh"?"序号":"#"}</th><th scope="col">{t.tool}</th><th scope="col">{t.strength}</th><th scope="col">{t.free}</th><th scope="col">{t.price}</th><th scope="col">{t.region}</th><th scope="col">{t.payment}</th><th scope="col">{t.models}</th><th scope="col">{t.license}</th><th scope="col">{t.action}</th></tr></thead>
    <tbody>
     {shown.map((p,i)=>{
       const listing=p.kind!=="company"?t.na:p.ipoFiling?t.ipoFiled:p.listing==="listed_parent"?t.listedParent:t.notConfirmed;
       return <Fragment key={p.id}><tr className="siai-home-tr">
        <td>{i+1}</td>
        <td className="siai-home-identity"><strong>{p.name}</strong>{p.recordStatus==="source_preview"&&<small className="siai-checked-date">{PREVIEW_COPY[lang]}</small>}<dl>
         <div><dt>{p.kind==="company"?t.company:t.project}</dt><dd>{p.company}</dd></div>
         <div><dt>{p.creator?.role==='founder'?t.founder:p.creator?.role==='project_creator'?t.projectCreator:t.leadAuthor}</dt><dd>{p.creator?(lang==="zh"?p.creator.zh:p.creator.en):"—"}<Source href={p.creator?.source||null} label={t.source}/></dd></div>
         <div><dt>{t.listed}</dt><dd>{listing}</dd></div>
         <div><dt>{t.founded}</dt><dd>{p.year||"—"}</dd></div>
         {p.checkedAt&&<div><dt>{p.recordStatus==="source_preview"?PREVIEW_DATE[lang]:REVIEWED_COPY[lang]}</dt><dd><time dateTime={p.checkedAt}>{p.checkedAt}</time></dd></div>}
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
        
       </Fragment>;
     })}
    </tbody>
   </table>
  </div>
  {shown.length===0&&<p className="siai-home-empty">{t.noResults}</p>}
   {selectedRow&&<div className="siai-detail-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setExpanded(null);}}><div className="siai-detail-modal" role="dialog" aria-modal="true" aria-label={selectedRow.name+" · "+t.details} tabIndex={-1} ref={dialogRef}>{detailPanel(selectedRow)}</div></div>}

 </main>;
}
