"use client";
import Link from "next/link";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import {SIAI_DISCOVERY} from "@/lib/siai-search-discovery";
import {FOOTER_CATALOG} from "@/lib/footer-catalog-copy";

const ZH={
 market:"🌍 全球SIAI排行榜｜全球SI AI工具行情平台",
 intro:"持续收录全球SI、AI公司、模型与工具，支持搜索、分类筛选、横向对比，持续更新官方资料。",
 benefits:["核心功能、模型能力、擅长领域","免费额度、真实价格、套餐限制","地区可用、付款方式、商用授权","厂商资料、官方证据与信息更新","视频、短剧制作成本及积分费用计算","API Token调用费用估算与模型成本对比","按领域、任务、免费方案及付款方式筛选"],
 tools:"🧰 100+在线实用工具",
 categories:[
 ["📄 PDF","编辑、合并、拆分、压缩、OCR、电子签名、盖章、脱敏、格式转换。"],
 ["🖼️ 图片","压缩、去水印、翻译、证件照、换底色、长图拼接、格式转换。"],
 ["🎬 视频音频","压缩、裁剪、去水印、倒放、字幕制作、配音、提取音频、降噪。"],
 ["📊 文件表格","Excel、CSV、JSON、XML转换、文本对比、文件整理。"],
 ["🔐 隐私工具","临时邮箱、阅后即焚、隐私清理、文件加密。"],
 ["🍎 日常工具","食物卡路里识别、二维码及更多实用功能。"]
 ],
 sasi:"✨ SASI全球多模型智能创作",
 sasiBody:"短剧、视频、网站、书籍、学习、科研等智能创作方向，支持九种语言，持续完善。",
 search:"🔍 大家还会搜：",
 closing:"💎 灵犀场 LINGXIFIELD",
 ending:"全球SIAI工具行情查询、视频与API成本对比、SASI智能创作、100+在线实用工具，一站式使用。"
};
type Copy={market:string;intro:string;benefits:string[];tools:string;sasi:string;sasiBody:string;search:string;closing:string;ending:string;privacy:string;daily:string;privacyBody:string;dailyBody:string};
const localized:Record<Exclude<LingxiLang,"zh">,Copy>={
 en:{market:"🌍 Global SIAI Rankings | Global SI and AI Tools",intro:"Discover global SI/AI companies, models and tools. Search, filter, compare and check regularly updated official sources.",
 benefits:["Key features, model capabilities and specialties","Free quotas, published prices and plan limits","Regional access, payment methods and commercial licenses","Publisher information, source evidence and updates","Video and short-film generation costs and credits","API token usage estimates and model cost comparison","Filter by category, task, free plans and payment methods"],tools:"🧰 100+ Practical Online Tools",sasi:"✨ SASI Global Multi-Model Creation",sasiBody:"Short dramas, videos, websites, books, learning and research across nine languages, with continuous improvements.",search:"🔍 People also search",closing:"💎 LINGXIFIELD",ending:"Explore SIAI products, compare video and API costs, create with SASI and use 100+ online tools in one place.",privacy:"Privacy tools",daily:"Everyday tools",privacyBody:"Temporary email, burn-after-reading messages, privacy cleanup and file encryption.",dailyBody:"Food calorie recognition, QR codes and more."},
 ja:{market:"🌍 世界のSIAIランキング｜SI・AIツール情報",intro:"世界のSI・AI企業、モデル、ツールを検索・分類・比較。公式情報を継続的に更新します。",
 benefits:["主な機能、モデル性能と得意分野","無料枠、公開料金とプラン制限","利用地域、決済方法と商用ライセンス","企業情報、公式根拠と更新情報","動画・短編制作の費用とクレジット計算","APIトークン費用とモデル比較","分野、用途、無料プラン、決済方法で絞り込み"],tools:"🧰 100種類以上のオンライン実用ツール",sasi:"✨ SASIグローバル・マルチモデル創作",sasiBody:"短編ドラマ、動画、Webサイト、書籍、学習、研究など。9言語に対応し、継続的に改善。",search:"🔍 よく検索される言葉",closing:"💎 LINGXIFIELD",ending:"SIAIツール比較、動画・API費用、SASI創作、100種類以上のツールをひとつに。",privacy:"プライバシー",daily:"日常ツール",privacyBody:"一時メール、自動消去メッセージ、情報整理、暗号化。",dailyBody:"食品カロリー認識、QRコードなど。"},
 ko:{market:"🌍 글로벌 SIAI 순위｜SI·AI 도구 정보",intro:"세계 SI·AI 기업, 모델과 도구를 검색, 분류, 비교하고 공식 정보를 지속적으로 업데이트합니다.",
 benefits:["핵심 기능, 모델 성능과 전문 분야","무료 한도, 공개 가격과 요금제 제한","지원 지역, 결제 수단과 상업용 라이선스","업체 정보, 공식 근거 및 업데이트","영상·숏드라마 비용과 크레딧 계산","API 토큰 비용과 모델별 가격 비교","분야·작업·무료 플랜·결제 방식별 필터"],tools:"🧰 100개 이상의 온라인 실용 도구",sasi:"✨ SASI 글로벌 다중 모델 창작",sasiBody:"숏드라마, 영상, 웹사이트, 책, 학습과 연구를 9개 언어로 지원하며 지속 개선합니다.",search:"🔍 자주 검색하는 항목",closing:"💎 LINGXIFIELD",ending:"SIAI 비교, 영상·API 비용 확인, SASI 창작 및 100개 이상의 온라인 도구를 한곳에서.",privacy:"개인정보 도구",daily:"일상 도구",privacyBody:"임시 이메일, 자동 삭제 메시지, 개인정보 정리와 암호화.",dailyBody:"음식 칼로리 인식, QR 코드 등."},
 fr:{market:"🌍 Classement mondial SIAI｜Outils SI et IA",intro:"Entreprises, modèles et outils SI/IA du monde entier : recherche, filtres, comparaison et sources officielles à jour.",
 benefits:["Fonctions, capacités des modèles et spécialités","Offres gratuites, prix publiés et limites","Pays disponibles, moyens de paiement et licences","Éditeurs, sources officielles et mises à jour","Coûts et crédits des vidéos et courts-métrages","Estimation des tokens API et comparaison des modèles","Filtres par catégorie, tâche, gratuité et paiement"],tools:"🧰 Plus de 100 outils en ligne",sasi:"✨ SASI : création multimodèle mondiale",sasiBody:"Vidéos, courts-métrages, sites, livres, apprentissage et recherche en neuf langues.",search:"🔍 Recherches fréquentes",closing:"💎 LINGXIFIELD",ending:"Comparez les outils SIAI et les coûts vidéo/API, créez avec SASI et utilisez plus de 100 outils.",privacy:"Confidentialité",daily:"Outils du quotidien",privacyBody:"E-mail temporaire, messages éphémères, nettoyage privé et chiffrement.",dailyBody:"Reconnaissance des calories, codes QR et plus."},
 de:{market:"🌍 Globales SIAI-Ranking｜SI- und KI-Tools",intro:"Weltweite SI-/KI-Unternehmen, Modelle und Tools suchen, filtern, vergleichen und anhand offizieller Quellen prüfen.",
 benefits:["Funktionen, Modellfähigkeiten und Stärken","Gratis-Kontingente, Preise und Tarifgrenzen","Regionen, Zahlungsarten und kommerzielle Lizenzen","Hersteller, offizielle Belege und Aktualisierungen","Video- und Kurzfilm-Kosten und Credits","API-Token-Kalkulation und Modellkostenvergleich","Filter nach Bereich, Aufgabe, Gratis-Angebot und Zahlung"],tools:"🧰 Über 100 Online-Werkzeuge",sasi:"✨ SASI: globale Multi-Modell-Kreation",sasiBody:"Kurzdramen, Videos, Websites, Bücher, Lernen und Forschung in neun Sprachen.",search:"🔍 Häufige Suchanfragen",closing:"💎 LINGXIFIELD",ending:"SIAI-Toolvergleiche, Video- und API-Kosten, SASI und über 100 Werkzeuge an einem Ort.",privacy:"Datenschutz",daily:"Alltagswerkzeuge",privacyBody:"Temporäre E-Mail, selbstlöschende Nachrichten, Datenbereinigung und Verschlüsselung.",dailyBody:"Kalorienerkennung, QR-Codes und mehr."},
 es:{market:"🌍 Ranking mundial SIAI｜Herramientas SI e IA",intro:"Empresas, modelos y herramientas SI/IA de todo el mundo: busca, filtra, compara y consulta fuentes oficiales.",
 benefits:["Funciones, capacidades y especialidades de modelos","Cuotas gratis, precios publicados y límites","Regiones, métodos de pago y licencias comerciales","Datos de proveedores, pruebas oficiales y novedades","Costes y créditos de vídeos y cortometrajes","Estimación de tokens API y costes por modelo","Filtros por categoría, tarea, plan gratis y pago"],tools:"🧰 Más de 100 herramientas en línea",sasi:"✨ Creación global multimodelo SASI",sasiBody:"Dramas cortos, vídeos, sitios, libros, aprendizaje e investigación en nueve idiomas.",search:"🔍 También se busca",closing:"💎 LINGXIFIELD",ending:"Consulta SIAI, costes de vídeo/API, creación SASI y más de 100 utilidades en un solo lugar.",privacy:"Privacidad",daily:"Herramientas diarias",privacyBody:"Correo temporal, mensajes autodestructivos, limpieza de datos y cifrado.",dailyBody:"Reconocimiento de calorías, códigos QR y más."},
 pt:{market:"🌍 Ranking global SIAI｜Ferramentas SI e IA",intro:"Empresas, modelos e ferramentas SI/IA do mundo inteiro para pesquisar, filtrar e comparar com fontes oficiais.",
 benefits:["Funções, capacidades e especialidades dos modelos","Limites gratuitos, preços publicados e restrições","Regiões, meios de pagamento e licenças comerciais","Fornecedores, fontes oficiais e atualizações","Custos e créditos de vídeos e curtas-metragens","Estimativa de tokens API e custos por modelo","Filtros por categoria, tarefa, plano grátis e pagamento"],tools:"🧰 Mais de 100 ferramentas online",sasi:"✨ Criação global multimodelo SASI",sasiBody:"Curtas, vídeos, sites, livros, aprendizagem e pesquisa em nove idiomas.",search:"🔍 Pesquisas frequentes",closing:"💎 LINGXIFIELD",ending:"Pesquisa SIAI, custos de vídeo/API, criação SASI e mais de 100 utilitários em um só lugar.",privacy:"Privacidade",daily:"Ferramentas diárias",privacyBody:"E-mail temporário, mensagens autodestrutivas, limpeza privada e criptografia.",dailyBody:"Reconhecimento de calorias, QR codes e mais."},
 ar:{market:"🌍 تصنيف SIAI العالمي｜دليل أدوات SI وAI",intro:"ابحث وقارن شركات ونماذج وأدوات SI وAI حول العالم باستخدام مصادر الناشرين الرسمية المتجددة.",
 benefits:["الوظائف الأساسية وقدرات النماذج والتخصصات","الحدود المجانية والأسعار المعلنة وقيود الباقات","التوافر حسب المنطقة وطرق الدفع والتراخيص","بيانات الشركات والأدلة الرسمية والتحديثات","تكاليف وأرصدة الفيديو والأفلام القصيرة","تقدير رموز API ومقارنة تكاليف النماذج","التصفية حسب المجال والمهمة والخطط المجانية والدفع"],tools:"🧰 أكثر من 100 أداة عملية عبر الإنترنت",sasi:"✨ إبداع SASI العالمي متعدد النماذج",sasiBody:"للفيديو والأفلام القصيرة والمواقع والكتب والتعلم والبحث بتسع لغات.",search:"🔍 عمليات بحث شائعة",closing:"💎 LINGXIFIELD",ending:"مقارنة أدوات SIAI وتكاليف الفيديو وAPI وإبداع SASI وأكثر من 100 أداة في مكان واحد.",privacy:"أدوات الخصوصية",daily:"أدوات يومية",privacyBody:"بريد مؤقت ورسائل ذاتية الإتلاف وتنظيف البيانات والتشفير.",dailyBody:"التعرف على السعرات في الطعام ورموز QR وغيرها."}
};
const TOOL_URLS=["/tools?q=PDF","/tools?q=图片","/tools?q=视频","/tools?q=Excel","/tools?q=临时邮箱","/tools?q=卡路里"] as const;
export default function UnifiedFooterOverview(){
 const {lang}=useLingxiLang();
 const d=lang==="zh"?ZH:localized[lang];
 const toolList:readonly (readonly [string,string])[]=lang==="zh"?ZH.categories:[
 ...FOOTER_CATALOG[lang].slice(0,4).map((v,i)=>[["📄","🖼️","🎬","📊"][i]+" "+v.title,v.body] as const),
 ["🔐 "+localized[lang].privacy,localized[lang].privacyBody],
 ["🍎 "+localized[lang].daily,localized[lang].dailyBody]
 ];
 return <section className="lx-footer-showcase" aria-labelledby="lx-footer-showcase-title" lang={lang==="zh"?"zh-CN":lang} dir={lang==="ar"?"rtl":"ltr"}>
  <div className="lx-footer-market">
   <h2 id="lx-footer-showcase-title"><Link href="/siai">{d.market}</Link></h2>
   <p>{d.intro}</p>
   <ul className="lx-footer-benefits">{d.benefits.map((x,i)=><li key={i}><span aria-hidden="true">🔹</span><span>{x}</span></li>)}</ul>
  </div>
  <div className="lx-footer-showcase-columns">
   <div className="lx-footer-tool-column">
    <h3><Link href="/tools">{d.tools}</Link></h3>
    <div className="lx-footer-tool-cards">{toolList.map(([title,body],i)=><article key={i}>
     <h4><Link href={TOOL_URLS[i]}>{title}</Link></h4><p>{body}</p>
    </article>)}</div>
    <section className="lx-footer-sasi"><h3><Link href="/sasi">{d.sasi}</Link></h3><p>{d.sasiBody}</p></section>
   </div>
   <nav className="lx-footer-search" aria-label={d.search}><h3>{d.search}</h3>
    <ol>{SIAI_DISCOVERY[lang].topics.map((topic,i)=><li key={topic.q}>
     <Link href={"/siai#siai-search-ranking-"+i}><span>{String(i+1).padStart(2,"0")}｜</span>{topic.q}</Link>
    </li>)}</ol>
   </nav>
  </div>
  <section className="lx-footer-end"><h3>{d.closing}</h3><p>{d.ending}</p></section>
 </section>;
}
