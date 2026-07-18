"use client";

import { useState } from "react";
import { useLang } from "@/lib/useLang";
import Bi from "@/components/Bi";

type Result = {
  score: number;
  breakdown: Record<string, number>;
  sunSignZh: string; sunSignEn: string;
  dayMasterElement: string;
};

const DIM_LABEL: Record<string, { zh: string; en: string }> = {
  stressRecovery: { zh: "压力恢复能力", en: "Stress Recovery" },
  adaptability: { zh: "变化适应能力", en: "Adaptability" },
  crisisRebound: { zh: "危机反弹能力", en: "Crisis Rebound" },
  persistence: { zh: "长期坚持能力", en: "Persistence" },
  emotionalStability: { zh: "精神稳定能力", en: "Emotional Stability" },
};

const DIM_ORDER = ["stressRecovery", "adaptability", "crisisRebound", "persistence", "emotionalStability"];
const DIM_COLOR: Record<string, string> = {
  stressRecovery: "#FF8FD1", adaptability: "#5FE8FF", crisisRebound: "#FFCB61",
  persistence: "#7FE7C4", emotionalStability: "#D8CDFF",
};

// 叙事文案跟接口计算逻辑一样，是同一份来源（lib/resilience-narrative.ts）——
// 这里为了避免把整套astronomy-engine/lunar-javascript计算逻辑打进客户端
// 打包体积，前端不直接 import 那个文件，而是把同样的四段模板复制一份轻量
// 纯文本版本在这里，用来渲染结果。两边的文案，改动时要记得同步。
const OVERALL: Record<0 | 1 | 2 | 3, { zh: string; en: string }> = {
  0: { zh: "你的韧性结构，目前更像是一片还没被夯实的地基——不是撑不住，是撑住的方式，还没有找到属于你自己的那一套。每一次冲击，感觉都要从头重新扛一遍，这种消耗感是真实的，不是你不够坚强。", en: "Right now your resilience looks less like a fortress and more like ground that hasn't been packed down yet — not that you can't hold weight, but that you haven't found your own way of holding it. Every impact can feel like starting from zero, and that drain is real, not a sign you aren't strong enough." },
  1: { zh: "你的韧性结构，正处在建立当中——已经有几块地方站得住脚了，但整体还没有连成一片。遇到不算太大的冲击，能扛过去；一旦几件事叠在一起，就容易感觉到整个系统在吃紧。", en: "Your resilience is under construction — a few parts already hold firm, but the whole hasn't knit together yet. Moderate hits, you can absorb; but when several things stack up at once, you can feel the whole system straining." },
  2: { zh: "你的韧性结构，整体是相对稳固的——大部分时候，冲击来了，你有能力接住，也有能力消化。真正值得留意的，不是你扛不扛得住，是扛住之后，有没有真的把那部分消耗还给自己。", en: "Your resilience is, on the whole, fairly solid — most of the time, when something hits, you have the capacity to absorb it and process it. What's worth watching isn't whether you can take the hit, but whether you actually give yourself back what it cost you afterward." },
  3: { zh: "你的韧性结构，是相当强韧的一类——不是没有脆弱的时候，是脆弱之后，你有一整套自己都未必清楚意识到的机制，会把你重新拼回一个能站起来的状态。这种能力很宝贵，也容易被自己当成理所当然，忘了它其实需要维护。", en: "Your resilience sits in a genuinely strong band — it's not that you never feel fragile, it's that once you do, some mechanism you may not even consciously notice tends to piece you back into someone who can stand again. That's a real asset, and it's easy to take it for granted and forget it still needs upkeep." },
};

