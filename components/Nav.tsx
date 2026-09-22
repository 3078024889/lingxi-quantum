"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type Lang = "zh"|"en"|"ja"|"ko"|"fr"|"de"|"es"|"pt"|"ar";
type Item = { href:string; key:keyof typeof copy.zh.nav };

const copy = {
  zh:{brand:"灵犀场",search:"搜索",new:"新任务",nav:{home:"首页",tools:"实用工具",books:"书本智能体",learning:"学习助手",research:"科研助手",studio:"AI 创作",field:"场域精测",manifest:"意识显化",practice:"修炼技术",wallet:"AI 余额",account:"我的场域"}, groups:["开始","智能体","灵犀场"]},
  en:{brand:"LINGXIFIELD",search:"Search",new:"New task",nav:{home:"Home",tools:"Tools",books:"Book Agent",learning:"Learning",research:"Research",studio:"AI Studio",field:"Field Insights",manifest:"Manifestation",practice:"Practice",wallet:"AI Balance",account:"Account"},groups:["Start","Agents","LingxiField"]},
  ja:{brand:"霊犀場",search:"検索",new:"新しいタスク",nav:{home:"ホーム",tools:"ツール",books:"ブックエージェント",learning:"学習アシスタント",research:"研究アシスタント",studio:"AI 制作",field:"フィールド分析",manifest:"意識の具現化",practice:"実践",wallet:"AI 残高",account:"アカウント"},groups:["開始","エージェント","霊犀場"]},
  ko:{brand:"링시필드",search:"검색",new:"새 작업",nav:{home:"홈",tools:"도구",books:"북 에이전트",learning:"학습 도우미",research:"연구 도우미",studio:"AI 제작",field:"필드 분석",manifest:"의식 구현",practice:"수련",wallet:"AI 잔액",account:"계정"},groups:["시작","에이전트","링시필드"]},
  fr:{brand:"LINGXIFIELD",search:"Rechercher",new:"Nouvelle tâche",nav:{home:"Accueil",tools:"Outils",books:"Agent Livre",learning:"Apprentissage",research:"Recherche",studio:"Studio IA",field:"Analyse du champ",manifest:"Manifestation",practice:"Pratique",wallet:"Solde IA",account:"Compte"},groups:["Départ","Agents","LingxiField"]},
  de:{brand:"LINGXIFIELD",search:"Suchen",new:"Neue Aufgabe",nav:{home:"Start",tools:"Werkzeuge",books:"Buch-Agent",learning:"Lernen",research:"Forschung",studio:"KI Studio",field:"Feldanalyse",manifest:"Manifestation",practice:"Praxis",wallet:"KI-Guthaben",account:"Konto"},groups:["Start","Agenten","LingxiField"]},
  es:{brand:"LINGXIFIELD",search:"Buscar",new:"Nueva tarea",nav:{home:"Inicio",tools:"Herramientas",books:"Agente de libros",learning:"Aprendizaje",research:"Investigación",studio:"Estudio IA",field:"Análisis de campo",manifest:"Manifestación",practice:"Práctica",wallet:"Saldo IA",account:"Cuenta"},groups:["Inicio","Agentes","LingxiField"]},
  pt:{brand:"LINGXIFIELD",search:"Pesquisar",new:"Nova tarefa",nav:{home:"Início",tools:"Ferramentas",books:"Agente de livros",learning:"Aprendizagem",research:"Pesquisa",studio:"Estúdio IA",field:"Análise de campo",manifest:"Manifestação",practice:"Prática",wallet:"Saldo IA",account:"Conta"},groups:["Início","Agentes","LingxiField"]},
  ar:{brand:"LINGXIFIELD",search:"بحث",new:"مهمة جديدة",nav:{home:"الرئيسية",tools:"الأدوات",books:"وكيل الكتب",learning:"التعلّم",research:"البحث",studio:"استوديو الذكاء",field:"تحليل المجال",manifest:"التجسيد",practice:"الممارسة",wallet:"رصيد الذكاء",account:"الحساب"},groups:["ابدأ","الوكلاء","LingxiField"]},
} as const;

