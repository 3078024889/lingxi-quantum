"use client";

import Link from "next/link";
import { useLingxiLang, type LingxiLang } from "@/lib/lingxi-i18n";

type Copy = Record<LingxiLang, string>;
const c=(zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string):Copy=>({zh,en,ja,ko,fr,de,es,pt,ar});

const C = {
  kicker:c("灵犀场 · 探索","LINGXIFIELD · Explore","LINGXIFIELD · 探索","LINGXIFIELD · 탐색","LINGXIFIELD · Explorer","LINGXIFIELD · Entdecken","LINGXIFIELD · Explorar","LINGXIFIELD · Explorar","LINGXIFIELD · استكشاف"),
  title:c("从一个入口，走到你真正想完成的事。","Start from one entrance and move toward the result you actually want.","ひとつの入口から、本当に完成させたいことへ。","하나의 입구에서 정말 완성하고 싶은 결과로.","Partez d’une entrée et avancez vers le résultat que vous voulez vraiment.","Von einem Einstieg zum Ergebnis, das Sie wirklich erreichen möchten.","Empieza por una entrada y avanza hacia el resultado que realmente quieres.","Comece por uma entrada e avance até o resultado que você realmente quer.","ابدأ من مدخل واحد وتقدّم نحو النتيجة التي تريدها فعلًا."),
  lead:c("工具、SASI、研究、书本与场域能力不再分散。这里按“你想做什么”重新组织。","Tools, SASI, research, books and field experiences are organized here by what you want to accomplish.","ツール、SASI、研究、書籍、フィールド機能を「何をしたいか」で整理しました。","도구, SASI, 연구, 책, 필드 기능을 ‘무엇을 하고 싶은가’ 기준으로 정리했습니다.","Outils, SASI, recherche, livres et expériences de terrain sont organisés selon votre objectif.","Tools, SASI, Forschung, Bücher und Feldfunktionen sind nach Ihrem Ziel geordnet.","Herramientas, SASI, investigación, libros y experiencias de campo, organizados según lo que quieres lograr.","Ferramentas, SASI, pesquisa, livros e experiências de campo organizados pelo que você quer realizar.","الأدوات وSASI والبحث والكتب وتجارب المجال منظّمة هنا بحسب ما تريد إنجازه."),
  open:c("进入 →","Open →","開く →","열기 →","Ouvrir →","Öffnen →","Abrir →","Abrir →","فتح →"),
};

