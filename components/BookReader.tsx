"use client";

import { useEffect, useMemo, useState } from "react";

// 将全文按段落打包成若干"页"，模拟实体书的翻页密度
function paginate(text: string, budget: number): string[] {
  const paras = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const pages: string[] = [];
  let current = "";
  for (const p of paras) {
    if (current && current.length + p.length > budget) {
      pages.push(current);
      current = p;
    } else {
      current = current ? current + "\n\n" + p : p;
    }
  }
  if (current) pages.push(current);
  return pages.length ? pages : [""];
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="whitespace-pre-line font-display text-[17px] leading-9 text-bone sm:text-lg sm:leading-10">
      {children}
    </div>
  );
}

function BookInstance({
  title,
  subtitle,
  text,
  budget = 560,
  locked,
  lockedPanel,
}: {
  title: string;
  subtitle: string;
  text: string;
  budget?: number;
  locked?: boolean;
  lockedPanel?: React.ReactNode;
}) {
  const pages = useMemo(() => paginate(text, budget), [text, budget]);
  // -1 = 封面页；pages.length = 尾页（完）
  const [page, setPage] = useState(-1);
  const [flip, setFlip] = useState(0);

  const visiblePages = locked ? Math.min(pages.length, 1) : pages.length;

  const go = (delta: number) => {
    setPage((p) => {
      const next = p + delta;
      if (next < -1) return -1;
      if (locked && next > visiblePages) return visiblePages; // 停在付费墙
      if (!locked && next > pages.length) return pages.length;
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
  }, [pages.length, locked]);

  const isCover = page === -1;
  const isPaywall = locked && page === visiblePages;
  const isEnd = !locked && page === pages.length;

  return (
    <div className="mx-auto max-w-2xl select-none">
      <div
        className="relative overflow-hidden rounded-sm border border-white/10"
        style={{
          background:
            "radial-gradient(ellipse at 20% 0%, rgba(230,210,255,0.16), transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(160,224,208,0.14), transparent 55%), linear-gradient(135deg, rgba(20,34,58,0.62) 0%, rgba(16,28,50,0.68) 100%), linear-gradient(135deg, rgba(110,196,230,0.28) 0%, rgba(150,170,235,0.26) 100%)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          minHeight: 420,
        }}
      >
        {/* 装订线阴影，营造书页感 */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/40 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/20 to-transparent" />

        <div key={flip} className="page-flip px-7 py-10 sm:px-12 sm:py-14">
          {isCover ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
              <p className="font-display text-[11px] uppercase tracking-widest2 text-lattice/70">
                灵犀 · 多维叙事
              </p>
              <h2 className="mt-6 font-display text-3xl font-light leading-snug text-bone sm:text-4xl">
                {title}
              </h2>
              <p className="mt-3 text-sm text-bone-dim/70">{subtitle}</p>
              <div className="glyph-rule mt-8 w-24" />
              <p className="mt-8 font-display text-xs uppercase tracking-widest2 text-bone-dim/50">
                Lingxi Field · Original
              </p>
            </div>
          ) : isPaywall ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center">
              {lockedPanel}
            </div>
          ) : isEnd ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
              <p className="font-display text-2xl tracking-widest2 text-lattice/70">✧ 完 ✧</p>
              <p className="mt-4 text-sm text-bone-dim/60">愿它在你的场里继续展开</p>
            </div>
          ) : (
            <Page>{pages[page]}</Page>
          )}
        </div>

        {/* 左右翻页点击区域 */}
        {!isCover && (
          <button
            aria-label="上一页"
            onClick={() => go(-1)}
            className="group absolute inset-y-0 left-0 flex w-10 items-center justify-start pl-1 sm:w-14"
          >
            <span className="text-lattice/0 transition group-hover:text-lattice/50">‹</span>
          </button>
        )}
        {!(isEnd || isPaywall) && (
          <button
            aria-label="下一页"
            onClick={() => go(1)}
            className="group absolute inset-y-0 right-0 flex w-10 items-center justify-end pr-1 sm:w-14"
          >
            <span className="text-lattice/0 transition group-hover:text-lattice/50">›</span>
          </button>
        )}
      </div>

      {/* 控制条 */}
      <div className="mt-4 flex items-center justify-between text-xs text-bone-dim/60">
        <button
          onClick={() => go(-1)}
          disabled={isCover}
          className="bg-void-deep rounded-sm px-3 py-1.5 font-display uppercase tracking-widest2 transition hover:border-lattice/60 hover:text-lattice disabled:opacity-30"
        >
          ← 上一页
        </button>
        <span className="font-display tracking-widest2">
          {isCover ? "封面" : isPaywall ? "· · ·" : isEnd ? "完" : `${page + 1} / ${pages.length}`}
        </span>
        <button
          onClick={() => go(1)}
          disabled={isEnd || isPaywall}
          className="bg-void-deep rounded-sm px-3 py-1.5 font-display uppercase tracking-widest2 transition hover:border-lattice/60 hover:text-lattice disabled:opacity-30"
        >
          下一页 →
        </button>
      </div>
    </div>
  );
}

export default function BookReader({
  titleZh,
  titleEn,
  subtitleZh,
  subtitleEn,
  textZh,
  textEn,
  locked,
  lockedPanelZh,
  lockedPanelEn,
}: {
  titleZh: string;
  titleEn: string;
  subtitleZh?: string;
  subtitleEn?: string;
  textZh: string;
  textEn?: string | null;
  locked?: boolean;
  lockedPanelZh?: React.ReactNode;
  lockedPanelEn?: React.ReactNode;
}) {
  return (
    <>
      <div data-lang="zh" className="bi-block">
        <BookInstance
          title={titleZh}
          subtitle={subtitleZh ?? ""}
          text={textZh}
          locked={locked}
          lockedPanel={lockedPanelZh}
        />
      </div>
      {textEn && (
        <div data-lang="en" className="bi-block">
          <BookInstance
            title={titleEn}
            subtitle={subtitleEn ?? ""}
            text={textEn}
            locked={locked}
            lockedPanel={lockedPanelEn}
          />
        </div>
      )}
    </>
  );
}
