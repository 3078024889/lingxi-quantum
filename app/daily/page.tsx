import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";
import Link from "next/link";
import { ZODIAC_SIGNS } from "@/lib/lifemap-calc";
import { computeTodayTransit } from "@/lib/daily-transit";

export const metadata = {
  title: "今日运势 · 十二星座每日免费运势 | 灵犀 Daily Horoscope — Free | Lingxi",
  description: "根据今天真实的月亮星座与月相天文数据，查看十二星座今日运势。免费、每日更新、不需要登录。Real daily transit data — free horoscope for all 12 zodiac signs, updated every day.",
  alternates: { canonical: "/daily" },
};

export default function DailyIndexPage() {
  const transit = computeTodayTransit();

  return (
    <>
      <Nav />
      <main className="pt-24">
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <div className="rounded-sm border border-white/10 bg-void-deep p-6 sm:p-8">
            <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
              <Bi zh="灵犀 · 今日运势" en="Lingxi · Daily Horoscope" />
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
                className="group flex flex-col items-center gap-2 rounded-sm border border-white/10 bg-void-deep py-6 transition hover:border-lattice/40"
              >
                <span className="font-display text-3xl text-lattice transition group-hover:text-amber">{s.glyph}</span>
                <span className="text-sm text-bone-dim"><Bi zh={s.zh} en={s.en} /></span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