const items=[
 {href:"/tools",icon:"🧰",title:c("解决一个具体问题","Solve a concrete task","具体的な問題を解決","구체적인 문제 해결","Résoudre une tâche concrète","Eine konkrete Aufgabe lösen","Resolver una tarea concreta","Resolver uma tarefa concreta","حل مهمة محددة"),desc:c("图片、PDF、视频、字幕、OCR、隐私处理与日常文件。","Images, PDFs, video, subtitles, OCR, privacy and everyday files.","画像、PDF、動画、字幕、OCR、プライバシー処理。","이미지, PDF, 영상, 자막, OCR, 개인정보 처리.","Images, PDF, vidéo, sous-titres, OCR et confidentialité.","Bilder, PDFs, Video, Untertitel, OCR und Datenschutz.","Imágenes, PDF, vídeo, subtítulos, OCR y privacidad.","Imagens, PDF, vídeo, legendas, OCR e privacidade.","الصور وPDF والفيديو والترجمة وOCR والخصوصية."),grad:"from-cyan-100 via-sky-50 to-violet-100"},
 {href:"/sasi",icon:"✨",title:c("把想法变成作品","Turn an idea into a work","アイデアを作品へ","아이디어를 작품으로","Transformer une idée en œuvre","Eine Idee in ein Werk verwandeln","Convertir una idea en obra","Transformar uma ideia em obra","حوّل الفكرة إلى عمل"),desc:c("短剧、影像、网站、应用与复杂任务，从 SASI 进入。","Short drama, visuals, websites, apps and complex tasks through SASI.","短編ドラマ、映像、Web、アプリ、複雑なタスク。","숏드라마, 영상, 웹사이트, 앱, 복합 작업.","Mini-séries, visuels, sites, apps et tâches complexes.","Kurzdrama, Visuals, Websites, Apps und komplexe Aufgaben.","Cortos, visuales, webs, apps y tareas complejas.","Curtas, visuais, sites, apps e tarefas complexas.","دراما قصيرة ومرئيات ومواقع وتطبيقات ومهام معقدة."),grad:"from-violet-100 via-fuchsia-50 to-rose-100"},
 {href:"/ai-knowledge",icon:"📚",title:c("把一本书变成可追问的智能体","Turn a book into an askable intelligence","本を質問できる知能へ","책을 질문 가능한 지능으로","Transformer un livre en intelligence interrogeable","Ein Buch in befragbare Intelligenz verwandeln","Convertir un libro en inteligencia consultable","Transformar um livro em inteligência consultável","حوّل الكتاب إلى ذكاء يمكن سؤاله"),desc:c("上传资料、保留原文证据、继续追问。","Upload sources, preserve source evidence and keep asking.","資料を追加し、原文根拠を保って質問。","자료를 추가하고 원문 근거로 계속 질문.","Ajoutez vos sources, gardez les preuves et poursuivez les questions.","Quellen hinzufügen, Originalbelege behalten und weiterfragen.","Sube fuentes, conserva evidencias y sigue preguntando.","Envie fontes, preserve evidências e continue perguntando.","ارفع المصادر واحتفظ بالأدلة الأصلية وواصل السؤال."),grad:"from-amber-100 via-orange-50 to-pink-100"},
 {href:"/ai-research",icon:"🔬",title:c("围绕资料做研究","Research around your sources","資料を中心に研究","자료 중심 연구","Rechercher à partir de vos sources","Mit Ihren Quellen forschen","Investigar a partir de tus fuentes","Pesquisar a partir das suas fontes","ابحث انطلاقًا من مصادرك"),desc:c("让问题、证据与推理留在同一个工作区。","Keep questions, evidence and reasoning in one workspace.","質問・証拠・推論を一つのワークスペースに。","질문·근거·추론을 하나의 작업 공간에.","Questions, preuves et raisonnement dans un même espace.","Fragen, Belege und Schlussfolgerungen in einem Arbeitsbereich.","Preguntas, evidencias y razonamiento en un solo espacio.","Perguntas, evidências e raciocínio em um só espaço.","الأسئلة والأدلة والاستدلال في مساحة عمل واحدة."),grad:"from-emerald-100 via-teal-50 to-cyan-100"},
 {href:"/field-tests",icon:"🧭",title:c("看见自己的结构与状态","See your structure and state","自分の構造と状態を見る","나의 구조와 상태 보기","Voir votre structure et votre état","Eigene Struktur und Zustand sehen","Ver tu estructura y estado","Ver sua estrutura e estado","رؤية بنيتك وحالتك"),desc:c("生命图谱、关系、韧性、财富、潮汐与生命原型。","Life map, relationships, resilience, wealth, tide and archetype.","生命図、関係、レジリエンス、富、潮流、原型。","생명 지도, 관계, 회복탄력성, 부, 흐름, 원형.","Carte de vie, relations, résilience, richesse, marées et archétype.","Lebenskarte, Beziehungen, Resilienz, Wohlstand, Rhythmus und Archetyp.","Mapa vital, relaciones, resiliencia, riqueza, marea y arquetipo.","Mapa de vida, relações, resiliência, riqueza, maré e arquétipo.","خريطة الحياة والعلاقات والمرونة والثروة والمدّ والنمط الأصلي."),grad:"from-indigo-100 via-blue-50 to-cyan-100"},
 {href:"/live-as",icon:"🌠",title:c("让改变进入现实","Bring change into reality","変化を現実へ","변화를 현실로","Faire entrer le changement dans le réel","Veränderung in die Realität bringen","Llevar el cambio a la realidad","Levar a mudança para a realidade","أدخل التغيير إلى الواقع"),desc:c("意识显化、潜意识重塑与修炼技术，形成持续路径。","Manifestation, subconscious reshaping and practices as a continuing path.","顕現、潜在意識の再構築、実践を継続的な道へ。","현현, 잠재의식 재구성, 수행을 지속 가능한 경로로.","Manifestation, remodelage du subconscient et pratiques continues.","Manifestation, Unterbewusstseinsarbeit und Übungen als fortlaufender Weg.","Manifestación, reconfiguración subconsciente y prácticas continuas.","Manifestação, reconfiguração do subconsciente e práticas contínuas.","التجلّي وإعادة تشكيل اللاوعي والممارسات كمسار مستمر."),grad:"from-rose-100 via-pink-50 to-violet-100"},
];

export default function ExplorePage(){
 const{lang}=useLingxiLang();
 return <main className="min-h-screen bg-[linear-gradient(180deg,#fbfdff_0%,#f6f8ff_48%,#fff_100%)] px-5 pb-20 pt-24 lg:ml-[260px] lg:px-10 lg:pt-10">
   <div className="mx-auto max-w-6xl">
     <section className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/90 p-7 shadow-[0_24px_80px_rgba(45,65,110,.08)] sm:p-10">
       <p className="text-sm font-semibold tracking-[.16em] text-indigo-600">{C.kicker[lang]}</p>
       <h1 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl">{C.title[lang]}</h1>
       <p className="mt-5 max-w-3xl text-[15px] leading-8 text-slate-600 sm:text-base">{C.lead[lang]}</p>
     </section>
     <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
       {items.map((item,index)=><Link key={item.href} href={item.href} className="group overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(45,65,110,.06)] transition hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(45,65,110,.12)]">
         <div className={`flex h-32 items-center justify-between bg-gradient-to-br ${item.grad} px-6`}>
           <span className="text-5xl drop-shadow-sm">{item.icon}</span>
           <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600">0{index+1}</span>
         </div>
         <div className="p-6">
           <h2 className="text-xl font-semibold text-slate-950">{item.title[lang]}</h2>
           <p className="mt-3 min-h-[72px] text-[15px] leading-7 text-slate-600">{item.desc[lang]}</p>
           <span className="mt-5 inline-flex text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">{C.open[lang]}</span>
         </div>
       </Link>)}
     </section>
   </div>
 </main>
}
