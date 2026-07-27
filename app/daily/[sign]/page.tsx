import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";
import Link from "next/link";
import { ZODIAC_SIGNS } from "@/lib/lifemap-calc";
import { computeTodayTransit, elementRelation } from "@/lib/daily-transit";
import { PHASE_THEME, RELATION_THEME } from "@/lib/daily-horoscope-narrative";
import DownloadResultPdfButton from "@/components/DownloadResultPdfButton";
import ShareButton from "@/components/ShareButton";

// 每次访问都重新算（不是纯静态页）——不然月相和月亮星座这些"应该每天
// 变"的数据，会被Next.js当成一成不变的静态内容缓存住，失去"每日"
// 的意义。计算本身很便宜（不调用AI，纯天文公式），不缓存也没问题。
export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { sign: string } }) {
  const sign = ZODIAC_SIGNS.find((s) => s.slug === params.sign);
  if (!sign) return {};
  return {
    title: `${sign.zh}座今日运势 · 每日更新 | 灵犀场 ${sign.en} Daily Horoscope | Lingxi Field`,
    description: `${sign.zh}座今天的真实月相与月亮星座解读，每天更新，即时查看。Today's real transit-based horoscope for ${sign.en}, updated daily.`,
    alternates: { canonical: `/daily/${sign.slug}` },
  };
}

export default function DailySignPage({ params }: { params: { sign: string } }) {
  const sign = ZODIAC_SIGNS.find((s) => s.slug === params.sign);
  if (!sign) notFound();

  const transit = computeTodayTransit();
  const relation = elementRelation(transit.moonElement, sign.element);
  const todayLabel = new Date(transit.date + "T00:00:00Z").toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      <Nav />
      <main className="pt-24">
        <div className="mx-auto max-w-xl px-6 py-16">
          <div className="flex items-center justify-between gap-3 rounded-sm border border-white/10 bg-void-deep px-6 py-4 text-center">
            <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
              <Bi zh="灵犀场 · 今日运势" en="Lingxi Field · Daily Horoscope" />
            </p>
            <DownloadResultPdfButton
              targetId="daily-result"
              fileName={`灵犀今日运势-${sign.zh}座.pdf`}
              bgColorRgb={[14, 16, 42]}
              bgColorHex="#0e102a"
              colorClass="shrink-0 border-lattice/40 text-lattice hover:border-lattice hover:bg-lattice/10"
            />
          </div>

          <div id="daily-result" className="mt-4">

          <div className="mt-6 flex flex-col items-center rounded-sm border border-white/10 bg-void-deep p-8 text-center">
            <span className="font-display text-5xl text-lattice">{sign.glyph}</span>
            <h1 className="mt-3 font-display text-3xl font-light text-bone">
              <Bi zh={`${sign.zh}座 · 今日运势`} en={`${sign.en} · Today`} />
            </h1>
            <p className="mt-2 text-xs text-bone-dim/85">{todayLabel}</p>
            <p className="mt-3 text-xs text-bone-dim">
              <Bi zh={`月相：${transit.moonPhaseZh} · 月亮在${transit.moonSignZh}座`} en={`Moon Phase: ${transit.moonPhaseEn} · Moon in ${transit.moonSignEn}`} />
            </p>
            <div className="mt-5 overflow-hidden rounded-sm border border-lattice/20" style={{ maxWidth: 220 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/daily/daily.jpg" alt="Daily Horoscope" className="block w-full" />
            </div>
          </div>

          <div className="mt-4 rounded-sm border border-white/10 bg-void-deep p-6">
            <p className="text-xs uppercase tracking-widest2 text-lattice"><Bi zh="今天的月相能量" en="Today's Lunar Energy" /></p>
            <p className="mt-2 text-base leading-8 text-bone-dim">
              <Bi zh={PHASE_THEME[transit.moonPhaseKey].zh} en={PHASE_THEME[transit.moonPhaseKey].en} />
            </p>
          </div>

          <div className="mt-4 rounded-sm border border-amber/20 bg-amber/5 p-6">
            <p className="text-xs uppercase tracking-widest2 text-amber"><Bi zh={`落在${sign.zh}座身上`} en={`For ${sign.en}, specifically`} /></p>
            <p className="mt-2 text-base leading-8 text-bone-dim">
              <Bi zh={RELATION_THEME[relation].zh} en={RELATION_THEME[relation].en} />
            </p>
          </div>
          </div>

          <div className="mt-4 text-center">
            <div className="mt-3">
              <ShareButton
                text={`我看了灵犀场${sign.zh}座今日运势，去看看你的星座：/ My Lingxi Field ${sign.en} horoscope today — check your sign:`}
                url={`https://lingxifield.com/daily/${sign.slug}`}
                label={{ zh: "分享今日运势", en: "Share today's reading" }}
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-6 gap-2 sm:grid-cols-12">
            {ZODIAC_SIGNS.map((s) => (
              <Link
                key={s.slug}
                href={`/daily/${s.slug}`}
                className={`flex flex-col items-center gap-1 rounded-sm border py-3 text-lg transition ${s.slug === sign.slug ? "border-lattice bg-lattice/10 text-lattice" : "border-white/10 bg-void-deep text-bone-dim hover:border-lattice/40"}`}
              >
                {s.glyph}
              </Link>
            ))}
          </div>

          <div className="mt-8 rounded-sm border border-white/10 bg-void-deep p-6 text-center">
            <p className="text-sm leading-7 text-bone-dim">
              <Bi
                zh="今日运势读取的是：宇宙当前运行状态，与你太阳星座之间产生的连接——像一份「今日意识天气」，帮你观察今天适合关注什么、调整什么、顺应什么。而生命图谱不同，它读取的是你出生那一刻、属于你的完整生命坐标。一个观察今天，一个探索你。"
                en="Today's horoscope reads the connection between the sky's current state and your Sun sign \u2014 a kind of \u201cweather report for today's consciousness,\u201d helping you notice what to focus on, adjust, or move with. Your Life Map is different \u2014 it reads the full set of coordinates that belong only to you, from the moment you were born. One observes today. The other explores you."
              />
            </p>
            <a
              href="/life-map"
              className="mt-5 inline-block bg-lattice px-8 py-3 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber"
            >
              <Bi zh="查看我的完整生命图谱 →" en="See My Full Life Map →" />
            </a>
          </div>

          <p className="mt-6 text-center text-xs text-bone-dim/78">
            <Bi zh="太阳星座只是众多变量之一，仅供参考与反思。" en="Sun sign is just one of many variables — for reflection only." />
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
