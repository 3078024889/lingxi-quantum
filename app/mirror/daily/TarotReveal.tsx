"use client";

import { useState, useRef } from "react";
import Bi from "@/components/Bi";
import type { TarotCard } from "@/lib/tarot-data";
import type { NextTidePeak } from "@/lib/daily-transit";
import { getProduct } from "@/lib/plans";
import ShareButton from "@/components/ShareButton";

// 三段式的"进入场域"仪式，取代原来"点一下、等0.9秒、弹出图片"这种
// 过于简单的交互——不是重新设计整个产品定位（见这次回复里对GPT那份
// "场域会话"方案的具体意见），是把"揭示"这个动作本身，做得更有分量：
// 第一步星云汇聚，第二步核心凝结出光点，第三步光点长成完整的卡牌——
// 卡牌是"从场域中心浮现出来的"，不是"翻开的"，视觉上更贴近"一个象征
// 在场域中显化"这个感觉，但没有牺牲卡牌本身内容的具体性。
//
// v230：加入"今日能量潮汐"跟卡牌的交叉解读——传统塔罗，同一张牌每天
// 的含义是不变的；这里额外叠加了当天真实的潮汐力学数据（见
// lib/daily-transit.ts 顶部注释），让"今天抽到这张牌"这件事，多了一层
// 只属于"今天"的具体信息，不是重新发明这张牌的含义，是在传统含义之上
// 再交叉引用一个真实、可验证的天文变量。
function tideReading(card: TarotCard, tide: number, nextTide: NextTidePeak, langEn: boolean): string {
  const band = tide >= 70 ? "high" : tide <= 30 ? "low" : "mid";
  const trendZh = nextTide.daysAway === 0
    ? "潮汐正处在转折点上"
    : `再过${nextTide.daysAway}天将到达这轮潮汐的${nextTide.kind === "spring" ? "峰值" : "低点"}`;
  const trendEn = nextTide.daysAway === 0
    ? "the tide sits right at a turning point"
    : `in ${nextTide.daysAway} day${nextTide.daysAway > 1 ? "s" : ""} this cycle reaches its ${nextTide.kind === "spring" ? "peak" : "low"}`;

  if (langEn) {
    if (band === "high") return `Today's energy tide runs strong (${tide}/100) — whatever "${card.nameEn}" is pointing you toward, the amplitude today makes it land harder than usual, for better or worse. And ${trendEn}.`;
    if (band === "low") return `Today's energy tide runs quiet (${tide}/100) — "${card.nameEn}" is still speaking, but today favors sitting with it rather than acting on it loudly. And ${trendEn}.`;
    return `Today's energy tide sits in the middle (${tide}/100) — a fairly ordinary day to meet "${card.nameEn}", neither amplified nor muted. And ${trendEn}.`;
  }
  if (band === "high") return `今天的能量潮汐很强（${tide}/100）——「${card.nameZh}」指向的这个主题，今天会被放大得比平时更明显，好坏都是。而且${trendZh}。`;
  if (band === "low") return `今天的能量潮汐偏弱（${tide}/100）——「${card.nameZh}」的意思还在，但今天更适合安静地体会它，而不是急着大动作回应。而且${trendZh}。`;
  return `今天的能量潮汐处在中间地带（${tide}/100）——遇到「${card.nameZh}」这张牌，是一个比较平常的时机，不会被放大也不会被压低。而且${trendZh}。`;
}

