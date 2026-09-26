"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLingxiLang, type LingxiLang } from "@/lib/lingxi-i18n";

type Copy = Record<LingxiLang, string>;
const c = (zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string):Copy => ({zh,en,ja,ko,fr,de,es,pt,ar});

type StaticEntry = { slug:string; href:string; titles:Copy };
const STATIC_PAGES: StaticEntry[] = [
  { slug:"live-as", href:"/live-as", titles:c("SASI 创作","Manifestation","意識の具現化","의식 구현","Manifestation","Manifestation","Manifestación","Manifestação","التجسيد") },
  { slug:"sasi", href:"/sasi", titles:c("灵犀场 SASI · AI 创作","LINGXIFIELD SASI · AI Creation","霊犀場 SASI · AI 制作","링시필드 SASI · AI 제작","LINGXIFIELD SASI · Création IA","LINGXIFIELD SASI · KI-Erstellung","LINGXIFIELD SASI · Creación IA","LINGXIFIELD SASI · Criação com IA","LINGXIFIELD SASI · إنشاء بالذكاء الاصطناعي") },
  { slug:"practice", href:"/practice", titles:c("阅后即焚","Practices","実践","수련","Pratiques","Praxis","Prácticas","Práticas","الممارسات") },
  { slug:"gates", href:"/#gates", titles:c("资料知识","Subconscious Reframing","潜在意識の再構築","잠재의식 재구성","Reconfiguration du subconscient","Unterbewusstsein neu ausrichten","Reconfiguración del subconsciente","Reconfiguração do subconsciente","إعادة تشكيل العقل الباطن") },
  { slug:"learn", href:"/learn", titles:c("探索","Learn","探索","탐색","Explorer","Entdecken","Explorar","Explorar","استكشاف") },
  { slug:"membership", href:"/membership", titles:c("能量交换场","Access","アクセス","이용 권한","Accès","Zugang","Acceso","Acesso","الوصول") },
  { slug:"number-energy", href:"/tools/number-energy", titles:c("手机号车牌号测试","Number Energy","番号エネルギー","번호 에너지","Énergie des nombres","Zahlenenergie","Energía numérica","Energia dos números","طاقة الأرقام") },
  { slug:"book-sasi", href:"/ai-knowledge", titles:c("书本 SASI","Book SASI","Book SASI","Book SASI","Book SASI","Book SASI","Book SASI","Book SASI","Book SASI") },
  { slug:"practice-breath", href:"/practice/breath", titles:c("量子息法","Quantum Breath Method","量子呼吸法","양자 호흡법","Méthode du souffle quantique","Quanten-Atemmethode","Método de respiración cuántica","Método da Respiração Quântica","طريقة التنفس الكمي") },
  { slug:"practice-intuition", href:"/practice/intuition", titles:c("直觉丹道","The Intuitive Way","直観の道","직관의 길","La voie intuitive","Der intuitive Weg","La vía intuitiva","O Caminho Intuitivo","طريق الحدس") },
  { slug:"practice-heart-reset", href:"/practice/heart-reset", titles:c("归零心诀","Heart Reset","ハートリセット","하트 리셋","Réinitialisation du cœur","Herz-Reset","Reinicio del corazón","Reset do coração","إعادة ضبط القلب") },
  { slug:"practice-ascending-heart", href:"/practice/ascending-heart", titles:c("上升心经","Ascending Heart","上昇する心","상승의 마음","Cœur ascendant","Aufsteigendes Herz","Corazón ascendente","Coração ascendente","القلب الصاعد") },
  { slug:"account", href:"/account", titles:c("场域入口","Account","アカウント","계정","Compte","Konto","Cuenta","Conta","الحساب") },
  { slug:"relationship", href:"/relationship", titles:c("关系共振图谱","Relationship Resonance Map","関係共鳴マップ","관계 공명 지도","Carte de résonance relationnelle","Beziehungsresonanz-Karte","Mapa de resonancia relacional","Mapa de ressonância relacional","خريطة رنين العلاقات") },
  { slug:"resilience", href:"/resilience", titles:c("生命韧性指数","Life Resilience Index","生命レジリエンス指数","생명 회복탄력성 지수","Indice de résilience de vie","Lebensresilienz-Index","Índice de resiliencia vital","Índice de resiliência da vida","مؤشر مرونة الحياة") },
  { slug:"romance", href:"/romance", titles:c("临时邮箱指数","Romance Resonance Index","恋愛共鳴指数","로맨스 공명 지수","Indice de résonance amoureuse","Romanz-Resonanzindex","Índice de resonancia romántica","Índice de ressonância romântica","مؤشر الرنين العاطفي") },
  { slug:"daily", href:"/daily", titles:c("今日潮汐","Today’s Tide","今日の潮汐","오늘의 흐름","Marée du jour","Heutige Gezeiten","Marea de hoy","Maré de hoje","مدّ اليوم") },
  { slug:"tarot", href:"/mirror", titles:c("量子生命镜像","Quantum Life Mirror","量子生命ミラー","양자 생명 거울","Miroir quantique de vie","Quanten-Lebensspiegel","Espejo cuántico de vida","Espelho quântico da vida","مرآة الحياة الكمية") },
  { slug:"tarot-daily", href:"/mirror/daily", titles:c("今日生命镜像","Daily Life Mirror","今日の生命ミラー","오늘의 생명 거울","Miroir quotidien","Täglicher Lebensspiegel","Espejo diario","Espelho diário","مرآة اليوم") },
  { slug:"qian", href:"/qian", titles:c("生命灵签","Life Oracle","生命オラクル","생명 오라클","Oracle de vie","Lebensorakel","Oráculo de vida","Oráculo da vida","وحي الحياة") },
  { slug:"life-archetype", href:"/archetype", titles:c("生命原型","Life Archetype","生命アーキタイプ","생명 원형","Archétype de vie","Lebensarchetyp","Arquetipo de vida","Arquétipo da vida","النموذج الأصلي للحياة") },
];

const HINTS: Copy[] = [
  c("试试搜「AI短剧」",'Try "AI Drama"',"「AIドラマ」を検索","‘AI 드라마’를 검색해 보세요",'Essayez « Drama IA »','Suche nach „KI-Drama“','Prueba «Drama IA»','Tente “Drama IA”','جرّب البحث عن «دراما بالذكاء الاصطناعي»'),
  c("试试搜「量子息法」",'Try "Quantum Breath Method"',"「量子呼吸法」を検索","‘양자 호흡법’을 검색해 보세요",'Essayez « Souffle quantique »','Suche nach „Quanten-Atemmethode“','Prueba «Respiración cuántica»','Tente “Respiração Quântica”','جرّب «التنفس الكمي»'),
  c("试试搜「书本 SASI」",'Try "Life Map"',"「生命マップ」を検索","‘생명 지도’를 검색해 보세요",'Essayez « Carte de vie »','Suche nach „Lebenskarte“','Prueba «Mapa de vida»','Tente “Mapa da vida”','جرّب «خريطة الحياة»'),
  c("试试搜「PDF 工具」",'Try "Manifestation"',"「具現化」を検索","‘의식 구현’을 검색해 보세요",'Essayez « Manifestation »','Suche nach „Manifestation“','Prueba «Manifestación»','Tente “Manifestação”','جرّب «التجسيد»'),
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
