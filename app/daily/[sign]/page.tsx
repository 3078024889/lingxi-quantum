import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";
import Link from "next/link";
import { ZODIAC_SIGNS } from "@/lib/lifemap-calc";
import { computeTodayTransit, elementRelation, computeRetrogrades, dayRuler, tideLevel, nextTidePeak } from "@/lib/daily-transit";
import { PHASE_THEME, RELATION_THEME } from "@/lib/daily-horoscope-narrative";
import { getDailyFortuneContent } from "@/lib/daily-fortune-ai";
import DownloadResultPdfButton from "@/components/DownloadResultPdfButton";
import ShareButton from "@/components/ShareButton";
import DailyTideUnlock from "./DailyTideUnlock";

// The page uses deterministic astronomy calculations and local knowledge composition.
export const maxDuration = 30;

// 每次访问都重新算（不是纯静态页）——不然月相和月亮星座这些"应该每天
// 变"的数据，会被Next.js当成一成不变的静态内容缓存住，失去"每日"
// 的意义。计算与知识编排均在本地完成，不依赖模型接口。
export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { sign: string } }) {
  const sign = ZODIAC_SIGNS.find((s) => s.slug === params.sign);
  if (!sign) return {};
  return {
    title: `${sign.zh}座今日运势潮汐 · 每日更新 | 灵犀场 ${sign.en} Daily Fortune Tide | Lingxi Field`,
    description: `${sign.zh}座今天的真实月相、月亮星座与能量潮汐解读，每天更新，即时查看。Today's real transit and energy-tide reading for ${sign.en}, updated daily.`,
    alternates: { canonical: `/daily/${sign.slug}` },
  };
}

