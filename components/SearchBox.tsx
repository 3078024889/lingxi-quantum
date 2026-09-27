"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLingxiLang, type LingxiLang } from "@/lib/lingxi-i18n";

type Copy = Record<LingxiLang, string>;
const c = (zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string):Copy => ({zh,en,ja,ko,fr,de,es,pt,ar});

type StaticEntry = { slug:string; href:string; titles:Copy };
const STATIC_PAGES: StaticEntry[] = [
  { slug:"sasi", href:"/sasi", titles:c("SASI 创作","SASI Creation","SASI 制作","SASI 제작","Création SASI","SASI-Erstellung","Creación SASI","Criação SASI","إنشاء SASI") },
  { slug:"sasi-drama", href:"/sasi/drama", titles:c("AI 短剧生成","AI Short Drama","AIショートドラマ","AI 숏드라마","Mini-série IA","KI-Kurzdrama","Minidrama IA","Minidrama com IA","دراما قصيرة بالذكاء الاصطناعي") },
  { slug:"book-sasi", href:"/ai-knowledge", titles:c("书本 SASI","Book SASI","Book SASI","Book SASI","Book SASI","Book SASI","Book SASI","Book SASI","Book SASI") },
  { slug:"learning-sasi", href:"/ai-learning", titles:c("学习 SASI","Learning SASI","学習 SASI","학습 SASI","SASI d’apprentissage","Lern-SASI","SASI de aprendizaje","SASI de aprendizagem","SASI للتعلّم") },
  { slug:"research-sasi", href:"/ai-research", titles:c("科研 SASI","Research SASI","研究 SASI","연구 SASI","SASI de recherche","Forschungs-SASI","SASI de investigación","SASI de pesquisa","SASI للبحث") },
  { slug:"tools", href:"/tools", titles:c("实用工具","Online Tools","オンラインツール","온라인 도구","Outils en ligne","Online-Tools","Herramientas online","Ferramentas online","أدوات عبر الإنترنت") },
  { slug:"pdf-editor", href:"/tools/pdf-editor", titles:c("PDF 编辑","PDF Editor","PDF 編集","PDF 편집","Éditeur PDF","PDF-Editor","Editor PDF","Editor de PDF","محرر PDF") },
  { slug:"pdf-compress", href:"/tools/pdf-compress", titles:c("PDF 压缩","PDF Compressor","PDF 圧縮","PDF 압축","Compresser PDF","PDF komprimieren","Comprimir PDF","Comprimir PDF","ضغط PDF") },
  { slug:"ocr", href:"/tools/ocr", titles:c("图片文字识别","Image OCR","画像OCR","이미지 OCR","OCR image","Bild-OCR","OCR de imagen","OCR de imagem","استخراج النص من الصور") },
  { slug:"video-transcription", href:"/tools/video-transcription", titles:c("视频转文字","Video Transcription","動画文字起こし","영상 텍스트 변환","Transcription vidéo","Video-Transkription","Transcripción de vídeo","Transcrição de vídeo","تحويل الفيديو إلى نص") },
  { slug:"temp-mail", href:"/tools/temp-mail", titles:c("临时邮箱","Temporary Email","一時メール","임시 이메일","E-mail temporaire","Temporäre E-Mail","Correo temporal","E-mail temporário","بريد مؤقت") },
  { slug:"burn-after-read", href:"/tools/burn-after-read", titles:c("阅后即焚","Burn After Reading","閲覧後に消去","열람 후 삭제","Lecture éphémère","Nach Lesen löschen","Autodestrucción","Apagar após leitura","حذف بعد القراءة") },
  { slug:"food-calorie", href:"/tools/food-calorie", titles:c("卡路里识别","Food Calorie","カロリー認識","칼로리 인식","Calories des aliments","Kalorien erkennen","Calorías de alimentos","Calorias dos alimentos","تقدير السعرات") },
];

