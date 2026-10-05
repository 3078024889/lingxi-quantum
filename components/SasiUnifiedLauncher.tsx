"use client";

import Link from "next/link";
import {useRef,useState} from "react";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import {SasiComposerSurface,SasiComposerTextarea} from "@/components/SasiComposerCore";
import {SASI_UNIFIED_ACCEPT} from "@/lib/sasi/composer-core";
import {inferSasiMode} from "@/lib/sasi/core/intent-router";
import type {SasiMode} from "@/lib/sasi/core/session-contract";
import SasiSkillPicker from "@/components/SasiSkillPicker";
import type{SasiSkillId}from"@/lib/sasi/skills/types";

type Row=Record<LingxiLang,string>;
const L=(zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string):Row=>({zh,en,ja,ko,fr,de,es,pt,ar});
const COPY={
 placeholder:L("告诉 SASI 你想做什么…","Tell SASI what you want to do…","SASIにやりたいことを伝えてください…","SASI에게 원하는 일을 말해 주세요…","Dites à SASI ce que vous voulez faire…","Sag SASI, was du machen möchtest…","Dile a SASI qué quieres hacer…","Diga ao SASI o que quer fazer…","أخبر SASI بما تريد إنجازه…"),
 add:L("添加","Add","追加","추가","Ajouter","Hinzufügen","Añadir","Adicionar","إضافة"),
 files:L("添加照片和文件","Add photos and files","写真やファイルを追加","사진 및 파일 추가","Ajouter des photos et fichiers","Fotos und Dateien hinzufügen","Añadir fotos y archivos","Adicionar fotos e ficheiros","إضافة صور وملفات"),
 choose:L("你也可以先选一件事","You can also choose a task first","先にやることを選ぶこともできます","먼저 할 일을 선택해도 됩니다","Vous pouvez aussi choisir une tâche","Du kannst auch zuerst eine Aufgabe wählen","También puedes elegir una tarea","Você também pode escolher uma tarefa","يمكنك أيضًا اختيار المهمة أولًا"),
 website:L("做网站","Build a website","Webサイトを作る","웹사이트 만들기","Créer un site","Website erstellen","Crear un sitio","Criar um site","إنشاء موقع"),
 drama:L("做短剧","Create a short video","短編動画を作る","숏드라마 만들기","Créer une courte vidéo","Kurzvideo erstellen","Crear un vídeo corto","Criar um vídeo curto","إنشاء فيديو قصير"),
 book:L("读书与资料","Read books & sources","本と資料を読む","책과 자료 읽기","Lire livres et sources","Bücher & Quellen lesen","Leer libros y fuentes","Ler livros e fontes","قراءة الكتب والمصادر"),
 learning:L("学习","Study","学習","학습","Étudier","Lernen","Estudiar","Estudar","التعلم"),
 research:L("深度研究","Deep research","深い調査","심층 연구","Recherche approfondie","Tiefenrecherche","Investigación profunda","Pesquisa aprofundada","بحث متعمق"),
 connect:L("连接我的智能服务","Connect my intelligence service","AIサービスを接続","내 지능형 서비스 연결","Connecter mon service d’IA","Meinen KI-Dienst verbinden","Conectar mi servicio de IA","Conectar meu serviço de IA","ربط خدمة الذكاء الخاصة بي"),
 unclear:L("再告诉我一点你想得到什么结果，例如“做一个网站”“研究这些资料”“教我这一章”或“做成短剧”。","Tell me a little more about the result you want, for example “build a website”, “research these sources”, “teach me this chapter”, or “turn this into a short video”.","欲しい結果をもう少し教えてください。例：「Webサイトを作る」「この資料を調査する」「この章を教える」「短編動画にする」。","원하는 결과를 조금 더 알려 주세요. 예: “웹사이트 만들기”, “이 자료 연구하기”, “이 장 가르쳐줘”, “숏드라마로 만들기”.","Dites-moi un peu mieux le résultat voulu, par exemple « créer un site », « rechercher ces sources », « m’enseigner ce chapitre » ou « en faire une courte vidéo ».","Sag mir etwas genauer, welches Ergebnis du möchtest, z. B. „Website erstellen“, „diese Quellen untersuchen“, „dieses Kapitel erklären“ oder „als Kurzvideo umsetzen“.","Cuéntame un poco más qué resultado quieres, por ejemplo «crear un sitio», «investigar estas fuentes», «enséñame este capítulo» o «convertirlo en un vídeo corto».","Diga um pouco mais sobre o resultado que deseja, por exemplo “criar um site”, “pesquisar estas fontes”, “ensinar este capítulo” ou “transformar em vídeo curto”.","أخبرني أكثر قليلًا بالنتيجة التي تريدها، مثل «أنشئ موقعًا» أو «ابحث هذه المصادر» أو «علّمني هذا الفصل» أو «حوّله إلى فيديو قصير»."),
 selected:L("已选择","Selected","選択中","선택됨","Sélectionné","Ausgewählt","Seleccionado","Selecionado","تم الاختيار")
} as const;

