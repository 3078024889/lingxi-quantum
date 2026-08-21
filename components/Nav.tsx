"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Bi from "./Bi";
import LangToggle from "./LangToggle";
import SearchBox from "./SearchBox";
import RuneIcon, { RuneKind } from "./RuneIcon";

const links: { href: string; zh: string; en: string; rune: RuneKind }[] = [
  { href: "/live-as", zh: "意识显化", en: "Manifestation", rune: "eye" },
  { href: "/dream", zh: "探索梦境", en: "Dreams", rune: "crescent" },
  { href: "/practice", zh: "修炼技术", en: "Practices", rune: "flame" },
  { href: "/#gates", zh: "重塑潜意识", en: "Rewrite", rune: "spiral" },
  { href: "/narrative", zh: "多维叙事", en: "Narratives", rune: "infinity" },
  { href: "/learn", zh: "探索", en: "Learn", rune: "compass" },
  { href: "/membership", zh: "能量交换场", en: "Access", rune: "crystal" },
];

// "场域精测"——把生命图谱、关系共振，还有以后会陆续上线的桃花测试、
// 命硬不硬，收进同一个文件夹式的下拉菜单里，不用每上线一个新测试，
// 就在导航栏最外层再挤一个新入口——导航栏本身的宽度是有限的，这样
// 收纳，以后加测试产品也不会让顶栏变得越来越挤。
const preciseTests: { href: string; zh: string; en: string; rune: RuneKind; soon?: boolean }[] = [
  { href: "/life-map", zh: "生命图谱", en: "Life Map", rune: "mandala" },
  { href: "/relationship", zh: "关系共振", en: "Resonance", rune: "twin" },
  { href: "/resilience", zh: "生命韧性指数", en: "Life Resilience Index", rune: "crystal" },
  { href: "/romance", zh: "桃花磁场测试", en: "Romance Magnetism", rune: "crescent" },
  { href: "/wealth", zh: "财富创造地图", en: "Wealth Creation Map", rune: "mandala" },
  { href: "/daily", zh: "今日运势潮汐", en: "Daily Fortune Tide", rune: "mandala" },
  { href: "/mirror", zh: "灵犀量子生命镜像", en: "Lingxi Quantum Life Mirror", rune: "twin" },
  { href: "/qian", zh: "灵犀生命灵签", en: "Lingxi Life Oracle", rune: "crystal" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [testsOpen, setTestsOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const testsActive = pathname?.startsWith("/life-map") || pathname?.startsWith("/relationship") || pathname?.startsWith("/resilience") || pathname?.startsWith("/romance") || pathname?.startsWith("/wealth") || pathname?.startsWith("/daily") || pathname?.startsWith("/mirror") || pathname?.startsWith("/qian");

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const updateHeight = () => document.documentElement.style.setProperty("--lx-header-height", `${header.offsetHeight}px`);
    updateHeight();
    // Older embedded WebViews can render the navigation perfectly well but do
    // not implement ResizeObserver. Do not crash the entire page for a resize
    // enhancement; a window resize listener is a safe fallback.
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateHeight);
      return () => window.removeEventListener("resize", updateHeight);
    }
    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  return (
    <header ref={headerRef} className="lx-nav-glass fixed inset-x-0 top-0 z-40 border-b border-amber/15 backdrop-blur-xl">
      <nav className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="group flex flex-col leading-tight"
          >
            <span className="flex items-center gap-1.5 font-display text-base tracking-widest2 text-bone transition group-hover:text-lattice sm:text-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/lingxifield-logo.png" alt="LINGXIFIELD" className="h-[1.4em] w-[1.4em]" />
              灵犀场 LINGXIFIELD
            </span>
            <span className="mt-1 hidden font-display text-[12px] tracking-[0.1em] text-lattice/85 sm:text-[13px] md:block md:text-sm">
              <Bi
                zh="意识数字显化场域 · 场域精测 · 探索梦境 · 修炼技术 · 重塑潜意识 · 多维叙事"
                en="A Living Digital Manifestation Field · Field Insights · Dreams · Practices · Rewrite · Narratives"
              />
            </span>
          </Link>

          {/* 桌面端：搜索框 + 登录 + 语言，第一行 */}
          <div className="hidden items-center gap-4 text-[13px] text-bone-dim md:flex">
            <SearchBox />
            <Link
              href="/account"
              className="flex items-center gap-1.5 whitespace-nowrap rounded-sm border border-[#F0C868]/50 px-4 py-1.5 font-medium text-bone shadow-[0_0_14px_rgba(240,200,104,0.25)] transition hover:border-[#F0C868] hover:shadow-[0_0_20px_rgba(240,200,104,0.45)]"
            >
              <RuneIcon kind="figure" className="h-[1.1em] w-[1.1em] text-[#F0C868]" />
              <Bi zh="场域入口" en="Field Entrance" />
            </Link>
            <LangToggle />
          </div>

          {/* 移动端：汉堡按钮 */}
          <div className="flex items-center gap-3 md:hidden">
            <LangToggle />
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="菜单"
              className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-sm border border-white/15"
            >
              <span className={`h-[1.5px] w-4 bg-bone transition ${open ? "translate-y-[6.5px] rotate-45" : ""}`} />
              <span className={`h-[1.5px] w-4 bg-bone transition ${open ? "opacity-0" : ""}`} />
              <span className={`h-[1.5px] w-4 bg-bone transition ${open ? "-translate-y-[6.5px] -rotate-45" : ""}`} />
            </button>
          </div>
        </div>

        {/* 桌面端：导航链接，独立第二行，宽松排布不再挤成两行文字 */}
        <div className="mt-4 hidden flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-white/5 pt-3 text-[13px] text-bone-dim md:flex">
          {(() => {
            const NavLink = (l: (typeof links)[number]) => {
              const active = pathname === l.href || (l.href !== "/" && pathname?.startsWith(l.href.split("#")[0]) && l.href !== "/#gates");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`group relative flex items-center gap-1.5 whitespace-nowrap pb-1 transition hover:text-lattice ${active ? "text-lattice" : ""}`}
                >
                  <RuneIcon kind={l.rune} className={`h-3.5 w-3.5 ${active ? "text-lattice" : "text-bone-soft"} transition group-hover:text-lattice`} />
                  <Bi zh={l.zh} en={l.en} />
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-[13px] h-[2px] rounded-full"
                      style={{ background: "linear-gradient(90deg, #D8B8FF, #A0E0D0)" }}
                    />
                  )}
                </Link>
              );
            };
            return (
              <>
                {NavLink(links[0])}
                <div
                  className="relative"
                  onMouseEnter={() => setTestsOpen(true)}
                  onMouseLeave={() => setTestsOpen(false)}
                >
                  <button
                    onClick={() => setTestsOpen((v) => !v)}
                    className={`group flex items-center gap-1.5 whitespace-nowrap pb-1 transition hover:text-lattice ${testsActive ? "text-lattice" : ""}`}
                  >
                    <RuneIcon kind="mandala" className={`h-3.5 w-3.5 ${testsActive ? "text-lattice" : "text-bone-soft"} transition group-hover:text-lattice`} />
                    <Bi zh="场域精测" en="Precision Tests" />
                    <svg viewBox="0 0 12 8" className={`h-2 w-2.5 transition ${testsOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.4">
                      <path d="M1 1.5 6 6.5 11 1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {testsActive && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 -bottom-[13px] h-[2px] rounded-full"
                        style={{ background: "linear-gradient(90deg, #D8B8FF, #A0E0D0)" }}
                      />
                    )}
                  </button>
                  {testsOpen && (
                    <div className="bg-void-deep absolute left-1/2 top-full z-50 mt-2 w-56 -translate-x-1/2 rounded-sm border border-white/10 p-2 shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
                      {preciseTests.map((item) =>
                        item.soon ? (
                          <div key={item.zh} className="flex cursor-not-allowed items-center justify-between gap-2 rounded-sm px-3 py-2.5 text-bone-soft">
                            <span className="flex items-center gap-2">
                              <RuneIcon kind={item.rune} className="h-3.5 w-3.5" />
                              <Bi zh={item.zh} en={item.en} />
                            </span>
                            <span className="text-[11px] uppercase tracking-widest2"><Bi zh="即将上线" en="Soon" /></span>
                          </div>
                        ) : (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setTestsOpen(false)}
                            className="flex items-center gap-2 rounded-sm px-3 py-2.5 text-bone transition hover:bg-white/5 hover:text-lattice"
                          >
                            <RuneIcon kind={item.rune} className="h-3.5 w-3.5" />
                            <Bi zh={item.zh} en={item.en} />
                          </Link>
                        )
                      )}
                    </div>
                  )}
                </div>
                {links.slice(1).map((l) => NavLink(l))}
              </>
            );
          })()}
        </div>
      </nav>

      {/* 移动端：展开菜单 */}
      {open && (
        <div className="lx-nav-glass max-h-[calc(100svh-64px)] overflow-y-auto border-t border-amber/15 px-6 py-3 md:hidden">
          <div className="flex flex-col pb-6">
            <div className="pb-3">
              <SearchBox className="sb-wide" />
            </div>
            {links.slice(0, 1).map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 border-b border-white/5 py-3 text-base text-bone transition hover:text-lattice"
              >
                <RuneIcon kind={l.rune} className="h-4 w-4 text-lattice" />
                <Bi zh={l.zh} en={l.en} />
              </Link>
            ))}
            <p className="pt-3 text-xs uppercase tracking-widest2 text-bone-soft"><Bi zh="场域精测" en="Precision Tests" /></p>
            {preciseTests.map((item) =>
              item.soon ? (
                <div key={item.zh} className="flex items-center justify-between gap-3 border-b border-white/5 py-3 text-base text-bone-soft">
                  <span className="flex items-center gap-3">
                    <RuneIcon kind={item.rune} className="h-4 w-4" />
                    <Bi zh={item.zh} en={item.en} />
                  </span>
                  <span className="text-[11px] uppercase tracking-widest2"><Bi zh="即将上线" en="Soon" /></span>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 border-b border-white/5 py-3 text-base text-bone transition hover:text-lattice"
                >
                  <RuneIcon kind={item.rune} className="h-4 w-4 text-lattice" />
                  <Bi zh={item.zh} en={item.en} />
                </Link>
              )
            )}
            {links.slice(1).map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 border-b border-white/5 py-3 text-base text-bone transition hover:text-lattice"
              >
                <RuneIcon kind={l.rune} className="h-4 w-4 text-lattice" />
                <Bi zh={l.zh} en={l.en} />
              </Link>
            ))}
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="mt-4 flex items-center justify-center gap-2 rounded-sm border border-[#F0C868]/50 py-3 text-center font-display text-sm tracking-widest2 text-bone transition hover:border-[#F0C868]"
            >
              <RuneIcon kind="figure" className="h-4 w-4 text-[#F0C868]" />
              <Bi zh="场域入口" en="Field Entrance" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
