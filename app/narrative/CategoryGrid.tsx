"use client";

import { useState } from "react";
import Link from "next/link";
import Bi from "@/components/Bi";
import { NARRATIVES, NARRATIVE_CATS, coverPlaceholder, CAT_GLYPH, type Narrative } from "@/lib/narratives";

// 每个分类的折叠封面：呼吸感的光核 + 环绕的漂浮微粒，用该分类自己的配色。
function CategoryCover({ catId }: { catId: string }) {
  const g = CAT_GLYPH[catId] ?? CAT_GLYPH.field;
  const particles = Array.from({ length: 10 }).map((_, i) => {
    const angle = (i / 10) * Math.PI * 2;
    const r = 46 + (i % 3) * 14;
    const cx = 150 + Math.cos(angle) * r;
    const cy = 90 + Math.sin(angle) * r * 0.55;
    const dur = (2.4 + (i % 4) * 0.6).toFixed(1);
    const delay = (i * 0.35).toFixed(2);
    return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(1 + (i % 3) * 0.5).toFixed(1)}" fill="${g.c3}" opacity=".7"><animate attributeName="opacity" values="0;.9;0" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/></circle>`;
  }).join("");
  const svg = `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="cc-bg-${catId}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${g.c2}"/><stop offset="100%" stop-color="${g.c1}"/>
      </radialGradient>
      <radialGradient id="cc-core-${catId}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fff6e8"/><stop offset="55%" stop-color="${g.c3}"/><stop offset="100%" stop-color="${g.c1}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="300" height="180" fill="url(#cc-bg-${catId})"/>
    ${particles}
    <g stroke="${g.c3}" stroke-width=".7" opacity=".35" fill="none">
      <circle cx="150" cy="90" r="34"><animate attributeName="r" values="30;40;30" dur="5s" repeatCount="indefinite"/></circle>
      <circle cx="150" cy="90" r="50"><animate attributeName="opacity" values=".3;.1;.3" dur="6s" repeatCount="indefinite"/></circle>
    </g>
    <circle cx="150" cy="90" r="16" fill="url(#cc-core-${catId})"><animate attributeName="r" values="13;19;13" dur="3.4s" repeatCount="indefinite"/></circle>
    <text x="150" y="98" text-anchor="middle" font-size="22" fill="#fff6e8" opacity=".92" font-family="serif">${g.glyph}</text>
  </svg>`;
  return <div className="aspect-[5/3] w-full" dangerouslySetInnerHTML={{ __html: svg }} />;
}

function ArticleCard({ n, catZh, catEn }: { n: Narrative; catZh: string; catEn: string }) {
  return (
    <Link
      href={`/narrative/${n.slug}`}
      className="group flex flex-col justify-between overflow-hidden rounded-sm border border-[color:var(--aurora-glass-border)] bg-void-deep transition hover:border-amber/50"
    >
      <div
        className="aspect-[5/3] w-full overflow-hidden bg-void-deep"
        dangerouslySetInnerHTML={{ __html: n.cover ?? coverPlaceholder(n.cat) }}
      />
      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <div className="flex items-center justify-between">
            <span className="font-display text-[11px] uppercase tracking-widest2 text-lattice/70">
              <Bi zh={catZh} en={catEn} />
            </span>
            {n.status === "soon" && (
              <span className="rounded-sm border border-white/15 px-2 py-0.5 font-display text-[11px] uppercase tracking-widest2 text-bone-dim/82">
                <Bi zh="创作中" en="Coming" />
              </span>
            )}
          </div>
          <h3 className="mt-3 font-display text-2xl leading-snug text-bone group-hover:text-amber">
            <Bi zh={n.title} en={n.titleEn} />
          </h3>
          <p className="mt-3 line-clamp-3 text-sm leading-7 text-bone-dim">
            <Bi zh={n.teaser} en={n.teaserEn} />
          </p>
        </div>
        <p className="mt-4 flex items-center justify-between border-t border-white/5 pt-4 font-display text-xs uppercase tracking-widest2">
          <span className={n.status === "soon" ? "text-bone-dim/75" : "text-amber"}>
            {n.status === "soon" ? (
              <Bi zh="即将开放" en="Opening soon" />
            ) : (
              <>
                ¥{n.price} · <Bi zh="解锁一年" en="1-year access" />
              </>
            )}
          </span>
          <span className="text-lattice/70 transition group-hover:translate-x-1">
            <Bi zh="进入 →" en="Enter →" />
          </span>
        </p>
      </div>
    </Link>
  );
}

export default function CategoryGrid() {
  const [openCats, setOpenCats] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpenCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {NARRATIVE_CATS.map((cat) => {
        const list = NARRATIVES.filter((n) => n.cat === (cat.id as string));
        const isOpen = openCats.has(cat.id as string);
        return (
          <div key={cat.id} className="overflow-hidden rounded-sm border border-[color:var(--aurora-glass-border)]">
            <button
              onClick={() => toggle(cat.id as string)}
              className="group grid w-full grid-cols-1 items-stretch text-left sm:grid-cols-[220px_1fr]"
            >
              <CategoryCover catId={cat.id as string} />
              <div className="flex flex-col justify-center gap-2 bg-void-deep p-6 transition group-hover:bg-void-deep">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl font-light text-bone sm:text-3xl">
                    <Bi zh={cat.zh} en={cat.en} />
                  </h2>
                  <span className={`shrink-0 font-display text-2xl text-lattice/60 transition-transform ${isOpen ? "rotate-45" : ""}`}>+</span>
                </div>
                <p className="text-sm leading-7 text-bone-dim">
                  <Bi zh={cat.descZh} en={cat.descEn} />
                </p>
                <p className="mt-1 font-display text-xs uppercase tracking-widest2 text-amber/70">
                  {cat.soon ? <Bi zh="档案整理中" en="Archive in preparation" /> : <Bi zh={`${list.length} 篇 · 点击展开`} en={`${list.length} pieces · tap to expand`} />}
                </p>
              </div>
            </button>

            {isOpen && !cat.soon && (
              <div className="grid gap-5 border-t border-white/10 bg-void p-6 sm:grid-cols-2">
                {list.map((n) => (
                  <ArticleCard key={n.slug} n={n} catZh={cat.zh} catEn={cat.en} />
                ))}
              </div>
            )}
            {isOpen && cat.soon && (
              <p className="border-t border-white/10 bg-void p-8 text-center text-sm text-bone-dim/85">
                <Bi zh="档案整理中 · 即将开放" en="Archive in preparation · opening soon" />
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
