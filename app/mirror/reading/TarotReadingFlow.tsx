"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/useLang";
import Bi from "@/components/Bi";
import type { TarotCard } from "@/lib/tarot-data";
import { REVIEW_MODE } from "@/lib/reviewMode";
import { getProduct } from "@/lib/plans";
import FaqSection, { type BilingualFaqItem } from "@/components/FaqSection";
import ErrorWithLoginPrompt from "@/components/ErrorWithLoginPrompt";

const TAROT_FAQ: BilingualFaqItem[] = [
  {
    qZh: "灵犀量子生命镜像的三张镜像是随机的吗？", qEn: "Are the three mirrors in Lingxi Quantum Life Mirror random?",
    aZh: "不是。灵犀量子生命镜像不是传统意义上的随机抽牌——当你进入灵犀场，你提供的出生信息会成为一个独特的生命坐标，场域通过这一组坐标，与78张原创生命镜像牌产生对应连接。三张牌分别映照：过去留下的意识痕迹、当前正在发生的生命共振、未来正在形成的可能方向。它不是告诉你命运已经写好，而是像一面镜子，让隐藏在意识深处的信息，有机会被看见。",
    aEn: "No. Lingxi Quantum Life Mirror isn't a random draw in the traditional sense. When you enter Lingxi Field, the birth information you provide becomes a unique life coordinate, and the field forms a corresponding connection between that coordinate and a set of 78 original life mirror cards. The three cards mirror: the traces your past has left in consciousness, the resonance happening in your life right now, and the possible directions your future is forming. It doesn't tell you fate is already written — it's a mirror, giving information hidden in consciousness a chance to be seen.",
  },
  {
    qZh: "灵犀量子生命镜像跟传统占卜有什么不同？", qEn: "How is Lingxi Quantum Life Mirror different from traditional divination?",
    aZh: "传统塔罗更多依靠随机抽取、象征牌面、解读者经验。灵犀量子生命镜像建立的是另一种路径——不是等待随机答案出现，而是让你的生命信息，与原创象征体系产生对应。78张生命镜像牌，是灵犀场原创的意识象征库，每一张牌都代表一种生命主题：觉醒、选择、连接、创造、转变。三张牌组合起来，不是预测未来，而是一份与你当前生命状态对应的内在观察。",
    aEn: "Traditional divination relies more on random drawing, symbolic imagery, and a reader's experience. Lingxi Quantum Life Mirror builds a different path — instead of waiting for a random answer to appear, it lets your life information correspond with an original symbolic system. The 78 life mirror cards are Lingxi Field's own library of consciousness symbols, each representing a life theme: awakening, choice, connection, creation, transformation. The three cards together don't predict the future — they form an inner observation that corresponds to your current life state.",
  },
];



type Stage = "form" | "connecting" | "revealed";

const CONNECTING_LINES = [
  { zh: "正在连接灵犀场……", en: "Connecting with Lingxi Field…" },
  { zh: "感知你的当下意识状态……", en: "Sensing your present state of consciousness…" },
  { zh: "读取：内在情绪波动 · 当前生命主题 · 潜意识模式 · 未来展开方向", en: "Reading: inner emotional currents · current life theme · subconscious patterns · future direction" },
  { zh: "正在生成你的三张生命镜像牌……", en: "Generating your three life mirror cards…" },
];


