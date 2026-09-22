"use client";
import Link from "next/link";
import { FormEvent,useEffect,useState } from "react";
import { usePathname,useRouter } from "next/navigation";
import { LANG_NAMES,type LingxiLang,useLingxiLang } from "@/lib/lingxi-i18n";
type Theme="light"|"dark";
type K="home"|"tools"|"studio"|"books"|"learning"|"research"|"field"|"manifest"|"subconscious"|"practice"|"wallet"|"myField";
const groups:{href:string;key:K}[][]=[
 [{href:"/",key:"home"},{href:"/tools",key:"tools"},{href:"/sasi",key:"studio"}],
 [{href:"/ai-knowledge",key:"books"},{href:"/ai-learning",key:"learning"},{href:"/ai-research",key:"research"}],
 [{href:"/field-tests",key:"field"},{href:"/live-as",key:"manifest"},{href:"/subconscious",key:"subconscious"},{href:"/practice",key:"practice"},{href:"/ai-wallet",key:"wallet"},{href:"/account",key:"myField"}]
];
function active(p:string,h:string){if(h==="/")return p==="/";if(h==="/tools")return p==="/tools"||p.startsWith("/tools/");return p===h||p.startsWith(`${h}/`)}
export default function Nav(){
 const pathname=usePathname()||"/",router=useRouter(),{lang,setLang,t}=useLingxiLang();const[open,setOpen]=useState(false),[theme,setTheme]=useState<Theme>("light"),[query,setQuery]=useState(""),[updates,setUpdates]=useState(false);
 useEffect(()=>{const x=(localStorage.getItem("lx-theme")||"light") as Theme;setTheme(x==="dark"?"dark":"light")},[]);
 useEffect(()=>setOpen(false),[pathname]);useEffect(()=>{localStorage.setItem("lx-theme",theme);document.documentElement.dataset.theme=theme},[theme]);
 const agent=pathname==="/sasi"||pathname.startsWith("/sasi/")||pathname.startsWith("/ai-"),titles=[t("start"),t("sasi"),t("fieldGroup")];
 function submit(e:FormEvent){e.preventDefault();const q=query.trim();if(!q)return;sessionStorage.setItem("lx-global-search",q);router.push(`/tools?q=${encodeURIComponent(q)}`)}
 const side=<><div className="lx11-brand-row"><Link href="/" className="lx11-brand"><img src="/images/lingxifield-logo.png" alt=""/><span><b>{t("brand")}</b><small>{agent?"SASI":"LINGXIFIELD"}</small></span></Link><button className="lx11-close lg:hidden" onClick={()=>setOpen(false)}>×</button></div><div className="lx11-nav-scroll"><Link className="lx11-new-task" href="/sasi">＋ {t("newTask")}</Link>{groups.map((g,i)=><section key={i} className="lx11-group"><div className="lx11-group-title">{titles[i]}</div>{g.map(x=><Link key={x.href} href={x.href} className={`lx11-link ${active(pathname,x.href)?"is-active":""}`}><span className="lx11-dot"/><span>{t(x.key)}</span></Link>)}</section>)}</div><div className="lx11-sidebar-bottom"><div className="lx11-theme-row"><button onClick={()=>setTheme("light")} className={theme==="light"?"is-active":""}>☀ {t("light")}</button><button onClick={()=>setTheme("dark")} className={theme==="dark"?"is-active":""}>◐ {t("dark")}</button></div><label className="lx11-lang-label">{t("language")} / Language</label><select value={lang} onChange={e=>setLang(e.target.value as LingxiLang)} className="lx11-lang-select">{(Object.keys(LANG_NAMES) as LingxiLang[]).map(k=><option key={k} value={k}>{LANG_NAMES[k]}</option>)}</select></div></>;
 return <><aside className="lx11-sidebar hidden lg:flex">{side}</aside><header className="lx11-topbar"><form className="lx11-search" onSubmit={submit}><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t("search")}/></form><div className="lx11-top-actions"><Link href="/sasi" className="lx11-top-link">＋ {t("create")}</Link><button className="lx11-icon-btn" onClick={()=>setUpdates(v=>!v)}>♢</button><Link href="/ai-wallet" className="lx11-primary">{t("recharge")}</Link><Link href="/account" className="lx11-avatar">◎</Link></div>{updates&&<div className="lx11-updates"><b>{t("updateTitle")}</b><p>{t("update1")}</p><p>{t("update2")}</p></div>}</header><header className="lx11-mobile lg:hidden"><Link href="/" className="lx11-mobile-brand"><img src="/images/lingxifield-logo.png" alt=""/><span><b>{t("brand")}</b><small>{agent?"SASI":"LINGXIFIELD"}</small></span></Link><div className="lx11-mobile-actions"><Link href="/ai-wallet">{t("recharge")}</Link><button onClick={()=>setOpen(true)}>☰</button></div></header>{open&&<button className="lx11-backdrop lg:hidden" onClick={()=>setOpen(false)}/>}<aside className={`lx11-sidebar lx11-drawer lg:hidden ${open?"is-open":""}`}>{side}</aside></>
}
