import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";
import FaqSection, { type BilingualFaqItem } from "@/components/FaqSection";
import FieldProductIntroduction from "@/components/FieldProductIntroduction";

const DAILY_FAQ: BilingualFaqItem[] = [
  {
    qZh: "今日潮汐是如何形成的？", qEn: "How does Today’s Tide form?",
    aZh: "每一天，天空都有独特的运行轨迹——月亮经过不同位置，太阳保持不同周期，宇宙中的时间节律持续变化。灵犀场读取当天的天象节点，并与你的太阳星座产生连接，形成属于今天的场域观察，不是重复生成一句固定的话，每天进入，看到的都是当天时间流动留下的不同主题。它帮助你观察：今天适合关注什么，今天哪些情绪值得倾听，今天如何更顺应自己的节奏。",
    aEn: "Every day, the sky follows its own unique path — the Moon moves through different positions, the Sun holds a different cycle, and the rhythm of cosmic time keeps shifting. Lingxi Field reads that day's celestial nodes and connects them with your Sun sign to form an observation that belongs to today — not a fixed line repeated on a loop. Each visit shows a different theme left behind by that day's flow of time. It helps you notice what's worth your attention today, which feelings are worth listening to, and how to move more in step with your own rhythm.",
  },
  {
    qZh: "今日潮汐和完整生命图谱有什么不同？", qEn: "What's the difference between Today’s Tide and the full Life Blueprint?",
    aZh: "两者观察的是不同层次。今日潮汐关注「现在」，像一份当下的节律参照；生命图谱关注「你」，探索你携带怎样的生命结构。一个感受此刻，一个照见更长的生命旅程。",
    aEn: "They observe different layers. Today’s Tide is a rhythmic reference for the present; the Life Blueprint explores the structure you carry. One feels this moment, while the other reflects a longer life journey.",
  },
];


import Link from "next/link";
import { ZODIAC_SIGNS } from "@/lib/lifemap-calc";
import { computeTodayTransit } from "@/lib/daily-transit";

export const metadata = {
  title: "今日潮汐 · 感受当下的宇宙节律 | 灵犀场 Today’s Tide | Lingxi Field",
  description: "依据当日真实月相与行星位置，将此刻天空映照为你的今日潮汐参照，每日更新。A daily tidal reference drawn from real lunar phases and planetary positions.",
  alternates: { canonical: "/daily" },
};

export default function DailyIndexPage() {
  const transit = computeTodayTransit();

  return (
    <>
      <Nav />
      <main className="pt-24">
        <FieldProductIntroduction href="/daily" />
        <div id="field-assessment" className="mx-auto max-w-2xl px-6 py-8 text-center">
          <p className="text-sm leading-7 text-bone-soft">
            <Bi
              zh={`今日真实月相：${transit.moonPhaseZh} · 月亮位于${transit.moonSignZh}座 · 每日数据更新`}
              en={`Today’s real lunar phase: ${transit.moonPhaseEn} · Moon in ${transit.moonSignEn} · Updated daily`}
            />
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {ZODIAC_SIGNS.map((s) => (
              <Link
                key={s.slug}
                href={`/daily/${s.slug}`}
                className="group flex flex-col items-center gap-2 lx-glass-daily py-6 transition hover:border-lattice/40"
              >
                <span className="font-display text-3xl text-lattice transition group-hover:text-amber">{s.glyph}</span>
                <span className="text-sm text-bone-dim"><Bi zh={s.zh} en={s.en} /></span>
              </Link>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-16 max-w-2xl px-6">
          <FaqSection items={DAILY_FAQ} />
        </div>
      </main>
      <Footer />
    </>
  );
}
