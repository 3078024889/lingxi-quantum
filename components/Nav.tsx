"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Bi from "./Bi";
import LangToggle from "./LangToggle";
import RuneIcon, { RuneKind } from "./RuneIcon";

type NavItem = { href: string; zh: string; en: string; rune: RuneKind; badge?: string };

const creation: NavItem[] = [
  { href: "/", zh: "SASI 首页", en: "SASI Home", rune: "crystal" },
  { href: "/?view=drama", zh: "影像创作", en: "Screen Studio", rune: "crescent" },
  { href: "/?view=build", zh: "产品构建", en: "Build & Deliver", rune: "mandala" },
  { href: "/learn", zh: "探索灵感", en: "Explore", rune: "compass" },
];

const field: NavItem[] = [
  { href: "/live-as", zh: "意识显化", en: "Manifestation", rune: "eye" },
  { href: "/practice", zh: "修炼技术", en: "Practice", rune: "flame", badge: "FREE" },
  { href: "/subconscious", zh: "重塑潜意识", en: "Rewrite Mind", rune: "spiral", badge: "FREE" },
  { href: "/account", zh: "我的场域", en: "My Field", rune: "figure" },
];

const insights: NavItem[] = [
  { href: "/life-map", zh: "生命图谱", en: "Life Map", rune: "mandala" },
  { href: "/relationship", zh: "关系共振", en: "Resonance", rune: "twin" },
  { href: "/resilience", zh: "生命韧性", en: "Resilience", rune: "crystal" },
  { href: "/romance", zh: "桃花磁场", en: "Romance Field", rune: "crescent" },
  { href: "/wealth", zh: "财富创造", en: "Wealth Creation", rune: "mandala" },
  { href: "/daily", zh: "今日潮汐", en: "Today’s Tide", rune: "eye" },
  { href: "/mirror", zh: "生命镜像", en: "Life Mirror", rune: "twin" },
  { href: "/qian", zh: "生命灵签", en: "Life Oracle", rune: "crystal" },
  { href: "/archetype", zh: "生命原型", en: "Life Archetype", rune: "spiral" },
];

function activeFor(pathname: string, href: string) {
  if (href.includes("?")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SideLink({ item, pathname, onNavigate }: { item: NavItem; pathname: string; onNavigate?: () => void }) {
  const active = activeFor(pathname, item.href);
  return (
    <Link href={item.href} onClick={onNavigate} className={`lx-side-link ${active ? "is-active" : ""}`}>
      <RuneIcon kind={item.rune} className="h-[18px] w-[18px] shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium"><Bi zh={item.zh} en={item.en} /></span>
        <span className="block truncate text-[9px] uppercase tracking-[.13em] opacity-45">{item.en}</span>
      </span>
      {item.badge && <span className="lx-side-badge">{item.badge}</span>}
    </Link>
  );
}

export default function Nav() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(() => insights.some((item) => activeFor(pathname, item.href)));
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem("lingxi-site-theme");
    const next = stored === "light" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }, []);

  useEffect(() => {
    if (insights.some((item) => activeFor(pathname, item.href))) setInsightsOpen(true);
    setOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("lingxi-site-theme", next);
  };

  const navigation = (
    <>
      <Link href="/" className="lx-side-brand" onClick={() => setOpen(false)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/lingxifield-logo.png" alt="" className="h-11 w-11" />
        <span><strong>灵犀场 SASI</strong><small>Lingxifield Sovereign AI Studio</small></span>
      </Link>

      <div className="lx-side-scroll">
        <p className="lx-side-kicker">SASI · CREATE</p>
        <nav className="space-y-1" aria-label="SASI creation">
          {creation.map((item) => <SideLink key={item.href} item={item} pathname={pathname} onNavigate={() => setOpen(false)} />)}
        </nav>
        <div className="lx-side-rule" />
        <p className="lx-side-kicker"><Bi zh="第二层 · LINGXI FIELD" en="SECOND LAYER · LINGXI FIELD" /></p>
        <nav className="space-y-1" aria-label="Lingxi Field">
          <SideLink item={field[0]} pathname={pathname} onNavigate={() => setOpen(false)} />
          <button type="button" className={`lx-side-link w-full ${insights.some((item) => activeFor(pathname, item.href)) ? "is-active" : ""}`} onClick={() => setInsightsOpen((value) => !value)} aria-expanded={insightsOpen}>
            <RuneIcon kind="mandala" className="h-[18px] w-[18px] shrink-0" />
            <span className="min-w-0 flex-1 text-left"><span className="block text-[13px] font-medium"><Bi zh="场域精测" en="Field Insights" /></span><span className="block text-[9px] uppercase tracking-[.13em] opacity-45">Field Insights</span></span>
            <span className={`text-xs transition ${insightsOpen ? "rotate-180" : ""}`}>⌄</span>
          </button>
          {insightsOpen && <div className="ml-4 border-l border-current/10 pl-2">{insights.map((item) => <SideLink key={item.href} item={item} pathname={pathname} onNavigate={() => setOpen(false)} />)}</div>}
          {field.slice(1).map((item) => <SideLink key={item.href} item={item} pathname={pathname} onNavigate={() => setOpen(false)} />)}
        </nav>
      </div>

      <div className="lx-side-actions">
        <button type="button" onClick={toggleTheme} className="lx-theme-toggle" aria-label={theme === "dark" ? "切换浅色" : "切换深色"}>
          <span className={theme === "light" ? "is-selected" : ""}>☀ <Bi zh="浅色" en="Light" /></span>
          <span className={theme === "dark" ? "is-selected" : ""}>☾ <Bi zh="深色" en="Dark" /></span>
        </button>
        <div className="mt-3 flex items-center justify-between gap-3"><LangToggle /><Link href="/account" className="text-[11px] opacity-65 transition hover:opacity-100"><Bi zh="进入场域 →" en="Enter field →" /></Link></div>
      </div>
    </>
  );

  return (
    <>
      <aside className="lx-side-nav hidden lg:flex">{navigation}</aside>
      <header className="lx-mobile-nav lg:hidden">
        <Link href="/" className="flex items-center gap-2">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/images/lingxifield-logo.png" alt="" className="h-8 w-8" /><span className="text-sm font-semibold tracking-[.08em]">灵犀场 SASI</span></Link>
        <div className="flex items-center gap-2"><LangToggle /><button type="button" onClick={() => setOpen(true)} className="lx-mobile-menu" aria-label="打开导航">☰</button></div>
      </header>
      {open && <div className="fixed inset-0 z-[90] bg-black/55 lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" />}
      <aside className={`lx-side-nav lx-side-nav-mobile lg:hidden ${open ? "is-open" : ""}`}><button type="button" onClick={() => setOpen(false)} className="absolute right-4 top-4 z-10 text-xl opacity-60" aria-label="关闭导航">×</button>{navigation}</aside>
    </>
  );
}
