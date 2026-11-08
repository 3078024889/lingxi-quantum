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
 tools:string;toolsDesc:string;sasi:string;sasiDesc:string;book:string;bookDesc:string;
 learning:string;learningDesc:string;research:string;researchDesc:string;all:string;allDesc:string;
 img:string;video:string;
};

const copy:Record<LingxiLang,Copy>={
 zh:{
  kicker:"灵犀场 LINGXIFIELD｜全球 SIAI 排行榜 · SASI 智能创作 · 免费在线实用工具",
  seoTitle:"灵犀场 LINGXIFIELD｜全球AI工具排行榜、SASI创作与在线实用工具",
  seoDesc:"全球AI工具太多，不知道哪个好用？灵犀场全球SIAI排行榜帮助比较AI公司、模型、功能、价格、免费额度、地区可用性和使用条件。SASI软件市场支持开发者发布与源码授权，另有100+在线实用工具。",hero:"全球 AI 工具太多，不知道哪个好用？",
  lead:"灵犀场全球 SIAI 排行榜帮你找答案。汇聚全球 AI 公司、模型与工具，比较能做什么、真实价格、免费额度、地区和使用体验。少花钱、少踩坑，找到适合自己任务的智能 SI 或 AI 伙伴。",
  placeholder:"告诉灵犀场：你现在最想解决什么？",begin:"开始处理",startWith:"可以直接从",
  taskTitle:"你现在要完成什么？",taskLead:"选一个任务，就能看到对应工具和下一步操作。",start:"开始",
  why:"不知道从哪开始？按问题直接找答案",finishNow:"PDF 改不了怎么办？图片太大怎么压？",finishNowBody:"按文件类型找到工具：合并 PDF、压缩图片、转换格式、制作字幕或处理表格。上传前看清格式要求，完成后核对结果。",
  important:"AI 太多怎么选？软件怎么发布？",importantBody:"先到全球 SIAI 排行榜比较工具的功能、价格与免费额度；发布软件可进入 SASI 开发者工作台，浏览软件可查看授权与交付说明。",
  tools:"实用工具",toolsDesc:"PDF、图片、视频、音频、表格和隐私文件，按任务选工具。",
  sasi:"SASI 智能软件",sasiDesc:"浏览源码软件与开发者作品，核验授权及安全交付。",
  book:"书本 SASI",bookDesc:"让一本书、一篇论文或一组资料变成可以持续追问、引用和回看的智能体。",
  learning:"学习 SASI",learningDesc:"把教材和笔记整理成真正能复习、追问并回到原文的学习空间。",
  research:"科研 SASI",researchDesc:"让问题、证据、比较和结论留在同一条研究脉络里。",
  all:"全部入口",allDesc:"不知道从哪里开始时，在这里查看当前真正可以使用的能力。",
  img:"图片工具",video:"视频与音频"
 },
 en:{
  kicker:"LINGXIFIELD",
  seoTitle:"LINGXIFIELD | PDF, images and practical tools",
  seoDesc:"Work with PDFs, images, video and text. Organize sources and ask questions about them. Processing details and prices are shown before use.",hero:"Too many AI tools. Which one is right for you?",
  lead:"Find the answer in Global SIAI Rankings. Compare features, costs, free plans and availability, then create with SASI or use practical tools.",
  placeholder:"Tell LINGXIFIELD what you want to solve now.",begin:"Start",startWith:"Start with",
  taskTitle:"What do you want to finish?",taskLead:"You do not need to learn the platform first. Start with the task in front of you.",start:"Open",
  why:"Why start here",finishNow:"Finish the thing in front of you",finishNowBody:"PDFs, images, video, subtitles, tables and private files should not require jumping between apps. Open the right tool and take the finished result.",
  important:"Then move the important work forward",importantBody:"Organize sources, find passages, ask questions and continue studying.",
  tools:"Practical Tools",toolsDesc:"Handle PDFs, images, video, subtitles, tables and private files.",
  sasi:"SASI Software",sasiDesc:"Browse source software, developer listings and verified delivery.",
  book:"Book SASI",bookDesc:"Turn books, papers and sources into an intelligence you can keep questioning and citing.",
  learning:"Learning SASI",learningDesc:"Turn study material into a space you can review, question and trace back to sources.",
  research:"Research SASI",researchDesc:"Keep questions, evidence, comparison and conclusions in one research thread.",
  all:"All Entrances",allDesc:"See what is actually available when you are not sure where to begin.",
  img:"Image tools",video:"Video & audio"
 },
 ja:{
  kicker:"LINGXIFIELD",
  seoTitle:"LINGXIFIELD｜PDF・画像・実用ツール",
  seoDesc:"PDF・画像・動画・テキストを扱い、資料を整理して原文について質問できます。処理方法と料金は利用前に確認できます。",hero:"AIツールが多すぎる。どれを選べばいい？",
  lead:"世界のSIAIランキングで機能・価格・無料枠・地域を比較し、SASIや便利なオンラインツールを使い始めましょう。",
  placeholder:"今いちばん解決したいことを入力してください。",begin:"始める",startWith:"おすすめ",
  taskTitle:"今、何を完成させたいですか？",taskLead:"先にプラットフォームを覚える必要はありません。目の前の作業から始めましょう。",start:"開く",
  why:"ここから始める理由",finishNow:"まず目の前の作業を終える",finishNowBody:"PDF、画像、動画、字幕、表、プライベートファイルを複数のアプリに分ける必要はありません。対応ツールを開き、そのまま結果を受け取れます。",
  important:"次に、大切な仕事を前へ進める",importantBody:"資料を整理し、原文を確認して質問や学習を続けられます。",
  tools:"実用ツール",toolsDesc:"PDF、画像、動画、字幕、表、ウェブ内容、プライベートファイルを処理します。",
  sasi:"SASI ソフトウェア",sasiDesc:"ソフトウェアとソースライセンス、安全な納品を確認。",
  book:"Book SASI",bookDesc:"本、論文、資料を、継続して質問・引用できる知的エージェントへ。",
  learning:"学習 SASI",learningDesc:"教材とノートを、復習・質問・原文確認ができる学習空間へ。",
  research:"研究 SASI",researchDesc:"問い、証拠、比較、結論を一つの研究の流れに保ちます。",
  all:"すべての入口",allDesc:"どこから始めるか迷ったら、現在使える機能をここで確認できます。",
  img:"画像ツール",video:"動画・音声"
 },
 ko:{
  kicker:"LINGXIFIELD",
  seoTitle:"LINGXIFIELD | PDF·이미지·실용 도구",
  seoDesc:"PDF·이미지·영상·텍스트를 처리하고 자료를 정리해 원문에 대해 질문하세요. 처리 방식과 요금은 사용 전에 확인할 수 있습니다.",hero:"AI 도구가 너무 많나요? 어떤 게 맞을까요?",
  lead:"글로벌 SIAI 순위에서 기능, 가격, 무료 한도, 지역을 비교하고 SASI 창작이나 온라인 도구를 바로 시작하세요.",
  placeholder:"지금 가장 해결하고 싶은 일을 입력하세요.",begin:"시작",startWith:"바로 시작",
  taskTitle:"지금 무엇을 완성하고 싶나요?",taskLead:"플랫폼부터 배울 필요 없습니다. 눈앞의 작업부터 시작하세요.",start:"열기",
  why:"여기서 시작하는 이유",finishNow:"먼저 눈앞의 일을 끝내기",finishNowBody:"PDF, 이미지, 영상, 자막, 표, 개인 파일을 여러 앱 사이에서 옮길 필요가 없습니다. 필요한 도구를 열고 결과를 바로 받으세요.",
  important:"그다음 중요한 일을 계속 진행하기",importantBody:"자료를 정리하고 원문을 확인하며 질문과 학습을 이어가세요.",
  tools:"실용 도구",toolsDesc:"PDF, 이미지, 영상, 자막, 표와 개인 파일을 처리합니다.",
  sasi:"SASI 소프트웨어",sasiDesc:"소스 라이선스와 개발자 소프트웨어, 안전한 전달을 확인하세요.",
  book:"Book SASI",bookDesc:"책, 논문, 자료를 계속 질문하고 인용할 수 있는 지능형 에이전트로 바꿉니다.",
  learning:"학습 SASI",learningDesc:"교재와 노트를 복습하고 질문하며 원문으로 돌아갈 수 있는 학습 공간으로 만듭니다.",
  research:"연구 SASI",researchDesc:"질문, 근거, 비교, 결론을 하나의 연구 흐름에 유지합니다.",
  all:"전체 입구",allDesc:"어디서 시작할지 모르겠다면 현재 사용할 수 있는 기능을 확인하세요.",
  img:"이미지 도구",video:"영상·오디오"
 },
 fr:{
  kicker:"LINGXIFIELD",
  seoTitle:"LINGXIFIELD | PDF, images et outils pratiques",
  seoDesc:"Traitez PDF, images, vidéos et textes. Organisez vos sources et posez des questions à leur sujet. Les modalités et tarifs sont indiqués avant utilisation.",hero:"Trop d’outils IA. Lequel choisir ?",
  lead:"Le classement mondial SIAI compare fonctions, prix, offres gratuites et régions. Créez ensuite avec SASI ou utilisez nos outils.",
  placeholder:"Que voulez-vous résoudre maintenant ?",begin:"Commencer",startWith:"Commencer par",
  taskTitle:"Que voulez-vous terminer ?",taskLead:"Pas besoin d’apprendre la plateforme d’abord. Commencez par la tâche devant vous.",start:"Ouvrir",
  why:"Pourquoi commencer ici",finishNow:"Terminer d’abord la tâche immédiate",finishNowBody:"PDF, images, vidéos, sous-titres, tableaux et fichiers privés peuvent être traités sans passer d’une application à l’autre.",
  important:"Puis faire avancer le travail important",importantBody:"Organisez vos sources, retrouvez les passages, posez des questions et poursuivez votre étude.",
  tools:"Outils pratiques",toolsDesc:"Traitez PDF, images, vidéo, sous-titres, tableaux et fichiers privés.",
  sasi:"Logiciels SASI",sasiDesc:"Découvrez les logiciels, les licences source et la livraison vérifiée.",
  book:"Book SASI",bookDesc:"Transformez livres, articles et sources en intelligence interrogeable et traçable.",
  learning:"SASI Études",learningDesc:"Transformez vos supports en espace de révision, de questions et de retour aux sources.",
  research:"SASI Recherche",researchDesc:"Gardez questions, preuves, comparaisons et conclusions dans un même fil de recherche.",
  all:"Tous les accès",allDesc:"Voyez les capacités réellement disponibles si vous ne savez pas par où commencer.",
  img:"Outils image",video:"Vidéo et audio"
 },
 de:{
  kicker:"LINGXIFIELD",
  seoTitle:"LINGXIFIELD | PDF, Bilder und praktische Tools",
  seoDesc:"Bearbeite PDFs, Bilder, Videos und Texte. Ordne Quellen und stelle Fragen dazu. Verarbeitung und Preise werden vor der Nutzung angezeigt.",hero:"Zu viele KI-Tools. Welches passt zu dir?",
  lead:"Im globalen SIAI-Ranking Funktionen, Kosten, Gratis-Angebote und Regionen vergleichen, dann mit SASI oder Online-Tools starten.",
  placeholder:"Was möchten Sie jetzt lösen?",begin:"Starten",startWith:"Direkt starten mit",
  taskTitle:"Was möchten Sie fertigstellen?",taskLead:"Sie müssen die Plattform nicht zuerst lernen. Beginnen Sie mit der aktuellen Aufgabe.",start:"Öffnen",
  why:"Warum hier beginnen",finishNow:"Zuerst die aktuelle Aufgabe erledigen",finishNowBody:"PDFs, Bilder, Videos, Untertitel, Tabellen und private Dateien lassen sich ohne ständigen App-Wechsel bearbeiten.",
  important:"Dann wichtige Arbeit weiterführen",importantBody:"Ordne Quellen, finde Textstellen, stelle Fragen und lerne weiter.",
  tools:"Praktische Werkzeuge",toolsDesc:"PDFs, Bilder, Video, Untertitel, Tabellen und private Dateien bearbeiten.",
  sasi:"SASI Software",sasiDesc:"Entdecken Sie Software, Quellcode-Lizenzen und geprüfte Lieferung.",
  book:"Book SASI",bookDesc:"Bücher, Papers und Quellen in eine weiter befragbare und zitierbare Intelligenz verwandeln.",
  learning:"Lern-SASI",learningDesc:"Lernmaterial in einen Raum für Wiederholung, Fragen und Quellenrückgriff verwandeln.",
  research:"Forschungs-SASI",researchDesc:"Fragen, Belege, Vergleiche und Schlussfolgerungen in einem Forschungsfaden halten.",
  all:"Alle Einstiege",allDesc:"Sehen Sie die aktuell verfügbaren Funktionen, wenn Sie nicht wissen, wo Sie anfangen sollen.",
  img:"Bildwerkzeuge",video:"Video & Audio"
 },
 es:{
  kicker:"LINGXIFIELD",
  seoTitle:"LINGXIFIELD | PDF, imágenes y herramientas",
  seoDesc:"Trabaja con PDF, imágenes, vídeos y textos. Organiza fuentes y haz preguntas sobre ellas. El tratamiento y los precios se indican antes del uso.",hero:"¿Demasiadas herramientas de IA? ¿Cuál elegir?",
  lead:"Compara funciones, precios, opciones gratis y regiones en el ranking mundial SIAI. Después crea con SASI o usa herramientas prácticas.",
  placeholder:"¿Qué quieres resolver ahora?",begin:"Empezar",startWith:"Empieza con",
  taskTitle:"¿Qué quieres terminar?",taskLead:"No necesitas aprender la plataforma primero. Empieza por la tarea que tienes delante.",start:"Abrir",
  why:"Por qué empezar aquí",finishNow:"Resuelve primero la tarea inmediata",finishNowBody:"PDF, imágenes, vídeo, subtítulos, tablas y archivos privados sin saltar entre múltiples aplicaciones.",
  important:"Después, lleva adelante el trabajo importante",importantBody:"Organiza fuentes, busca pasajes, haz preguntas y sigue estudiando.",
  tools:"Herramientas prácticas",toolsDesc:"Procesa PDF, imágenes, vídeo, subtítulos, tablas y archivos privados.",
  sasi:"Software SASI",sasiDesc:"Explora software, licencias de código fuente y entrega verificada.",
  book:"Book SASI",bookDesc:"Convierte libros, artículos y fuentes en una inteligencia que puedas consultar y citar.",
  learning:"SASI Aprendizaje",learningDesc:"Convierte materiales de estudio en un espacio para repasar, preguntar y volver a las fuentes.",
  research:"SASI Investigación",researchDesc:"Mantén preguntas, evidencia, comparación y conclusiones en un mismo hilo.",
  all:"Todos los accesos",allDesc:"Consulta las capacidades disponibles si no sabes por dónde empezar.",
  img:"Herramientas de imagen",video:"Vídeo y audio"
 },
 pt:{
  kicker:"LINGXIFIELD",
  seoTitle:"LINGXIFIELD | PDF, imagens e ferramentas",
  seoDesc:"Trabalhe com PDF, imagens, vídeos e textos. Organize fontes e faça perguntas sobre elas. O processamento e os preços são informados antes do uso.",hero:"Muitas ferramentas de IA. Qual escolher?",
  lead:"Compare recursos, preços, opções grátis e regiões no ranking global SIAI. Depois crie com SASI ou use ferramentas práticas.",
  placeholder:"O que você quer resolver agora?",begin:"Começar",startWith:"Comece por",
  taskTitle:"O que você quer concluir?",taskLead:"Você não precisa aprender a plataforma primeiro. Comece pela tarefa à sua frente.",start:"Abrir",
  why:"Por que começar aqui",finishNow:"Resolva primeiro a tarefa imediata",finishNowBody:"PDFs, imagens, vídeos, legendas, tabelas e arquivos privados sem ficar alternando entre aplicativos.",
  important:"Depois, avance o trabalho importante",importantBody:"Organize fontes, encontre trechos, faça perguntas e continue estudando.",
  tools:"Ferramentas práticas",toolsDesc:"Processe PDFs, imagens, vídeo, legendas, tabelas e arquivos privados.",
  sasi:"Software SASI",sasiDesc:"Explore softwares, licenças de código-fonte e entrega verificada.",
  book:"Book SASI",bookDesc:"Transforme livros, artigos e fontes em uma inteligência que você possa consultar e citar.",
  learning:"SASI Aprendizagem",learningDesc:"Transforme materiais de estudo em espaço para revisar, perguntar e voltar às fontes.",
  research:"SASI Pesquisa",researchDesc:"Mantenha perguntas, evidências, comparações e conclusões no mesmo fluxo.",
  all:"Todos os acessos",allDesc:"Veja o que está realmente disponível se não souber por onde começar.",
  img:"Ferramentas de imagem",video:"Vídeo e áudio"
 },
 ar:{
  kicker:"LINGXIFIELD",
  seoTitle:"LINGXIFIELD | أدوات PDF والصور",
  seoDesc:"عالج ملفات PDF والصور والفيديو والنصوص، ونظّم المصادر واطرح أسئلة عنها. تُعرض طريقة المعالجة والأسعار قبل الاستخدام.",hero:"أدوات الذكاء الاصطناعي كثيرة، فأيها يناسبك؟",
  lead:"قارن الوظائف والأسعار والخيارات المجانية والمناطق في تصنيف SIAI العالمي، ثم أنشئ مع SASI أو استخدم الأدوات العملية.",
  placeholder:"ما الذي تريد حله الآن؟",begin:"ابدأ",startWith:"ابدأ من",
  taskTitle:"ما الذي تريد إنجازه الآن؟",taskLead:"لا تحتاج إلى تعلّم المنصة أولًا. ابدأ بالمهمة التي أمامك.",start:"فتح",
  why:"لماذا تبدأ من هنا",finishNow:"أنهِ المهمة الحالية أولًا",finishNowBody:"تعامل مع PDF والصور والفيديو والترجمة والجداول والملفات الخاصة دون التنقل بين عدة تطبيقات.",
  important:"ثم واصل العمل المهم",importantBody:"نظّم المصادر وابحث في النصوص واطرح الأسئلة وتابع الدراسة.",
  tools:"أدوات عملية",toolsDesc:"عالج PDF والصور والفيديو والترجمة والجداول والملفات الخاصة.",
  sasi:"برمجيات SASI",sasiDesc:"تصفح البرامج وتراخيص الشيفرة وطرق التسليم الآمن.",
  book:"Book SASI",bookDesc:"حوّل الكتب والأبحاث والمصادر إلى ذكاء يمكنك سؤاله والاستشهاد به.",
  learning:"SASI للتعلّم",learningDesc:"حوّل مواد الدراسة إلى مساحة للمراجعة والسؤال والرجوع إلى المصدر.",
  research:"SASI للبحث",researchDesc:"احتفظ بالأسئلة والأدلة والمقارنات والاستنتاجات في مسار بحث واحد.",
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
  {words:["全球ai","全球si","全球siai","ai工具","siai","排行榜","行情平台","模型价格","工具排名","免费ai","ai工具哪个好","ai视频","ai绘画","ai编程","api价格","ai模型","国内能用ai","全球人工智能"],href:"/siai",label:market.title},
  {words:["pdf","合并","压缩","拆分","ocr","签名","盖章"],href:"/tools",label:"PDF"},
  {words:["图片","照片","jpg","png","webp","水印","放大"],href:"/tools",label:c.img},
  {words:["视频","字幕","音频","配音","转文字"],href:"/tools",label:c.video},
  {words:["书","教材","论文","笔记","资料"],href:"/ai-knowledge",label:c.book},
  {words:["学习","复习","知识"],href:"/ai-learning",label:c.learning},
  {words:["科研","研究","证据"],href:"/ai-research",label:c.research},
  {words:["ea","mt5","源码","软件","授权","开发者"],href:"/sasi",label:c.sasi},
 ],[c,market.title]);
 const hit=useMemo(()=>{const s=q.toLowerCase().replace(/\s+/g,"");return intents.map(x=>({...x,score:x.words.filter(w=>s.includes(w)).length})).sort((a,b)=>b.score-a.score)[0]},[q,intents]);
 const cards=[
  {href:"/siai",icon:"products" as LingxiIconName,title:market.title,desc:market.description},
  {href:"/sasi",icon:"sasi" as LingxiIconName,title:c.sasi,desc:c.sasiDesc},
  {href:"/tools",icon:"tools" as LingxiIconName,title:c.tools,desc:c.toolsDesc},
 ];
 function submit(e:FormEvent){e.preventDefault();const v=q.trim();if(!v)return;if(isLikelyToolQuery(v)){location.href=`/tools?q=${encodeURIComponent(v)}&lang=${lang}`;return}const url=new URL(hit?.score>0?hit.href:'/sasi',location.origin);url.searchParams.set('intent',v);url.searchParams.set('lang',lang);location.href=url.pathname+url.search;}
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
     <form onSubmit={submit} className="lx11-prompt"><textarea value={q} onChange={e=>setQ(e.target.value)} rows={2} aria-label={c.placeholder} placeholder={c.placeholder}/><button>{c.begin}</button></form>
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