const TASKS:Array<{id:SasiMode;key:"website"|"drama"|"book"|"learning"|"research"}>=[
 {id:"website",key:"website"},
 {id:"drama",key:"drama"},
 {id:"book",key:"book"},
 {id:"learning",key:"learning"},
 {id:"research",key:"research"}
];

export default function SasiUnifiedLauncher({onStart}:{onStart:(mode:SasiMode,prompt:string,files:File[],skillIds:SasiSkillId[])=>void}){
 const{lang}=useLingxiLang();
 const t=(key:keyof typeof COPY)=>COPY[key][lang]||COPY[key].en;
 const[prompt,setPrompt]=useState("");
 const[selected,setSelected]=useState<SasiMode|null>(null);
 const[files,setFiles]=useState<File[]>([]);
 const[selectedSkills,setSelectedSkills]=useState<SasiSkillId[]>([]);
 const[open,setOpen]=useState(false);
 const[notice,setNotice]=useState("");
 const inputRef=useRef<HTMLInputElement|null>(null);

 function addFiles(list:FileList|File[]){
  const next=[...files,...Array.from(list)].slice(0,20);
  setFiles(next);setNotice("");setOpen(false);
 }
 function submit(){
  const text=prompt.trim();
  const mode=selected||inferSasiMode(text);
  if(!text||!mode){setNotice(t("unclear"));return}
  onStart(mode,text,files,selectedSkills);
 }

 return <section className="mx-auto flex min-h-[calc(100vh-152px)] w-full max-w-4xl flex-col justify-end px-2 pb-14 sm:px-4">
  <div className="mb-[12vh]">
   <SasiComposerSurface dragging={false} className="relative">
    {files.length>0&&<div className="mb-2 flex gap-2 overflow-x-auto pb-1">
      {files.map((file,index)=><span key={`${file.name}-${file.size}-${index}`} className="inline-flex max-w-[240px] shrink-0 items-center gap-2 rounded-full border border-[var(--lx-line)] bg-[var(--lx-soft)] px-3 py-1.5 text-xs">
       <span className="truncate">{file.name}</span>
       <button type="button" onClick={()=>setFiles(rows=>rows.filter((_,i)=>i!==index))} className="opacity-50 hover:opacity-100">×</button>
      </span>)}
    </div>}
    <SasiComposerTextarea
     value={prompt}
     onChange={e=>{setPrompt(e.target.value);setNotice("")}}
     onPaste={e=>{const pasted=Array.from(e.clipboardData.files||[]);if(pasted.length){e.preventDefault();addFiles(pasted)}}}
     onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submit()}}}
     placeholder={t("placeholder")}
     autoFocus
    />
    <div className="mt-1 flex items-center gap-2">
     <input ref={inputRef} type="file" multiple accept={SASI_UNIFIED_ACCEPT} className="hidden"
      onChange={e=>{if(e.target.files?.length)addFiles(e.target.files);e.currentTarget.value=""}}/>
     <div className="relative">
      <button type="button" aria-label={t("add")} aria-expanded={open} onClick={()=>setOpen(v=>!v)}
       className="grid h-9 w-9 place-items-center rounded-full text-2xl hover:bg-[var(--lx-soft)]">＋</button>
      {open&&<div className="absolute bottom-11 left-0 z-50 w-[300px] rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-2 shadow-[0_14px_48px_rgba(0,0,0,.16)]">
       <button type="button" onClick={()=>inputRef.current?.click()} className="block w-full rounded-xl px-3 py-3 text-left text-sm hover:bg-[var(--lx-soft)]">{t("files")}</button>
       <div className="px-3 pb-2 pt-3 text-xs text-[var(--lx-muted)]">{t("choose")}</div>
       {TASKS.map(item=><button key={item.id} type="button"
        onClick={()=>{setSelected(item.id);setSelectedSkills([]);setNotice("")}}
        className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm hover:bg-[var(--lx-soft)]">
        <span>{t(item.key)}</span>{selected===item.id?<span className="text-xs text-[var(--lx-muted)]">{t("selected")}</span>:null}
       </button>)}
       {selected&&<SasiSkillPicker mode={selected} selected={selectedSkills} onChange={setSelectedSkills}/>}
       <div className="mt-1 border-t border-[var(--lx-line)] pt-1">
        <Link href="/sasi/connections" className="block rounded-xl px-3 py-3 text-sm hover:bg-[var(--lx-soft)]">{t("connect")} <span className="float-right">↗</span></Link>
       </div>
      </div>}
     </div>
     {selected&&<button type="button" onClick={()=>setSelected(null)}
      className="rounded-full border border-[var(--lx-line)] px-3 py-1.5 text-xs text-[var(--lx-muted)]">
      {t(TASKS.find(x=>x.id===selected)?.key||"research")} ×
     </button>}
     <button type="button" onClick={submit} disabled={!prompt.trim()}
      className="ml-auto grid h-9 min-w-9 place-items-center rounded-full bg-[var(--lx-ink)] px-3 text-sm font-medium text-[var(--lx-bg)] disabled:opacity-30">↑</button>
    </div>
    {notice&&<p className="px-3 pt-2 text-xs leading-5 text-[var(--lx-muted)]">{notice}</p>}
   </SasiComposerSurface>
  </div>
 </section>;
}
