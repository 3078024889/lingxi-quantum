"use client";
import {BRAND_PUBLIC_COPY} from "@/lib/brand-public-copy";
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
  kicker:"灵犀场 LINGXIFIELD｜SASI全球多模型智能创作平台",
  seoTitle:"灵犀场 LINGXIFIELD｜SASI全球多模型智能创作平台",
  seoDesc:"AI短剧生成、网站构建、书本问答、学习与科研。100+免费在线实用工具：PDF合并、拆分、压缩，图片转换、文字识别，视频裁剪、音频提取、表格转换与隐私清理。",hero:"今天你要完成什么？",
  lead:"",
  placeholder:"告诉灵犀场：你现在最想解决什么？",begin:"开始处理",startWith:"可以直接从",
  taskTitle:"你现在要完成什么？",taskLead:"不需要先理解平台。先解决眼前这件事。",start:"开始",
  why:"为什么从这里开始",finishNow:"先把眼前的小事处理掉",finishNowBody:"PDF、图片、视频、字幕、表格和隐私文件，不需要在多个软件之间来回切换。打开对应工具，处理完成后直接拿到结果。",
  important:"再把真正重要的事继续推进",importantBody:"整理资料，再查看原文、提问和继续学习。",
  tools:"实用工具",toolsDesc:"处理 PDF、图片、视频、字幕、表格和隐私文件，打开就能做。",
  sasi:"SASI 创作",sasiDesc:"整理资料，再查看原文、提问和继续学习。",
  book:"书本 SASI",bookDesc:"让一本书、一篇论文或一组资料变成可以持续追问、引用和回看的智能体。",
  learning:"学习 SASI",learningDesc:"把教材和笔记整理成真正能复习、追问并回到原文的学习空间。",
  research:"科研 SASI",researchDesc:"让问题、证据、比较和结论留在同一条研究脉络里。",
  all:"全部入口",allDesc:"不知道从哪里开始时，在这里查看当前真正可以使用的能力。",
  img:"图片工具",video:"视频与音频"
 },
 en:{
  kicker:"LINGXIFIELD",
  seoTitle:"LINGXIFIELD | PDF, images and practical tools",
  seoDesc:"Work with PDFs, images, video and text. Organize sources and ask questions about them. Processing details and prices are shown before use.",hero:"What would you like to work on?",
  lead:"Describe your task, or choose a tool or source Q&A below.",
  placeholder:"Tell LINGXIFIELD what you want to solve now.",begin:"Start",startWith:"Start with",
  taskTitle:"What do you want to finish?",taskLead:"You do not need to learn the platform first. Start with the task in front of you.",start:"Open",
  why:"Why start here",finishNow:"Finish the thing in front of you",finishNowBody:"PDFs, images, video, subtitles, tables and private files should not require jumping between apps. Open the right tool and take the finished result.",
  important:"Then move the important work forward",importantBody:"Organize sources, find passages, ask questions and continue studying.",
  tools:"Practical Tools",toolsDesc:"Handle PDFs, images, video, subtitles, tables and private files.",
  sasi:"SASI Creation",sasiDesc:"Organize sources, find passages, ask questions and continue studying.",
  book:"Book SASI",bookDesc:"Turn books, papers and sources into an intelligence you can keep questioning and citing.",
  learning:"Learning SASI",learningDesc:"Turn study material into a space you can review, question and trace back to sources.",
  research:"Research SASI",researchDesc:"Keep questions, evidence, comparison and conclusions in one research thread.",
  all:"All Entrances",allDesc:"See what is actually available when you are not sure where to begin.",
  img:"Image tools",video:"Video & audio"
 },
 ja:{
  kicker:"LINGXIFIELD",
  seoTitle:"LINGXIFIELD｜PDF・画像・実用ツール",
  seoDesc:"PDF・画像・動画・テキストを扱い、資料を整理して原文について質問できます。処理方法と料金は利用前に確認できます。",hero:"今日は何を処理しますか？",
  lead:"やりたいことを入力するか、下からツールや資料への質問を選んでください。",
  placeholder:"今いちばん解決したいことを入力してください。",begin:"始める",startWith:"おすすめ",
  taskTitle:"今、何を完成させたいですか？",taskLead:"先にプラットフォームを覚える必要はありません。目の前の作業から始めましょう。",start:"開く",
  why:"ここから始める理由",finishNow:"まず目の前の作業を終える",finishNowBody:"PDF、画像、動画、字幕、表、プライベートファイルを複数のアプリに分ける必要はありません。対応ツールを開き、そのまま結果を受け取れます。",
  important:"次に、大切な仕事を前へ進める",importantBody:"資料を整理し、原文を確認して質問や学習を続けられます。",
  tools:"実用ツール",toolsDesc:"PDF、画像、動画、字幕、表、ウェブ内容、プライベートファイルを処理します。",
  sasi:"SASI 制作",sasiDesc:"資料を整理し、原文を確認して質問や学習を続けられます。",
  book:"Book SASI",bookDesc:"本、論文、資料を、継続して質問・引用できる知的エージェントへ。",
  learning:"学習 SASI",learningDesc:"教材とノートを、復習・質問・原文確認ができる学習空間へ。",
  research:"研究 SASI",researchDesc:"問い、証拠、比較、結論を一つの研究の流れに保ちます。",
  all:"すべての入口",allDesc:"どこから始めるか迷ったら、現在使える機能をここで確認できます。",
  img:"画像ツール",video:"動画・音声"
 },
 ko:{
  kicker:"LINGXIFIELD",
  seoTitle:"LINGXIFIELD | PDF·이미지·실용 도구",
  seoDesc:"PDF·이미지·영상·텍스트를 처리하고 자료를 정리해 원문에 대해 질문하세요. 처리 방식과 요금은 사용 전에 확인할 수 있습니다.",hero:"무엇을 처리할까요?",
  lead:"할 일을 입력하거나 아래에서 도구와 자료 질문을 선택하세요.",
  placeholder:"지금 가장 해결하고 싶은 일을 입력하세요.",begin:"시작",startWith:"바로 시작",
  taskTitle:"지금 무엇을 완성하고 싶나요?",taskLead:"플랫폼부터 배울 필요 없습니다. 눈앞의 작업부터 시작하세요.",start:"열기",
  why:"여기서 시작하는 이유",finishNow:"먼저 눈앞의 일을 끝내기",finishNowBody:"PDF, 이미지, 영상, 자막, 표, 개인 파일을 여러 앱 사이에서 옮길 필요가 없습니다. 필요한 도구를 열고 결과를 바로 받으세요.",
  important:"그다음 중요한 일을 계속 진행하기",importantBody:"자료를 정리하고 원문을 확인하며 질문과 학습을 이어가세요.",
  tools:"실용 도구",toolsDesc:"PDF, 이미지, 영상, 자막, 표와 개인 파일을 처리합니다.",
  sasi:"SASI 창작",sasiDesc:"자료를 정리하고 원문을 확인하며 질문과 학습을 이어가세요.",
  book:"Book SASI",bookDesc:"책, 논문, 자료를 계속 질문하고 인용할 수 있는 지능형 에이전트로 바꿉니다.",
  learning:"학습 SASI",learningDesc:"교재와 노트를 복습하고 질문하며 원문으로 돌아갈 수 있는 학습 공간으로 만듭니다.",
  research:"연구 SASI",researchDesc:"질문, 근거, 비교, 결론을 하나의 연구 흐름에 유지합니다.",
  all:"전체 입구",allDesc:"어디서 시작할지 모르겠다면 현재 사용할 수 있는 기능을 확인하세요.",
  img:"이미지 도구",video:"영상·오디오"
 },
 fr:{
  kicker:"LINGXIFIELD",
  seoTitle:"LINGXIFIELD | PDF, images et outils pratiques",
  seoDesc:"Traitez PDF, images, vidéos et textes. Organisez vos sources et posez des questions à leur sujet. Les modalités et tarifs sont indiqués avant utilisation.",hero:"Que souhaitez-vous faire ?",
  lead:"Décrivez votre tâche ou choisissez un outil ou des questions sur vos sources ci-dessous.",
  placeholder:"Que voulez-vous résoudre maintenant ?",begin:"Commencer",startWith:"Commencer par",
  taskTitle:"Que voulez-vous terminer ?",taskLead:"Pas besoin d’apprendre la plateforme d’abord. Commencez par la tâche devant vous.",start:"Ouvrir",
  why:"Pourquoi commencer ici",finishNow:"Terminer d’abord la tâche immédiate",finishNowBody:"PDF, images, vidéos, sous-titres, tableaux et fichiers privés peuvent être traités sans passer d’une application à l’autre.",
  important:"Puis faire avancer le travail important",importantBody:"Organisez vos sources, retrouvez les passages, posez des questions et poursuivez votre étude.",
  tools:"Outils pratiques",toolsDesc:"Traitez PDF, images, vidéo, sous-titres, tableaux et fichiers privés.",
  sasi:"Création SASI",sasiDesc:"Organisez vos sources, retrouvez les passages, posez des questions et poursuivez votre étude.",
  book:"Book SASI",bookDesc:"Transformez livres, articles et sources en intelligence interrogeable et traçable.",
  learning:"SASI Études",learningDesc:"Transformez vos supports en espace de révision, de questions et de retour aux sources.",
  research:"SASI Recherche",researchDesc:"Gardez questions, preuves, comparaisons et conclusions dans un même fil de recherche.",
  all:"Tous les accès",allDesc:"Voyez les capacités réellement disponibles si vous ne savez pas par où commencer.",
  img:"Outils image",video:"Vidéo et audio"
 },
 de:{
  kicker:"LINGXIFIELD",
  seoTitle:"LINGXIFIELD | PDF, Bilder und praktische Tools",
  seoDesc:"Bearbeite PDFs, Bilder, Videos und Texte. Ordne Quellen und stelle Fragen dazu. Verarbeitung und Preise werden vor der Nutzung angezeigt.",hero:"Was möchtest du bearbeiten?",
  lead:"Beschreibe deine Aufgabe oder wähle unten ein Tool oder Fragen zu Quellen.",
  placeholder:"Was möchten Sie jetzt lösen?",begin:"Starten",startWith:"Direkt starten mit",
  taskTitle:"Was möchten Sie fertigstellen?",taskLead:"Sie müssen die Plattform nicht zuerst lernen. Beginnen Sie mit der aktuellen Aufgabe.",start:"Öffnen",
  why:"Warum hier beginnen",finishNow:"Zuerst die aktuelle Aufgabe erledigen",finishNowBody:"PDFs, Bilder, Videos, Untertitel, Tabellen und private Dateien lassen sich ohne ständigen App-Wechsel bearbeiten.",
  important:"Dann wichtige Arbeit weiterführen",importantBody:"Ordne Quellen, finde Textstellen, stelle Fragen und lerne weiter.",
  tools:"Praktische Werkzeuge",toolsDesc:"PDFs, Bilder, Video, Untertitel, Tabellen und private Dateien bearbeiten.",
  sasi:"SASI Creation",sasiDesc:"Ordne Quellen, finde Textstellen, stelle Fragen und lerne weiter.",
  book:"Book SASI",bookDesc:"Bücher, Papers und Quellen in eine weiter befragbare und zitierbare Intelligenz verwandeln.",
  learning:"Lern-SASI",learningDesc:"Lernmaterial in einen Raum für Wiederholung, Fragen und Quellenrückgriff verwandeln.",
  research:"Forschungs-SASI",researchDesc:"Fragen, Belege, Vergleiche und Schlussfolgerungen in einem Forschungsfaden halten.",
  all:"Alle Einstiege",allDesc:"Sehen Sie die aktuell verfügbaren Funktionen, wenn Sie nicht wissen, wo Sie anfangen sollen.",
  img:"Bildwerkzeuge",video:"Video & Audio"
 },
 es:{
  kicker:"LINGXIFIELD",
  seoTitle:"LINGXIFIELD | PDF, imágenes y herramientas",
  seoDesc:"Trabaja con PDF, imágenes, vídeos y textos. Organiza fuentes y haz preguntas sobre ellas. El tratamiento y los precios se indican antes del uso.",hero:"¿Qué quieres hacer hoy?",
  lead:"Describe tu tarea o elige una herramienta o preguntas sobre fuentes abajo.",
  placeholder:"¿Qué quieres resolver ahora?",begin:"Empezar",startWith:"Empieza con",
  taskTitle:"¿Qué quieres terminar?",taskLead:"No necesitas aprender la plataforma primero. Empieza por la tarea que tienes delante.",start:"Abrir",
  why:"Por qué empezar aquí",finishNow:"Resuelve primero la tarea inmediata",finishNowBody:"PDF, imágenes, vídeo, subtítulos, tablas y archivos privados sin saltar entre múltiples aplicaciones.",
  important:"Después, lleva adelante el trabajo importante",importantBody:"Organiza fuentes, busca pasajes, haz preguntas y sigue estudiando.",
  tools:"Herramientas prácticas",toolsDesc:"Procesa PDF, imágenes, vídeo, subtítulos, tablas y archivos privados.",
  sasi:"Creación SASI",sasiDesc:"Organiza fuentes, busca pasajes, haz preguntas y sigue estudiando.",
  book:"Book SASI",bookDesc:"Convierte libros, artículos y fuentes en una inteligencia que puedas consultar y citar.",
  learning:"SASI Aprendizaje",learningDesc:"Convierte materiales de estudio en un espacio para repasar, preguntar y volver a las fuentes.",
  research:"SASI Investigación",researchDesc:"Mantén preguntas, evidencia, comparación y conclusiones en un mismo hilo.",
  all:"Todos los accesos",allDesc:"Consulta las capacidades disponibles si no sabes por dónde empezar.",
  img:"Herramientas de imagen",video:"Vídeo y audio"
 },
 pt:{
  kicker:"LINGXIFIELD",
  seoTitle:"LINGXIFIELD | PDF, imagens e ferramentas",
  seoDesc:"Trabalhe com PDF, imagens, vídeos e textos. Organize fontes e faça perguntas sobre elas. O processamento e os preços são informados antes do uso.",hero:"O que você quer fazer hoje?",
  lead:"Descreva sua tarefa ou escolha uma ferramenta ou perguntas sobre fontes abaixo.",
  placeholder:"O que você quer resolver agora?",begin:"Começar",startWith:"Comece por",
  taskTitle:"O que você quer concluir?",taskLead:"Você não precisa aprender a plataforma primeiro. Comece pela tarefa à sua frente.",start:"Abrir",
  why:"Por que começar aqui",finishNow:"Resolva primeiro a tarefa imediata",finishNowBody:"PDFs, imagens, vídeos, legendas, tabelas e arquivos privados sem ficar alternando entre aplicativos.",
  important:"Depois, avance o trabalho importante",importantBody:"Organize fontes, encontre trechos, faça perguntas e continue estudando.",
  tools:"Ferramentas práticas",toolsDesc:"Processe PDFs, imagens, vídeo, legendas, tabelas e arquivos privados.",
  sasi:"Criação SASI",sasiDesc:"Organize fontes, encontre trechos, faça perguntas e continue estudando.",
  book:"Book SASI",bookDesc:"Transforme livros, artigos e fontes em uma inteligência que você possa consultar e citar.",
  learning:"SASI Aprendizagem",learningDesc:"Transforme materiais de estudo em espaço para revisar, perguntar e voltar às fontes.",
  research:"SASI Pesquisa",researchDesc:"Mantenha perguntas, evidências, comparações e conclusões no mesmo fluxo.",
  all:"Todos os acessos",allDesc:"Veja o que está realmente disponível se não souber por onde começar.",
  img:"Ferramentas de imagem",video:"Vídeo e áudio"
 },
 ar:{
  kicker:"LINGXIFIELD",
  seoTitle:"LINGXIFIELD | أدوات PDF والصور",
  seoDesc:"عالج ملفات PDF والصور والفيديو والنصوص، ونظّم المصادر واطرح أسئلة عنها. تُعرض طريقة المعالجة والأسعار قبل الاستخدام.",hero:"ما الذي تريد معالجته اليوم؟",
  lead:"صف مهمتك أو اختر أداة أو أسئلة عن المصادر أدناه.",
  placeholder:"ما الذي تريد حله الآن؟",begin:"ابدأ",startWith:"ابدأ من",
  taskTitle:"ما الذي تريد إنجازه الآن؟",taskLead:"لا تحتاج إلى تعلّم المنصة أولًا. ابدأ بالمهمة التي أمامك.",start:"فتح",
  why:"لماذا تبدأ من هنا",finishNow:"أنهِ المهمة الحالية أولًا",finishNowBody:"تعامل مع PDF والصور والفيديو والترجمة والجداول والملفات الخاصة دون التنقل بين عدة تطبيقات.",
  important:"ثم واصل العمل المهم",importantBody:"نظّم المصادر وابحث في النصوص واطرح الأسئلة وتابع الدراسة.",
  tools:"أدوات عملية",toolsDesc:"عالج PDF والصور والفيديو والترجمة والجداول والملفات الخاصة.",
  sasi:"إنشاء SASI",sasiDesc:"نظّم المصادر وابحث في النصوص واطرح الأسئلة وتابع الدراسة.",
  book:"Book SASI",bookDesc:"حوّل الكتب والأبحاث والمصادر إلى ذكاء يمكنك سؤاله والاستشهاد به.",
  learning:"SASI للتعلّم",learningDesc:"حوّل مواد الدراسة إلى مساحة للمراجعة والسؤال والرجوع إلى المصدر.",
  research:"SASI للبحث",researchDesc:"احتفظ بالأسئلة والأدلة والمقارنات والاستنتاجات في مسار بحث واحد.",
  all:"كل المداخل",allDesc:"اطّلع على الإمكانات المتاحة فعليًا عندما لا تعرف من أين تبدأ.",
  img:"أدوات الصور",video:"الفيديو والصوت"
 }
};

