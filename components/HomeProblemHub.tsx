"use client";
import {BRAND_PUBLIC_COPY} from "@/lib/brand-public-copy";
import {SiaiSearchDiscovery} from "@/components/SiaiSearchDiscovery";
import {SIAI_DISCOVERY} from "@/lib/siai-search-discovery";
import {PUBLIC_FEATURE_COPY} from "@/lib/public-feature-copy";
import {FOOTER_CATALOG} from "@/lib/footer-catalog-copy";

import {FormEvent,useMemo,useState} from "react";
import Link from "next/link";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import LingxiMiniIcon,{type LingxiIconName} from "@/components/LingxiMiniIcon";
import {isLikelyToolQuery} from "@/lib/tools/search-intents-v44r2.mjs";

type Copy={
 kicker:string;seoTitle:string;seoDesc:string;hero:string;lead:string;placeholder:string;begin:string;startWith:string;
 taskTitle:string;taskLead:string;start:string;why:string;
 finishNow:string;finishNowBody:string;important:string;importantBody:string;
 tools:string;toolsDesc:string;sasi:string;sasiDesc:string;all:string;allDesc:string;
 img:string;video:string;
};

const copy:Record<LingxiLang,Copy>={
 zh:{
  kicker:"灵犀场 LINGXIFIELD｜全球 SIAI 排行榜 · SASI 软件市场 · 100+ 在线工具",
  seoTitle:"灵犀场 LINGXIFIELD｜全球 SIAI 排行榜、SASI 软件市场与 100+ 在线工具",
  seoDesc:"灵犀场全球 SIAI 排行榜比较全球 SI/AI 公司、模型能力、真实价格、免费额度、地区可用性和商用授权；SASI 提供成品软件、MT5 EA、交易指标与源码授权市场；另有 100+ PDF、图片、视频音频、文档和隐私工具。",hero:"全球 AI 工具太多，不知道哪个好用？",
  lead:"全球 SIAI 排行榜比较模型能力、真实价格、免费额度、地区和商用授权；SASI 软件市场浏览成品软件与源码授权，100+ 在线工具处理文件和日常任务。",
  placeholder:"告诉灵犀场：你现在最想解决什么？",begin:"开始处理",startWith:"可以直接从",
  taskTitle:"你现在要完成什么？",taskLead:"选一个任务，就能看到对应工具和下一步操作。",start:"开始",
  why:"不知道从哪开始？按问题直接找答案",finishNow:"PDF 改不了怎么办？图片太大怎么压？",finishNowBody:"按文件类型找到工具：合并 PDF、压缩图片、转换格式、制作字幕或处理表格。上传前看清格式要求，完成后核对结果。",
  important:"AI 太多怎么选？软件怎么发布？",importantBody:"先在全球 SIAI 排行榜比较功能、价格和免费额度；购买软件可查看商品授权与交付规则，开发者可进入卖家服务发布软件。",
  tools:"实用工具",toolsDesc:"PDF、图片、视频、音频、表格和隐私文件，按任务选工具。",
  sasi:"SASI 智能软件市场",sasiDesc:"浏览经过审核的 MT5 EA、量化交易源码、成品软件与源码授权，查看安装教程、版本、价格和自动交付规则。",
  all:"全部入口",allDesc:"不知道从哪里开始时，在这里查看当前真正可以使用的能力。",
  img:"图片工具",video:"视频与音频"
 },
 en:{
  kicker:"LINGXIFIELD | Global SIAI Rankings · SASI Software Marketplace · 100+ Online Tools",
  seoTitle:"LINGXIFIELD | Global SIAI Rankings, SASI Software Marketplace & 100+ Online Tools",
  seoDesc:"Compare global SI/AI companies, model capabilities, prices, free allowances, regional availability and commercial rights. Browse finished software, MT5 EAs, indicators and source licenses in SASI, plus 100+ online tools.",hero:"Too many AI tools. Which one is right for you?",
  lead:"Compare model capabilities, real prices, free allowances, regions and commercial rights in Global SIAI Rankings. Browse finished software and source licenses in SASI, or use 100+ online tools.",
  placeholder:"Tell LINGXIFIELD what you want to solve now.",begin:"Start",startWith:"Start with",
  taskTitle:"What do you want to finish?",taskLead:"You do not need to learn the platform first. Start with the task in front of you.",start:"Open",
  why:"Why start here",finishNow:"Finish the thing in front of you",finishNowBody:"PDFs, images, video, subtitles, tables and private files should not require jumping between apps. Open the right tool and take the finished result.",
  important:"Then move the important work forward",importantBody:"Compare features, prices and free allowances in Global SIAI Rankings. Browse software and delivery terms in SASI, or apply through Seller Services to publish products.",
  tools:"Practical Tools",toolsDesc:"Handle PDFs, images, video, subtitles, tables and private files.",
  sasi:"SASI Intelligent Software Marketplace",sasiDesc:"Browse reviewed MT5 EAs, trading source code, finished software and source licenses, with installation guides, clear pricing and verified delivery.",
  all:"All Entrances",allDesc:"See what is actually available when you are not sure where to begin.",
  img:"Image tools",video:"Video & audio"
 },
 ja:{
  kicker:"LINGXIFIELD｜世界のSIAIランキング・SASIソフトウェア市場・100以上のツール",
  seoTitle:"LINGXIFIELD｜世界のSIAIランキング・SASIソフトウェア市場・オンラインツール",
  seoDesc:"世界のSI/AI企業、モデル性能、価格、無料枠、地域対応、商用利用条件を比較。SASIでは完成ソフト、MT5 EA、取引インジケーター、ソースライセンスを閲覧でき、100以上のオンラインツールも利用できます。",hero:"AIツールが多すぎる。どれを選べばいい？",
  lead:"世界のSIAIランキングでモデル性能、価格、無料枠、地域、商用条件を比較。SASIでソフトウェアとソースライセンスを確認し、100以上のオンラインツールで作業を進めましょう。",
  placeholder:"今いちばん解決したいことを入力してください。",begin:"始める",startWith:"おすすめ",
  taskTitle:"今、何を完成させたいですか？",taskLead:"先にプラットフォームを覚える必要はありません。目の前の作業から始めましょう。",start:"開く",
  why:"ここから始める理由",finishNow:"まず目の前の作業を終える",finishNowBody:"PDF、画像、動画、字幕、表、プライベートファイルを複数のアプリに分ける必要はありません。対応ツールを開き、そのまま結果を受け取れます。",
  important:"次に、大切な仕事を前へ進める",importantBody:"世界のSIAIランキングで機能・価格・無料枠を比較。SASIでソフトウェアの権利と納品条件を確認し、開発者は販売者サービスから出品できます。",
  tools:"実用ツール",toolsDesc:"PDF、画像、動画、字幕、表、ウェブ内容、プライベートファイルを処理します。",
  sasi:"SASIインテリジェントソフトウェア市場",sasiDesc:"審査済みMT5 EA、取引ソースコード、完成ソフトウェア、ソースライセンス、導入ガイドと安全な納品を確認できます。",
  all:"すべての入口",allDesc:"どこから始めるか迷ったら、現在使える機能をここで確認できます。",
  img:"画像ツール",video:"動画・音声"
 },
 ko:{
  kicker:"LINGXIFIELD｜글로벌 SIAI 순위 · SASI 소프트웨어 마켓 · 온라인 도구 100+",
  seoTitle:"LINGXIFIELD｜글로벌 SIAI 순위, SASI 소프트웨어 마켓 및 온라인 도구",
  seoDesc:"글로벌 SI/AI 기업, 모델 성능, 실제 가격, 무료 한도, 지역 지원과 상업적 이용 조건을 비교하세요. SASI에서 완성형 소프트웨어, MT5 EA, 거래 지표와 소스 라이선스를 살펴보고 100개 이상의 온라인 도구를 이용할 수 있습니다.",hero:"AI 도구가 너무 많나요? 어떤 게 맞을까요?",
  lead:"글로벌 SIAI 순위에서 모델 성능, 가격, 무료 한도, 지역과 상업적 권리를 비교하세요. SASI 소프트웨어 마켓과 100개 이상의 온라인 도구도 이용할 수 있습니다.",
  placeholder:"지금 가장 해결하고 싶은 일을 입력하세요.",begin:"시작",startWith:"바로 시작",
  taskTitle:"지금 무엇을 완성하고 싶나요?",taskLead:"플랫폼부터 배울 필요 없습니다. 눈앞의 작업부터 시작하세요.",start:"열기",
  why:"여기서 시작하는 이유",finishNow:"먼저 눈앞의 일을 끝내기",finishNowBody:"PDF, 이미지, 영상, 자막, 표, 개인 파일을 여러 앱 사이에서 옮길 필요가 없습니다. 필요한 도구를 열고 결과를 바로 받으세요.",
  important:"그다음 중요한 일을 계속 진행하기",importantBody:"글로벌 SIAI 순위에서 기능·가격·무료 한도를 비교하세요. SASI에서 소프트웨어 권한과 전달 조건을 확인하고 개발자는 판매자 서비스에서 상품을 등록할 수 있습니다.",
  tools:"실용 도구",toolsDesc:"PDF, 이미지, 영상, 자막, 표와 개인 파일을 처리합니다.",
  sasi:"SASI 지능형 소프트웨어 마켓",sasiDesc:"검토된 MT5 EA, 거래 소스 코드, 완성형 소프트웨어, 소스 라이선스, 설치 안내와 안전한 전달을 확인하세요.",
  all:"전체 입구",allDesc:"어디서 시작할지 모르겠다면 현재 사용할 수 있는 기능을 확인하세요.",
  img:"이미지 도구",video:"영상·오디오"
 },
 fr:{
  kicker:"LINGXIFIELD | Classement SIAI · Marché logiciel SASI · 100+ outils",
  seoTitle:"LINGXIFIELD | Classement SIAI mondial, marché logiciel SASI et outils en ligne",
  seoDesc:"Comparez entreprises SI/IA, capacités des modèles, prix, quotas gratuits, disponibilité régionale et droits commerciaux. SASI propose logiciels, EA MT5, indicateurs et licences source, avec plus de 100 outils en ligne.",hero:"Trop d’outils IA. Lequel choisir ?",
  lead:"Comparez capacités, prix, quotas gratuits, régions et droits commerciaux dans le classement SIAI. Parcourez les logiciels et licences source SASI ou utilisez plus de 100 outils en ligne.",
  placeholder:"Que voulez-vous résoudre maintenant ?",begin:"Commencer",startWith:"Commencer par",
  taskTitle:"Que voulez-vous terminer ?",taskLead:"Pas besoin d’apprendre la plateforme d’abord. Commencez par la tâche devant vous.",start:"Ouvrir",
  why:"Pourquoi commencer ici",finishNow:"Terminer d’abord la tâche immédiate",finishNowBody:"PDF, images, vidéos, sous-titres, tableaux et fichiers privés peuvent être traités sans passer d’une application à l’autre.",
  important:"Puis faire avancer le travail important",importantBody:"Comparez fonctions, prix et quotas gratuits dans le classement SIAI. Consultez les licences et la livraison sur SASI ; les développeurs peuvent publier via les services vendeurs.",
  tools:"Outils pratiques",toolsDesc:"Traitez PDF, images, vidéo, sous-titres, tableaux et fichiers privés.",
  sasi:"Marché de logiciels intelligents SASI",sasiDesc:"Découvrez les EA MT5 vérifiés, codes sources de trading, logiciels finis, licences, guides d’installation et livraison sécurisée.",
  all:"Tous les accès",allDesc:"Voyez les capacités réellement disponibles si vous ne savez pas par où commencer.",
  img:"Outils image",video:"Vidéo et audio"
 },
 de:{
  kicker:"LINGXIFIELD | Globales SIAI-Ranking · SASI-Softwaremarkt · 100+ Tools",
  seoTitle:"LINGXIFIELD | Globales SIAI-Ranking, SASI-Softwaremarkt und Online-Tools",
  seoDesc:"Vergleiche SI/KI-Unternehmen, Modellfähigkeiten, Preise, Gratis-Kontingente, regionale Verfügbarkeit und kommerzielle Rechte. SASI bietet fertige Software, MT5-EAs, Indikatoren und Quellcode-Lizenzen sowie über 100 Online-Tools.",hero:"Zu viele KI-Tools. Welches passt zu dir?",
  lead:"Vergleiche Modellfähigkeiten, Preise, Gratis-Kontingente, Regionen und kommerzielle Rechte im globalen SIAI-Ranking. Entdecke SASI-Software und Quellcode-Lizenzen sowie über 100 Online-Tools.",
  placeholder:"Was möchten Sie jetzt lösen?",begin:"Starten",startWith:"Direkt starten mit",
  taskTitle:"Was möchten Sie fertigstellen?",taskLead:"Sie müssen die Plattform nicht zuerst lernen. Beginnen Sie mit der aktuellen Aufgabe.",start:"Öffnen",
  why:"Warum hier beginnen",finishNow:"Zuerst die aktuelle Aufgabe erledigen",finishNowBody:"PDFs, Bilder, Videos, Untertitel, Tabellen und private Dateien lassen sich ohne ständigen App-Wechsel bearbeiten.",
  important:"Dann wichtige Arbeit weiterführen",importantBody:"Vergleiche Funktionen, Preise und Gratis-Kontingente im SIAI-Ranking. Prüfe Softwarelizenzen und Lieferung bei SASI; Entwickler können Produkte über den Verkäuferbereich veröffentlichen.",
  tools:"Praktische Werkzeuge",toolsDesc:"PDFs, Bilder, Video, Untertitel, Tabellen und private Dateien bearbeiten.",
  sasi:"SASI-Markt für intelligente Software",sasiDesc:"Entdecke geprüfte MT5-EAs, Trading-Quellcode, fertige Software, Quellcode-Lizenzen, Installationsanleitungen und sichere Lieferung.",
  all:"Alle Einstiege",allDesc:"Sehen Sie die aktuell verfügbaren Funktionen, wenn Sie nicht wissen, wo Sie anfangen sollen.",
  img:"Bildwerkzeuge",video:"Video & Audio"
 },
 es:{
  kicker:"LINGXIFIELD | Ranking SIAI global · Mercado SASI · Más de 100 herramientas",
  seoTitle:"LINGXIFIELD | Ranking SIAI global, mercado de software SASI y herramientas online",
  seoDesc:"Compara empresas SI/IA, capacidades de modelos, precios, límites gratuitos, disponibilidad regional y derechos comerciales. SASI ofrece software terminado, EA de MT5, indicadores y licencias de código fuente, además de más de 100 herramientas.",hero:"¿Demasiadas herramientas de IA? ¿Cuál elegir?",
  lead:"Compara capacidades, precios, límites gratuitos, regiones y derechos comerciales en el ranking SIAI. Explora software y licencias SASI o utiliza más de 100 herramientas online.",
  placeholder:"¿Qué quieres resolver ahora?",begin:"Empezar",startWith:"Empieza con",
  taskTitle:"¿Qué quieres terminar?",taskLead:"No necesitas aprender la plataforma primero. Empieza por la tarea que tienes delante.",start:"Abrir",
  why:"Por qué empezar aquí",finishNow:"Resuelve primero la tarea inmediata",finishNowBody:"PDF, imágenes, vídeo, subtítulos, tablas y archivos privados sin saltar entre múltiples aplicaciones.",
  important:"Después, lleva adelante el trabajo importante",importantBody:"Compara funciones, precios y límites gratuitos en el ranking SIAI. Consulta licencias y entrega en SASI; los desarrolladores pueden publicar desde los servicios para vendedores.",
  tools:"Herramientas prácticas",toolsDesc:"Procesa PDF, imágenes, vídeo, subtítulos, tablas y archivos privados.",
  sasi:"Mercado de software inteligente SASI",sasiDesc:"Explora EA de MT5 revisados, código fuente de trading, software terminado, licencias, guías de instalación y entrega segura.",
  all:"Todos los accesos",allDesc:"Consulta las capacidades disponibles si no sabes por dónde empezar.",
  img:"Herramientas de imagen",video:"Vídeo y audio"
 },
 pt:{
  kicker:"LINGXIFIELD | Ranking SIAI global · Mercado SASI · Mais de 100 ferramentas",
  seoTitle:"LINGXIFIELD | Ranking SIAI global, mercado SASI e ferramentas online",
  seoDesc:"Compare empresas SI/IA, capacidades dos modelos, preços, limites gratuitos, disponibilidade regional e direitos comerciais. O SASI reúne software pronto, EAs MT5, indicadores e licenças de código-fonte, além de mais de 100 ferramentas online.",hero:"Muitas ferramentas de IA. Qual escolher?",
  lead:"Compare capacidades, preços, limites gratuitos, regiões e direitos comerciais no ranking SIAI. Explore software e licenças SASI ou utilize mais de 100 ferramentas online.",
  placeholder:"O que você quer resolver agora?",begin:"Começar",startWith:"Comece por",
  taskTitle:"O que você quer concluir?",taskLead:"Você não precisa aprender a plataforma primeiro. Comece pela tarefa à sua frente.",start:"Abrir",
  why:"Por que começar aqui",finishNow:"Resolva primeiro a tarefa imediata",finishNowBody:"PDFs, imagens, vídeos, legendas, tabelas e arquivos privados sem ficar alternando entre aplicativos.",
  important:"Depois, avance o trabalho importante",importantBody:"Compare recursos, preços e limites gratuitos no ranking SIAI. Consulte licenças e entrega no SASI; desenvolvedores podem publicar produtos pelos serviços de vendedor.",
  tools:"Ferramentas práticas",toolsDesc:"Processe PDFs, imagens, vídeo, legendas, tabelas e arquivos privados.",
  sasi:"Mercado de software inteligente SASI",sasiDesc:"Explore EAs MT5 revisados, código-fonte de trading, software pronto, licenças, guias de instalação e entrega segura.",
  all:"Todos os acessos",allDesc:"Veja o que está realmente disponível se não souber por onde começar.",
  img:"Ferramentas de imagem",video:"Vídeo e áudio"
 },
 ar:{
  kicker:"LINGXIFIELD | تصنيف SIAI العالمي · سوق برامج SASI · أكثر من 100 أداة",
  seoTitle:"LINGXIFIELD | تصنيف SIAI العالمي وسوق برامج SASI والأدوات عبر الإنترنت",
  seoDesc:"قارن شركات SI/AI وقدرات النماذج والأسعار والحصص المجانية والتوفر الإقليمي وحقوق الاستخدام التجاري. يوفر SASI برامج جاهزة ومستشاري MT5 ومؤشرات وتراخيص شيفرة مصدرية، إضافة إلى أكثر من 100 أداة عبر الإنترنت.",hero:"أدوات الذكاء الاصطناعي كثيرة، فأيها يناسبك؟",
  lead:"قارن قدرات النماذج والأسعار والحصص المجانية والمناطق والحقوق التجارية في تصنيف SIAI العالمي. استعرض برامج SASI وتراخيص المصدر واستخدم أكثر من 100 أداة.",
  placeholder:"ما الذي تريد حله الآن؟",begin:"ابدأ",startWith:"ابدأ من",
  taskTitle:"ما الذي تريد إنجازه الآن؟",taskLead:"لا تحتاج إلى تعلّم المنصة أولًا. ابدأ بالمهمة التي أمامك.",start:"فتح",
  why:"لماذا تبدأ من هنا",finishNow:"أنهِ المهمة الحالية أولًا",finishNowBody:"تعامل مع PDF والصور والفيديو والترجمة والجداول والملفات الخاصة دون التنقل بين عدة تطبيقات.",
  important:"ثم واصل العمل المهم",importantBody:"قارن الوظائف والأسعار والحصص المجانية في تصنيف SIAI. راجع تراخيص البرامج والتسليم في SASI، ويمكن للمطورين نشر منتجاتهم عبر خدمات البائعين.",
  tools:"أدوات عملية",toolsDesc:"عالج PDF والصور والفيديو والترجمة والجداول والملفات الخاصة.",
  sasi:"سوق برامج SASI الذكية",sasiDesc:"استعرض مستشاري MT5 المعتمدين وشيفرات التداول والبرامج الجاهزة وتراخيص المصدر وأدلة التثبيت والتسليم الآمن.",
  all:"كل المداخل",allDesc:"اطّلع على الإمكانات المتاحة فعليًا عندما لا تعرف من أين تبدأ.",
  img:"أدوات الصور",video:"الفيديو والصوت"
 }
};