const DIM_HIGH: Record<string, { zh: string; en: string }> = {
  stressRecovery: { zh: "你最突出的一项，是压力恢复能力——这意味着，你不是不会被事情压到，是压到之后，你的系统会主动去「消化」那份情绪，而不是让它一直悬在那里。", en: "Your strongest suit is stress recovery — you do get weighed down by things, but afterward your system actively processes that weight instead of letting it hang there indefinitely." },
  adaptability: { zh: "你最突出的一项，是变化适应能力——计划被打乱、环境突然改变，对你来说，制造的更多是「需要重新规划」的感觉，而不是「整个人被打乱」的感觉。", en: "Your strongest suit is adaptability — when plans fall apart or circumstances shift suddenly, what you feel is mostly needing to re-plan, not coming completely undone." },
  crisisRebound: { zh: "你最突出的一项，是危机反弹能力——真正的低谷来临时，你反而比在风平浪静时更容易调动起行动力，去找下一个出口，而不是停在原地。", en: "Your strongest suit is crisis rebound — when a real low point hits, you tend to mobilize and start looking for the next way forward more readily than you do in calm times." },
  persistence: { zh: "你最突出的一项，是长期坚持能力——一件事需要拖得很长、需要在看不到即时反馈的情况下持续投入，这种消耗对你来说相对更可承受。", en: "Your strongest suit is persistence — when something drags on and offers no immediate feedback, that kind of grind is more sustainable for you than for most." },
  emotionalStability: { zh: "你最突出的一项，是精神稳定能力——情绪来了，你有出口，也有觉察，不容易被情绪本身反过来控制住行动。", en: "Your strongest suit is emotional stability — feelings arrive, you have an outlet and awareness for them, and they rarely end up steering your actions against your will." },
};

const DIM_LOW: Record<string, { zh: string; en: string }> = {
  stressRecovery: { zh: "相对更需要留意的一项，是压力恢复能力——给自己安排「真正的恢复时间」，对你来说不是可有可无的加分项，是维持整体状态运转的必需品。", en: "The dimension most worth watching is stress recovery — real recovery time isn't optional for you, it's what keeps the rest of the system running." },
  adaptability: { zh: "相对更需要留意的一项，是变化适应能力——给自己一点「先愣一下再动」的空间，不是反应慢，是你的系统需要这道程序，才能真正切换过去。", en: "The dimension most worth watching is adaptability — giving yourself a beat before you respond isn't slowness, it's a step your system genuinely needs before it can switch gears." },
  crisisRebound: { zh: "相对更需要留意的一项，是危机反弹能力——低谷期主动给自己找一个可以依靠的人或系统，比逼自己立刻振作，更接近你真实的节奏。", en: "The dimension most worth watching is crisis rebound — actively finding someone or something to lean on during a low point fits your real rhythm better than forcing yourself to bounce back immediately." },
  persistence: { zh: "相对更需要留意的一项，是长期坚持能力——把大目标拆成能持续看到反馈的小节点，对你来说不是「降低难度」，是让这件事真正变得可持续的必要设计。", en: "The dimension most worth watching is persistence — breaking a big goal into smaller checkpoints with visible feedback isn't lowering the bar for you, it's what makes the thing sustainable." },
  emotionalStability: { zh: "相对更需要留意的一项，是精神稳定能力——给情绪一个明确的表达渠道（写下来、说出来、动起来），比「先压下去再说」，更符合你的系统需要的运作方式。", en: "The dimension most worth watching is emotional stability — giving that feeling an explicit channel fits how your system needs to operate better than pushing it down first." },
};

function band(score: number): 0 | 1 | 2 | 3 {
  if (score < 40) return 0;
  if (score < 60) return 1;
  if (score < 80) return 2;
  return 3;
}