export default function TarotReveal({ card, tide, nextTide }: { card: TarotCard; tide: number; nextTide: NextTidePeak }) {
  const [stage, setStage] = useState<"idle" | "gathering" | "condensing" | "revealed">("idle");
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const downloadPdf = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    try {
      const { exportSimplePdf } = await import("@/lib/pdf-export");
      await exportSimplePdf({
        containerRef: reportRef.current,
        fileName: `灵犀今日塔罗-${card.nameZh}.pdf`,
        // 紫罗兰神秘主题，呼应塔罗牌本身的视觉调性。
        bgColorRgb: [246, 244, 240],
        bgColorHex: "#F6F4F0",
      });
    } catch (e) {
      console.error("PDF 生成失败:", e);
      alert("PDF 生成失败，请稍后再试。 / PDF generation failed — please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const enter = () => {
    if (stage !== "idle") return;
    setStage("gathering");
    setTimeout(() => setStage("condensing"), 1400);
    setTimeout(() => setStage("revealed"), 2600);
  };

  const imgSrc = `/images/tarot/${String(card.index).padStart(2, "0")}.jpg`;

  if (stage !== "revealed") {
    return (
      <div className="lx-field relative mx-auto flex h-80 w-64 items-center justify-center">
        {/* 星云汇聚层——九色光环，一进入就开始缓慢转动，不是等点击才出现，
           营造"场域一直在，你只是走近了它"的感觉。 */}
        <div className="lx-nebula pointer-events-none absolute inset-0 rounded-full" />
        <div className="lx-nebula-2 pointer-events-none absolute inset-4 rounded-full" />

        {stage === "idle" && (
          <button
            onClick={enter}
            className="lx-enter-btn group relative z-10 flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-full border border-lattice/40 bg-void/70 backdrop-blur-sm transition hover:border-lattice/70"
          >
            <span className="font-display text-2xl text-lattice transition group-hover:text-lattice">✦</span>
            <span className="px-2 text-center font-display text-[11px] uppercase tracking-widest2 text-bone-dim">
              <Bi zh="进入灵犀场" en="Enter the Field" />
            </span>
          </button>
        )}

        {(stage === "gathering" || stage === "condensing") && (
          <>
            {/* 粒子从四周向中心汇聚 */}
            {Array.from({ length: 14 }).map((_, i) => (
              <span
                key={i}
                className="lx-particle absolute h-1 w-1 rounded-full"
                style={{
                  ["--a" as string]: `${(i * 360) / 14}deg`,
                  ["--delay" as string]: `${i * 0.05}s`,
                  background: ["#C79CFF", "#8CD2FF", "#7CE0D3", "#E8B765", "#FF8FD1"][i % 5],
                }}
              />
            ))}
            {/* 中心核心——先是一个小光点，凝结阶段开始放大发光，为卡牌浮现做铺垫 */}
            <span className={`lx-core absolute rounded-full bg-white ${stage === "condensing" ? "lx-core-grow" : ""}`} />
            {stage === "condensing" && (
              <p className="absolute bottom-0 font-display text-xs tracking-widest2 text-lattice">
                <Bi zh="一个象征正在浮现……" en="A symbol is emerging…" />
              </p>
            )}
          </>
        )}

        <style>{`
          .lx-nebula { background: conic-gradient(from 0deg, #C79CFF, #8CD2FF, #7CE0D3, #7FE7C4, #E8D08A, #E8B765, #FF8FD1, #FF7A8A, #D8B8FF, #C79CFF); filter: blur(26px); opacity: 0.35; animation: lx-spin 16s linear infinite; }
          .lx-nebula-2 { background: conic-gradient(from 180deg, #C79CFF, #8CD2FF, #7CE0D3, #7FE7C4, #E8D08A, #E8B765, #FF8FD1, #FF7A8A, #D8B8FF, #C79CFF); filter: blur(16px); opacity: 0.25; animation: lx-spin-rev 11s linear infinite; }
          @keyframes lx-spin { to { transform: rotate(360deg); } }
          @keyframes lx-spin-rev { to { transform: rotate(-360deg); } }
          .lx-particle { left: 50%; top: 50%; box-shadow: 0 0 6px 2px currentColor; animation: lx-gather 1.3s ease-in both; animation-delay: var(--delay); }
          @keyframes lx-gather {
            0%   { opacity: 0; transform: rotate(var(--a)) translateX(110px) scale(1); }
            20%  { opacity: 1; }
            100% { opacity: 0; transform: rotate(var(--a)) translateX(0) scale(0.2); }
          }
          .lx-core { width: 6px; height: 6px; box-shadow: 0 0 12px 4px rgba(255,255,255,0.9); animation: lx-pulse 1s ease-in-out infinite; }
          .lx-core-grow { animation: lx-core-expand 1.2s cubic-bezier(.22,1,.36,1) forwards; }
          @keyframes lx-pulse { 0%,100% { opacity: 0.7; } 50% { opacity: 1; } }
          @keyframes lx-core-expand { from { width: 6px; height: 6px; box-shadow: 0 0 12px 4px rgba(255,255,255,0.9); } to { width: 220px; height: 220px; box-shadow: 0 0 60px 20px rgba(255,255,255,0.5); opacity: 0; } }
          .lx-enter-btn { animation: lx-breathe 3s ease-in-out infinite; }
          @keyframes lx-breathe { 0%,100% { box-shadow: 0 0 0 rgba(199,156,255,0); } 50% { box-shadow: 0 0 24px 4px rgba(199,156,255,0.25); } }
          @media (prefers-reduced-motion: reduce) {
            .lx-nebula, .lx-nebula-2, .lx-particle, .lx-core, .lx-core-grow, .lx-enter-btn { animation: none !important; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      <div ref={reportRef}>
      <div className="lx-tarot-reveal relative mx-auto w-56 overflow-hidden rounded-sm border border-lattice/40 bg-void-deep">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgSrc} alt={card.nameZh} className="block w-full" />
      </div>

      <div className="mt-6 lx-glass-tarot p-6 text-center">
        <p className="font-display text-xl text-bone">
          <Bi zh={card.nameZh} en={card.nameEn} />
        </p>
        <p className="mt-1 text-xs text-lattice">
          <Bi zh={card.keywordsZh} en={card.keywordsEn} />
        </p>
      </div>

      <div className="mt-4 lx-glass-tarot p-6">
        <p className="text-base leading-8 text-bone-dim">
          <Bi zh={card.meaningZh} en={card.meaningEn} />
        </p>
      </div>

      <div className="mt-4 rounded-sm border border-amber/25 bg-amber/5 p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest2 text-amber"><Bi zh="今日能量潮汐" en="Today's Energy Tide" /></p>
          <p className="text-xs text-bone-dim">{tide}/100</p>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-lattice to-amber" style={{ width: `${tide}%` }} />
        </div>
        <p className="mt-3 text-sm leading-7 text-bone-dim">
          <Bi zh={tideReading(card, tide, nextTide, false)} en={tideReading(card, tide, nextTide, true)} />
        </p>
      </div>
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={downloadPdf}
          disabled={downloading}
          className="rounded-sm border border-lattice/40 px-6 py-3 font-display text-sm uppercase tracking-widest2 text-lattice transition hover:border-lattice hover:bg-lattice/10 disabled:opacity-50"
        >
          {downloading ? <Bi zh="正在生成 PDF…" en="Generating PDF…" /> : <Bi zh="下载 PDF" en="Download PDF" />}
        </button>
        <div className="mt-3">
          <ShareButton
            text={`今天全场域共享的塔罗牌是「${card.nameZh}」，来看看你的： / Today's shared tarot card is "${card.nameEn}" — see yours:`}
            url="https://lingxifield.com/tarot/daily"
            label={{ zh: "分享今日一卡", en: "Share today's card" }}
          />
        </div>
      </div>

      <div className="mt-6 rounded-sm border border-amber/25 bg-amber/5 p-6 text-center">
        <p className="text-sm leading-7 text-bone-dim">
          <Bi
            zh="今天的这张牌，是全场域共享的。想要专属于你自己的三张牌——潜意识镜像、当下共振、未来展开，由你真实的命盘确定，不是随机抽取。"
            en="Today's card is shared by everyone. For your own three cards — hidden pattern, present resonance, future possibility — determined by your real chart, not a random draw."
          />
        </p>
        <a
          href="/mirror/reading"
          className="mt-5 inline-block bg-amber px-8 py-3 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-lattice"
        >
          <Bi zh={`展开我的三张牌阵 · ¥${getProduct("tarot-reading")?.priceRmb}`} en={`Reveal My Three-Card Reading · ¥${getProduct("tarot-reading")?.priceRmb}`} />
        </a>
      </div>

      <div className="mt-6 lx-glass-tarot p-6 text-center">
        <p className="text-sm leading-7 text-bone-dim">
          <Bi
            zh="今天这张牌，是全宇宙今天共享的一个提示。想知道这张牌落在你自己独特的命盘上，会有什么更具体的含义，可以看看你的完整生命图谱。"
            en="Today's card is a prompt shared by everyone today. To see what it means layered onto your own unique chart, take a look at your full Life Map."
          />
        </p>
        <a
          href="/life-map"
          className="mt-6 inline-block border border-lattice/45 px-5 py-2 font-display text-xs uppercase tracking-widest2 text-lattice transition hover:border-lattice hover:text-bone"
        >
          <Bi zh="继续探索：完整生命图谱 →" en="Continue exploring: Full Life Map →" />
        </a>
      </div>

      <style>{`
        .lx-tarot-reveal { animation: lx-tarot-in 0.6s cubic-bezier(.22,1,.36,1) both; }
        @keyframes lx-tarot-in { from { opacity: 0; transform: scale(0.85); filter: brightness(2); } to { opacity: 1; transform: scale(1); filter: brightness(1); } }
        @media (prefers-reduced-motion: reduce) { .lx-tarot-reveal { animation: none; } }
      `}</style>
    </div>
  );
}