export default async function DailySignPage({ params }: { params: { sign: string } }) {
  const sign = ZODIAC_SIGNS.find((s) => s.slug === params.sign);
  if (!sign) notFound();

  const transit = computeTodayTransit();
  const relation = elementRelation(transit.moonElement, sign.element);
  const retro = computeRetrogrades();
  const ruler = dayRuler();
  const tide = tideLevel(transit.moonPhaseAngle);
  const nextTide = nextTidePeak();
  const todayLabel = new Date(transit.date + "T00:00:00Z").toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  // Chinese and English previews share the same deterministic date snapshot.
  const [fortuneZh, fortuneEn] = await Promise.all([
    getDailyFortuneContent({ signSlug: sign.slug, signZh: sign.zh, signEn: sign.en, transit, retro, ruler, relation, tide, nextTide, lang: "zh" }),
    getDailyFortuneContent({ signSlug: sign.slug, signZh: sign.zh, signEn: sign.en, transit, retro, ruler, relation, tide, nextTide, lang: "en" }),
  ]);
  const fallbackZh = `${PHASE_THEME[transit.moonPhaseKey].zh} ${RELATION_THEME[relation].zh}`;
  const fallbackEn = `${PHASE_THEME[transit.moonPhaseKey].en} ${RELATION_THEME[relation].en}`;

  return (
    <>
      <Nav />
      <main className="pt-24">
        <div className="mx-auto max-w-xl px-6 py-16">
          <div className="flex items-center justify-between gap-3 lx-glass-daily px-6 py-4 text-center">
            <p className="font-display text-sm uppercase tracking-widest2 text-lattice">
              <Bi zh="灵犀场 · 今日运势潮汐" en="Lingxi Field · Daily Fortune Tide" />
            </p>
            <DownloadResultPdfButton
              targetId="daily-result"
              fileName={`灵犀今日运势潮汐-${sign.zh}座.pdf`}
              bgColorRgb={[14, 16, 42]}
              bgColorHex="#0e102a"
              colorClass="shrink-0 border-lattice/40 text-lattice hover:border-lattice hover:bg-lattice/10"
            />
          </div>

          <div id="daily-result" className="mt-4">

          <div className="mt-6 flex flex-col items-center lx-glass-daily p-8 text-center">
            <span className="font-display text-5xl text-lattice">{sign.glyph}</span>
            <h1 className="mt-3 font-display text-3xl font-light text-bone">
              <Bi zh={`${sign.zh}座 · 今日运势潮汐`} en={`${sign.en} · Daily Fortune Tide`} />
            </h1>
            <p className="mt-2 text-xs text-bone-soft">{todayLabel}</p>
            <p className="mt-3 text-xs text-bone-dim">
              <Bi zh={`月相：${transit.moonPhaseZh} · 月亮在${transit.moonSignZh}座`} en={`Moon Phase: ${transit.moonPhaseEn} · Moon in ${transit.moonSignEn}`} />
            </p>
            <div className="mt-5 overflow-hidden rounded-sm border border-lattice/20" style={{ maxWidth: 220 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/daily/daily.jpg" alt="Daily Fortune Tide" className="block w-full" />
            </div>
          </div>

          <div className="mt-4 lx-glass-daily p-6">
            <p className="text-xs uppercase tracking-widest2 text-lattice"><Bi zh="今日场域解读" en="Today's Field Reading" /></p>
            <p className="mt-2 text-base leading-8 text-bone-dim">
              <Bi zh={fortuneZh || fallbackZh} en={fortuneEn || fallbackEn} />
            </p>

            <div className="mt-5 border-t border-white/10 pt-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest2 text-amber"><Bi zh="能量潮汐" en="Energy Tide" /></p>
                <p className="text-xs text-bone-dim">{tide}/100</p>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-lattice to-amber" style={{ width: `${tide}%` }} />
              </div>
              <p className="mt-2 text-xs leading-6 text-bone-soft">
                <Bi
                  zh={`日月排列潮汐指数——越接近新月或满月数值越高，越接近上下弦数值越低；它不是所在地的真实潮位。${nextTide.daysAway === 0 ? "今天正好处在潮汐的转折点。" : `再过${nextTide.daysAway}天，会到达这轮潮汐的${nextTide.kind === "spring" ? "峰值（大潮）" : "低点（小潮）"}。`}`}
                  en={`A lunar-solar alignment index — higher near new/full moons and lower near the quarters; it is not a local sea-level forecast. ${nextTide.daysAway === 0 ? "Today sits right at a turning point." : `In ${nextTide.daysAway} day${nextTide.daysAway > 1 ? "s" : ""}, this cycle reaches its ${nextTide.kind === "spring" ? "peak (spring tide)" : "low (neap tide)"}.`}`}
                />
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-bone-soft">
              <span className="rounded-sm border border-white/10 px-2 py-1">
                <Bi zh={`当日守护星：${ruler.zh}`} en={`Day Ruler: ${ruler.en}`} />
              </span>
              {retro.length > 0 && (
                <span className="rounded-sm border border-amber/25 px-2 py-1 text-amber">
                  <Bi zh={`逆行中：${retro.map((r) => r.planetZh).join("、")}`} en={`Retrograde: ${retro.map((r) => r.planetEn).join(", ")}`} />
                </span>
              )}
            </div>
          </div>
          </div>

          <DailyTideUnlock />

          <div className="mt-4 text-center">
            <div className="mt-3">
              <ShareButton
                text={`我测了灵犀场${sign.zh}座今日运势潮汐，去看看你的星座：/ My Lingxi Field ${sign.en} field test today — check your sign:`}
                url={`https://lingxifield.com/daily/${sign.slug}`}
                label={{ zh: "分享今日运势潮汐", en: "Share today's field test" }}
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

          <div className="mt-10 border-t border-white/10 pt-6 text-center">
            <p className="text-sm leading-7 text-bone-dim">
              <Bi
                zh="今日运势潮汐读取的是：宇宙当前运行状态，与你太阳星座之间产生的连接——像一份「今日意识天气」，帮你观察今天适合关注什么、调整什么、顺应什么。而生命图谱不同，它读取的是你出生那一刻、属于你的完整生命坐标。一个观察今天，一个探索你。"
                en="Today's horoscope reads the connection between the sky's current state and your Sun sign \u2014 a kind of \u201cweather report for today's consciousness,\u201d helping you notice what to focus on, adjust, or move with. Your Life Map is different \u2014 it reads the full set of coordinates that belong only to you, from the moment you were born. One observes today. The other explores you."
              />
            </p>
            <a
              href="/life-map"
              className="mt-4 inline-block border border-lattice/45 px-5 py-2 font-display text-xs uppercase tracking-widest2 text-lattice transition hover:border-lattice hover:text-bone"
            >
              <Bi zh="继续探索：完整生命图谱 →" en="Continue exploring: Full Life Map →" />
            </a>
          </div>

          <p className="mt-6 text-center text-xs text-bone-soft">
            <Bi zh="太阳星座只是众多变量之一，仅供参考与反思。" en="Sun sign is just one of many variables — for reflection only." />
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
