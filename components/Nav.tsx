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

const toolsNav: NavItem[] = [
  { href: "/tools", zh: "在线工具", en: "Online Tools", rune: "mandala", badge: "NEW" },
  { href: "/tools/compress-image-to-100kb", zh: "图片压到100KB", en: "Image → 100KB", rune: "crystal" },
  { href: "/tools/file-type-detector", zh: "真实格式检测", en: "File type detect", rune: "eye" },
  { href: "/tools/md5-sha256", zh: "MD5 / SHA256", en: "MD5 / SHA256", rune: "twin" },
];

function activeFor(pathname: string, href: string) {
  if (href.includes("?")) return false;
  if (href === "/") return pathname === "/";
  if (href === "/field-tests") return ["/field-tests", "/life-map", "/relationship", "/resilience", "/romance", "/wealth", "/daily", "/mirror", "/qian", "/archetype"].some((route) => pathname === route || pathname.startsWith(`${route}/`));
  if (href === "/tools") return pathname === "/tools" || pathname.startsWith("/tools/");
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
        {[
          { title: "SASI · 创作工作台", items: creation },
          { title: "灵犀场 · 探索与实践", items: field },
          { title: "灵犀场 · 小工具", items: toolsNav },
          { title: "灵犀场 · AI知识库", items: [
            { href: "/ai-knowledge", zh: "AI知识库", en: "AI Knowledge", rune: "crystal" as RuneKind },
            { href: "/ai-learning", zh: "AI学习助手", en: "AI Learning", rune: "eye" as RuneKind },
            { href: "/ai-research", zh: "AI科研助手", en: "AI Research", rune: "mandala" as RuneKind },
          ] },
        ].map(group => <details key={`${group.title}:${pathname}`} className="lx-nav-group" open={group.items.some(item => activeFor(pathname, item.href))}>
          <summary>{group.title}</summary>
          <nav className="space-y-1" aria-label={group.title}>{group.items.map(item => <SideLink key={item.href} item={item} pathname={pathname} onNavigate={() => setOpen(false)} />)}</nav>
        </details>)}
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
