"use client";

import { useRef, useState } from "react";
import Bi from "@/components/Bi";

type Result = {
  titleZh: string; titleEn: string; insightZh: string; insightEn: string;
  nodes: Array<{ id: string; zh: string; en: string; score: number; actionZh?: string; actionEn?: string }>;
  dominant: Array<{ id: string; zh: string; en: string; score: number; actionZh?: string; actionEn?: string }>;
  chapters?: Array<{ id: string; titleZh: string; titleEn: string; bodyZh: string; bodyEn: string }>;
  evidence?: { answered: number; total: number; historyProducts: number; sourceZh: string; sourceEn: string };
  fieldContributions?: Array<{ productId: string; score: number; state: "long-term" | "recent" | "active" | "tension" }>;
  structuralRelations?: Array<{ from: string; to: string; kind: "reinforce" | "bridge" | "tension"; strength: number }>;
};
const FIELD_LABELS: Record<string, string> = {
  "life-map-report":"生命图谱", "relationship-resonance":"关系共振", "resilience-report":"生命韧性",
  "romance-report":"桃花磁场", "wealth-report":"财富创造", "daily-tide-report":"今日潮汐",
  "tarot-reading":"生命镜像", "qian-reading":"生命灵签",
};
const CONTRIBUTION_LABELS = { "long-term":"长期底层", recent:"近期参与", active:"当前前景", tension:"承接张力" } as const;
const PRODUCT_EDITORIAL: Record<string, { solveZh: string; solveEn: string; mechanismZh: string; mechanismEn: string; actionZh: string; actionEn: string }> = {
  "life-map-report": { solveZh:"辨认长期结构与当下角色之间是否仍在同一条线上。", solveEn:"Distinguish enduring structure from the role currently being maintained.", mechanismZh:"读取跨情境反复出现的本源倾向、现实适应与适应成本。", mechanismEn:"Read recurring source tendencies, real-world adaptation, and its cost.", actionZh:"用一组无人要求时的自然选择，校准正在承担的现实角色。", actionEn:"Calibrate the role you carry against choices made without external demand." },
  "relationship-resonance": { solveZh:"看见两个人之间真实形成的第三种关系结构，而不是计算匹配率。", solveEn:"Reveal the third structure formed between two people rather than a compatibility score.", mechanismZh:"比较靠近、表达、安全、边界、冲突与修复如何互相传递。", mechanismEn:"Compare how approach, expression, safety, boundary, conflict, and repair transmit.", actionZh:"把一处感知落差改写为双方都能验证的回应。", actionEn:"Turn one perception gap into a response both people can verify." },
  "resilience-report": { solveZh:"区分表面恢复、内部可用能量与尚未计算的恢复成本。", solveEn:"Separate visible recovery, usable inner energy, and uncounted recovery cost.", mechanismZh:"读取压力进入、承接、回弹与再次投入之间的时间差。", mechanismEn:"Read the timing gaps among pressure, capacity, rebound, and re-entry.", actionZh:"建立七天双轨记录，让功能恢复与真实容量分别留下证据。", actionEn:"Create a seven-day dual record of functional recovery and actual capacity." },
  "romance-report": { solveZh:"辨认吸引信号在哪里形成、被表达，又在哪里停止进入双向互动。", solveEn:"Locate where attraction forms, becomes visible, and stops becoming mutual.", mechanismZh:"读取靠近许可、边界、可见度与现实回应的共同结构。", mechanismEn:"Read permission to approach, boundary, visibility, and real response together.", actionZh:"发出一个清晰、有边界、可被回应的兴趣信号。", actionEn:"Send one clear, bounded, answerable signal of interest." },
  "wealth-report": { solveZh:"识别价值创造与现实交换之间最具体的断点。", solveEn:"Identify the precise break between value creation and real exchange.", mechanismZh:"追踪价值被创造、命名、交付、验证、复制与承接的路径。", mechanismEn:"Trace how value is created, named, delivered, verified, repeated, and received.", actionZh:"把一个已有成果改写成明确对象、交付形式与下一次交换。", actionEn:"Turn one existing result into a user, deliverable, and next exchange." },
  "daily-tide-report": { solveZh:"让今天的决定与今天真实可用的容量保持一致。", solveEn:"Align today's decisions with capacity actually available today.", mechanismZh:"读取能量、负载、专注与连接窗口，而不是把状态误判成人格。", mechanismEn:"Read energy, load, focus, and connection windows without mistaking state for identity.", actionZh:"调整一项任务强度，并在一天结束时验证容量是否回升。", actionEn:"Adjust one task's intensity and verify whether capacity returns by day's end." },
  "tarot-reading": { solveZh:"把经验、现实条件与行动空间从同一个镜面中重新分开。", solveEn:"Separate experience, real conditions, and action space from one symbolic mirror.", mechanismZh:"以三重镜像打开互不替代的观察位置，不把象征当作未来判定。", mechanismEn:"Use three mirrors as distinct viewpoints without turning symbols into predictions.", actionZh:"移动一个最小现实变量，观察整张结构图如何改变。", actionEn:"Move one small real-world variable and observe how the structure changes." },
  "qian-reading": { solveZh:"让难以命名的经验获得象征坐标，再回到现实验证。", solveEn:"Give unnamed experience a symbolic coordinate, then return it to reality for verification.", mechanismZh:"以源流、灵魂与行者三重位置校准注意力、意义与行动。", mechanismEn:"Calibrate attention, meaning, and action through Source, Soul, and Wayfarer positions.", actionZh:"选择一条最有触动的象征句，为它安排三天内可观察的行动。", actionEn:"Choose the most resonant symbolic line and give it an observable three-day action." },
  "life-archetype": { solveZh:"读取八条支流共同形成的主轴、增强回路、承接差与真实张力。", solveEn:"Read the shared axis, reinforcement loops, capacity gaps, and real tensions formed by eight tributaries.", mechanismZh:"交叉计算 192 次选择、八组节点与跨域关系，不把八份报告压缩成摘要。", mechanismEn:"Cross-read 192 choices, eight node systems, and inter-field relations without reducing them to a summary.", actionZh:"选择一个同时触及主轴与承接差的七日实验，为下一次原型更新提供新证据。", actionEn:"Run one seven-day experiment touching both primary axis and capacity gap, creating evidence for the next update." },
};

