"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { getCoreType, type WesternElement, type ChineseElement } from "@/lib/lifemap-calc";
import Bi from "@/components/Bi";

const isEn = () => typeof document !== "undefined" && document.documentElement.classList.contains("lang-en");
const t = (zh: string, en: string) => (isEn() ? en : zh);

type Stage = "landing" | "form" | "loading" | "report";

type Focus = "wealth" | "relationship" | "direction" | "growth" | "all";
type CurrentState = "transforming" | "lost" | "breakthrough" | "stable" | "exploring";

type Facts = {
  sunSignZh: string; sunSignEn: string; sunElement: WesternElement;
  moonSignZh: string; moonSignEn: string; moonElement: WesternElement;
  yearPillar: string; monthPillar: string; dayPillar: string; hourPillar: string | null;
  dayMasterGan: string; dayMasterElement: ChineseElement;
};

type ReportData = {
  facts: Facts;
  coreType: { name: string; nameEn: string; essence: string; essenceEn: string };
  narrative: string; // 灵犀生成的正文（含三段：呼应/阶段/关键词）
};

const FOCUS_OPTIONS: { id: Focus; zh: string; en: string }[] = [
  { id: "wealth", zh: "财富与事业", en: "Wealth & Career" },
  { id: "relationship", zh: "感情与关系", en: "Love & Relationships" },
  { id: "direction", zh: "人生方向", en: "Life Direction" },
  { id: "growth", zh: "内在成长", en: "Inner Growth" },
  { id: "all", zh: "全面探索", en: "Full Exploration" },
];

const STATE_OPTIONS: { id: CurrentState; zh: string; en: string }[] = [
  { id: "transforming", zh: "正在转变期", en: "In a period of change" },
  { id: "lost", zh: "感觉迷茫", en: "Feeling lost" },
  { id: "breakthrough", zh: "寻找突破", en: "Seeking a breakthrough" },
  { id: "stable", zh: "稳定成长", en: "Growing steadily" },
  { id: "exploring", zh: "探索未知", en: "Exploring the unknown" },
];

const LOADING_STEPS = [
  { zh: "正在连接你的生命信息结构\u2026", en: "Connecting to your life information structure\u2026" },
  { zh: "✨ 分析出生周期", en: "✨ Analyzing your birth cycle" },
  { zh: "✨ 构建意识模型", en: "✨ Building your consciousness model" },
  { zh: "✨ 生成关系模式", en: "✨ Generating your relational pattern" },
  { zh: "✨ 计算成长路径", en: "✨ Calculating your growth path" },
];