const HINTS: Copy[] = [
  c("试试搜「AI 短剧生成」",'Try "AI Short Drama"',"「AIショートドラマ」を検索","‘AI 숏드라마’를 검색해 보세요",'Essayez « Mini-série IA »','Suche nach „KI-Kurzdrama“','Prueba «Minidrama IA»','Tente “Minidrama IA”','جرّب «دراما قصيرة بالذكاء الاصطناعي»'),
  c("试试搜「PDF 编辑」",'Try "PDF Editor"',"「PDF 編集」を検索","‘PDF 편집’을 검색해 보세요",'Essayez « Éditeur PDF »','Suche nach „PDF-Editor“','Prueba «Editor PDF»','Tente “Editor de PDF”','جرّب «محرر PDF»'),
  c("试试搜「书本 SASI」",'Try "Book SASI"',"「Book SASI」を検索","‘Book SASI’를 검색해 보세요",'Essayez « Book SASI »','Suche nach „Book SASI“','Prueba «Book SASI»','Tente “Book SASI”','جرّب «Book SASI»'),
  c("试试搜「临时邮箱」",'Try "Temporary Email"',"「一時メール」を検索","‘임시 이메일’을 검색해 보세요",'Essayez « E-mail temporaire »','Suche nach „Temporäre E-Mail“','Prueba «Correo temporal»','Tente “E-mail temporário”','جرّب «بريد مؤقت»'),
];

const UI = {
  clear:c("清空","Clear","クリア","지우기","Effacer","Leeren","Limpiar","Limpar","مسح"),
  search:c("搜索","Search","検索","검색","Rechercher","Suchen","Buscar","Buscar","بحث"),
  ask:c("向灵犀场提问","Ask LingxiField about","霊犀場に質問","링시필드에 질문","Demander à LingxiField","LingxiField fragen","Preguntar a LingxiField","Perguntar ao LingxiField","اسأل LingxiField عن"),
  empty:c("灵犀场里还没有这个","Not in the field yet","まだ見つかりません","아직 필드에 없습니다","Pas encore dans le champ","Noch nicht im Feld","Aún no está en el campo","Ainda não está no campo","غير موجود في المجال بعد"),
  pages:c("页面","Pages","ページ","페이지","Pages","Seiten","Páginas","Páginas","الصفحات"),
};

type Ripple = { id:number; x:number; y:number };

