"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Bi from "./Bi";
import LangToggle from "./LangToggle";
import SearchBox from "./SearchBox";
import RuneIcon, { RuneKind } from "./RuneIcon";

const links: { href: string; zh: string; en: string; rune: RuneKind }[] = [
  { href: "/live-as", zh: "意识显化", en: "Manifestation", rune: "eye" },
  { href: "/life-map", zh: "生命图谱", en: "Life Map", rune: "mandala" },
  { href: "/dream", zh: "探索梦境", en: "Dreams", rune: "crescent" },
  { href: "/practice", zh: "修炼技术", en: "Practices", rune: "flame" },
  { href: "/#gates", zh: "重塑潜意识", en: "Rewrite", rune: "spiral" },
  { href: "/narrative", zh: "多维叙事", en: "Narratives", rune: "infinity" },
  { href: "/learn", zh: "探索", en: "Learn", rune: "compass" },
  { href: "/membership", zh: "能量交换场", en: "Access", rune: "crystal" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="lx-nav-glass fixed inset-x-0 top-0 z-40 border-b border-amber/15 backdrop-blur-xl">
      <nav className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="group flex flex-col leading-tight"
          >
            <span className="flex items-center gap-1.5 font-display text-base tracking-widest2 text-bone transition group-hover:text-lattice sm:text-lg">
              <RuneIcon kind="mark" className="h-[1.05em] w-[1.05em] text-lattice" />
              灵犀场 LINGXIFIELD
            </span>
            <span className="mt-1 hidden font-display text-[12px] tracking-[0.1em] text-lattice/85 sm:text-[13px] md:block md:text-sm">
              <Bi
                zh="意识显化 · 生命图谱 · 探索梦境 · 修炼技术 · 重塑潜意识 · 多维叙事"
                en="Manifestation · Life Map · Dreams · Practices · Rewrite · Narratives"
              />
            </span>
          </Link>

          {/* 桌面端：搜索框 + 登录 + 语言，第一行 */}
          <div className="hidden items-center gap-4 text-[13px] text-bone-dim md:flex">
            <SearchBox />
            <Link
              href="/account"
              className="whitespace-nowrap rounded-sm px-4 py-1.5 font-medium text-[#E0F0FF] shadow-[0_0_14px_rgba(216,184,255,0.35)] transition hover:shadow-[0_0_20px_rgba(216,184,255,0.55)]"
              style={{ background: "linear-gradient(90deg, #8B7FE8, #6FA8E8)" }}
            >
              <Bi zh="进入场域" en="Enter" />
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
        <div className="mt-4 hidden items-center justify-center gap-7 border-t border-white/5 pt-3 text-[13px] text-bone-dim md:flex">
          {links.map((l) => {
            const active = pathname === l.href || (l.href !== "/" && pathname?.startsWith(l.href.split("#")[0]) && l.href !== "/#gates");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`group relative flex items-center gap-1.5 whitespace-nowrap pb-1 transition hover:text-lattice ${active ? "text-lattice" : ""}`}
              >
                <RuneIcon kind={l.rune} className={`h-3.5 w-3.5 ${active ? "text-lattice" : "text-bone-dim/70"} transition group-hover:text-lattice`} />
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
          })}
        </div>
      </nav>

      {/* 移动端：展开菜单 */}
      {open && (
        <div className="lx-nav-glass border-t border-amber/15 px-6 py-3 md:hidden">
          <div className="flex flex-col">
            <div className="pb-3">
              <SearchBox className="sb-wide" />
            </div>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 border-b border-white/5 py-3 text-base text-bone transition hover:text-lattice"
              >
                <RuneIcon kind={l.rune} className="h-4 w-4 text-lattice/70" />
                <Bi zh={l.zh} en={l.en} />
              </Link>
            ))}
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="mt-4 rounded-sm border border-lattice/40 py-3 text-center font-display text-sm tracking-widest2 text-lattice transition hover:border-amber hover:text-amber"
            >
              <Bi zh="进入场域" en="Enter" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
