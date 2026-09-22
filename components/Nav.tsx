"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import RuneIcon, { RuneKind } from "./RuneIcon";

type Item = { href:string; title:string; sub?:string; rune:RuneKind; badge?:string };

const groups: Array<{ title:string; items:Item[] }> = [
  {
    title: "开始",
    items: [
      { href:"/", title:"今天想解决什么？", sub:"HOME", rune:"compass" },
      { href:"/tools", title:"实用工具", sub:"TOOLS", rune:"mandala", badge:"NEW" },
    ],
  },
  {
    title: "灵犀场 · 书本智能体",
    items: [
      { href:"/ai-knowledge", title:"书本智能体", sub:"BOOK AGENT", rune:"crystal" },
      { href:"/ai-learning", title:"AI学习助手", sub:"AI LEARNING", rune:"eye" },
      { href:"/ai-research", title:"AI科研助手", sub:"AI RESEARCH", rune:"mandala" },
    ],
  },
  {
    title: "灵犀场",
    items: [
      { href:"/field-tests", title:"场域精测", sub:"FIELD INSIGHTS", rune:"mandala" },
      { href:"/live-as", title:"意识显化", sub:"MANIFESTATION", rune:"eye" },
      { href:"/subconscious", title:"潜意识重塑", sub:"SUBCONSCIOUS", rune:"spiral" },
      { href:"/practice", title:"修炼技术", sub:"PRACTICE", rune:"flame" },
      { href:"/account", title:"我的场域", sub:"ACCOUNT", rune:"figure" },
    ],
  },
];

function isActive(pathname:string, href:string) {
  if (href === "/") return pathname === "/";
  if (href === "/tools") return pathname === "/tools" || pathname.startsWith("/tools/");
  if (href === "/field-tests") {
    return ["/field-tests","/life-map","/relationship","/resilience","/romance","/wealth","/daily","/mirror","/qian","/archetype"]
      .some((x)=>pathname===x||pathname.startsWith(`${x}/`));
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({item, pathname, close}:{item:Item;pathname:string;close:()=>void}) {
  const active=isActive(pathname,item.href);
  return <Link href={item.href} onClick={close} className={`lx-v9-nav-link ${active?"is-active":""}`}>
    <RuneIcon kind={item.rune} className="h-[17px] w-[17px] shrink-0" />
    <span className="min-w-0 flex-1">
      <span className="block truncate text-[15px] font-medium">{item.title}</span>
      {item.sub&&<span className="mt-[2px] block truncate text-[10px] tracking-[.14em] text-slate-400">{item.sub}</span>}
    </span>
    {item.badge&&<span className="rounded-full bg-blue-50 px-2 py-1 text-[9px] font-semibold text-blue-600">{item.badge}</span>}
  </Link>;
}

export default function Nav() {
  const pathname=usePathname()||"/";
  const [open,setOpen]=useState(false);
  useEffect(()=>setOpen(false),[pathname]);
  const content=<>
    <Link href="/" className="lx-v9-brand" onClick={()=>setOpen(false)}>
      <img src="/images/lingxifield-logo.png" alt="灵犀场 LINGXIFIELD" className="h-10 w-10 rounded-xl object-contain" />
      <span><strong>灵犀场</strong><small>LINGXIFIELD</small></span>
    </Link>
    <div className="lx-v9-nav-scroll">
      {groups.map((group)=><section key={group.title} className="mb-6">
        <h2 className="px-3 pb-2 text-[12px] font-semibold tracking-[.08em] text-slate-500">{group.title}</h2>
        <nav className="space-y-1" aria-label={group.title}>
          {group.items.map(item=><NavLink key={item.href} item={item} pathname={pathname} close={()=>setOpen(false)} />)}
        </nav>
      </section>)}
    </div>
    <div className="border-t border-slate-100 p-4">
      <p className="text-xs leading-5 text-slate-400">别人给你一个工具。<br/>灵犀场给你一个结果。</p>
    </div>
  </>;

  return <>
    <aside className="lx-v9-side hidden lg:flex">{content}</aside>
    <header className="lx-v9-mobile lg:hidden">
      <Link href="/" className="flex items-center gap-2"><img src="/images/lingxifield-logo.png" alt="" className="h-8 w-8"/><b>灵犀场</b></Link>
      <button onClick={()=>setOpen(true)} aria-label="打开导航" className="rounded-xl border border-slate-200 bg-white px-3 py-2">☰</button>
    </header>
    {open&&<div className="fixed inset-0 z-[90] bg-black/30 lg:hidden" onClick={()=>setOpen(false)}/>}
    <aside className={`lx-v9-side lx-v9-mobile-drawer lg:hidden ${open?"is-open":""}`}>
      <button onClick={()=>setOpen(false)} className="absolute right-4 top-4 text-xl text-slate-400" aria-label="关闭导航">×</button>
      {content}
    </aside>
  </>;
}