const languageNames: Record<Lang,string> = {zh:"中文",en:"English",ja:"日本語",ko:"한국어",fr:"Français",de:"Deutsch",es:"Español",pt:"Português",ar:"العربية"};
const itemGroups: Item[][] = [
  [{href:"/",key:"home"},{href:"/tools",key:"tools"},{href:"/sasi",key:"studio"}],
  [{href:"/ai-knowledge",key:"books"},{href:"/ai-learning",key:"learning"},{href:"/ai-research",key:"research"}],
  [{href:"/field-tests",key:"field"},{href:"/live-as",key:"manifest"},{href:"/practice",key:"practice"},{href:"/ai-wallet",key:"wallet"},{href:"/account",key:"account"}],
];

function active(pathname:string, href:string){
  if(href==="/") return pathname==="/";
  if(href==="/tools") return pathname==="/tools"||pathname.startsWith("/tools/");
  return pathname===href||pathname.startsWith(`${href}/`);
}

export default function Nav(){
  const pathname=usePathname()||"/";
  const [open,setOpen]=useState(false);
  const [lang,setLang]=useState<Lang>("zh");
  useEffect(()=>{
    const saved=(localStorage.getItem("lx-lang")||"zh") as Lang;
    if(copy[saved]) setLang(saved);
  },[]);
  useEffect(()=>setOpen(false),[pathname]);
  useEffect(()=>{
    localStorage.setItem("lx-lang",lang);
    document.documentElement.lang=lang==="zh"?"zh-CN":lang;
    document.documentElement.dir=lang==="ar"?"rtl":"ltr";
  },[lang]);
  const t=copy[lang];
  const nav=useMemo(()=>itemGroups,[ ]);

  const body=<>
    <div className="lx10-brand-row">
      <Link href="/" className="lx10-brand" onClick={()=>setOpen(false)}>
        <img src="/images/lingxifield-logo.png" alt="" />
        <span>{t.brand}</span>
      </Link>
      <button className="lx10-close lg:hidden" onClick={()=>setOpen(false)} aria-label="关闭">×</button>
    </div>
    <div className="lx10-nav-scroll">
      <Link className="lx10-new-task" href="/sasi" onClick={()=>setOpen(false)}>＋ {t.new}</Link>
      {nav.map((group,gi)=><section key={gi} className="lx10-group">
        <div className="lx10-group-title">{t.groups[gi]}</div>
        {group.map(item=><Link key={item.href} href={item.href} onClick={()=>setOpen(false)} className={`lx10-link ${active(pathname,item.href)?"is-active":""}`}>
          <span className="lx10-dot" />{t.nav[item.key]}
        </Link>)}
      </section>)}
    </div>
    <div className="lx10-sidebar-bottom">
      <label className="lx10-lang-label" htmlFor="lx-lang">语言 / Language</label>
      <select id="lx-lang" value={lang} onChange={e=>setLang(e.target.value as Lang)} className="lx10-lang-select">
        {(Object.keys(languageNames) as Lang[]).map(k=><option key={k} value={k}>{languageNames[k]}</option>)}
      </select>
      <p>别人给你一个工具。灵犀场给你一个结果。</p>
    </div>
  </>;

  return <>
    <aside className="lx10-sidebar hidden lg:flex">{body}</aside>
    <header className="lx10-mobile lg:hidden">
      <Link href="/" className="lx10-mobile-brand"><img src="/images/lingxifield-logo.png" alt=""/><b>{t.brand}</b></Link>
      <button onClick={()=>setOpen(true)} className="lx10-menu" aria-label="菜单">☰</button>
    </header>
    {open&&<button className="lx10-backdrop lg:hidden" onClick={()=>setOpen(false)} aria-label="关闭菜单" />}
    <aside className={`lx10-sidebar lx10-drawer lg:hidden ${open?"is-open":""}`}>{body}</aside>
  </>;
}