const SIAI_HOME_ENTRY:Record<LingxiLang,{title:string;description:string;cta:string}>={
 zh:{title:"全球 SIAI 发现",description:"想写文章、做视频还是编程？按任务比较模型能力、价格、免费额度和地区，找到能完成任务的 AI。",cta:"探索全球 SIAI 排行榜"},
 en:{title:"Global SIAI Rankings",description:"Compare AI companies, models and tools by tasks, pricing, free plans and regional access",cta:"Compare AI tools"},
 ja:{title:"世界の SIAI ランキング",description:"世界のAI企業・モデル・ツールの機能、価格、無料枠、利用地域を比較",cta:"AIツールを比較"},
 ko:{title:"글로벌 SIAI 순위",description:"글로벌 AI 기업, 모델 및 도구의 기능, 가격, 무료 한도, 지원 지역 비교",cta:"AI 도구 비교"},
 fr:{title:"Classement mondial SIAI",description:"Comparez entreprises, modèles et outils IA : fonctions, tarifs, offres gratuites et régions",cta:"Comparer les outils IA"},
 de:{title:"Globales SIAI-Ranking",description:"KI-Anbieter, Modelle und Tools nach Funktionen, Preisen, Gratis-Angeboten und Regionen vergleichen",cta:"KI-Tools vergleichen"},
 es:{title:"Ranking mundial SIAI",description:"Compara empresas, modelos y herramientas IA: funciones, precios, planes gratis y regiones",cta:"Comparar herramientas IA"},
 pt:{title:"Ranking global SIAI",description:"Compare empresas, modelos e ferramentas IA: recursos, preços, opções grátis e regiões",cta:"Comparar ferramentas IA"},
 ar:{title:"تصنيف SIAI العالمي",description:"قارن شركات ونماذج وأدوات الذكاء الاصطناعي حسب الوظائف والأسعار والحصص المجانية والمناطق",cta:"قارن أدوات الذكاء الاصطناعي"},
};