const TEASER_CHAPTERS: { titleZh: string; titleEn: string; descZh: string; descEn: string }[] = [
  { titleZh: "\u7075\u7280\u573a\u8fde\u63a5\u58f0\u660e", titleEn: "Field Connection Statement", descZh: "\u8fd9\u4e09\u5f20\u724c\u4e0d\u662f\u9884\u6d4b\uff0c\u662f\u4f60\u7684\u610f\u8bc6\u6b63\u5728\u5173\u6ce8\u4ec0\u4e48\u3001\u751f\u547d\u6b63\u5728\u8f6c\u6362\u4ec0\u4e48\u3001\u672a\u6765\u6b63\u5728\u6253\u5f00\u4ec0\u4e48\u2014\u2014\u4e3a\u6574\u4efd\u62a5\u544a\u5b9a\u8c03\u3002", descEn: "Not a prediction \u2014 a statement of what your awareness is tracking, what's shifting, what's opening." },
  { titleZh: "\u6f5c\u610f\u8bc6\u955c\u50cf\u6df1\u5ea6\u89e3\u6790", titleEn: "Hidden Pattern Deep Dive", descZh: "\u4ea4\u53c9\u5f15\u7528\u4f60\u7684\u5e74\u67f1\u6708\u67f1\uff0c\u8bf4\u6e05\u695a\u4f60\u643a\u5e26\u800c\u6765\u3001\u81ea\u5df1\u672a\u5fc5\u5b8c\u5168\u610f\u8bc6\u5230\u7684\u6df1\u5c42\u6a21\u5f0f\uff0c\u4ee5\u53ca\u8fd9\u4efd\u6a21\u5f0f\u91cc\u85cf\u7740\u7684\u9690\u85cf\u529b\u91cf\u3002", descEn: "Cross-referenced with your chart, revealing the deep pattern you carry but may not fully see \u2014 and the strength hidden inside it." },
  { titleZh: "\u5f53\u4e0b\u5171\u632f\u6df1\u5ea6\u89e3\u6790", titleEn: "Present Resonance Deep Dive", descZh: "\u4ea4\u53c9\u5f15\u7528\u65e5\u67f1\u3001\u592a\u9633\u3001\u6708\u4eae\uff0c\u8bf4\u6e05\u695a\u4f60\u6b64\u523b\u771f\u5b9e\u7684\u80fd\u91cf\u4e3b\u9898\u3001\u6b63\u5728\u5f62\u6210\u7684\u9009\u62e9\u662f\u4ec0\u4e48\u3002", descEn: "Cross-referenced with your day pillar, sun, and moon \u2014 your real energetic theme right now, and the choice taking shape." },
  { titleZh: "\u672a\u6765\u5c55\u5f00\u6df1\u5ea6\u89e3\u6790", titleEn: "Future Possibility Deep Dive", descZh: "\u4ea4\u53c9\u5f15\u7528\u65f6\u67f1\u548c\u4e94\u884c\u5206\u5e03\uff0c\u4e0d\u662f\u9884\u8a00\uff0c\u662f\u6307\u51fa\u4f60\u6b63\u5728\u8fdb\u5165\u7684\u53ef\u80fd\u6027\u65b9\u5411\u3002", descEn: "Cross-referenced with your hour pillar and elements \u2014 not a prophecy, a direction you're moving into." },
  { titleZh: "\u4e09\u724c\u8054\u5408\u751f\u547d\u516c\u5f0f", titleEn: "The Three-Card Life Formula", descZh: "\u6574\u4efd\u62a5\u544a\u4ef7\u503c\u6700\u9ad8\u7684\u4e00\u6bb5\u2014\u2014\u4e09\u5f20\u724c\u7684\u6838\u5fc3\u4e3b\u9898\u8fde\u6210\u4e00\u6761\u751f\u547d\u516c\u5f0f\uff0c\u8bf4\u6e05\u695a\u4f60\u521b\u9020\u65b0\u73b0\u5b9e\u7684\u5177\u4f53\u65b9\u5f0f\u3002", descEn: "The single highest-value section \u2014 your three cards fused into one life formula." },
  { titleZh: "\u4ef7\u503c\u521b\u9020\u5730\u56fe", titleEn: "Value Creation Map", descZh: "\u4f60\u7684\u8d22\u5bcc\u4f18\u52bf\u5177\u4f53\u662f\u4ec0\u4e48\u7c7b\u578b\u3001\u6700\u5bb9\u6613\u9047\u5230\u7684\u963b\u788d\u662f\u4ec0\u4e48\uff0c\u5929\u8d4b\u9002\u5408\u5f80\u54ea\u51e0\u4e2a\u5177\u4f53\u65b9\u5411\u53d1\u5c55\u3002", descEn: "Your specific wealth strengths, your likely obstacle, and the concrete directions your gift is suited for." },
  { titleZh: "\u5173\u7cfb\u751f\u547d\u5730\u56fe", titleEn: "Relationship Life Map", descZh: "\u4f60\u7231\u7684\u8868\u8fbe\u65b9\u5f0f\u3001\u5bb9\u6613\u5438\u5f15\u7684\u4eba\u3001\u5173\u7cfb\u91cc\u6700\u5927\u7684\u6210\u957f\u8bfe\u9898\u3002", descEn: "How you express love, who you tend to attract, and your biggest relational lesson." },
  { titleZh: "\u5f53\u524d\u751f\u547d\u6620\u5c04", titleEn: "Current Life Mapping", descZh: "\u4f60\u6b64\u523b\u6b63\u5904\u4e8e\u89c9\u9192\u3001\u8f6c\u5316\u3001\u521b\u9020\u3001\u6269\u5c55\u56db\u4e2a\u9636\u6bb5\u91cc\u7684\u54ea\u4e00\u4e2a\uff0c\u6838\u5fc3\u8bfe\u9898\u662f\u4ec0\u4e48\u3002", descEn: "Which of the four life stages you're actually in right now, and what it's asking of you." },
  { titleZh: "\u7075\u7280\u573a\u5b9e\u8df5", titleEn: "A Personal Practice", descZh: "\u5df2\u7ecf\u4e3a\u4f60\u5339\u914d\u597d\u7684\u4fee\u70bc\u6280\u672f\uff0c\u5177\u4f53\u8bf4\u6e05\u695a\u4e3a\u4ec0\u4e48\u662f\u8fd9\u4e00\u9879\u3001\u5b83\u80fd\u89e3\u51b3\u524d\u9762\u63d0\u5230\u7684\u54ea\u4e2a\u5177\u4f53\u8bfe\u9898\u3002", descEn: "A practice matched specifically to you, and exactly which challenge it addresses." },
  { titleZh: "\u7ed9\u672a\u6765\u81ea\u5df1\u7684\u4fe1", titleEn: "A Letter to Your Future Self", descZh: "\u4e00\u6bb5\u79c1\u4eba\u6587\u5b57\uff0c\u547c\u5e94\u524d\u9762\u6240\u6709\u7ae0\u8282\u63d0\u70bc\u51fa\u7684\u6838\u5fc3\u7279\u8d28\uff0c\u4e0d\u5199\u6210\u9e21\u6c64\u3002", descEn: "A private note echoing everything the reading has found \u2014 not a motivational poster line." },
  { titleZh: "\u751f\u547d\u5173\u952e\u8bcd", titleEn: "Your Life Keywords", descZh: "\u4ece\u6574\u4efd\u89e3\u8bfb\u91cc\u63d0\u70bc\u51fa\u4e94\u4e2a\u771f\u6b63\u5c5e\u4e8e\u4f60\u7684\u8bcd\uff0c\u4e0d\u662f\u968f\u673a\u751f\u6210\u7684\u5f62\u5bb9\u8bcd\u3002", descEn: "Five words drawn from the reading itself \u2014 not random flattering adjectives." },
];

