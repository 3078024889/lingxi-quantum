"use client";

import { useState } from "react";
import Bi from "@/components/Bi";
import SpiralField from "@/components/SpiralField";
import { useLang } from "@/lib/useLang";
import type { TarotCard } from "@/lib/tarot-data";

export default function TarotReveal({ card }: { card: TarotCard }) {
  const langEn = useLang();
  const [revealing, setRevealing] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const reveal = () => {
    if (revealed || revealing) return;
    setRevealing(true);
    // 半秒钟的"翻牌中"动效，配合螺旋动效，让"揭示"这个动作有一点仪式感，
    // 不是点了就立刻弹出文字——神秘空间先回应一下，再给出答案。
    setTimeout(() => {
      setRevealing(false);
      setRevealed(true);
    }, 900);
  };

  const imgSrc = `/images/tarot/${String(card.index).padStart(2, "0")}.jpg`;

  if (!revealed) {
    return (
      <>
        <SpiralField active={revealing} label={langEn ? "The card is turning in light…" : "塔罗正在被光翻开……"} />
        <button
          onClick={reveal}
          disabled={revealing}
          className="lx-tarot-card group relative mx-auto flex h-80 w-56 flex-col items-center justify-center gap-4 rounded-sm border border-lattice/30 bg-void-deep transition hover:border-lattice/60 disabled:cursor-wait"
        >
          <span className="font-display text-4xl text-lattice/60 transition group-hover:text-lattice">✦</span>
          <span className="font-display text-xs uppercase tracking-widest2 text-bone-dim">
            <Bi zh="翻开今日塔罗" en="Reveal Today's Card" />
          </span>
          <style>{`
          .lx-tarot-card { background-image: repeating-linear-gradient(45deg, rgba(199,156,255,0.05) 0 2px, transparent 2px 14px); }
        `}</style>
        </button>
      </>
    );
  }

  return (
    <div>
      <div className="lx-tarot-reveal relative mx-auto w-56 overflow-hidden rounded-sm border border-lattice/40 bg-void-deep">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgSrc} alt={card.nameZh} className="block w-full" />
      </div>

      <div className="mt-6 rounded-sm border border-white/10 bg-void-deep p-6 text-center">
        <p className="font-display text-xl text-bone">
          <Bi zh={card.nameZh} en={card.nameEn} />
        </p>
        <p className="mt-1 text-xs text-lattice/70">
          <Bi zh={card.keywordsZh} en={card.keywordsEn} />
        </p>
      </div>

      <div className="mt-4 rounded-sm border border-white/10 bg-void-deep p-6">
        <p className="text-base leading-8 text-bone-dim">
          <Bi zh={card.meaningZh} en={card.meaningEn} />
        </p>
      </div>

      <div className="mt-6 rounded-sm border border-white/10 bg-void-deep p-6 text-center">
        <p className="text-sm leading-7 text-bone-dim">
          <Bi
            zh="今天这张牌，是全宇宙今天共享的一个提示。想知道这张牌落在你自己独特的命盘上，会有什么更具体的含义，可以看看你的完整生命图谱。"
            en="Today's card is a prompt shared by everyone today. To see what it means layered onto your own unique chart, take a look at your full Life Map."
          />
        </p>
        <a
          href="/life-map"
          className="mt-5 inline-block bg-lattice px-8 py-3 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber"
        >
          <Bi zh="查看我的完整生命图谱 →" en="See My Full Life Map →" />
        </a>
      </div>

      <style>{`
        .lx-tarot-reveal { animation: lx-tarot-in 0.5s cubic-bezier(.22,1,.36,1) both; }
        @keyframes lx-tarot-in { from { opacity: 0; transform: scale(0.9) rotateY(90deg); } to { opacity: 1; transform: scale(1) rotateY(0deg); } }
        @media (prefers-reduced-motion: reduce) { .lx-tarot-reveal { animation: none; } }
      `}</style>
    </div>
  );
}
