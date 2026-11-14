"use client";
import {useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import {isLikelyToolQuery} from "@/lib/tools/search-intents-v44r2.mjs";
import {HomeHeroVisual,HomeGlobalGrowth} from "@/components/HomeGlobalGrowth";
type HeroCopy={title:string;lead:string;subline:string;primary:string;secondary:string;placeholder:string;begin:string;proof:string[]};
const HERO_COPY:Record<LingxiLang,HeroCopy>={
 zh:{title:"全球智能服务与实用工具平台",lead:"全球 SIAI 排行榜比较模型能力、真实价格、免费额度、地区可用性与商用授权；SASI 智能软件市场提供成品软件、MT5 EA、交易指标与源码授权；100+ 在线工具覆盖 PDF、图片、视频、音频、表格及日常文件处理。",subline:"全球 SIAI 排行榜 · 100+ 在线实用工具 · SASI 智能软件市场",primary:"立即探索",secondary:"开通工具包",placeholder:"输入问题或任务，快速找到对应工具…",begin:"查找答案",proof:["真实数据","持续更新","全球可用","安全高效"]},
 en:{title:"Global Intelligent Services & Practical Tools",lead:"Compare model capabilities, real prices, free allowances, regional access and commercial rights in Global SIAI Rankings. Browse finished software, MT5 EAs, indicators and source licenses in SASI, or use 100+ online tools for everyday work.",subline:"Global SIAI Rankings · 100+ Practical Tools · SASI Software Marketplace",primary:"Explore now",secondary:"Get ToolPass",placeholder:"Describe the task to find the right tool…",begin:"Find an answer",proof:["Verified facts","Regular updates","Global access","Secure service"]},
 ja:{title:"グローバル智能サービスと実用ツール",lead:"SIAIランキングでモデル性能、実際の価格、無料枠、地域対応、商用利用条件を比較。SASIで完成ソフト、MT5 EA、取引指標、ソースライセンスを確認し、100以上のオンラインツールを利用できます。",subline:"世界のSIAIランキング · 100以上のツール · SASIソフトウェア市場",primary:"今すぐ探す",secondary:"ToolPassを利用",placeholder:"解決したい作業や質問を入力…",begin:"答えを探す",proof:["確認済み情報","継続更新","世界対応","安全で効率的"]},
 ko:{title:"글로벌 지능형 서비스 및 실용 도구 플랫폼",lead:"글로벌 SIAI 순위에서 모델 성능, 실제 가격, 무료 한도, 지역 지원과 상업적 이용 조건을 비교하세요. SASI에서 완성형 소프트웨어, MT5 EA, 거래 지표와 소스 라이선스를 살펴보고 100개 이상의 온라인 도구를 이용할 수 있습니다.",subline:"글로벌 SIAI 순위 · 실용 도구 100+ · SASI 소프트웨어 마켓",primary:"지금 탐색",secondary:"ToolPass 이용",placeholder:"해결할 작업이나 질문을 입력하세요…",begin:"답변 찾기",proof:["검증된 정보","지속 업데이트","글로벌 지원","안전하고 효율적"]},
 fr:{title:"Services intelligents mondiaux et outils pratiques",lead:"Comparez les modèles IA, les prix réels, les quotas gratuits, la disponibilité régionale et les droits commerciaux. Parcourez les logiciels, EA MT5 et licences source SASI, ou utilisez plus de 100 outils en ligne.",subline:"Classement SIAI mondial · 100+ outils pratiques · Marché SASI",primary:"Explorer",secondary:"Activer ToolPass",placeholder:"Décrivez la tâche ou la question à résoudre…",begin:"Trouver une réponse",proof:["Données vérifiées","Mises à jour","Accès mondial","Service sécurisé"]},
 de:{title:"Globale intelligente Dienste und praktische Werkzeuge",lead:"Vergleiche KI-Modelle, echte Preise, Gratis-Kontingente, regionale Verfügbarkeit und kommerzielle Rechte. Entdecke fertige Software, MT5-EAs und Quellcode-Lizenzen bei SASI sowie über 100 Online-Tools.",subline:"Globales SIAI-Ranking · 100+ praktische Tools · SASI-Softwaremarkt",primary:"Jetzt entdecken",secondary:"ToolPass nutzen",placeholder:"Beschreibe die Aufgabe oder Frage…",begin:"Antwort finden",proof:["Geprüfte Daten","Regelmäßige Updates","Weltweit verfügbar","Sicher und effizient"]},
 es:{title:"Servicios inteligentes globales y herramientas prácticas",lead:"Compara modelos IA, precios reales, límites gratuitos, disponibilidad regional y derechos comerciales. Explora software, EA de MT5 y licencias de código fuente en SASI, además de más de 100 herramientas online.",subline:"Ranking SIAI global · Más de 100 herramientas · Mercado SASI",primary:"Explorar",secondary:"Activar ToolPass",placeholder:"Describe la tarea o pregunta que quieres resolver…",begin:"Encontrar respuesta",proof:["Datos verificados","Actualización continua","Acceso global","Seguro y eficiente"]},
 pt:{title:"Serviços inteligentes globais e ferramentas práticas",lead:"Compare modelos de IA, preços reais, limites gratuitos, disponibilidade regional e direitos comerciais. Explore software pronto, EAs MT5 e licenças de código-fonte no SASI, além de mais de 100 ferramentas online.",subline:"Ranking SIAI global · Mais de 100 ferramentas · Mercado SASI",primary:"Explorar",secondary:"Ativar ToolPass",placeholder:"Descreva a tarefa ou pergunta que deseja resolver…",begin:"Encontrar resposta",proof:["Dados verificados","Atualização contínua","Acesso global","Seguro e eficiente"]},
 ar:{title:"خدمات ذكية عالمية وأدوات عملية",lead:"قارن نماذج الذكاء الاصطناعي والأسعار الفعلية والحصص المجانية والتوفر الإقليمي وحقوق الاستخدام التجاري. استعرض البرامج الجاهزة ومستشاري MT5 وتراخيص المصدر في SASI واستخدم أكثر من 100 أداة عبر الإنترنت.",subline:"تصنيف SIAI العالمي · أكثر من 100 أداة · سوق SASI",primary:"استكشف الآن",secondary:"استخدم ToolPass",placeholder:"اكتب المهمة أو السؤال الذي تريد حله…",begin:"اعثر على إجابة",proof:["بيانات موثوقة","تحديث مستمر","متاح عالميًا","آمن وفعال"]}
};
export default function HomeProblemHub(){
 const {lang}=useLingxiLang();const copy=HERO_COPY[lang]||HERO_COPY.en;const router=useRouter();const [query,setQuery]=useState("");
 function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();const value=query.trim();if(!value)return;const lower=value.toLowerCase();const encoded=encodeURIComponent(value);
  if(/开发者|卖家|发布|上架|seller|developer|vendor|vendedor|verkäufer|vendeur|판매자|出品者|بائع/i.test(value)){router.push(`/sasi/seller?intent=${encoded}&lang=${lang}`);return}
  if(/安装|交付|教程|授权规则|delivery|installation|license|licence/i.test(value)){router.push(`/sasi/delivery?q=${encoded}&lang=${lang}`);return}
  if(/mt5|\bea\b|源码|软件|授权|成品|商品|市场|sasi/i.test(lower)){router.push(`/sasi?q=${encoded}&lang=${lang}`);return}
  if(/ai|模型|排行榜|免费额度|价格|商用|siai|chatgpt|claude|gemini/i.test(lower)){const discovery=new URL("/siai",location.origin);discovery.searchParams.set("q",value);discovery.searchParams.set("lang",lang);router.push(discovery.pathname+discovery.search);return}
  if(/工具包|toolpass|会员|无限使用|membership/i.test(value)){router.push(`/tools/pass?lang=${lang}`);return}
  router.push(isLikelyToolQuery(value)?`/tools?q=${encoded}&lang=${lang}`:`/tools?q=${encoded}&lang=${lang}`);
 }
 return <><section className="lx-home-hero-section" aria-labelledby="lx-home-hero-title">
  <div className="lx-home-hero-grid"><div className="lx-home-hero-copy">
   <p className="lx-home-hero-brand">LINGXIFIELD <span>·</span> GLOBAL INTELLIGENT SERVICES</p>
   <h1 id="lx-home-hero-title">{copy.title}</h1><p className="lx-home-hero-lead">{copy.lead}</p>
   <p className="lx-home-hero-subline">{copy.subline}</p>
   <div className="lx-home-hero-actions"><a href="/siai" className="lx-home-cta-primary">{copy.primary} <span aria-hidden="true">→</span></a><a href="/tools/pass" className="lx-home-cta-secondary">{copy.secondary} <span aria-hidden="true">→</span></a></div>
   <div className="lx-home-hero-proof">{copy.proof.map(item=><span key={item}><b aria-hidden="true">✓</b>{item}</span>)}</div>
   <form onSubmit={submit} className="lx-home-question-search" data-testid="home-task-search"><span aria-hidden="true">⌕</span><input value={query} onChange={event=>setQuery(event.target.value)} aria-label={copy.placeholder} placeholder={copy.placeholder}/><button type="submit">{copy.begin}</button></form>
  </div><HomeHeroVisual/></div>
 </section><HomeGlobalGrowth lang={lang}/></>;
}
