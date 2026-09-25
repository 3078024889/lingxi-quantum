"use client";

import {FormEvent,useMemo,useState} from "react";
import Link from "next/link";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import LingxiMiniIcon,{type LingxiIconName} from "@/components/LingxiMiniIcon";

type Copy={
 kicker:string;hero:string;lead:string;placeholder:string;begin:string;startWith:string;
 taskTitle:string;taskLead:string;start:string;why:string;
 finishNow:string;finishNowBody:string;important:string;importantBody:string;
 tools:string;toolsDesc:string;sasi:string;sasiDesc:string;book:string;bookDesc:string;
 learning:string;learningDesc:string;research:string;researchDesc:string;all:string;allDesc:string;
 img:string;video:string;
};

const copy:Record<LingxiLang,Copy>={
 zh:{
  kicker:"灵犀场 · LINGXIFIELD",hero:"把想法、资料和日常问题真正处理起来。",
  lead:"从一个文件、一张图片、一段视频，到一本书、一项研究或一个还没理清的想法，都可以从这里直接开始。告诉灵犀场你要完成什么，它会把你带到最合适的入口。",
  placeholder:"告诉灵犀场：你现在最想解决什么？",begin:"开始处理",startWith:"可以直接从",
  taskTitle:"你现在要完成什么？",taskLead:"不需要先理解平台。先解决眼前这件事。",start:"开始",
  why:"为什么从这里开始",finishNow:"先把眼前的小事处理掉",finishNowBody:"PDF、图片、视频、字幕、表格和隐私文件，不需要在多个软件之间来回切换。打开对应工具，处理完成后直接拿到结果。",
  important:"再把真正重要的事继续推进",importantBody:"当任务变成写一部短剧、读懂一本书、研究一个问题或做出一个网站，SASI 会接住前面的上下文，让工作不必每次从零开始。",
  tools:"实用工具",toolsDesc:"处理 PDF、图片、视频、字幕、表格、网页和隐私文件，打开就能做。",
  sasi:"SASI 创作",sasiDesc:"从一个想法进入短剧、网站、资料智能体与持续创作，把任务继续推进。",
  book:"书本 SASI",bookDesc:"让一本书、一篇论文或一组资料变成可以持续追问、引用和回看的智能体。",
  learning:"学习 SASI",learningDesc:"把教材和笔记整理成真正能复习、追问并回到原文的学习空间。",
  research:"科研 SASI",researchDesc:"让问题、证据、比较和结论留在同一条研究脉络里。",
  all:"全部入口",allDesc:"不知道从哪里开始时，在这里查看当前真正可以使用的能力。",
  img:"图片工具",video:"视频与音频"
 },
 en:{
  kicker:"LINGXIFIELD",hero:"Turn ideas, sources and everyday tasks into finished work.",
  lead:"Start with a file, image, video, book, research question or an idea that is not clear yet. Tell LINGXIFIELD what you need done and it will take you to the right place.",
  placeholder:"Tell LINGXIFIELD what you want to solve now.",begin:"Start",startWith:"Start with",
  taskTitle:"What do you want to finish?",taskLead:"You do not need to learn the platform first. Start with the task in front of you.",start:"Open",
  why:"Why start here",finishNow:"Finish the thing in front of you",finishNowBody:"PDFs, images, video, subtitles, tables and private files should not require jumping between apps. Open the right tool and take the finished result.",
  important:"Then move the important work forward",importantBody:"When the task becomes a drama, book, research problem or website, SASI carries context forward instead of starting over every time.",
  tools:"Practical Tools",toolsDesc:"Handle PDFs, images, video, subtitles, tables, web content and private files.",
  sasi:"SASI Creation",sasiDesc:"Move from one idea into drama, websites, document agents and continued creation.",
  book:"Book SASI",bookDesc:"Turn books, papers and sources into an intelligence you can keep questioning and citing.",
  learning:"Learning SASI",learningDesc:"Turn study material into a space you can review, question and trace back to sources.",
  research:"Research SASI",researchDesc:"Keep questions, evidence, comparison and conclusions in one research thread.",
  all:"All Entrances",allDesc:"See what is actually available when you are not sure where to begin.",
  img:"Image tools",video:"Video & audio"
 },
 ja:{
  kicker:"LINGXIFIELD",hero:"アイデア、資料、日々の作業を、実際の結果まで進める。",
  lead:"ファイル、画像、動画、本、研究課題、まだ整理できていない考えまで、ここから直接始められます。やりたいことを伝えると、最適な入口へ案内します。",
  placeholder:"今いちばん解決したいことを入力してください。",begin:"始める",startWith:"おすすめ",
  taskTitle:"今、何を完成させたいですか？",taskLead:"先にプラットフォームを覚える必要はありません。目の前の作業から始めましょう。",start:"開く",
  why:"ここから始める理由",finishNow:"まず目の前の作業を終える",finishNowBody:"PDF、画像、動画、字幕、表、プライベートファイルを複数のアプリに分ける必要はありません。対応ツールを開き、そのまま結果を受け取れます。",
  important:"次に、大切な仕事を前へ進める",importantBody:"短編ドラマ、本、研究、ウェブサイトのような仕事では、SASI が文脈を引き継ぎ、毎回ゼロから始める必要を減らします。",
  tools:"実用ツール",toolsDesc:"PDF、画像、動画、字幕、表、ウェブ内容、プライベートファイルを処理します。",
  sasi:"SASI 制作",sasiDesc:"アイデアからドラマ、ウェブサイト、資料エージェント、継続制作へ。",
  book:"Book SASI",bookDesc:"本、論文、資料を、継続して質問・引用できる知的エージェントへ。",
  learning:"学習 SASI",learningDesc:"教材とノートを、復習・質問・原文確認ができる学習空間へ。",
  research:"研究 SASI",researchDesc:"問い、証拠、比較、結論を一つの研究の流れに保ちます。",
  all:"すべての入口",allDesc:"どこから始めるか迷ったら、現在使える機能をここで確認できます。",
  img:"画像ツール",video:"動画・音声"
 },
 ko:{
  kicker:"LINGXIFIELD",hero:"아이디어, 자료, 일상 작업을 실제 결과까지 이어갑니다.",
  lead:"파일, 이미지, 영상, 책, 연구 질문, 아직 정리되지 않은 생각까지 여기서 바로 시작할 수 있습니다. 해야 할 일을 말하면 알맞은 입구로 연결합니다.",
  placeholder:"지금 가장 해결하고 싶은 일을 입력하세요.",begin:"시작",startWith:"바로 시작",
  taskTitle:"지금 무엇을 완성하고 싶나요?",taskLead:"플랫폼부터 배울 필요 없습니다. 눈앞의 작업부터 시작하세요.",start:"열기",
  why:"여기서 시작하는 이유",finishNow:"먼저 눈앞의 일을 끝내기",finishNowBody:"PDF, 이미지, 영상, 자막, 표, 개인 파일을 여러 앱 사이에서 옮길 필요가 없습니다. 필요한 도구를 열고 결과를 바로 받으세요.",
  important:"그다음 중요한 일을 계속 진행하기",importantBody:"숏드라마, 책, 연구, 웹사이트처럼 작업이 커지면 SASI가 맥락을 이어 받아 매번 처음부터 시작하지 않게 합니다.",
  tools:"실용 도구",toolsDesc:"PDF, 이미지, 영상, 자막, 표, 웹 콘텐츠와 개인 파일을 처리합니다.",
  sasi:"SASI 창작",sasiDesc:"하나의 아이디어를 드라마, 웹사이트, 자료 에이전트와 지속 창작으로 이어갑니다.",
  book:"Book SASI",bookDesc:"책, 논문, 자료를 계속 질문하고 인용할 수 있는 지능형 에이전트로 바꿉니다.",
  learning:"학습 SASI",learningDesc:"교재와 노트를 복습하고 질문하며 원문으로 돌아갈 수 있는 학습 공간으로 만듭니다.",
  research:"연구 SASI",researchDesc:"질문, 근거, 비교, 결론을 하나의 연구 흐름에 유지합니다.",
  all:"전체 입구",allDesc:"어디서 시작할지 모르겠다면 현재 사용할 수 있는 기능을 확인하세요.",
  img:"이미지 도구",video:"영상·오디오"
 },
 fr:{
  kicker:"LINGXIFIELD",hero:"Transformez idées, sources et tâches quotidiennes en résultats concrets.",
  lead:"Commencez avec un fichier, une image, une vidéo, un livre, une question de recherche ou une idée encore floue. Dites ce que vous voulez accomplir et LINGXIFIELD vous conduit au bon point d’entrée.",
  placeholder:"Que voulez-vous résoudre maintenant ?",begin:"Commencer",startWith:"Commencer par",
  taskTitle:"Que voulez-vous terminer ?",taskLead:"Pas besoin d’apprendre la plateforme d’abord. Commencez par la tâche devant vous.",start:"Ouvrir",
  why:"Pourquoi commencer ici",finishNow:"Terminer d’abord la tâche immédiate",finishNowBody:"PDF, images, vidéos, sous-titres, tableaux et fichiers privés peuvent être traités sans passer d’une application à l’autre.",
  important:"Puis faire avancer le travail important",importantBody:"Pour un drama, un livre, une recherche ou un site, SASI conserve le contexte afin de ne pas repartir de zéro.",
  tools:"Outils pratiques",toolsDesc:"Traitez PDF, images, vidéo, sous-titres, tableaux, contenu web et fichiers privés.",
  sasi:"Création SASI",sasiDesc:"Passez d’une idée à un drama, un site, un agent documentaire et une création continue.",
  book:"Book SASI",bookDesc:"Transformez livres, articles et sources en intelligence interrogeable et traçable.",
  learning:"SASI Études",learningDesc:"Transformez vos supports en espace de révision, de questions et de retour aux sources.",
  research:"SASI Recherche",researchDesc:"Gardez questions, preuves, comparaisons et conclusions dans un même fil de recherche.",
  all:"Tous les accès",allDesc:"Voyez les capacités réellement disponibles si vous ne savez pas par où commencer.",
  img:"Outils image",video:"Vidéo et audio"
 },
 de:{
  kicker:"LINGXIFIELD",hero:"Bringen Sie Ideen, Quellen und Alltagsaufgaben zu einem echten Ergebnis.",
  lead:"Starten Sie mit Datei, Bild, Video, Buch, Forschungsfrage oder einer noch ungeklärten Idee. Sagen Sie, was erledigt werden soll; LINGXIFIELD führt zum passenden Einstieg.",
  placeholder:"Was möchten Sie jetzt lösen?",begin:"Starten",startWith:"Direkt starten mit",
  taskTitle:"Was möchten Sie fertigstellen?",taskLead:"Sie müssen die Plattform nicht zuerst lernen. Beginnen Sie mit der aktuellen Aufgabe.",start:"Öffnen",
  why:"Warum hier beginnen",finishNow:"Zuerst die aktuelle Aufgabe erledigen",finishNowBody:"PDFs, Bilder, Videos, Untertitel, Tabellen und private Dateien lassen sich ohne ständigen App-Wechsel bearbeiten.",
  important:"Dann wichtige Arbeit weiterführen",importantBody:"Bei Drama, Buch, Forschung oder Website trägt SASI den Kontext weiter, statt jedes Mal von vorn zu beginnen.",
  tools:"Praktische Werkzeuge",toolsDesc:"PDFs, Bilder, Video, Untertitel, Tabellen, Webinhalte und private Dateien bearbeiten.",
  sasi:"SASI Creation",sasiDesc:"Von einer Idee zu Drama, Website, Dokument-Agent und fortlaufender Erstellung.",
  book:"Book SASI",bookDesc:"Bücher, Papers und Quellen in eine weiter befragbare und zitierbare Intelligenz verwandeln.",
  learning:"Lern-SASI",learningDesc:"Lernmaterial in einen Raum für Wiederholung, Fragen und Quellenrückgriff verwandeln.",
  research:"Forschungs-SASI",researchDesc:"Fragen, Belege, Vergleiche und Schlussfolgerungen in einem Forschungsfaden halten.",
  all:"Alle Einstiege",allDesc:"Sehen Sie die aktuell verfügbaren Funktionen, wenn Sie nicht wissen, wo Sie anfangen sollen.",
  img:"Bildwerkzeuge",video:"Video & Audio"
 },
 es:{
  kicker:"LINGXIFIELD",hero:"Convierte ideas, fuentes y tareas cotidianas en resultados reales.",
  lead:"Empieza con un archivo, imagen, vídeo, libro, pregunta de investigación o una idea aún sin ordenar. Dile a LINGXIFIELD qué necesitas terminar y te llevará al punto adecuado.",
  placeholder:"¿Qué quieres resolver ahora?",begin:"Empezar",startWith:"Empieza con",
  taskTitle:"¿Qué quieres terminar?",taskLead:"No necesitas aprender la plataforma primero. Empieza por la tarea que tienes delante.",start:"Abrir",
  why:"Por qué empezar aquí",finishNow:"Resuelve primero la tarea inmediata",finishNowBody:"PDF, imágenes, vídeo, subtítulos, tablas y archivos privados sin saltar entre múltiples aplicaciones.",
  important:"Después, lleva adelante el trabajo importante",importantBody:"Cuando la tarea es un drama, un libro, una investigación o una web, SASI mantiene el contexto para no empezar de cero.",
  tools:"Herramientas prácticas",toolsDesc:"Procesa PDF, imágenes, vídeo, subtítulos, tablas, contenido web y archivos privados.",
  sasi:"Creación SASI",sasiDesc:"Pasa de una idea a drama, web, agente documental y creación continua.",
  book:"Book SASI",bookDesc:"Convierte libros, artículos y fuentes en una inteligencia que puedas consultar y citar.",
  learning:"SASI Aprendizaje",learningDesc:"Convierte materiales de estudio en un espacio para repasar, preguntar y volver a las fuentes.",
  research:"SASI Investigación",researchDesc:"Mantén preguntas, evidencia, comparación y conclusiones en un mismo hilo.",
  all:"Todos los accesos",allDesc:"Consulta las capacidades disponibles si no sabes por dónde empezar.",
  img:"Herramientas de imagen",video:"Vídeo y audio"
 },
 pt:{
  kicker:"LINGXIFIELD",hero:"Transforme ideias, fontes e tarefas do dia a dia em resultados reais.",
  lead:"Comece com um arquivo, imagem, vídeo, livro, questão de pesquisa ou uma ideia ainda não organizada. Diga o que precisa concluir e a LINGXIFIELD leva você ao ponto certo.",
  placeholder:"O que você quer resolver agora?",begin:"Começar",startWith:"Comece por",
  taskTitle:"O que você quer concluir?",taskLead:"Você não precisa aprender a plataforma primeiro. Comece pela tarefa à sua frente.",start:"Abrir",
  why:"Por que começar aqui",finishNow:"Resolva primeiro a tarefa imediata",finishNowBody:"PDFs, imagens, vídeos, legendas, tabelas e arquivos privados sem ficar alternando entre aplicativos.",
  important:"Depois, avance o trabalho importante",importantBody:"Quando a tarefa vira drama, livro, pesquisa ou site, o SASI mantém o contexto para você não recomeçar do zero.",
  tools:"Ferramentas práticas",toolsDesc:"Processe PDFs, imagens, vídeo, legendas, tabelas, conteúdo web e arquivos privados.",
  sasi:"Criação SASI",sasiDesc:"Leve uma ideia a drama, site, agente documental e criação contínua.",
  book:"Book SASI",bookDesc:"Transforme livros, artigos e fontes em uma inteligência que você possa consultar e citar.",
  learning:"SASI Aprendizagem",learningDesc:"Transforme materiais de estudo em espaço para revisar, perguntar e voltar às fontes.",
  research:"SASI Pesquisa",researchDesc:"Mantenha perguntas, evidências, comparações e conclusões no mesmo fluxo.",
  all:"Todos os acessos",allDesc:"Veja o que está realmente disponível se não souber por onde começar.",
  img:"Ferramentas de imagem",video:"Vídeo e áudio"
 },
 ar:{
  kicker:"LINGXIFIELD",hero:"حوّل الأفكار والمصادر والمهام اليومية إلى نتائج فعلية.",
  lead:"ابدأ بملف أو صورة أو فيديو أو كتاب أو سؤال بحثي أو فكرة لم تتضح بعد. أخبر LINGXIFIELD بما تريد إنجازه وسيقودك إلى المدخل الأنسب.",
  placeholder:"ما الذي تريد حله الآن؟",begin:"ابدأ",startWith:"ابدأ من",
  taskTitle:"ما الذي تريد إنجازه الآن؟",taskLead:"لا تحتاج إلى تعلّم المنصة أولًا. ابدأ بالمهمة التي أمامك.",start:"فتح",
  why:"لماذا تبدأ من هنا",finishNow:"أنهِ المهمة الحالية أولًا",finishNowBody:"تعامل مع PDF والصور والفيديو والترجمة والجداول والملفات الخاصة دون التنقل بين عدة تطبيقات.",
  important:"ثم واصل العمل المهم",importantBody:"عندما تصبح المهمة دراما أو كتابًا أو بحثًا أو موقعًا، يحتفظ SASI بالسياق بدل البدء من الصفر كل مرة.",
  tools:"أدوات عملية",toolsDesc:"عالج PDF والصور والفيديو والترجمة والجداول ومحتوى الويب والملفات الخاصة.",
  sasi:"إنشاء SASI",sasiDesc:"انقل فكرة واحدة إلى دراما أو موقع أو وكيل مستندات أو إنشاء مستمر.",
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
  {words:["书","教材","论文","笔记","资料"],href:"/ai-knowledge",label:c.book},
  {words:["学习","复习","知识"],href:"/ai-learning",label:c.learning},
  {words:["科研","研究","证据"],href:"/ai-research",label:c.research},
  {words:["网站","应用","短剧","剧本","广告","mv","cg","创作"],href:"/sasi",label:c.sasi},
 ],[c]);
 const hit=useMemo(()=>{const s=q.toLowerCase();return intents.map(x=>({...x,score:x.words.filter(w=>s.includes(w)).length})).sort((a,b)=>b.score-a.score)[0]},[q,intents]);
 const cards=[
  {href:"/tools",icon:"tools" as LingxiIconName,title:c.tools,desc:c.toolsDesc},
  {href:"/sasi",icon:"sasi" as LingxiIconName,title:c.sasi,desc:c.sasiDesc},
  {href:"/ai-knowledge",icon:"book" as LingxiIconName,title:c.book,desc:c.bookDesc},
  {href:"/ai-learning",icon:"learning" as LingxiIconName,title:c.learning,desc:c.learningDesc},
  {href:"/ai-research",icon:"research" as LingxiIconName,title:c.research,desc:c.researchDesc},
  {href:"/products",icon:"products" as LingxiIconName,title:c.all,desc:c.allDesc},
 ];
 function submit(e:FormEvent){e.preventDefault();const v=q.trim();if(!v)return;if(hit?.score>0)location.href=hit.href;else{sessionStorage.setItem("lx-home-intent",v);location.href=`/sasi?intent=${encodeURIComponent(v)}`}}
 return <main className="lx11-page"><div className="lx11-wrap">
  <section className="lx11-home-hero lx-home-v143"><p className="lx11-home-kicker">{c.kicker}</p><h1>{c.hero}</h1><p>{c.lead}</p>
   <form onSubmit={submit} className="lx11-prompt"><textarea value={q} onChange={e=>setQ(e.target.value)} rows={2} placeholder={c.placeholder}/><button>{c.begin}</button></form>
   {q.trim()&&hit?.score>0&&<div className="lx11-suggestion"><span>{c.startWith}</span><Link href={hit.href}>{hit.label}</Link></div>}
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