export default function ResilienceFlow() {
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
      const res = await fetch("/api/resilience/calc", {
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
    const dims = DIM_ORDER.filter((d) => d in result.breakdown);
    const sorted = [...dims].sort((a, b) => result.breakdown[b] - result.breakdown[a]);
    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];
    const r = 70, c = 2 * Math.PI * r;
    const pct = result.score / 100;
    const elementLabel: Record<string, string> = { wood: "木", fire: "火", earth: "土", metal: "金", water: "水" };

    return (
      <div className="mx-auto max-w-xl px-6 py-16">
        <p className="text-center font-display text-sm uppercase tracking-widest2 text-lattice/80">
          <Bi zh="灵犀 · 生命韧性指数" en="Lingxi · Life Resilience Index" />
        </p>

        <div className="mt-8 flex flex-col items-center rounded-sm border border-white/10 bg-void-deep p-8">
          <svg viewBox="0 0 180 180" className="w-44" style={{ filter: "drop-shadow(0 0 14px rgba(199,156,255,0.45))" }}>
            <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
            <circle
              cx="90" cy="90" r={r} fill="none" stroke="#C79CFF" strokeWidth="12" strokeLinecap="round"
              strokeDasharray={`${c}`} strokeDashoffset={`${c * (1 - pct)}`}
              transform="rotate(-90 90 90)"
            />
            <text x="90" y="82" textAnchor="middle" fontSize="40" fill="#F4EFFF" fontFamily="serif">{result.score}</text>
            <text x="90" y="108" textAnchor="middle" fontSize="12" fill="#B7AEEB">/ 100</text>
          </svg>
          <p className="mt-2 text-xs text-bone-dim">
            {t("太阳", "Sun")} {langEn ? result.sunSignEn : result.sunSignZh} · {t("日主", "Day Master")} {langEn ? result.dayMasterElement : (elementLabel[result.dayMasterElement] || "")}
          </p>
        </div>

        <div className="mt-6 rounded-sm border border-white/10 bg-void-deep p-6">
          <p className="text-base leading-9 text-bone-dim">{t(OVERALL[band(result.score)].zh, OVERALL[band(result.score)].en)}</p>
        </div>

        <div className="mt-4 rounded-sm border border-white/10 bg-void-deep p-6">
          <div className="space-y-3">
            {dims.map((d) => (
              <div key={d} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-xs text-bone-dim">
                  <Bi zh={DIM_LABEL[d].zh} en={DIM_LABEL[d].en} />
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${result.breakdown[d]}%`, background: `linear-gradient(90deg, ${DIM_COLOR[d]}99, ${DIM_COLOR[d]})` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-xs text-bone-dim">{result.breakdown[d]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-sm border border-lattice/20 bg-lattice/5 p-6">
          <p className="text-xs uppercase tracking-widest2 text-lattice"><Bi zh="你最强的一项" en="Your Strongest Trait" /></p>
          <p className="mt-2 text-base leading-8 text-bone-dim">{t(DIM_HIGH[strongest].zh, DIM_HIGH[strongest].en)}</p>
        </div>
        <div className="mt-4 rounded-sm border border-amber/20 bg-amber/5 p-6">
          <p className="text-xs uppercase tracking-widest2 text-amber"><Bi zh="值得留意的一项" en="Worth Watching" /></p>
          <p className="mt-2 text-base leading-8 text-bone-dim">{t(DIM_LOW[weakest].zh, DIM_LOW[weakest].en)}</p>
        </div>

        <div className="mt-8 rounded-sm border border-white/10 bg-void-deep p-6 text-center">
          <p className="text-sm leading-7 text-bone-dim">
            <Bi
              zh="这个分数，只是你完整生命图谱里的一个章节。财富模式、关系模式、内在矛盾——完整报告里都有，交叉引用同一份命盘算出来的所有维度。"
              en="This score is one chapter of your full Life Map. Wealth patterns, relationship patterns, inner conflicts — the full report cross-references every dimension computed from the same chart."
            />
          </p>
          <a
            href="/life-map"
            className="mt-5 inline-block bg-lattice px-8 py-3 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber"
          >
            <Bi zh="查看完整生命图谱 →" en="See Your Full Life Map →" />
          </a>
        </div>

        <p className="mt-6 text-center text-xs text-bone-dim/60">
          <Bi zh="这是一份自我探索与反思的参考，不是命运预言。" en="This is a reference for self-reflection, not a prophecy." />
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
        <Bi zh="灵犀 · 生命韧性指数" en="Lingxi · Life Resilience Index" />
      </p>
      <h1 className="mt-4 font-display text-3xl font-light text-bone sm:text-4xl">
        <Bi zh="遇到低谷，你的系统是怎么把你接住的？" en="When things get hard, how does your system catch you?" />
      </h1>
      <p className="mt-4 text-base leading-8 text-bone-dim">
        <Bi
          zh="不是问你「命硬不硬」。是从你的真实命盘数据里，算出五项确定性的分数——压力恢复、变化适应、危机反弹、长期坚持、精神稳定——看看你的韧性，具体是哪种类型。免费、即时、不需要登录。"
          en={'Not asking whether you\'re "built tough." We compute five deterministic scores from your real chart data — stress recovery, adaptability, crisis rebound, persistence, emotional stability — to show exactly what kind of resilience you have. Free, instant, no sign-in needed.'}
        />
      </p>

      <div className="mt-8 rounded-sm border border-white/10 bg-void-deep p-6">
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
        className="mt-6 w-full bg-lattice py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50"
      >
        {loading ? <Bi zh="正在计算…" en="Calculating…" /> : <Bi zh="测出我的生命韧性指数" en="Get My Resilience Index" />}
      </button>
    </div>
  );
}
