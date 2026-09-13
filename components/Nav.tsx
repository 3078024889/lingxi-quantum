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
  { href: "/?view=director", zh: "苍玄 AI 导演", en: "CangXuan Director", rune: "eye" },
  { href: "/?view=drama", zh: "AI 短剧工坊", en: "AI Drama Studio", rune: "crescent" },
  { href: "/?view=build", zh: "编程构建部署", en: "Build & Deploy", rune: "mandala" },
  { href: "/?view=skills", zh: "Skills", en: "Skills", rune: "crystal" },
  { href: "/?view=models", zh: "模型与 API", en: "Models & API", rune: "twin" },
  { href: "/?view=billing", zh: "余额与用量", en: "Balance & Usage", rune: "flame" },
  { href: "/?view=works", zh: "我的作品库", en: "My Works", rune: "compass" },
  { href: "/?view=account", zh: "我的账户", en: "My Account", rune: "figure" },
];

const field: NavItem[] = [
  { href: "/learn", zh: "探索", en: "Explore", rune: "compass" },
  { href: "/live-as", zh: "意识显化", en: "Manifestation", rune: "eye" },
  { href: "/field-tests", zh: "场域精测", en: "Field Insights", rune: "mandala" },
  { href: "/practice", zh: "修炼技术", en: "Practice", rune: "flame", badge: "FREE" },
  { href: "/subconscious", zh: "重塑潜意识", en: "Rewrite Mind", rune: "spiral", badge: "FREE" },
  { href: "/account", zh: "我的场域", en: "My Field", rune: "figure" },
];

function activeFor(pathname: string, href: string) {
  if (href.includes("?")) return false;
  if (href === "/") return pathname === "/";
  if (href === "/field-tests") return ["/field-tests", "/life-map", "/relationship", "/resilience", "/romance", "/wealth", "/daily", "/mirror", "/qian", "/archetype"].some((route) => pathname === route || pathname.startsWith(`${route}/`));
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SideLink({ item, pathname, onNavigate }: { item: NavItem; pathname: string; onNavigate?: () => void }) {
  const active = activeFor(pathname, item.href);
  return (
    <Link href={item.href} onClick={onNavigate} className={`lx-side-link ${active ? "is-active" : ""}`}>
      <RuneIcon kind={item.rune} className="h-[18px] w-[18px] shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-medium"><Bi zh={item.zh} en={item.en} /></span>
        <span className="block truncate text-xs uppercase tracking-[.09em] opacity-60">{item.en}</span>
      </span>
      {item.badge && <span className="lx-side-badge">{item.badge}</span>}
    </Link>
  );
}

export default function Nav() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    const stored = window.localStorage.getItem("lingxi-site-theme");
    const next = stored === "dark" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }, []);

  useEffect(() => {
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
          {field.map((item) => <SideLink key={item.href} item={item} pathname={pathname} onNavigate={() => setOpen(false)} />)}
        </nav>
      </div>

      <div className="lx-side-actions">
        <button type="button" onClick={toggleTheme} className="lx-theme-toggle" aria-label={theme === "dark" ? "切换浅色" : "切换深色"}>
          <span className={theme === "light" ? "is-selected" : ""}>☀ <Bi zh="浅色" en="Light" /></span>
          <span className={theme === "dark" ? "is-selected" : ""}>☾ <Bi zh="深色" en="Dark" /></span>
        </button>
        <div className="mt-3 flex items-center justify-between gap-3"><LangToggle /><Link href="/account" className="text-sm opacity-70 transition hover:opacity-100"><Bi zh="进入场域 →" en="Enter field →" /></Link></div>
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
