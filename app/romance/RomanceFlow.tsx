"use client";

import { useState } from "react";
import { useLang } from "@/lib/useLang";
import Bi from "@/components/Bi";
import PortalSpinner from "@/components/PortalSpinner";

type Result = {
  score: number;
  style: "independent" | "magnetic" | "devoted" | "gentle";
  hasTaoHua: boolean;
  taohuaBranch: string | null;
  foundIn: string[];
  venusSignZh: string; venusSignEn: string;
};

const STYLE_LABEL: Record<Result["style"], { zh: string; en: string }> = {
  independent: { zh: "独立探索型", en: "The Free Spirit" },
  magnetic: { zh: "磁场吸引型", en: "The Magnetic One" },
  devoted: { zh: "深度专一型", en: "The Devoted Heart" },
  gentle: { zh: "温和亲和型", en: "The Gentle Warmth" },
};

const STYLE_TEXT: Record<Result["style"], { zh: string; en: string }> = {
  independent: {
    zh: "你吸引人的方式，不是主动靠近，是身上那股「不需要谁来完整自己」的松弛感——这种状态本身，反而容易让人想靠近。你的关系风险，不是没人喜欢你，是习惯性地在关系变深之前，先留一条后路。",
    en: "You attract people not by chasing but by radiating a sense of being whole on your own — and that ease is exactly what draws people in. Your risk isn't going unnoticed, it's leaving yourself an exit before things get deep.",
  },
  magnetic: {
    zh: "你吸引人的方式，是你自带的社交能量——进一个房间，人群很自然会往你这边聚拢。你的关系风险，是这种吸引力太容易铺得很宽，反而没时间让某一段关系真正往深处走。",
    en: "You attract people through sheer social energy — walk into a room and people naturally gravitate toward you. Your risk is that this pull spreads so wide it rarely gets the time to go deep with any one person.",
  },
  devoted: {
    zh: "你吸引人的方式，不靠一开始就很耀眼，是相处越久越让人放心的那种沉淀感。你的关系风险，是投入得太早太深，一旦对方的节奏跟不上，你会比对方更早感觉到失衡。",
    en: "You attract people less through a dazzling first impression than through a steadiness that deepens the longer someone knows you. Your risk is investing early and deeply — if the other person's pace doesn't match, you'll feel the imbalance before they do.",
  },
  gentle: {
    zh: "你吸引人的方式，是一种不具攻击性的亲和力——让人觉得在你身边，可以卸下防备。你的关系风险，是这种「让别人舒服」的本能，容易在关系里，把自己的需求排到后面。",
    en: "You attract people through an unthreatening warmth — being around you makes people feel safe enough to drop their guard. Your risk is that this instinct to make others comfortable can push your own needs to the back of the line.",
  },
};

function band(score: number): 0 | 1 | 2 {
  if (score < 45) return 0;
  if (score < 70) return 1;
  return 2;
}

const OVERALL: Record<0 | 1 | 2, { zh: string; en: string }> = {
  0: { zh: "你的桃花磁场，目前偏内敛——不是没有吸引力，是这份吸引力更需要近距离、长时间接触才会被感知到，不是那种一眼就能被看见的类型。", en: "Your romance magnetism runs quiet right now — it's not that you lack appeal, it's that it only reads up close, over time, not the kind that's obvious at first glance." },
  1: { zh: "你的桃花磁场，处在一个比较均衡的区间——在合适的场合、合适的状态下，你的吸引力会被清楚地感知到，但它不是那种无论什么状态都在线的类型，跟你当下的能量状态关系很大。", en: "Your romance magnetism sits in a fairly balanced range — in the right setting and the right state, it reads clearly, but it isn't always-on; it tracks closely with your energy in the moment." },
  2: { zh: "你的桃花磁场，是比较外显的一类——大多数场合里，你的吸引力都容易被清楚地感知到。真正值得留意的，不是有没有人靠近，是这么多靠近的信号里，哪一个才是你真正想要的。", en: "Your romance magnetism runs strong and visible — in most settings, people pick up on it clearly. What's worth watching isn't whether people come close, it's recognizing which of those signals is the one you actually want." },
};

