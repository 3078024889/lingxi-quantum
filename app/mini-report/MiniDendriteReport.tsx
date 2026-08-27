"use client";

import { useRef, useState } from "react";
import Bi from "@/components/Bi";

type Result = {
  titleZh: string; titleEn: string; insightZh: string; insightEn: string;
  nodes: Array<{ id: string; zh: string; en: string; score: number }>;
  dominant: Array<{ id: string; zh: string; en: string; score: number }>;
  chapters?: Array<{ id: string; titleZh: string; titleEn: string; bodyZh: string; bodyEn: string }>;
  evidence?: { answered: number; total: number; historyProducts: number; sourceZh: string; sourceEn: string };
};

export default function MiniDendriteReport({ productName, createdAt, result, cards, cardRolesZh, cardRolesEn }: { productName: string; createdAt: string; result: Result; cards: Array<{ index: number; nameZh: string; nameEn: string }>; cardRolesZh: string[]; cardRolesEn: string[] }) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const download = async () => {
    if (!reportRef.current || downloading) return;
    setDownloading(true);
    try {
      const { exportSimplePdf } = await import("@/lib/pdf-export");
      await exportSimplePdf({ containerRef: reportRef.current, fileName: `${productName}-树突场域档案.pdf`, bgColorRgb: [10, 19, 48], bgColorHex: "#0A1330" });
    } finally { setDownloading(false); }
  };
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_15%_10%,rgba(126,91,180,.35),transparent_32%),radial-gradient(circle_at_85%_25%,rgba(43,156,168,.28),transparent_36%),#0a1330] px-5 py-16 text-bone">
      <div ref={reportRef} className="mx-auto max-w-3xl space-y-5">
        <header className="lx-glass p-7 sm:p-10">
          <p className="text-xs uppercase tracking-[.32em] text-lattice">LINGXIFIELD DENDRITIC ARCHIVE</p>
          <h1 className="mt-5 font-display text-3xl sm:text-5xl">{productName}</h1>
          <p className="mt-3 text-sm text-bone-dim">{new Date(createdAt).toLocaleString("zh-CN")}</p>
          <div className="mt-8 border-l border-lattice/50 pl-5">
            <p className="font-display text-2xl text-lattice"><Bi zh={result.titleZh} en={result.titleEn} /></p>
            <p className="mt-4 leading-8 text-bone-dim"><Bi zh={result.insightZh} en={result.insightEn} /></p>
          </div>
        </header>
        {cards.length > 0 && <section className="grid gap-5 sm:grid-cols-3">{cards.map((card, index) => <article key={`${card.index}-${index}`} className="lx-glass overflow-hidden p-4 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}<img src={`/images/qian/${String(card.index).padStart(2, "0")}.jpg`} alt={card.nameZh} className="mx-auto aspect-[2/3] w-full object-cover" />
          <p className="mt-4 text-xs uppercase tracking-widest2 text-lattice"><Bi zh={cardRolesZh[index] ?? "生命原型"} en={cardRolesEn[index] ?? "Life Archetype"} /></p>
          <p className="mt-2 font-display text-lg"><Bi zh={card.nameZh} en={card.nameEn} /></p>
        </article>)}</section>}
        <section className="lx-glass p-7 sm:p-10"><h2 className="font-display text-xl text-lattice"><Bi zh="节点激活图" en="Node Activation Map" /></h2><div className="mt-6 space-y-4">{result.nodes.map((node) => <div key={node.id}><div className="flex justify-between text-sm text-bone-dim"><span><Bi zh={node.zh} en={node.en} /></span><span>{node.score}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-lattice to-purple-300" style={{ width: `${node.score}%` }} /></div></div>)}</div></section>
        {(result.chapters ?? []).map((chapter, index) => <section key={chapter.id} className="lx-glass p-7 sm:p-10"><p className="text-xs tracking-[.28em] text-lattice">{String(index + 1).padStart(2, "0")}</p><h2 className="mt-3 font-display text-2xl"><Bi zh={chapter.titleZh} en={chapter.titleEn} /></h2><p className="mt-5 leading-8 text-bone-dim"><Bi zh={chapter.bodyZh} en={chapter.bodyEn} /></p></section>)}
        {result.evidence && <section className="lx-glass p-7 text-sm leading-8 text-bone-dim"><p className="text-lattice"><Bi zh={`结构证据 · ${result.evidence.answered}/${result.evidence.total} 次有效互动${result.evidence.historyProducts ? ` · ${result.evidence.historyProducts} 个历史场域` : ""}`} en={`Structural evidence · ${result.evidence.answered}/${result.evidence.total} valid interactions${result.evidence.historyProducts ? ` · ${result.evidence.historyProducts} history fields` : ""}`} /></p><p className="mt-3"><Bi zh={result.evidence.sourceZh} en={result.evidence.sourceEn} /></p></section>}
        <section className="lx-glass p-7 text-sm leading-8 text-bone-dim"><Bi zh="本报告来自小程序中的灵犀场树突知识网络：真实选择激活产品专属知识节点，节点相连后经过结构增强、抑制与交叉校准形成当前结构。它不同于官网以天文与历法数据展开的结构演算；两种路径可相互参照，但都不构成命运预测、医疗建议或替你作出的决定。" en="This report comes from the Mini Program’s Lingxifield Dendritic Knowledge Network: lived choices activate product-specific nodes that connect through structural amplification, inhibition, and cross-calibration. It differs from the website’s astronomical and calendrical calculation. The two paths can cross-reflect, but neither predicts fate, provides medical advice, or makes decisions for you." /></section>
      </div>
      <div className="mx-auto mt-6 max-w-3xl"><button onClick={download} disabled={downloading} className="w-full border border-lattice/50 bg-lattice/10 py-4 text-sm tracking-widest2 text-lattice">{downloading ? "正在生成 PDF…" : "下载 PDF · DOWNLOAD"}</button></div>
    </main>
  );
}
