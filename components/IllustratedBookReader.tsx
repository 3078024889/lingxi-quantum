"use client";

import { useEffect, useState } from "react";
import Bi from "@/components/Bi";
import type { IllustratedEntry } from "@/lib/narrative-illustrated";

export default function IllustratedBookReader({
  entry,
  locked,
  lockedPanel,
}: {
  entry: IllustratedEntry;
  locked?: boolean;
  lockedPanel?: React.ReactNode;
}) {
  const total = entry.pages.length;
  const [idx, setIdx] = useState(-1); // -1 = 封面
  const [flip, setFlip] = useState(0);

  // 未解锁时：封面 + 第一页 免费，其余锁定
  const freeUntil = 0;

  const go = (delta: number) => {
    setIdx((p) => {
      let next = p + delta;
      if (next < -1) next = -1;
      if (next > total - 1) next = total - 1;
      if (locked && next > freeUntil) next = freeUntil + 1; // 停在付费墙位
      return next;
    });
    setFlip((f) => f + 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked, total]);

  const isCover = idx === -1;
  const isPaywall = !!locked && idx === freeUntil + 1;
  const page = !isCover && !isPaywall ? entry.pages[idx] : null;

  return (
    <div className="mx-auto max-w-2xl select-none">
      <div
        className="relative overflow-hidden rounded-sm border border-white/10"
        style={{
          background:
            "radial-gradient(ellipse at 20% 0%, rgba(255,143,209,0.10), transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(95,232,255,0.10), transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(255,203,97,0.08), transparent 60%), linear-gradient(180deg, #1c1830 0%, #14101f 100%)",
          minHeight: 560,
        }}
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/40 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/20 to-transparent z-10" />

        <div key={flip} className="page-flip px-6 py-8 sm:px-10 sm:py-10">
          {isCover ? (
            <div className="flex min-h-[480px] flex-col items-center justify-center text-center">
              <p className="font-display text-[11px] uppercase tracking-widest2 text-lattice/70">
                <Bi zh="灵犀 · 多维叙事" en="Lingxi · Dimensional Narrative" />
              </p>
              <div
                className="mt-6 aspect-[3/2.2] w-full max-w-sm overflow-hidden rounded-sm"
                dangerouslySetInnerHTML={{ __html: entry.cover }}
              />
              <h2 className="mt-6 font-display text-3xl font-light leading-snug text-bone sm:text-4xl">
                <Bi zh={entry.title} en={entry.titleEn} />
              </h2>
              <p className="mt-3 max-w-md text-sm text-bone-dim/70">
                <Bi zh={entry.teaser} en={entry.teaserEn} />
              </p>
            </div>
          ) : isPaywall ? (
            <div className="flex min-h-[480px] flex-col items-center justify-center">{lockedPanel}</div>
          ) : page ? (
            <div className="flex min-h-[480px] flex-col">
              <div
                className="aspect-[3/2] w-full overflow-hidden rounded-sm shadow-lg"
                dangerouslySetInnerHTML={{ __html: page.art }}
              />
              <div className="mt-5 text-center">
                {page.tagZh && (
                  <span className="inline-block rounded-full border border-white/15 px-3 py-1 font-display text-[10px] uppercase tracking-widest2 text-bone-dim/70">
                    <Bi zh={page.tagZh} en={page.tagEn ?? ""} />
                  </span>
                )}
                <p className="mt-3 font-display text-[11px] uppercase tracking-widest2 text-lattice/70">
                  <Bi zh={page.kickerZh} en={page.kickerEn} />
                </p>
              </div>
              <div className="mx-auto mt-4 max-w-xl whitespace-pre-line font-display text-[16px] leading-8 text-bone-dim sm:text-[17px] sm:leading-9">
                <Bi zh={page.textZh} en={page.textEn} block />
              </div>
              {page.closingZh && (
                <p className="mx-auto mt-5 max-w-md border-t border-white/10 pt-4 text-center font-display text-sm italic leading-7 text-lattice/80">
                  <Bi zh={page.closingZh} en={page.closingEn ?? ""} />
                </p>
              )}
            </div>
          ) : null}
        </div>

        {!isCover && (
          <button
            aria-label="上一页"
            onClick={() => go(-1)}
            className="group absolute inset-y-0 left-0 z-20 flex w-10 items-center justify-start pl-1 sm:w-14"
          >
            <span className="text-lattice/0 transition group-hover:text-lattice/50">‹</span>
          </button>
        )}
        {!isPaywall && idx < total - 1 && (
          <button
            aria-label="下一页"
            onClick={() => go(1)}
            className="group absolute inset-y-0 right-0 z-20 flex w-10 items-center justify-end pr-1 sm:w-14"
          >
            <span className="text-lattice/0 transition group-hover:text-lattice/50">›</span>
          </button>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-bone-dim/60">
        <button
          onClick={() => go(-1)}
          disabled={isCover}
          className="rounded-sm border border-white/10 px-3 py-1.5 font-display uppercase tracking-widest2 transition hover:border-lattice/50 hover:text-lattice disabled:opacity-30"
        >
          <Bi zh="← 上一页" en="← Prev" />
        </button>
        <span className="font-display tracking-widest2">
          {isCover ? <Bi zh="封面" en="Cover" /> : isPaywall ? "· · ·" : `${idx + 1} / ${total}`}
        </span>
        <button
          onClick={() => go(1)}
          disabled={isPaywall || idx >= total - 1}
          className="rounded-sm border border-white/10 px-3 py-1.5 font-display uppercase tracking-widest2 transition hover:border-lattice/50 hover:text-lattice disabled:opacity-30"
        >
          <Bi zh="下一页 →" en="Next →" />
        </button>
      </div>
    </div>
  );
}