export default function HomeProblemHub(){
 const{lang}=useLingxiLang();const c=copy[lang]??copy.en;
 const[q,setQ]=useState("");
 const intents=useMemo(()=>[
  {words:["pdf","合并","压缩","拆分","ocr","签名","盖章"],href:"/tools",label:"PDF"},
  {words:["图片","照片","jpg","png","webp","水印","放大"],href:"/tools",label:c.img},
  {words:["视频","字幕","音频","配音","转文字"],href:"/tools",label:c.video},
  {words:["书","教材","论文","笔记","资料"],href:"/sasi?mode=book",label:c.book},
  {words:["学习","复习","知识"],href:"/sasi?mode=learning",label:c.learning},
  {words:["科研","研究","证据"],href:"/sasi?mode=research",label:c.research},
  {words:["短剧","剧本","广告","mv","cg","创作"],href:"/sasi",label:c.sasi},
 ],[c]);
 const hit=useMemo(()=>{const s=q.toLowerCase();return intents.map(x=>({...x,score:x.words.filter(w=>s.includes(w)).length})).sort((a,b)=>b.score-a.score)[0]},[q,intents]);
 const cards=[
  {href:"/tools",icon:"tools" as LingxiIconName,title:c.tools,desc:c.toolsDesc},
  {href:"/sasi",icon:"sasi" as LingxiIconName,title:c.sasi,desc:c.sasiDesc},
  {href:"/sasi?mode=book",icon:"book" as LingxiIconName,title:c.book,desc:c.bookDesc},
  {href:"/sasi?mode=learning",icon:"learning" as LingxiIconName,title:c.learning,desc:c.learningDesc},
  {href:"/sasi?mode=research",icon:"research" as LingxiIconName,title:c.research,desc:c.researchDesc},
  {href:"/products",icon:"products" as LingxiIconName,title:c.all,desc:c.allDesc},
 ];
 function submit(e:FormEvent){e.preventDefault();const v=q.trim();if(!v)return;if(isLikelyToolQuery(v)){location.href=`/tools?q=${encodeURIComponent(v)}&lang=${lang}`;return}const url=new URL(hit?.score>0?hit.href:'/sasi',location.origin);url.searchParams.set('intent',v);url.searchParams.set('lang',lang);location.href=url.pathname+url.search;}
 return <main className="lx11-page"><div className="lx11-wrap">
  <section className="lx11-home-hero lx-home-v143 overflow-hidden">
   <div className="grid items-center gap-8 ">
    <div>
     <p className="lx-v37-brand-title">{BRAND_PUBLIC_COPY[lang].title}</p>
     <h1>{c.hero}</h1>
     <p className="lx-v37-brand-desc"><strong>{PUBLIC_FEATURE_COPY[lang].headline}</strong></p>
     <p className="lx-v37-brand-desc"><strong>{PUBLIC_FEATURE_COPY[lang].freeTools}</strong></p>
     <div className="mt-3 grid gap-1 text-sm leading-6 text-[var(--lx-muted)]" data-home-tool-catalog>
      {FOOTER_CATALOG[lang].map(category=><p key={category.title}><strong className="text-[var(--lx-ink)]">{category.title}：</strong>{category.body}</p>)}
     </div>
     <p className="mt-3 text-sm leading-6 text-[var(--lx-muted)]">{lang==="zh"?"短剧视频生成、网站构建、书本、学习、科研多模型创作；9国语言，支持 CNY/USD 与微信支付、支付宝、PayPal。":"SASI supports short-video creation, websites, books, study and research across nine languages, with CNY/USD payments."}</p>
     <p className="mt-1 text-xs text-[var(--lx-muted)]">lingxifield.com · lingxifield.cn</p>
     <form onSubmit={submit} className="lx11-prompt"><textarea value={q} onChange={e=>setQ(e.target.value)} rows={2} aria-label={c.placeholder} placeholder={c.placeholder}/><button>{c.begin}</button></form>
     {q.trim()&&hit?.score>0&&<div className="lx11-suggestion"><span>{c.startWith}</span><Link href={hit.href}>{hit.label}</Link></div>}
    </div>
   </div>
  </section>
  <section className="lx11-home-section"><div className="lx11-section-heading"><div><span>01</span><h2>{c.taskTitle}</h2></div><p>{c.taskLead}</p></div>
   <div className="lx11-home-grid lx-home-v143-grid">{cards.map((item,i)=><Link href={item.href} key={item.href} className={`lx11-home-card lx-v143-card tone-${(i%6)+1}`}><LingxiMiniIcon name={item.icon} size="card" className="lx-v143-icon"/><h3>{item.title}</h3><p>{item.desc}</p><b>{c.start} →</b></Link>)}</div>
  </section>
  <section className="lx11-home-section lx-v143-about"><div className="lx11-section-heading"><div><span>02</span><h2>{c.why}</h2></div></div><div className="lx-v143-about-grid">
   <article><LingxiMiniIcon name="tools" size="card" className="lx-v143-icon"/><h3>{c.finishNow}</h3><p>{c.finishNowBody}</p></article>
   <article><LingxiMiniIcon name="sasi" size="card" className="lx-v143-icon"/><h3>{c.important}</h3><p>{c.importantBody}</p></article>
  </div></section>
 </div></main>
}
