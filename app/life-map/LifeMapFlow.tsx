"use client";

import { useState, useRef } from "react";
import { getCoreType, type WesternElement, type ChineseElement } from "@/lib/lifemap-calc";
import Bi from "@/components/Bi";
import { createClient } from "@/lib/supabase/client";
import LifeMapCompass from "./LifeMapCompass";

const isEn = () => typeof document !== "undefined" && document.documentElement.classList.contains("lang-en");
const t = (zh: string, en: string) => (isEn() ? en : zh);

type Stage = "landing" | "form" | "loading" | "report";

type Focus = "wealth" | "relationship" | "direction" | "growth" | "all";
type CurrentState = "transforming" | "lost" | "breakthrough" | "stable" | "exploring";

type PlanetPlacement = { signZh: string; signEn: string; element: WesternElement };
type PillarDetail = { ganZhi: string; shiShenGan: string; shiShenZhi: string; naYin: string; diShi: string; hideGan: string[] };
type MayaTzolkin = { sign: string; signEn: string; meaning: string; tone: number; toneZh: string; toneMeaning: string };

type Facts = {
  sunSignZh: string; sunSignEn: string; sunElement: WesternElement;
  moonSignZh: string; moonSignEn: string; moonElement: WesternElement;
  mercury: PlanetPlacement; venus: PlanetPlacement; mars: PlanetPlacement; jupiter: PlanetPlacement; saturn: PlanetPlacement;
  yearPillar: string; monthPillar: string; dayPillar: string; hourPillar: string | null;
  dayMasterGan: string; dayMasterElement: ChineseElement;
  yearShiShen: string; monthShiShen: string; hourShiShen: string | null;
  daYunStartAge: number | null;
  yearDetail: PillarDetail; monthDetail: PillarDetail; dayDetail: PillarDetail; timeDetail: PillarDetail | null;
  taiYuan: string; taiYuanNaYin: string; mingGong: string; mingGongNaYin: string; shenGong: string; shenGongNaYin: string;
  wuXingCount: Record<ChineseElement, number>;
  maya: MayaTzolkin;
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
  { zh: "✨ 推算七大行星的真实位置", en: "✨ Calculating the true positions of seven planets" },
  { zh: "✨ 排布你的四柱八字与十神", en: "✨ Charting your Four Pillars and Ten Gods" },
  { zh: "✨ 换算玛雅Tzolkin圣历印记", en: "✨ Converting your Maya Tzolkin day sign" },
  { zh: "✨ 交叉三套系统，生成你的核心类型", en: "✨ Cross-referencing three systems into your core type" },
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
  const [energyLevel, setEnergyLevel] = useState(3);
  const [clarityLevel, setClarityLevel] = useState(3);
  const [alignmentLevel, setAlignmentLevel] = useState(3);
  const [loadingStep, setLoadingStep] = useState(0);
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState("");
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const formTopRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

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
      const wx = facts.wuXingCount;
      const wxStr = `木${wx.wood} 火${wx.fire} 土${wx.earth} 金${wx.metal} 水${wx.water}`;
      const promptContent =
        `【核心类型】${coreType.name}（${coreType.nameEn}）——${coreType.essence}\n` +
        `【西方星盘】太阳：${facts.sunSignZh}；月亮：${facts.moonSignZh}；水星：${facts.mercury.signZh}；金星：${facts.venus.signZh}；火星：${facts.mars.signZh}；木星：${facts.jupiter.signZh}；土星：${facts.saturn.signZh}\n` +
        `【中式命盘】四柱：${facts.yearPillar} ${facts.monthPillar} ${facts.dayPillar}${facts.hourPillar ? " " + facts.hourPillar : "（未知具体时辰）"}；` +
        `日主：${facts.dayMasterGan}（${facts.dayMasterElement === "wood" ? "木" : facts.dayMasterElement === "fire" ? "火" : facts.dayMasterElement === "earth" ? "土" : facts.dayMasterElement === "metal" ? "金" : "水"}）；` +
        `年干十神：${facts.yearShiShen}；月干十神：${facts.monthShiShen}；日柱纳音：${facts.dayDetail.naYin}；命局五行分布：${wxStr}\n` +
        `【玛雅Tzolkin】${facts.maya.tone} ${facts.maya.sign}（${facts.maya.meaning}／数字${facts.maya.tone}：${facts.maya.toneMeaning}）\n` +
        `【当前频率自测】能量水平${energyLevel}/5，头脑清晰度${clarityLevel}/5，内外对齐感${alignmentLevel}/5\n` +
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

      // 若已登录，保存这份提交记录，供之后解锁完整报告时使用；未登录则跳过，
      // 解锁完整报告时会引导先登录。
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const saveRes = await fetch("/api/lifemap/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: name.trim() || null,
              birthInput: { year: y, month: m, day: d, hour: hasTime ? parseInt(hour, 10) || 0 : 12, minute: hasTime ? parseInt(minute, 10) || 0 : 0, hasTime },
              facts,
              coreTypeName: isEn() ? coreType.nameEn : coreType.name,
              freeNarrative: aiPayload.text,
              focus: focusLabel.zh,
              currentState: stateLabel.zh,
              energyLevel, clarityLevel, alignmentLevel,
            }),
          });
          const saveData = await saveRes.json();
          if (saveRes.ok && saveData.id) setSubmissionId(saveData.id);
        }
      } catch {
        // 保存失败不影响免费报告的展示，静默忽略，解锁按钮会引导用户重新走一次
      }
    } catch {
      clearInterval(stepTimer);
      setError(t("场域连接不稳定，请重试一次。", "The field connection was unstable — please try again."));
      setStage("form");
    }
  };

  const unlockFull = async () => {
    setUnlocking(true);
    setError("");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError(t("需要先登录，正在带你去登录页面…", "You'll need to sign in first — taking you there now…"));
        setTimeout(() => { window.location.href = "/account"; }, 1200);
        return;
      }
      let id = submissionId;
      if (!id) {
        setError(t("提交记录尚未保存好，请稍候几秒再试一次。", "Your submission isn't saved yet — please wait a few seconds and try again."));
        setUnlocking(false);
        return;
      }
      const res = await fetch("/api/pay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: "life-map-report", returnPath: `/life-map/full?id=${id}&paid=1` }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("解锁完整报告失败:", data);
        setError(
          data.error === "支付未配置"
            ? t("支付网关尚未配置（缺少 NOWPAYMENTS_API_KEY），请联系站点管理员配置后再试。", "Payment gateway isn't configured yet (missing NOWPAYMENTS_API_KEY) — please contact the site admin.")
            : data.error || t("下单失败，请稍后再试。", "Order failed, please try again later.")
        );
        setUnlocking(false);
      }
    } catch (e) {
      console.error("解锁完整报告出错:", e);
      setError(t("网络错误，请稍后再试。", "Network error, please try again later."));
      setUnlocking(false);
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
          <div className="pointer-events-none absolute inset-x-0 top-16 flex justify-center opacity-70">
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
              <Bi zh="输入你的基础信息，生成你的专属生命图谱——西方占星、中式八字、玛雅Tzolkin圣历，三套真实的天文历法系统，同一个人，三种古老的语言。" en="Enter your basic information, and generate a life map that is entirely your own — Western astrology, Chinese Bazi, and the Maya Tzolkin calendar: three real astronomical and calendrical systems, one person, three ancient languages." />
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
            <LifeMapCompass />
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

            <h2 className="mt-14 text-center font-display text-3xl font-light text-bone">
              <Bi zh="三、当前频率自测" en="III. Self-Assessment: Your Current Frequency" />
            </h2>
            <p className="mx-auto mt-3 max-w-md text-center text-sm leading-7 text-bone-dim">
              <Bi
                zh="命盘给出的是你与生俱来的结构，这三项，则是你此刻真实的状态——两者放在一起看，报告才知道，该把重点，放在哪里。"
                en="Your chart shows the structure you were born with. These three ratings show where you actually are right now — together, they tell the report where to focus."
              />
            </p>
            <div className="mt-8 space-y-6">
              {[
                { label: t("能量水平", "Energy Level"), sub: t("此刻，你感觉自己有多少行动的力气？", "Right now, how much drive do you feel to act?"), v: energyLevel, set: setEnergyLevel },
                { label: t("头脑清晰度", "Mental Clarity"), sub: t("此刻，你对自己想要什么，有多清楚？", "Right now, how clear are you on what you want?"), v: clarityLevel, set: setClarityLevel },
                { label: t("内外对齐感", "Sense of Alignment"), sub: t("此刻，你的生活方式，与你真正相信的东西，有多一致？", "Right now, how aligned does your daily life feel with what you actually believe?"), v: alignmentLevel, set: setAlignmentLevel },
              ].map((f) => (
                <div key={f.label}>
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm text-bone">{f.label}</p>
                    <p className="font-display text-lg text-lm-violet">{f.v}<span className="text-xs text-bone-dim/50">/5</span></p>
                  </div>
                  <p className="mt-1 text-xs text-bone-dim/60">{f.sub}</p>
                  <div className="mt-3 flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => f.set(n)}
                        className={`h-8 flex-1 rounded-sm border transition ${n <= f.v ? "border-lm-violet bg-lm-violet/40" : "border-white/12 bg-void"}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
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

            {/* 命盘数据面板：中西玛雅三方合参，全部真实计算，不是编的——这是免费版就能看到的"证据" */}
            <div className="mt-8 rounded-sm border border-lm-violet/20 bg-lm-violet/5 p-6">
              <p className="font-display text-sm uppercase tracking-widest2 text-lm-violet">
                <Bi zh="你的命盘数据 · 西方占星 · 中式八字 · 玛雅Tzolkin" en="Your Chart Data · Western Astrology · Chinese Bazi · Maya Tzolkin" />
              </p>
              <p className="mt-2 text-xs leading-6 text-bone-dim/70">
                <Bi
                  zh="以下每一项，都由真实的天文与历法算法计算得出——七大行星的黄道位置，与专业占星软件同源；四柱八字的干支、纳音、地势，采用标准命理算法；玛雅Tzolkin圣历的图腾与数字，用儒略日精确推算，并用两个真实的历史节点（创世日、2012年长历终止日）验证过准确性。不是语言模型现场编的数字。"
                  en="Every value below comes from real astronomical and calendrical calculation — planetary positions from the same class of method professional astrology software uses; Bazi characters, elements and stages from standard calendrical rules; the Maya Tzolkin day sign and tone computed via Julian Day Number and verified against two real historical reference points. None of it is a number a language model made up."
                />
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { label: t("太阳", "Sun"), v: isEn() ? report.facts.sunSignEn : report.facts.sunSignZh },
                  { label: t("月亮", "Moon"), v: isEn() ? report.facts.moonSignEn : report.facts.moonSignZh },
                  { label: t("水星", "Mercury"), v: isEn() ? report.facts.mercury.signEn : report.facts.mercury.signZh },
                  { label: t("金星", "Venus"), v: isEn() ? report.facts.venus.signEn : report.facts.venus.signZh },
                  { label: t("火星", "Mars"), v: isEn() ? report.facts.mars.signEn : report.facts.mars.signZh },
                  { label: t("木星", "Jupiter"), v: isEn() ? report.facts.jupiter.signEn : report.facts.jupiter.signZh },
                  { label: t("土星", "Saturn"), v: isEn() ? report.facts.saturn.signEn : report.facts.saturn.signZh },
                ].map((p) => (
                  <div key={p.label} className="rounded-sm border border-white/10 bg-void-deep px-3 py-2 text-center">
                    <p className="text-[10px] uppercase tracking-widest2 text-bone-dim/60">{p.label}</p>
                    <p className="mt-1 font-display text-sm text-bone">{p.v}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-white/10 pt-4 font-display text-sm text-bone">
                <span className="rounded-sm border border-white/10 px-3 py-1.5">{report.facts.yearPillar}</span>
                <span className="rounded-sm border border-white/10 px-3 py-1.5">{report.facts.monthPillar}</span>
                <span className="rounded-sm border border-amber/40 bg-amber/10 px-3 py-1.5">{report.facts.dayPillar}</span>
                {report.facts.hourPillar && <span className="rounded-sm border border-white/10 px-3 py-1.5">{report.facts.hourPillar}</span>}
                {!report.facts.hourPillar && <span className="rounded-sm border border-white/5 px-3 py-1.5 text-bone-dim/40">{t("时柱未知", "Hour pillar unknown")}</span>}
              </div>
              <p className="mt-3 text-center text-xs text-bone-dim/50">
                <Bi zh={`日柱纳音：${report.facts.dayDetail.naYin}　命局五行：木${report.facts.wuXingCount.wood} 火${report.facts.wuXingCount.fire} 土${report.facts.wuXingCount.earth} 金${report.facts.wuXingCount.metal} 水${report.facts.wuXingCount.water}`} en={`Day Pillar Na Yin: ${report.facts.dayDetail.naYin}　Element Balance: Wood ${report.facts.wuXingCount.wood} Fire ${report.facts.wuXingCount.fire} Earth ${report.facts.wuXingCount.earth} Metal ${report.facts.wuXingCount.metal} Water ${report.facts.wuXingCount.water}`} />
              </p>
              <div className="mt-4 flex items-center justify-center gap-3 border-t border-white/10 pt-4">
                <span className="rounded-sm border border-lm-violet/30 bg-lm-violet/10 px-4 py-2 text-center font-display text-sm text-bone">
                  {t("玛雅印记", "Maya Sign")} {report.facts.maya.tone} {isEn() ? report.facts.maya.signEn : report.facts.maya.sign}
                </span>
              </div>
              <p className="mt-2 text-center text-xs text-bone-dim/50">{report.facts.maya.meaning} · {report.facts.maya.toneMeaning}</p>
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
                🔒 <Bi zh="以上，只是命盘最外层的骨架。" en="What you've seen so far is only the outer frame of your chart." />
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-bone-dim">
                <Bi
                  zh="七大行星只给了星座，没给你它们彼此之间的角度关系；四柱只列了干支，没给你藏干、地势、胎元命宫身宫这些更深的骨架；玛雅印记也只给了名字，没给你它在你命盘里真正意味着什么。三套系统、几十个真实数据点，交叉组合出的，是独属于你的一份命盘——完整报告，会把它们，逐一，为你解读。"
                  en="The planets above only show signs — not the angles between them. The Pillars only show characters — not the hidden stems, growth stages, or the deeper palaces beneath them. The Maya sign only shows a name — not what it actually means in your chart. Three systems, dozens of real data points, cross-combined into something uniquely yours — the full report interprets all of it, one layer at a time."
                />
              </p>
              <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm leading-7 text-bone-dim">
                <li>01 · <Bi zh="逐一解读——七大行星，每一颗，都有单独的一段解读，不是罗列星座名字" en="Planet by planet — each of the seven gets its own reading, not just a sign name" /></li>
                <li>02 · <Bi zh="八字深层结构——十神、纳音、地势、藏干，逐柱展开，加上胎元命宫身宫的解读" en="Bazi in depth — Ten Gods, Na Yin, growth stages, hidden stems, pillar by pillar, plus the three palaces" /></li>
                <li>03 · <Bi zh="玛雅印记详解——你的图腾与数字，在你命盘里具体意味着什么" en="Your Maya sign, decoded — what your day sign and tone specifically mean in your chart" /></li>
                <li>04 · <Bi zh="大运走势——未来几个十年周期，各自的主题与转折点" en="Major Luck Cycles — the theme and turning point of each coming decade" /></li>
                <li>05 · <Bi zh="频率自测解读——你填的能量/清晰度/对齐感三项分数，对照命盘，看出真正的落差在哪里" en="Your frequency self-assessment, interpreted — where your actual state diverges from your chart, and why" /></li>
                <li>06 · <Bi zh="财富与事业频率地图——事业运势、适合的工作方式，与财富的关系、适合的创造路径" en="Wealth & Career Map — your career instincts, working style, relationship with money, paths suited to you" /></li>
                <li>07 · <Bi zh="关系共振地图——亲密关系的情感模式，加上家族归属、群体角色的解读" en="Relationship Resonance Map — your intimacy pattern, plus family dynamics and your role in groups" /></li>
                <li>08 · <Bi zh="人生周期导航——30天/90天/365天的关注方向" en="Life Cycle Navigation — focus points for the next 30/90/365 days" /></li>
                <li>09 · <Bi zh="专属灵犀练习——根据你的状态生成的呼吸与觉察练习" en="A Personal Lingxi Practice — breathing and awareness exercises shaped to your state" /></li>
                <li>10 · <Bi zh="完整报告可下载 PDF，永久保存，随时回看" en="Full report available as a downloadable PDF — yours to keep, revisit anytime" /></li>
              </ul>
              <p className="mx-auto mt-6 max-w-sm text-xs leading-6 text-bone-dim/50">
                <Bi
                  zh="真人命理师/占星师的一次解读，通常在千元以上；一份中西玛雅三方合参、逐项展开的书面报告，只要一杯咖啡的价钱。"
                  en="A single session with a real astrologer or fortune-teller typically runs well over a hundred dollars; a full, itemized written report drawing on three real systems costs less than a coffee."
                />
              </p>
              <div className="mt-8">
                <p className="text-sm text-bone-dim/60 line-through">$29.9</p>
                <p className="font-display text-4xl text-lm-violet">$9.9</p>
              </div>
              <button
                onClick={unlockFull}
                disabled={unlocking}
                className="mt-6 inline-block bg-lm-violet px-12 py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:brightness-110 disabled:opacity-50"
              >
                {unlocking ? t("正在跳转支付…", "Redirecting to payment…") : <>✨ <Bi zh="解锁完整报告" en="Unlock My Full Life Map" /></>}
              </button>
              {error && (
                <p className="mx-auto mt-4 max-w-sm rounded-sm border border-rose/30 bg-rose/10 px-4 py-3 text-sm leading-6 text-rose">
                  {error}
                </p>
              )}
              {!error && !submissionId && (
                <p className="mx-auto mt-4 max-w-xs text-xs text-bone-dim/50">
                  <Bi zh="需要先登录，才能保存并解锁你的完整报告。" en="Sign in first to save and unlock your full report." />
                </p>
              )}
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