export default function MiniDendriteReport({ productId, productName, subjectName, createdAt, result, cards, artworks, cardRolesZh, cardRolesEn }: { productId: string; productName: string; subjectName: string; createdAt: string; result: Result; cards: Array<{ index: number; nameZh: string; nameEn: string }>; artworks: string[]; cardRolesZh: string[]; cardRolesEn: string[] }) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const nodeLabels = new Map(result.nodes.map((node) => [node.id, node.zh]));
  const editorial = PRODUCT_EDITORIAL[productId] ?? PRODUCT_EDITORIAL["life-map-report"];
  const download = async () => {
    if (!reportRef.current || downloading) return;
    setDownloadError("");
    setDownloading(true);
    try {
      const { exportSimplePdf } = await import("@/lib/pdf-export");
      await exportSimplePdf({ containerRef: reportRef.current, fileName: `${productName}-树突场域档案.pdf`, bgColorRgb: [10, 19, 48], bgColorHex: "#0A1330" });
      setDownloaded(true);
    } catch {
      setDownloadError("PDF 暂未完成，请保留本页并稍后重试；网页档案已安全保存在“我的场域”。");
    } finally { setDownloading(false); }
  };
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_15%_10%,rgba(126,91,180,.35),transparent_32%),radial-gradient(circle_at_85%_25%,rgba(43,156,168,.28),transparent_36%),#0a1330] px-5 py-16 text-bone">
      <div ref={reportRef} className="mx-auto max-w-3xl space-y-5">
        <header className="lx-glass p-7 sm:p-10">
          <p className="text-xs uppercase tracking-[.32em] text-lattice">LINGXIFIELD DENDRITIC ARCHIVE</p>
          <h1 className="mt-5 font-display text-3xl sm:text-5xl">{productName}</h1>
          <p className="mt-3 text-sm tracking-[.18em] text-lattice">档案主体 · {subjectName}</p>
          <p className="mt-3 text-sm text-bone-dim">{new Date(createdAt).toLocaleString("zh-CN")}</p>
          <div className="mt-8 border-l border-lattice/50 pl-5">
            <p className="font-display text-2xl text-lattice"><Bi zh={result.titleZh} en={result.titleEn} /></p>
            <p className="mt-4 leading-8 text-bone-dim"><Bi zh={result.insightZh} en={result.insightEn} /></p>
          </div>
        </header>
        <section className="grid gap-4 sm:grid-cols-3">
          <article className="lx-glass p-6"><p className="text-xs tracking-[.2em] text-lattice">01 · 当前解决什么</p><p className="mt-4 leading-7 text-bone-dim"><Bi zh={editorial.solveZh} en={editorial.solveEn} /></p></article>
          <article className="lx-glass p-6"><p className="text-xs tracking-[.2em] text-lattice">02 · 如何形成判断</p><p className="mt-4 leading-7 text-bone-dim"><Bi zh={editorial.mechanismZh} en={editorial.mechanismEn} /></p></article>
          <article className="lx-glass p-6"><p className="text-xs tracking-[.2em] text-lattice">03 · 现实验证入口</p><p className="mt-4 leading-7 text-bone-dim"><Bi zh={editorial.actionZh} en={editorial.actionEn} /></p></article>
        </section>
        {artworks[0] && <figure className="lx-publication-card-page relative min-h-[620px] overflow-hidden border border-white/15">
          {/* eslint-disable-next-line @next/next/no-img-element */}<img src={artworks[0]} alt={`${productName} 原型结构图`} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08102c] via-[#08102c]/35 to-[#08102c]/10" />
          <figcaption className="absolute inset-x-0 bottom-0 p-7 sm:p-10"><p className="text-xs tracking-[.28em] text-lattice">LINGXIFIELD ORIGINAL FIELD PLATE</p><h2 className="mt-4 font-display text-3xl text-bone"><Bi zh={result.titleZh} en={result.titleEn} /></h2><p className="mt-4 max-w-2xl leading-8 text-bone-soft"><Bi zh={result.insightZh} en={result.insightEn} /></p></figcaption>
        </figure>}
        {cards.length > 0 && <section className="grid gap-5 sm:grid-cols-3">{cards.map((card, index) => <article key={`${card.index}-${index}`} className="lx-glass overflow-hidden p-4 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}<img src={`/images/qian/${String(card.index).padStart(2, "0")}.jpg`} alt={card.nameZh} className="mx-auto aspect-[2/3] w-full object-cover" />
          <p className="mt-4 text-xs uppercase tracking-widest2 text-lattice"><Bi zh={cardRolesZh[index] ?? "生命原型"} en={cardRolesEn[index] ?? "Life Archetype"} /></p>
          <p className="mt-2 font-display text-lg"><Bi zh={card.nameZh} en={card.nameEn} /></p>
        </article>)}</section>}
        <section className="lx-glass p-7 sm:p-10"><h2 className="font-display text-xl text-lattice"><Bi zh="节点激活图" en="Node Activation Map" /></h2><div className="mt-6 space-y-4">{result.nodes.map((node) => <div key={node.id}><div className="flex justify-between text-sm text-bone-dim"><span><Bi zh={node.zh} en={node.en} /></span><span>{node.score}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-lattice to-purple-300" style={{ width: `${node.score}%` }} /></div></div>)}</div></section>
        {result.fieldContributions?.length ? <section className="lx-glass p-7 sm:p-10"><h2 className="font-display text-xl text-lattice">八重场域贡献</h2><p className="mt-3 text-sm leading-7 text-bone-dim">八域仍保持各自证据，不被压缩成一段总结。状态显示它们当前在原型中的作用位置。</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{result.fieldContributions.map((field) => <article key={field.productId} className="border border-white/10 bg-white/[.035] p-4"><div className="flex items-center justify-between gap-3 text-sm"><span>{FIELD_LABELS[field.productId] ?? field.productId}</span><span className="text-lattice">{field.score} · {CONTRIBUTION_LABELS[field.state]}</span></div></article>)}</div></section> : null}
        {result.structuralRelations?.length ? <section className="lx-glass p-7 sm:p-10"><h2 className="font-display text-xl text-lattice">结构关系矩阵</h2><div className="mt-6 space-y-3">{result.structuralRelations.map((relation, index) => <div key={`${relation.from}-${relation.to}-${index}`} className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 text-sm text-bone-dim"><span>{nodeLabels.get(relation.from) ?? relation.from} → {nodeLabels.get(relation.to) ?? relation.to}</span><span className="text-lattice">{{ reinforce:"增强", bridge:"桥接", tension:"张力" }[relation.kind]} · {relation.strength}</span></div>)}</div></section> : null}
        {(result.chapters ?? []).map((chapter, index) => <div key={chapter.id} className="space-y-5"><section className="lx-glass p-7 sm:p-10"><p className="text-xs tracking-[.28em] text-lattice">{String(index + 1).padStart(2, "0")}</p><h2 className="mt-3 font-display text-2xl"><Bi zh={chapter.titleZh} en={chapter.titleEn} /></h2><p className="mt-5 whitespace-pre-line leading-8 text-bone-dim"><Bi zh={chapter.bodyZh} en={chapter.bodyEn} /></p><div className="mt-7 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-2"><p className="text-sm leading-7 text-bone-soft"><span className="text-lattice">结构证据 · </span>{result.dominant[index % result.dominant.length]?.zh} {result.dominant[index % result.dominant.length]?.score} / 100</p><p className="text-sm leading-7 text-bone-soft"><span className="text-lattice">验证方向 · </span>{result.dominant[index % result.dominant.length]?.actionZh}</p></div>{index === 0 && <div className="mt-6 border-l border-lattice/40 pl-4 text-sm leading-7 text-lattice">证据 → 结构机制 → 现实影响 → 可验证动作</div>}</section>{artworks[index + 1] && <figure className="lx-publication-card-page relative min-h-[620px] overflow-hidden border border-white/15"><img src={artworks[index + 1]} alt={`${productName} 结构图 ${index + 1}`} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#07102c] via-[#07102c]/28 to-transparent"/><figcaption className="absolute inset-x-0 bottom-0 p-7 sm:p-10"><p className="text-xs tracking-[.26em] text-lattice">{String(index + 1).padStart(2, "0")} · STRUCTURAL PLATE</p><h3 className="mt-3 font-display text-3xl text-bone"><Bi zh={chapter.titleZh} en={chapter.titleEn} /></h3><p className="mt-4 line-clamp-4 max-w-2xl leading-8 text-bone-soft"><Bi zh={chapter.bodyZh} en={chapter.bodyEn} /></p></figcaption></figure>}</div>)}
        {result.evidence && <section className="lx-glass p-7 text-sm leading-8 text-bone-dim"><p className="text-lattice"><Bi zh={`结构证据 · ${result.evidence.answered}/${result.evidence.total} 次有效互动${result.evidence.historyProducts ? ` · ${result.evidence.historyProducts} 个历史场域` : ""}`} en={`Structural evidence · ${result.evidence.answered}/${result.evidence.total} valid interactions${result.evidence.historyProducts ? ` · ${result.evidence.historyProducts} history fields` : ""}`} /></p><p className="mt-3"><Bi zh={result.evidence.sourceZh} en={result.evidence.sourceEn} /></p></section>}
        <section className="lx-glass p-7 text-sm leading-8 text-bone-dim"><Bi zh="本报告来自小程序中的灵犀场树突知识网络：真实选择激活产品专属知识节点，节点相连后经过结构增强、抑制与交叉校准形成当前结构。它不同于官网以天文与历法数据展开的结构演算；两种路径可相互参照，但都不构成命运预测、医疗建议或替你作出的决定。" en="This report comes from the Mini Program’s Lingxifield Dendritic Knowledge Network: lived choices activate product-specific nodes that connect through structural amplification, inhibition, and cross-calibration. It differs from the website’s astronomical and calendrical calculation. The two paths can cross-reflect, but neither predicts fate, provides medical advice, or makes decisions for you." /></section>
      </div>
      <div className="mx-auto mt-6 max-w-3xl"><button onClick={download} disabled={downloading} className="w-full border border-lattice/50 bg-lattice/10 py-4 text-sm tracking-widest2 text-lattice">{downloading ? "正在生成 PDF…" : "下载 PDF · DOWNLOAD"}</button>{downloaded && <p className="mt-3 text-center text-xs leading-6 text-lattice">PDF 已生成并交给当前设备下载；本报告实例也已保存在小程序「我的场域」，无需再次购买。</p>}{downloadError && <p className="mt-3 text-center text-xs leading-6 text-rose-300">{downloadError}</p>}<p className="mt-3 text-center text-[11px] text-bone-dim">档案编号 · {productId}</p></div>
    </main>
  );
}