const TOOL_CATEGORY_LABEL:Record<LingxiLang,string>={
 zh:"展开查看：PDF · 图片 · 视频 · 音频 · 文件表格 · 隐私工具",
 en:"Explore PDF, images, video, audio, spreadsheets and privacy tools",
 ja:"PDF・画像・動画・音声・表計算・プライバシーツールを表示",
 ko:"PDF·이미지·영상·오디오·표·개인정보 보호 도구 보기",
 fr:"Voir les outils PDF, image, vidéo, audio, tableurs et confidentialité",
 de:"PDF-, Bild-, Video-, Audio-, Tabellen- und Datenschutztools anzeigen",
 es:"Ver herramientas de PDF, imagen, vídeo, audio, hojas de cálculo y privacidad",
 pt:"Ver ferramentas de PDF, imagem, vídeo, áudio, planilhas e privacidade",
 ar:"عرض أدوات PDF والصور والفيديو والصوت والجداول والخصوصية",
};

export default function HomeProblemHub(){
 const{lang}=useLingxiLang();const c=copy[lang]??copy.en;const market=SIAI_HOME_ENTRY[lang]??SIAI_HOME_ENTRY.en;
 const[q,setQ]=useState("");
 const intents=useMemo(()=>[
   {words:["ai视频","视频生成","文生视频","图生视频"],href:"/siai",label:market.title},
   {words:["pdf","图片","视频","音频","字幕","文件","压缩","ocr","表格"],href:"/tools",label:c.tools},
   {words:["ai","模型","排行榜","免费额度","api","价格","模型能力"],href:"/siai",label:market.title},
   {words:["ea","mt5","源码","软件","授权","成品","商品","市场"],href:"/sasi",label:c.sasi},
   {words:["开发者","卖家","发布","上架","商品审核"],href:"/sasi/seller",label:lang==="zh"?"卖家服务":"Seller services"},
  ],[c,market.title,lang]);
 const hit=useMemo(()=>{const s=q.toLowerCase().replace(/\s+/g,"");return intents.map(x=>({...x,score:x.words.filter(w=>s.includes(w)).length})).sort((a,b)=>b.score-a.score)[0]},[q,intents]);
 const cards=[
  {href:"/siai",icon:"products" as LingxiIconName,title:market.title,desc:market.description},
  {href:"/sasi",icon:"sasi" as LingxiIconName,title:c.sasi,desc:c.sasiDesc},
  {href:"/tools",icon:"tools" as LingxiIconName,title:c.tools,desc:c.toolsDesc},
 ];
 function submit(e:FormEvent){e.preventDefault();const v=q.trim();if(!v)return;const normalized=v.toLowerCase().replace(/\s+/g,"");if(/(?:ai视频|视频生成|文生视频|图生视频|aivideo|texttovideo|imagetovideo)/i.test(normalized)){const url=new URL("/siai",location.origin);url.searchParams.set("q",v);url.searchParams.set("lang",lang);location.href=url.pathname+url.search;return}if(isLikelyToolQuery(v)){location.href=`/tools?q=${encodeURIComponent(v)}&lang=${lang}`;return}const url=new URL(hit?.score>0?hit.href:'/sasi',location.origin);url.searchParams.set('intent',v);url.searchParams.set('lang',lang);location.href=url.pathname+url.search;}
 return <main className="lx11-page"><div className="lx11-wrap">
  <section className="lx11-home-hero lx-home-v143 overflow-hidden">
   <div className="grid items-center gap-8 ">
    <div>
     <p className="lx-v37-brand-title">{BRAND_PUBLIC_COPY[lang].title}</p>
     <h1>{c.hero}</h1>
     <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--lx-muted)]">{c.lead}</p>
     <p className="lx-v37-brand-desc"><strong>{PUBLIC_FEATURE_COPY[lang].headline}</strong></p>
     <p className="lx-v37-brand-desc"><strong>{PUBLIC_FEATURE_COPY[lang].freeTools}</strong></p>
     <Link href="/siai" data-testid="home-global-siai-entry" className="mt-4 flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-300 bg-blue-50 px-5 py-4 text-blue-950 shadow-sm transition-shadow hover:border-blue-500 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
      <span className="min-w-0 flex-1"><strong className="block text-base font-bold">{market.title}</strong><span className="mt-1 block text-xs leading-5">{SIAI_DISCOVERY[lang].hero}</span><small className="mt-1 block text-sm leading-6">{market.description}</small></span>
      <span className="shrink-0 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white">{market.cta} →</span>
     </Link>
     <details className="mt-4 rounded-xl border border-[var(--lx-border)] p-3" data-home-tool-catalog>
      <summary className="cursor-pointer font-medium text-[var(--lx-ink)]">{TOOL_CATEGORY_LABEL[lang]}</summary>
      <div className="mt-3 grid gap-1 text-sm leading-6 text-[var(--lx-muted)]">
       {FOOTER_CATALOG[lang].map(category=><p key={category.title}><strong className="text-[var(--lx-ink)]">{category.title}：</strong>{category.body}</p>)}
      </div>
     </details>
     <p className="mt-3 text-sm leading-6 text-[var(--lx-muted)]">{lang==="zh"?"SASI 现为智能软件市场；按商品说明提供源码授权、开发者发布和安全交付。付款前展示费用与可用支付方式。":"SASI is now a software marketplace for developer products and source licenses. Prices and available payment methods appear before payment confirmation."}</p>
     <p className="mt-1 text-xs text-[var(--lx-muted)]">lingxifield.com · lingxifield.cn</p>
     <form onSubmit={submit} className="lx11-prompt" data-testid="home-task-search"><textarea value={q} onChange={e=>setQ(e.target.value)} rows={2} aria-label={c.placeholder} placeholder={c.placeholder}/><button>{c.begin}</button></form>
     {q.trim()&&hit?.score>0&&<div className="lx11-suggestion"><span>{c.startWith}</span><Link href={hit.href}>{hit.label}</Link></div>}
    </div>
   </div>
  </section>
  <section className="lx11-home-section"><div className="lx11-section-heading"><div><span>01</span><h2>{c.taskTitle}</h2></div><p>{c.taskLead}</p></div>
   <div className="lx11-home-grid lx-home-v143-grid">{cards.map((item,i)=><Link href={item.href} key={item.href} className={`lx11-home-card lx-v143-card tone-${(i%6)+1}`}><LingxiMiniIcon name={item.icon} size="card" className="lx-v143-icon"/><h3>{item.title}</h3><p>{item.desc}</p><b>{c.start} →</b></Link>)}</div>
  </section>
  <SiaiSearchDiscovery variant="home"/>
  <section className="lx11-home-section lx-v143-about"><div className="lx11-section-heading"><div><span>02</span><h2>{c.why}</h2></div></div><div className="lx-v143-about-grid">
   <article><LingxiMiniIcon name="tools" size="card" className="lx-v143-icon"/><h3>{c.finishNow}</h3><p>{c.finishNowBody}</p></article>
   <article><LingxiMiniIcon name="sasi" size="card" className="lx-v143-icon"/><h3>{c.important}</h3><p>{c.importantBody}</p></article>
  </div></section>
 </div></main>
}