export default function LifeMapFlow() {
  const [stage, setStage] = useState<Stage>("landing");
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hasTime, setHasTime] = useState(true);
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [city, setCity] = useState("");
  const [focus, setFocus] = useState<Focus>("all");
  const [currentState, setCurrentState] = useState<CurrentState>("exploring");
  const [loadingStep, setLoadingStep] = useState(0);
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState("");
  const formTopRef = useRef<HTMLDivElement>(null);

  const goForm = () => {
    setStage("form");
    setTimeout(() => formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const submit = async () => {
    const y = parseInt(year, 10), m = parseInt(month, 10), d = parseInt(day, 10);
    if (!y || !m || !d || y < 1900 || y > 2026 || m < 1 || m > 12 || d < 1 || d > 31) {
      setError(t("请填写完整、有效的出生日期。", "Please enter a complete, valid birth date."));
      return;
    }
    setError("");
    setStage("loading");
    setLoadingStep(0);
    const stepTimer = setInterval(() => setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)), 1200);

    try {
      // 计算走服务端 API（含真实天文 + 八字算法），避免把算法逻辑暴露在客户端 bundle 里，也便于以后统一升级算法
      const calcRes = await fetch("/api/lifemap/calc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: y, month: m, day: d,
          hour: hasTime ? parseInt(hour, 10) || 0 : 12,
          minute: hasTime ? parseInt(minute, 10) || 0 : 0,
          hasTime,
        }),
      });
      const facts: Facts = await calcRes.json();
      if (!calcRes.ok) throw new Error("calc failed");

      const coreType = getCoreType(facts.sunElement, facts.dayMasterElement);

      const focusLabel = FOCUS_OPTIONS.find((f) => f.id === focus)!;
      const stateLabel = STATE_OPTIONS.find((s) => s.id === currentState)!;
      const promptContent =
        `【核心类型】${coreType.name}（${coreType.nameEn}）——${coreType.essence}\n` +
        `【客观事实】太阳星座：${facts.sunSignZh}；月亮星座：${facts.moonSignZh}；` +
        `四柱：${facts.yearPillar} ${facts.monthPillar} ${facts.dayPillar}${facts.hourPillar ? " " + facts.hourPillar : "（未知具体时辰）"}；` +
        `日主：${facts.dayMasterGan}（${facts.dayMasterElement === "wood" ? "木" : facts.dayMasterElement === "fire" ? "火" : facts.dayMasterElement === "earth" ? "土" : facts.dayMasterElement === "metal" ? "金" : "水"}）\n` +
        `【用户最想探索】${focusLabel.zh}\n【用户当前状态】${stateLabel.zh}` +
        (name.trim() ? `\n【称呼】${name.trim()}` : "");

      const aiRes = await fetch("/api/lingxi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "lifemap", content: promptContent, lang: isEn() ? "en" : "zh" }),
      });
      const aiPayload = await aiRes.json();
      if (!aiRes.ok || !aiPayload.text) throw new Error("ai failed");

      clearInterval(stepTimer);
      setReport({ facts, coreType, narrative: aiPayload.text });
      setStage("report");
    } catch {
      clearInterval(stepTimer);
      setError(t("场域连接不稳定，请重试一次。", "The field connection was unstable — please try again."));
      setStage("form");
    }
  };

  // ---------- 解析灵犀返回的三段式正文 ----------
  const parsed = (() => {
    if (!report) return null;
    const parts = report.narrative.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
    const echoText = parts[0] || "";
    const [stageName, stageDesc] = (parts[1] || "").split("|").map((s) => s?.trim());
    const keywordParts = (parts[2] || "").split("|").map((s) => s.trim()).filter(Boolean);
    const keywords = keywordParts.map((kp) => {
      const [w, d] = kp.split(",").map((s) => s?.trim());
      return { word: w || "", desc: d || "" };
    });
    return { echoText, stageName: stageName || "", stageDesc: stageDesc || "", keywords };
  })();

  return (
    <div ref={formTopRef}>
      {stage === "landing" && (
        <section className="relative min-h-[85vh] overflow-hidden px-6 py-24 text-center">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="lm-core" />
          </div>
          <div className="relative z-10">
            <p className="font-display text-sm uppercase tracking-widest2 text-lm-violet">
              🌌 {t("发现你的生命频率", "Discover Your Life Frequency")}
            </p>
            <h1 className="mx-auto mt-6 max-w-2xl font-display text-4xl font-light leading-tight text-bone sm:text-5xl">
              <Bi zh="每个人来到这个世界，都携带独特的信息结构。" en="Everyone who arrives in this world carries a unique information structure." />
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-9 text-bone-dim">
              <Bi zh="输入你的基础信息，生成你的专属生命图谱。" en="Enter your basic information, and generate a life map that is entirely your own." />
            </p>
            <button
              onClick={goForm}
              className="mt-10 inline-block bg-lm-violet px-12 py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:brightness-110"
            >
              ✨ {t("开始探索", "Begin Exploring")}
            </button>
            <p className="mx-auto mt-6 max-w-md text-xs leading-6 text-bone-dim/60">
              <Bi
                zh="这是一份自我探索与反思的参考，不是命运预言——生命的走向，始终由你自己选择。"
                en="This is a tool for self-exploration and reflection, not a prophecy — the direction of your life is always your own to choose."
              />
            </p>
          </div>
        </section>
      )}

      {stage === "form" && (
        <section className="px-6 py-20">
          <div className="mx-auto max-w-xl">
            <p className="text-center font-display text-sm uppercase tracking-widest2 text-lm-violet">
              <Bi zh="创建你的生命档案" en="Create Your Life Profile" />
            </p>
            <h2 className="mt-3 text-center font-display text-3xl font-light text-bone">
              <Bi zh="一、基础信息" en="I. Basic Information" />
            </h2>

            <div className="mt-10 space-y-6">
              <div>
                <label className="block text-sm text-bone-dim"><Bi zh="姓名（选填）" en="Name (optional)" /></label>
                <input
                  value={name} onChange={(e) => setName(e.target.value)}
                  placeholder={t("名字是一种身份频率符号", "A name is a symbol of your identity frequency")}
                  className="mt-2 w-full rounded-sm border border-white/15 bg-void px-4 py-3 text-bone outline-none focus:border-lm-violet/60"
                />
              </div>

              <div>
                <label className="block text-sm text-bone-dim"><Bi zh="出生日期" en="Birth Date" /></label>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  <input value={year} onChange={(e) => setYear(e.target.value)} placeholder={t("年", "Year")} inputMode="numeric" className="rounded-sm border border-white/15 bg-void px-4 py-3 text-bone outline-none focus:border-lm-violet/60" />
                  <input value={month} onChange={(e) => setMonth(e.target.value)} placeholder={t("月", "Month")} inputMode="numeric" className="rounded-sm border border-white/15 bg-void px-4 py-3 text-bone outline-none focus:border-lm-violet/60" />
                  <input value={day} onChange={(e) => setDay(e.target.value)} placeholder={t("日", "Day")} inputMode="numeric" className="rounded-sm border border-white/15 bg-void px-4 py-3 text-bone outline-none focus:border-lm-violet/60" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm text-bone-dim"><Bi zh="出生时间" en="Birth Time" /></label>
                  <button onClick={() => setHasTime((v) => !v)} className="text-xs text-lm-violet underline underline-offset-4">
                    {hasTime ? t("不知道也可以", "I don't know it") : t("我知道具体时间", "I know the exact time")}
                  </button>
                </div>
                {hasTime && (
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <input value={hour} onChange={(e) => setHour(e.target.value)} placeholder={t("时 (0-23)", "Hour (0-23)")} inputMode="numeric" className="rounded-sm border border-white/15 bg-void px-4 py-3 text-bone outline-none focus:border-lm-violet/60" />
                    <input value={minute} onChange={(e) => setMinute(e.target.value)} placeholder={t("分", "Minute")} inputMode="numeric" className="rounded-sm border border-white/15 bg-void px-4 py-3 text-bone outline-none focus:border-lm-violet/60" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-bone-dim"><Bi zh="出生地点（选填）" en="Birth City (optional)" /></label>
                <input
                  value={city} onChange={(e) => setCity(e.target.value)}
                  placeholder={t("城市", "City")}
                  className="mt-2 w-full rounded-sm border border-white/15 bg-void px-4 py-3 text-bone outline-none focus:border-lm-violet/60"
                />
              </div>
            </div>

            <h2 className="mt-14 text-center font-display text-3xl font-light text-bone">
              <Bi zh="二、当前人生状态" en="II. Where You Are Now" />
            </h2>
            <div className="mt-8">
              <p className="text-sm text-bone-dim"><Bi zh="你目前最想探索：" en="What you most want to explore right now:" /></p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {FOCUS_OPTIONS.map((f) => (
                  <button key={f.id} onClick={() => setFocus(f.id)}
                    className={`rounded-sm border px-4 py-3 text-left text-sm transition ${focus === f.id ? "border-lm-violet bg-lm-violet/10 text-bone" : "border-white/12 text-bone-dim hover:border-white/25"}`}>
                    <Bi zh={f.zh} en={f.en} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <p className="text-sm text-bone-dim"><Bi zh="最近你的状态：" en="Your state recently:" /></p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {STATE_OPTIONS.map((s) => (
                  <button key={s.id} onClick={() => setCurrentState(s.id)}
                    className={`rounded-sm border px-4 py-3 text-left text-sm transition ${currentState === s.id ? "border-lm-violet bg-lm-violet/10 text-bone" : "border-white/12 text-bone-dim hover:border-white/25"}`}>
                    <Bi zh={s.zh} en={s.en} />
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="mt-6 text-sm text-rose">{error}</p>}

            <button
              onClick={submit}
              className="mt-10 w-full bg-lm-violet py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:brightness-110"
            >
              {t("生成我的生命图谱", "Generate My Life Map")}
            </button>
          </div>
        </section>
      )}

      {stage === "loading" && (
        <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
          <div className="lm-core lm-core-active" />
          <div className="mt-10 space-y-3">
            {LOADING_STEPS.slice(0, loadingStep + 1).map((s, i) => (
              <p key={i} className={`font-display text-base ${i === loadingStep ? "text-bone" : "text-bone-dim/50"}`}>
                <Bi zh={s.zh} en={s.en} />
              </p>
            ))}
          </div>
        </section>
      )}

      {stage === "report" && report && parsed && (
        <section className="px-6 py-20">
          <div className="mx-auto max-w-2xl">
            <p className="text-center font-display text-sm uppercase tracking-widest2 text-lm-violet">
              🌌 {t("你的生命频率报告", "Your Life Frequency Report")}
            </p>
            <h2 className="mt-4 text-center font-display text-4xl font-light text-bone">
              {isEn() ? report.coreType.nameEn : report.coreType.name}
            </h2>
            <p className="mt-3 text-center text-sm text-bone-dim/70">
              {t("太阳", "Sun")} {isEn() ? report.facts.sunSignEn : report.facts.sunSignZh} · {t("日主", "Day Master")} {report.facts.dayMasterGan}
            </p>

            <div className="mt-10 rounded-sm border border-white/10 bg-void-deep p-8">
              <p className="text-base leading-9 text-bone-dim">{parsed.echoText}</p>
            </div>

            <div className="mt-8">
              <p className="font-display text-sm uppercase tracking-widest2 text-lm-violet">
                <Bi zh="当前生命阶段" en="Your Current Life Stage" />
              </p>
              <h3 className="mt-2 font-display text-2xl text-bone">「{parsed.stageName}」</h3>
              <p className="mt-3 text-base leading-8 text-bone-dim">{parsed.stageDesc}</p>
            </div>

            <div className="mt-8">
              <p className="font-display text-sm uppercase tracking-widest2 text-lm-violet">
                <Bi zh="你的三个关键词" en="Your Three Keywords" />
              </p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {parsed.keywords.map((k, i) => (
                  <div key={i} className="rounded-sm border border-white/10 bg-void-deep p-4 text-center">
                    <p className="font-display text-xl text-bone">✨ {k.word}</p>
                    <p className="mt-1 text-xs text-bone-dim/70">{k.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-14 rounded-sm border border-lm-violet/30 bg-lm-violet/5 p-8 text-center">
              <p className="font-display text-lg text-bone">
                🔒 <Bi zh="你的完整生命图谱还有：" en="Your complete Life Map also includes:" />
              </p>
              <ul className="mx-auto mt-5 max-w-sm space-y-2 text-left text-sm leading-7 text-bone-dim">
                <li>01 · <Bi zh="意识结构分析——优势来源、隐藏潜能、容易忽略的模式" en="Consciousness Structure — your strengths, hidden potential, overlooked patterns" /></li>
                <li>02 · <Bi zh="财富频率地图——你与财富的关系、阻碍模式、适合的创造路径" en="Wealth Frequency Map — your relationship with money, blocks, and paths suited to you" /></li>
                <li>03 · <Bi zh="关系共振分析——情感模式、容易吸引的人、成长方向" en="Relationship Resonance — your emotional pattern, who you tend to attract, growth direction" /></li>
                <li>04 · <Bi zh="人生周期导航——30天/90天/365天的关注方向" en="Life Cycle Navigation — focus points for the next 30/90/365 days" /></li>
                <li>05 · <Bi zh="专属灵犀练习——根据你的状态生成的呼吸与觉察练习" en="A Personal Lingxi Practice — breathing and awareness exercises shaped to your state" /></li>
              </ul>
              <div className="mt-8">
                <p className="text-sm text-bone-dim/60 line-through">$29.9</p>
                <p className="font-display text-4xl text-lm-violet">$9.9</p>
              </div>
              <Link
                href="/live-as"
                className="mt-6 inline-block bg-lm-violet px-12 py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:brightness-110"
              >
                ✨ <Bi zh="解锁完整报告" en="Unlock My Full Life Map" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <style>{`
        .lm-core {
          width: 120px; height: 120px; border-radius: 999px;
          background: radial-gradient(circle at 50% 45%, #fff6e8, #C9A5D8 45%, transparent 75%);
          animation: lm-breathe 4.2s ease-in-out infinite;
          filter: blur(1px);
        }
        @keyframes lm-breathe { 0%,100% { transform: scale(1); opacity: .75; } 50% { transform: scale(1.18); opacity: 1; } }
        .lm-core-active { animation: lm-breathe 1.5s ease-in-out infinite; width: 90px; height: 90px; }
      `}</style>
    </div>
  );
}
