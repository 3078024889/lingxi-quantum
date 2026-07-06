"use client";

import { useState } from "react";
import Link from "next/link";
import Bi from "./Bi";
import LangToggle from "./LangToggle";

const links = [
  { href: "/live-as", zh: "意识显化", en: "Manifestation" },
  { href: "/dream", zh: "探索梦境", en: "Dreams" },
  { href: "/practice", zh: "修炼技术", en: "Practices" },
  { href: "/#gates", zh: "重塑潜意识", en: "Rewrite" },
  { href: "/narrative", zh: "多维叙事", en: "Narratives" },
  { href: "/learn", zh: "探索", en: "Learn" },
  { href: "/membership", zh: "能量交换场", en: "Access" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-amber/10 bg-[#1c140c]/75 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="group flex flex-col leading-tight"
        >
          <span className="font-display text-base tracking-widest2 text-bone transition group-hover:text-lattice sm:text-lg">
            灵犀 LINGXI
          </span>
          <span className="mt-1 font-display text-[12px] tracking-[0.12em] text-lattice/85 sm:text-[13px] md:text-sm">
            <Bi
              zh="意识显化 · 场域解梦 · 潜意识改写 · 修炼技术"
              en="Manifestation · Dream Field · Subconscious · Practice"
            />
          </span>
        </Link>

        {/* 桌面端 */}
        <div className="hidden items-center gap-4 text-[13px] text-bone-dim md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-lattice">
              <Bi zh={l.zh} en={l.en} />
            </Link>
          ))}
          <Link
            href="/account"
            className="rounded-sm border border-lattice/40 px-3 py-1.5 text-lattice transition hover:border-amber hover:text-amber"
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
      </nav>

      {/* 移动端：展开菜单 */}
      {open && (
        <div className="border-t border-amber/10 bg-[#1c140c]/95 px-6 py-3 md:hidden">
          <div className="flex flex-col">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/5 py-3 text-base text-bone transition hover:text-lattice"
              >
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