export default function RomanceFlow() {
  const langEn = useLang();
  const t = (zh: string, en: string) => (langEn ? en : zh);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hasTime, setHasTime] = useState(false);
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const submit = async () => {
    if (!year || !month || !day || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/romance/calc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: parseInt(year, 10), month: parseInt(month, 10), day: parseInt(day, 10),
          hour: hasTime ? parseInt(hour, 10) : 12, minute: hasTime ? parseInt(minute, 10) : 0,
          hasTime,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("计算失败，请检查出生信息。", "Calculation failed — please check your birth details."));
        setLoading(false);
        return;
      }
      setResult(data as Result);
    } catch {
      setError(t("连接场域时出错，请稍后再试。", "Error connecting to the field — please try again."));
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    const r = 70, c = 2 * Math.PI * r;
    const pct = result.score / 100;

    return (
      <div className="mx-auto max-w-xl px-6 py-16">
        <div className="rounded-sm border border-white/10 bg-void-deep px-6 py-4 text-center">
          <p className="font-display text-sm uppercase tracking-widest2 text-amber/90">
            <Bi zh="灵犀 · 桃花磁场指数" en="Lingxi · Romance Magnetism Index" />
          </p>
        </div>

        <div className="mt-6 flex flex-col items-center rounded-sm border border-white/10 bg-void-deep p-8">
          <svg viewBox="0 0 180 180" className="w-44" style={{ filter: "drop-shadow(0 0 14px rgba(255,143,209,0.45))" }}>
            <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
            <circle
              cx="90" cy="90" r={r} fill="none" stroke="#FF8FD1" strokeWidth="12" strokeLinecap="round"
              strokeDasharray={`${c}`} strokeDashoffset={`${c * (1 - pct)}`}
              transform="rotate(-90 90 90)"
            />
            <text x="90" y="82" textAnchor="middle" fontSize="40" fill="#F4EFFF" fontFamily="serif">{result.score}</text>
            <text x="90" y="108" textAnchor="middle" fontSize="12" fill="#E8B3D8">/ 100</text>
          </svg>
          <p className="mt-2 text-xs text-bone-dim">
            {t("金星", "Venus")} {langEn ? result.venusSignEn : result.venusSignZh}
            {result.hasTaoHua && <> · {t("命带桃花", "Chart carries Peach Blossom")}</>}
          </p>
        </div>

        <div className="mt-4 rounded-sm border border-white/10 bg-void-deep p-6">
          <p className="text-base leading-9 text-bone-dim">{t(OVERALL[band(result.score)].zh, OVERALL[band(result.score)].en)}</p>
        </div>

        <div className="mt-4 rounded-sm border border-amber/20 bg-amber/5 p-6">
          <p className="text-xs uppercase tracking-widest2 text-amber"><Bi zh={STYLE_LABEL[result.style].zh} en={STYLE_LABEL[result.style].en} /></p>
          <p className="mt-2 text-base leading-8 text-bone-dim">{t(STYLE_TEXT[result.style].zh, STYLE_TEXT[result.style].en)}</p>
        </div>

        {result.hasTaoHua && (
          <div className="mt-4 rounded-sm border border-lattice/20 bg-lattice/5 p-6">
            <p className="text-xs uppercase tracking-widest2 text-lattice"><Bi zh="命带桃花" en="Peach Blossom in Your Chart" /></p>
            <p className="mt-2 text-base leading-8 text-bone-dim">
              <Bi
                zh={`你的${result.foundIn.join("、")}上，带着传统命理里说的「桃花」地支（${result.taohuaBranch}）——这是命理古法里，专门用来判断人际吸引力是否容易被外界感知到的一条规则，不是说你的关系必然如何，是说你的吸引力，天生就更容易被人注意到。`}
                en={`Your ${result.foundIn.join(", ")} carries what classical Chinese astrology calls a "Peach Blossom" branch (${result.taohuaBranch}) — a traditional marker for interpersonal magnetism that's easily noticed by others. It doesn't determine your relationships; it means your appeal tends to be visible by nature.`}
              />
            </p>
          </div>
        )}

        <div className="mt-8 rounded-sm border border-white/10 bg-void-deep p-6 text-center">
          <p className="text-sm leading-7 text-bone-dim">
            <Bi
              zh="这个分数，只是你完整生命图谱里的一个章节。财富模式、生命韧性、内在矛盾——完整报告里都有，交叉引用同一份命盘算出来的所有维度。"
              en="This score is one chapter of your full Life Map. Wealth patterns, resilience, inner conflicts — the full report cross-references every dimension computed from the same chart."
            />
          </p>
          <a
            href="/life-map"
            className="mt-5 inline-block bg-lattice px-8 py-3 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber"
          >
            <Bi zh="查看完整生命图谱 →" en="See Your Full Life Map →" />
          </a>
        </div>

        <div className="mt-6 rounded-sm border border-white/10 bg-void-deep px-6 py-3 text-center">
          <p className="text-xs text-bone-dim/60">
            <Bi zh="这是一份自我探索与反思的参考，不是关系预言。" en="This is a reference for self-reflection, not a prophecy about your relationships." />
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-sm border border-white/10 bg-void-deep p-6 sm:p-8">
        <p className="font-display text-sm uppercase tracking-widest2 text-amber/90">
          <Bi zh="灵犀 · 桃花磁场指数" en="Lingxi · Romance Magnetism Index" />
        </p>
        <h1 className="mt-4 font-display text-3xl font-light text-bone sm:text-4xl">
          <Bi zh="你的吸引力，别人是怎么感受到的？" en="How do people actually feel your pull?" />
        </h1>
        <p className="mt-4 text-base leading-8 text-bone-dim">
          <Bi
            zh="从你的真实命盘数据里，算出桃花磁场分数、你的吸引力风格，再核对一条命理古法——命盘里是否带着传统说法里的「桃花」标记。免费、即时、不需要登录。"
            en={'Computed from your real chart data: a romance magnetism score, your attraction style, and a check against a classical rule — whether your chart carries a traditional "Peach Blossom" marker. Free, instant, no sign-in needed.'}
          />
        </p>
      </div>

      <div className="mt-6 rounded-sm border border-white/10 bg-void-deep p-6">
        <p className="text-sm text-bone-dim">{t("出生年月日", "Birth date")}</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <input value={year} onChange={(e) => setYear(e.target.value)} placeholder={t("年", "Year")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
          <input value={month} onChange={(e) => setMonth(e.target.value)} placeholder={t("月", "Month")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
          <input value={day} onChange={(e) => setDay(e.target.value)} placeholder={t("日", "Day")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
        </div>
        <label className="mt-3 flex items-center gap-2 text-xs text-bone-dim">
          <input type="checkbox" checked={hasTime} onChange={(e) => setHasTime(e.target.checked)} />
          <Bi zh="知道具体出生时间（选填，能看得更细）" en="I know the exact birth time (optional)" />
        </label>
        {hasTime && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <input value={hour} onChange={(e) => setHour(e.target.value)} placeholder={t("时（0-23）", "Hour (0-23)")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
            <input value={minute} onChange={(e) => setMinute(e.target.value)} placeholder={t("分", "Minute")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-sm border border-rose/30 bg-void-deep p-4">
          <p className="text-sm text-rose">{error}</p>
        </div>
      )}

      <button
        onClick={submit}
        disabled={loading || !year || !month || !day}
        className="mt-6 flex w-full items-center justify-center gap-2 bg-lattice py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50"
      >
        {loading ? <><PortalSpinner /><Bi zh="正在计算…" en="Calculating…" /></> : <Bi zh="测出我的桃花磁场指数" en="Get My Romance Magnetism Index" />}
      </button>
    </div>
  );
}