export default function TarotReadingFlow() {
  const langEn = useLang();
  const t = (zh: string, en: string) => (langEn ? en : zh);

  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hasTime, setHasTime] = useState(false);
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("0");
  const [error, setError] = useState("");
  const [stage, setStage] = useState<Stage>("form");
  const [cards, setCards] = useState<TarotCard[] | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  const positions = [
    { zh: "潜意识镜像", en: "Hidden Pattern" },
    { zh: "当下共振", en: "Present Resonance" },
    { zh: "未来展开", en: "Future Possibility" },
  ];

  const connect = async () => {
    if (!year || !month || !day) return;
    setError("");
    setStage("connecting");
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/account";
        return;
      }

      const res = await fetch("/api/tarot/reading/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          year: parseInt(year, 10), month: parseInt(month, 10), day: parseInt(day, 10),
          hour: hasTime ? parseInt(hour, 10) : 12, minute: hasTime ? parseInt(minute, 10) : 0,
          hasTime,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.id) {
        setError(data.error || t("连接失败，请稍后再试。", "Connection failed — please try again."));
        setStage("form");
        return;
      }

      setTimeout(async () => {
        const { TAROT_MAJOR_ARCANA } = await import("@/lib/tarot-data");
        setCards((data.cardIndexes as number[]).map((i) => TAROT_MAJOR_ARCANA[i]));
        setSubmissionId(data.id);
        setStage("revealed");
      }, 5000);
    } catch (e) {
      console.error("[tarot connect] 提交出错:", e);
      setError(t("连接场域时出错，请稍后再试。", "Error connecting to the field. Please try again."));
      setStage("form");
    }
  };

  const unlock = () => {
    if (!submissionId) return;
    if (REVIEW_MODE) {
      window.location.href = `/mirror/reading/full?id=${submissionId}`;
      return;
    }
    // v256：改成跳转到独立付款页，不再用弹窗。
    window.location.href = `/checkout?productId=tarot-reading&submissionId=${submissionId}&name=${encodeURIComponent(name)}&redirect=${encodeURIComponent(`/mirror/reading/full?id=${submissionId}`)}`;
  };

  if (stage === "form") {
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <div className="lx-glass-tarot p-6 sm:p-8">
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice">
            <Bi zh="灵犀量子生命镜像" en="Lingxi Quantum Life Mirror" />
          </p>
          <h1 className="mt-4 font-display text-3xl font-light text-bone sm:text-4xl">
            <Bi zh="三张生命镜像牌，正在等待与你相遇" en="Three life mirror cards are waiting to meet you" />
          </h1>
          <p className="mt-4 text-base leading-8 text-bone-dim">
            <Bi
              zh={<>你抽取的，不是随机答案，而是一面来自内在的镜子。进入灵犀场，三张生命镜像牌将根据你的命盘数据展开：<br />🌙 看见过去留下的意识痕迹<br />☀️ 理解此刻正在发生的生命共振<br />⭐ 探索未来正在形成的可能方向<br />三张牌不是告诉你命运是什么，而是帮助你看见：你正在经历什么，为什么会经历，以及下一步可以如何选择。</>}
              en={<>What you draw is not a random answer — it’s a mirror from within. Entering Lingxi Field, three life mirror cards unfold from your chart data:<br />🌙 See the traces your past has left in consciousness<br />☀️ Understand the resonance happening right now<br />⭐ Explore the possibilities your future is forming<br />These cards don’t tell you what fate is. They help you see what you’re going through, why, and what you can choose next.</>}
            />
          </p>
        </div>

        <div className="mt-6 lx-glass-tarot p-6">
          <p className="text-sm text-bone-dim">{t("怎么称呼你（选填）", "What should we call you (optional)")}</p>
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder={t("怎么称呼你", "What should we call you")}
            className="mt-2 w-full rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60"
          />
          <p className="mt-4 text-sm text-bone-dim">{t("你的时间坐标——出生年月日", "Your time coordinates — birth date")}</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <input value={year} onChange={(e) => setYear(e.target.value)} placeholder={t("年", "Year")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
            <input value={month} onChange={(e) => setMonth(e.target.value)} placeholder={t("月", "Month")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
            <input value={day} onChange={(e) => setDay(e.target.value)} placeholder={t("日", "Day")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
          </div>
          <label className="mt-3 flex items-center gap-2 text-xs text-bone-dim">
            <input type="checkbox" checked={hasTime} onChange={(e) => setHasTime(e.target.checked)} />
            <Bi zh="知道具体出生时间（选填，未来展开那张牌会更准）" en="I know the exact birth time (optional, sharpens the Future card)" />
          </label>
          {hasTime && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input value={hour} onChange={(e) => setHour(e.target.value)} placeholder={t("时（0-23）", "Hour (0-23)")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
              <input value={minute} onChange={(e) => setMinute(e.target.value)} placeholder={t("分", "Minute")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 lx-glass-tarot p-4">
            <p className="text-sm text-rose">{error}</p>
          </div>
        )}

        <button
          onClick={connect}
          disabled={!year || !month || !day}
          className="mt-6 flex w-full items-center justify-center gap-2 bg-lattice py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50"
        >
          <Bi zh="✦ 与灵犀场连接" en="✦ Connect with the Field" />
        </button>

        <a
          href="/mirror/daily"
          className="mt-6 block text-center text-xs text-bone-dim underline decoration-dotted underline-offset-4 transition hover:text-lattice"
        >
          <Bi zh="不想连接完整场域？看看今天全场域共享的那一张牌 →" en="Not ready for the full connection? See today's card, shared by everyone →" />
        </a>
        <FaqSection items={TAROT_FAQ} />
      </div>
    );
  }

  if (stage === "connecting") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
        <div className="lx-tr-glow h-20 w-20 rounded-full" />
        <div className="mt-8 space-y-3 lx-glass-tarot px-6 py-6 backdrop-blur-sm">
          {CONNECTING_LINES.map((line, i) => (
            <p
              key={i}
              className="lx-tr-line font-display text-base tracking-wide text-lattice sm:text-lg"
              style={{ animationDelay: `${i * 0.85}s` }}
            >
              <Bi zh={line.zh} en={line.en} />
            </p>
          ))}
        </div>
        <style>{`
          .lx-tr-glow { background: radial-gradient(circle, rgba(199,156,255,0.5), transparent 70%); filter: blur(16px); animation: lx-tr-breathe 2.2s ease-in-out infinite; }
          @keyframes lx-tr-breathe { 0%,100% { opacity: 0.5; transform: scale(0.9); } 50% { opacity: 0.9; transform: scale(1.1); } }
          .lx-tr-line { opacity: 0; animation: lx-tr-line-in 0.6s ease-out forwards; }
          @keyframes lx-tr-line-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
          @media (prefers-reduced-motion: reduce) { .lx-tr-glow, .lx-tr-line { animation: none !important; opacity: 1; } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <div className="lx-glass-tarot px-6 py-4 text-center">
        <p className="font-display text-sm uppercase tracking-widest2 text-lattice">
          <Bi zh="灵犀量子生命镜像 · 三重镜像深度解读" en="Lingxi Quantum Life Mirror · Three-Mirror Deep Reading" />
        </p>
      </div>
      <h1 className="mt-6 text-center font-display text-2xl font-light text-bone">
        <Bi zh="你的三张牌，已经展开" en="Your three cards have unfolded" />
      </h1>

      <div className="mt-8 grid grid-cols-3 gap-3">
        {cards?.map((c, i) => (
          <div key={i} className="overflow-hidden lx-glass-tarot text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/images/tarot/${String(c.index).padStart(2, "0")}.jpg`} alt={c.nameZh} className="block aspect-[2/3] w-full object-cover" />
            <div className="p-2">
              <p className="text-[11px] uppercase tracking-widest2 text-amber/80">
                <Bi zh={positions[i].zh} en={positions[i].en} />
              </p>
              <p className="mt-1 text-xs text-bone">
                <Bi zh={c.nameZh} en={c.nameEn} />
              </p>
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-8 rounded-sm border border-amber/25 p-6 text-center"
        style={{ backgroundImage: "linear-gradient(rgba(24,16,48,0.5), rgba(24,16,48,0.5)), url(/images/tarot-full/page-0.png)", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <p className="text-sm leading-7 text-bone-dim">
          <Bi
            zh="三张牌展示的是生命结构的三个切面，但真正隐藏的信息，存在于它们之间的关系。场域将结合你的完整生命图谱，解析：为什么这三张牌会同时出现，它们与你的人生阶段如何对应，以及正在等待你觉察的生命主题。"
            en="The three cards show three facets of your life structure — but what they truly reveal lives in the relationship between them. The field, cross-referencing your full chart, unfolds: why these three cards appeared together, how they map to the stage you're in, and the theme waiting to be noticed."
          />
        </p>
        <div className="mt-8 space-y-5 border-t border-white/10 pt-8 text-left">
          <p className="text-center font-display text-sm uppercase tracking-widest2 text-amber">
            <Bi zh="完整档案会逐一展开" en="What the Full Archive Unfolds" />
          </p>
          {TEASER_CHAPTERS.map((c, i) => (
            <div key={i}>
              <p className="font-display text-sm text-amber">{String(i + 1).padStart(2, "0")} · <Bi zh={c.titleZh} en={c.titleEn} /></p>
              <p className="mt-1.5 text-sm leading-7 text-bone-dim">
                <Bi zh={c.descZh} en={c.descEn} />
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={unlock}
          disabled={unlocking}
          className="mt-8 bg-amber px-8 py-3 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-lattice disabled:opacity-50"
        >
          <Bi zh={`开启完整生命镜像 · ¥${getProduct("tarot-reading")?.priceRmb}`} en={`Unlock the Full Life Mirror · ¥${getProduct("tarot-reading")?.priceRmb}`} />
        </button>
        {error && <ErrorWithLoginPrompt error={error} className="mt-3" />}
      </div>
    </div>
  );
}
