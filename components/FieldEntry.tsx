"use client";

import { useState } from "react";
import Link from "next/link";
import Bi from "./Bi";

type Mood = { key: string; emoji: string; zh: string; en: string; href: string; accent: string; replyZh: string; replyEn: string };

// 关注度/转化率最高的 9 个方向
const MOODS: Mood[] = [
  { key: "wealth", emoji: "💰", zh: "我想创造财富", en: "Create wealth", href: "/gate/wealth", accent: "#E8B765", replyZh: "丰盛是一种状态，先成为，再拥有。", replyEn: "Abundance is a state — become it first." },
  { key: "career", emoji: "💼", zh: "我想突破事业瓶颈", en: "Break a career ceiling", href: "/gate/destiny", accent: "#E8B765", replyZh: "对齐，而非用力。", replyEn: "Align, do not force." },
  { key: "relation", emoji: "❤️", zh: "我想拥有更好的关系", en: "Heal relationships", href: "/gate/relation", accent: "#C77D9C", replyZh: "先回到自己的中心。", replyEn: "Return first to your own center." },
  { key: "health", emoji: "🌿", zh: "我想恢复身心健康", en: "Restore health", href: "/gate/health", accent: "#7CE0D3", replyZh: "聆听身体，它一直在说话。", replyEn: "Listen — the body is always speaking." },
  { key: "calm", emoji: "🕊️", zh: "我想平息焦虑", en: "Calm anxiety", href: "/gate/mind", accent: "#7CE0D3", replyZh: "先回到呼吸，再回到自己。", replyEn: "Return to the breath, then to yourself." },
  { key: "confidence", emoji: "✨", zh: "我想找回自信与价值", en: "Reclaim self-worth", href: "/gate/mind", accent: "#7CE0D3", replyZh: "你本自具足，只是忘了。", replyEn: "You are already whole — you only forgot." },
  { key: "direction", emoji: "🧭", zh: "我想看清人生方向", en: "See my life's direction", href: "/gate/destiny", accent: "#E8B765", replyZh: "方向，藏在你最深的渴望里。", replyEn: "Direction hides in your deepest longing." },
  { key: "dream", emoji: "🌙", zh: "我想读懂我的梦", en: "Decode my dreams", href: "/dream", accent: "#C77D9C", replyZh: "梦，是潜意识写给你的信。", replyEn: "Dreams are letters from your deeper self." },
  { key: "manifest", emoji: "🌅", zh: "我准备显化新现实", en: "Manifest a new reality", href: "/live-as", accent: "#7CE0D3", replyZh: "活在那个已经拥有的版本里。", replyEn: "Live as the version that already has it." },
];

export default function FieldEntry() {
  const [mood, setMood] = useState<Mood | null>(null);
  const accent = mood?.accent ?? "#7CE0D3";

  return (
    <section id="field" className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden border-t border-white/5 px-6 py-24 text-center">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 transition-all duration-[1400ms] ease-out" style={{ backgroundImage: `radial-gradient(circle at 50% 40%, ${accent}22, transparent 62%)`, opacity: mood ? 1 : 0.45 }} />
        <div className="absolute inset-0 bg-gradient-to-b from-void/35 via-void/20 to-void/35" />
      </div>

      <p className="font-display text-sm uppercase tracking-widest2 text-lattice"><Bi zh="灵犀，正在感知你" en="Lingxi is perceiving you" /></p>
      <h2 className="mt-6 font-display text-3xl font-light leading-snug text-bone sm:text-4xl"><Bi zh="此刻，你想朝哪个方向展开？" en="Where do you want to unfold, right now?" /></h2>

      <div className="mt-12 grid w-full max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOODS.map((m) => {
          const active = mood?.key === m.key;
          return (
            <button key={m.key} onClick={() => setMood(m)} className="rounded-sm border px-5 py-6 text-left transition" style={{ borderColor: active ? `${m.accent}99` : "rgba(255,255,255,0.10)", background: active ? `${m.accent}12` : "transparent" }}>
              <span className="text-2xl">{m.emoji}</span>
              <p className="mt-3 font-display text-lg text-bone"><Bi zh={m.zh} en={m.en} /></p>
            </button>
          );
        })}
      </div>

      <div className="mt-12 min-h-[6rem] transition-all duration-700" style={{ opacity: mood ? 1 : 0 }}>
        {mood && (
          <>
            <p className="font-display text-2xl leading-relaxed text-bone sm:text-3xl"><Bi zh={mood.replyZh} en={mood.replyEn} /></p>
            <Link href={mood.href} className="mt-8 inline-block px-10 py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition" style={{ background: mood.accent }}>
              <Bi zh="进入 →" en="Enter →" />
            </Link>
          </>
        )}
      </div>

      <a href="#gates" className="mt-14 font-display text-xs uppercase tracking-widest2 text-bone-dim transition hover:text-lattice">
        <Bi zh="或进入重塑潜意识 ↓" en="Or enter Rewrite the Subconscious ↓" />
      </a>
    </section>
  );
}
