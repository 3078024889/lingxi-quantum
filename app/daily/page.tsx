import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";
import FaqSection, { type BilingualFaqItem } from "@/components/FaqSection";

const DAILY_FAQ: BilingualFaqItem[] = [
  {
    qZh: "今日运势潮汐是如何形成的？", qEn: "How does the Daily Fortune Tide form?",
    aZh: "每一天，天空都有独特的运行轨迹——月亮经过不同位置，太阳保持不同周期，宇宙中的时间节律持续变化。灵犀场读取当天的天象节点，并与你的太阳星座产生连接，形成属于今天的场域观察，不是重复生成一句固定的话，每天进入，看到的都是当天时间流动留下的不同主题。它帮助你观察：今天适合关注什么，今天哪些情绪值得倾听，今天如何更顺应自己的节奏。",
    aEn: "Every day, the sky follows its own unique path — the Moon moves through different positions, the Sun holds a different cycle, and the rhythm of cosmic time keeps shifting. Lingxi Field reads that day's celestial nodes and connects them with your Sun sign to form an observation that belongs to today — not a fixed line repeated on a loop. Each visit shows a different theme left behind by that day's flow of time. It helps you notice what's worth your attention today, which feelings are worth listening to, and how to move more in step with your own rhythm.",
  },
  {
    qZh: "今日运势潮汐和完整生命图谱有什么不同？", qEn: "What's the difference between Daily Fortune Tide and the full Life Map?",
    aZh: "两者观察的是不同层次。今日运势潮汐关注「现在」，它像天气，告诉你今天的环境节奏如何流动。生命图谱关注「你」，它像一张完整地图，探索你携带怎样的生命结构、天赋如何展开、关系模式如何形成、创造方向在哪里。一个看当下，一个看整个旅程。",
    aEn: "They observe different layers. Daily Fortune Tide focuses on 'now' — it's like weather, telling you how today's environmental rhythm is flowing. The Life Map focuses on 'you' — it's like a complete map, exploring what life structure you carry, how your gifts unfold, how your relationship patterns form, and where your creative direction lies. One looks at the moment. The other looks at the whole journey.",
  },
];


import Link from "next/link";
import { ZODIAC_SIGNS } from "@/lib/lifemap-calc";
import { computeTodayTransit } from "@/lib/daily-transit";

export const metadata = {
  title: "今日运势潮汐 · 十二星座每日运势 | 灵犀场 Daily Fortune Tide | Lingxi Field",
  description: "根据今天真实的月亮星座与月相天文数据，查看十二星座今日运势潮汐，每日更新，不需要登录。Real daily transit data for all 12 zodiac signs, updated every day.",
  alternates: { canonical: "/daily" },
};

export default function DailyIndexPage() {
  const transit = computeTodayTransit();

  return (
    <>
      <Nav />
      <main className="pt-24">
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <div className="lx-pdf-daily p-6 sm:p-8">
            <p className="font-display text-sm uppercase tracking-widest2 text-lattice">
              <Bi zh="灵犀 · 今日运势潮汐" en="Lingxi · Daily Fortune Tide" />
            </p>
            <h1 className="mt-4 font-display text-3xl font-light text-bone sm:text-4xl">
              <Bi zh="今天，月亮在跟你的太阳说什么？" en="What's today's Moon saying to your Sun?" />
            </h1>
            <p className="mt-4 text-base leading-8 text-bone-dim">
              <Bi
                zh={`今天真实的月相是${transit.moonPhaseZh}，月亮此刻在${transit.moonSignZh}座——不是随口编的每日一句，是用真实天文数据算出来的，每天都会真的不一样。选一个太阳星座，看看今天的月相能量落在你身上，具体是什么样子。`}
                en={`Today's real moon phase is ${transit.moonPhaseEn}, with the Moon currently in ${transit.moonSignEn} — not a made-up daily line, computed from real astronomical data that genuinely changes every day. Pick your Sun sign to see what today's lunar energy feels like for you.`}
              />
            </p>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {ZODIAC_SIGNS.map((s) => (
              <Link
                key={s.slug}
                href={`/daily/${s.slug}`}
                className="group flex flex-col items-center gap-2 lx-glass py-6 transition hover:border-lattice/40"
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