export default function SearchBox({className=""}:{className?:string}) {
  const router=useRouter();
  const {lang}=useLingxiLang();
  const [q,setQ]=useState("");
  const [focused,setFocused]=useState(false);
  const [ripples,setRipples]=useState<Ripple[]>([]);
  const [hintIdx,setHintIdx]=useState(0);
  const seq=useRef(0);
  const boxRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{const timer=setInterval(()=>setHintIdx(i=>(i+1)%HINTS.length),3200);return()=>clearInterval(timer)},[]);

  const results=useMemo(()=>{
    const query=q.trim().toLocaleLowerCase();
    if(!query)return{pages:[] as StaticEntry[]};
    const pages=STATIC_PAGES.filter(p=>Object.values(p.titles).some(title=>title.toLocaleLowerCase().includes(query))).slice(0,4);
    return{pages};
  },[q]);

  const fireRipple=(e:React.MouseEvent<HTMLDivElement>)=>{
    const rect=boxRef.current?.getBoundingClientRect();if(!rect)return;
    const r={id:seq.current++,x:e.clientX-rect.left,y:e.clientY-rect.top};
    setRipples(prev=>[...prev.slice(-3),r]);
    setTimeout(()=>setRipples(prev=>prev.filter(p=>p.id!==r.id)),900);
  };

  useEffect(()=>{const onDocClick=(e:MouseEvent)=>{if(boxRef.current&&!boxRef.current.contains(e.target as Node))setFocused(false)};document.addEventListener("mousedown",onDocClick);return()=>document.removeEventListener("mousedown",onDocClick)},[]);

  const goToTopResult=()=>{const query=q.trim();if(!query)return;setFocused(false);router.push(results.pages[0]?.href??`/learn?q=${encodeURIComponent(query)}`)};

  return <div ref={boxRef} onMouseDown={fireRipple} className={`sb-box relative ${focused?"sb-box-active":""} ${className}`}>
    {ripples.map(r=><span key={r.id} className="sb-ripple" style={{left:r.x,top:r.y}}/>)}
    <form className="flex flex-1 items-center gap-1.5" onSubmit={e=>{e.preventDefault();goToTopResult()}}>
      <svg className="sb-icon" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M13 13L17.5 17.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
      <input value={q} onChange={e=>setQ(e.target.value)} onFocus={()=>setFocused(true)} type="search" enterKeyHint="search" placeholder={HINTS[hintIdx][lang]} className="sb-input"/>
      {q&&<button type="button" aria-label={UI.clear[lang]} onClick={()=>setQ("")} className="sb-clear">×</button>}
      {q&&<button type="submit" aria-label={UI.search[lang]} className="sb-go"><svg viewBox="0 0 20 20" fill="none" className="h-full w-full"><circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.6"/><path d="M13 13L17.5 17.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg></button>}
    </form>

    {focused&&q&&<div className="sb-panel">
      <Link href={`/learn?q=${encodeURIComponent(q)}`} onClick={()=>setFocused(false)} className="sb-ask-link">{UI.ask[lang]} “{q}” →</Link>
      {!results.pages.length&&<p className="sb-empty">{UI.empty[lang]}</p>}
      {!!results.pages.length&&<div className="sb-group">
        <div className="sb-group-label">{UI.pages[lang]}</div>
        {results.pages.map(p=><Link key={p.slug} href={p.href} onClick={()=>setFocused(false)} className="sb-item"><span>{p.titles[lang]}</span><span className="sb-item-en">{p.titles.en}</span></Link>)}
      </div>}
    </div>}

    <style suppressHydrationWarning>{`
      .sb-box{display:flex;align-items:center;gap:6px;width:100%;max-width:15rem;padding:6px 10px;border-radius:999px;position:relative;border:1.5px solid transparent;background:linear-gradient(rgba(10,20,38,.55),rgba(10,20,38,.55)) padding-box,conic-gradient(from var(--sb-angle,0deg),#D8B8FF,#94D8F0,#A0E0D0,#D8B8FF) border-box;animation:sb-spin 6s linear infinite;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);color:var(--text-primary,#DDE6FF);transition:box-shadow .25s ease,background .25s ease;overflow:hidden;cursor:text}
      @property --sb-angle{syntax:'<angle>';initial-value:0deg;inherits:false}@keyframes sb-spin{to{--sb-angle:360deg}}
      .sb-box-active,.sb-box:hover{box-shadow:0 0 16px rgba(160,224,255,.3),0 4px 18px rgba(216,184,255,.18);background:linear-gradient(rgba(10,20,38,.68),rgba(10,20,38,.68)) padding-box,conic-gradient(from var(--sb-angle,0deg),#D8B8FF,#94D8F0,#A0E0D0,#D8B8FF) border-box}.sb-box.sb-wide{max-width:none}@media(prefers-reduced-motion:reduce){.sb-box{animation:none}}
      .sb-icon{width:15px;height:15px;flex:none;opacity:.85}.sb-input{flex:1;min-width:0;background:transparent;border:none;outline:none;font-size:13px;color:#ede7dc}.sb-input::placeholder{color:rgba(237,231,220,.42)}.sb-clear{flex:none;font-size:15px;line-height:1;color:rgba(237,231,220,.5);padding:0 2px}.sb-clear:hover{color:#e8b765}.sb-go{flex:none;width:22px;height:22px;padding:3px;color:rgba(237,231,220,.7);border-radius:999px;transition:color .15s ease,background .15s ease}.sb-go:hover,.sb-go:active{color:#e8b765;background:rgba(232,183,101,.12)}
      .sb-ripple{position:absolute;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:radial-gradient(circle,rgba(232,183,101,.55),transparent 70%);animation:sb-ripple-grow .8s ease-out forwards;pointer-events:none}@keyframes sb-ripple-grow{from{transform:scale(.3);opacity:.8}to{transform:scale(14);opacity:0}}
      .sb-panel{position:absolute;left:0;right:0;top:calc(100% + 8px);max-height:70vh;overflow-y:auto;background:linear-gradient(135deg,rgba(20,34,58,.88) 0%,rgba(16,28,50,.92) 100%);border:1px solid var(--aurora-glass-border,rgba(160,224,255,.5));border-radius:14px;padding:8px;box-shadow:0 12px 40px rgba(0,0,0,.4),0 0 20px rgba(140,210,255,.12);z-index:60}
      .sb-empty{padding:14px 10px 4px;font-size:13px;color:rgba(237,231,220,.55);text-align:center}.sb-ask-link{display:block;margin:4px 8px 8px;padding:9px 10px;border-radius:8px;text-align:center;font-size:13px;color:#F0C868;background:rgba(240,200,104,.1);border:1px solid rgba(240,200,104,.3);transition:background .15s ease}.sb-ask-link:hover{background:rgba(240,200,104,.2)}
      .sb-group-label{font-size:11px;letter-spacing:.08em;color:rgba(124,224,211,.75);padding:4px 8px}.sb-item{display:flex;flex-direction:column;gap:1px;padding:7px 10px;border-radius:8px;color:#ede7dc;font-size:13.5px;transition:background .15s ease}.sb-item:hover{background:rgba(232,183,101,.12)}.sb-item-en{font-size:11px;color:rgba(237,231,220,.45)}
    `}</style>
  </div>;
}
