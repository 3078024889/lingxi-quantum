"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/useLang";
import Bi from "@/components/Bi";
import type { LifeSign } from "@/lib/qian-data";
import { TIER_LABELS } from "@/lib/qian-data";
import QianCosmicRing from "@/components/QianCosmicRing";
import { REVIEW_MODE } from "@/lib/reviewMode";
import { getProduct } from "@/lib/plans";
import FaqSection, { type BilingualFaqItem } from "@/components/FaqSection";
import ErrorWithLoginPrompt from "@/components/ErrorWithLoginPrompt";

const QIAN_FAQ: BilingualFaqItem[] = [
  {
    qZh: "灵犀生命灵签的64枚生命原型是随机摇出来的吗？", qEn: "Are the 64 archetypes in Lingxi Life Oracle randomly drawn?",
    aZh: "不是。当你进入灵犀场，你的出生信息会成为一组独特的生命坐标，这组坐标会与64枚生命原型产生对应连接，展开三重生命镜像：源流签映照你携带而来的生命背景，以及那些早已形成的深层倾向；灵魂签观察你内在最核心的意识模式，以及此刻正在经历的生命主题；行者签探索你如何走向现实世界，以及未来展开自己的方式。三枚生命原型不是随机出现的答案，它们更像三面镜子，分别照见你的过去、现在，以及正在形成的方向。",
    aEn: "No. When you enter Lingxi Field, your birth information becomes a unique set of life coordinates, which form a corresponding connection with 64 life archetypes, unfolding three layers of life mirroring: the Origin Sign reflects the background you carry and the deep-set tendencies already formed within you; the Soul Sign observes your core conscious pattern and the theme you're currently living through; the Walker Sign explores how you move into the world and the way your future unfolds. The three archetypes aren't a random answer — they're closer to three mirrors, each reflecting your past, present, and the direction now forming.",
  },
  {
    qZh: "生命灵签和传统抽签有什么不同？", qEn: "How is Lingxi Life Oracle different from traditional divination?",
    aZh: "传统抽签通常关注「结果是什么」「吉还是凶」。生命灵签关注的是「我为什么会成为现在的我」「我的生命结构正在表达什么」——它不是从未知中寻找答案，而是从你已经携带的信息中，重新整理那些容易被日常忽略的线索。64枚生命原型，是灵犀场原创设计的一套象征体系，每一个原型都代表一种生命主题：创造、连接、觉察、转变、探索、成长。三重生命签组合在一起，形成属于你的生命原型档案，不是替你定义人生，而是帮助你重新认识自己。",
    aEn: "Traditional divination usually asks 'what's the outcome' or 'is it good or bad luck.' Lingxi Life Oracle asks 'why did I become who I am' and 'what is my life structure expressing.' It isn't searching for an answer in the unknown — it's reorganizing clues you already carry, ones that everyday life tends to overlook. The 64 life archetypes are an original symbolic system created for Lingxi Field, each representing a life theme: creation, connection, awareness, transformation, exploration, growth. The three signs together form your own life archetype record — not defining your life for you, but helping you recognize yourself again.",
  },
  {
    qZh: "生命灵签的完整解读包含什么内容？", qEn: "What does the full Life Oracle reading include?",
    aZh: "完整生命灵签不是简单解释三枚签的含义，它会展开：三重生命原型总览、源流签深度解析、灵魂签深度解析、行者签深度解析、三签融合关系、财富创造系统、关系模式分析、事业使命地图、当前人生阶段、隐藏天赋探索、灵犀场成长路径、生命宣言，共12个章节。最终生成的是一份属于你的生命原型档案。",
    aEn: "The full Life Oracle reading isn't a simple explanation of what three signs mean — it unfolds: an overview of your three archetypes, deep dives into the Origin, Soul, and Walker signs, how the three fuse together, a wealth creation system, relationship pattern analysis, a career and mission map, your current life stage, hidden talent exploration, a Lingxi Field growth path, and a personal life declaration — 12 sections in total. What forms is a life archetype record that's entirely your own.",
  },
];



type Stage = "form" | "gathering" | "shaking" | "revealed";


const TEASER_CHAPTERS: { titleZh: string; titleEn: string; descZh: string; descEn: string }[] = [
  { titleZh: "\u751f\u547d\u4e09\u539f\u578b\u603b\u89c8", titleEn: "Three Archetypes Overview", descZh: "\u628a\u4e09\u91cd\u7b7e\u7684\u6838\u5fc3\u7279\u8d28\u63d0\u70bc\u6210\u4e00\u6761\u300cXX\u2192XX\u2192XX\u300d\u7684\u751f\u547d\u516c\u5f0f\u2014\u2014\u4e0d\u662f\u4e09\u4e2a\u7b7e\u540d\u5b57\u7684\u5806\u780c\uff0c\u662f\u4e00\u6761\u6709\u65b9\u5411\u611f\u7684\u5c55\u5f00\u8def\u7ebf\u3002", descEn: "Your three signs distilled into a single life formula \u2014 not three names stacked together, but a route with a direction." },
  { titleZh: "\u6e90\u6d41\u7b7e\u6df1\u5ea6\u89e3\u6790", titleEn: "Origin Sign Deep Dive", descZh: "\u4f60\u643a\u5e26\u800c\u6765\u7684\u539f\u59cb\u9891\u7387\u3001\u751f\u547d\u4f18\u52bf\u662f\u4ec0\u4e48\uff0c\u4f18\u52bf\u53cd\u9762\u53c8\u5bb9\u6613\u5e26\u6765\u4ec0\u4e48\u6f5c\u5728\u6311\u6218\u2014\u2014\u4e0d\u662f\u7b80\u5355\u5938\u5956\uff0c\u662f\u6709\u5177\u4f53\u753b\u9762\u611f\u7684\u5224\u65ad\u3002", descEn: "The raw frequency you were born carrying, your real advantage, and the specific shadow side of that same advantage." },
  { titleZh: "\u7075\u9b42\u7b7e\u6df1\u5ea6\u89e3\u6790", titleEn: "Soul Sign Deep Dive", descZh: "\u4f60\u771f\u6b63\u7684\u5185\u5728\u9a71\u52a8\u529b\u662f\u4ec0\u4e48\u3001\u5929\u8d4b\u65b9\u5411\u9002\u5408\u5f80\u54ea\u8d70\u3001\u6f5c\u610f\u8bc6\u91cc\u5bb9\u6613\u91cd\u590d\u51fa\u73b0\u7684\u6a21\u5f0f\u662f\u4ec0\u4e48\u3002", descEn: "What actually drives you underneath, where your gift wants to go, and the pattern your subconscious keeps replaying." },
  { titleZh: "\u884c\u8005\u7b7e\u6df1\u5ea6\u89e3\u6790", titleEn: "Walker Sign Deep Dive", descZh: "\u4f60\u7684\u884c\u52a8\u529b\u6a21\u5f0f\u3001\u521b\u9020\u73b0\u5b9e\u7684\u5177\u4f53\u8def\u5f84\uff0c\u4ee5\u53ca\u4e00\u53e5\u53ea\u5bf9\u4f60\u6210\u7acb\u7684\u4eba\u751f\u884c\u52a8\u63d0\u9192\u3002", descEn: "How you actually move, your specific path for turning ideas into reality, and one action reminder that fits you and only you." },
  { titleZh: "\u4e09\u7b7e\u878d\u5408\u5206\u6790", titleEn: "Three-Sign Fusion", descZh: "\u6574\u4efd\u62a5\u544a\u4ef7\u503c\u6700\u9ad8\u7684\u4e00\u6bb5\u2014\u2014\u4e09\u7b7e\u8fde\u6210\u4e00\u4e2a\u751f\u547d\u516c\u5f0f\uff0c\u6e90\u6d41\u7b7e\u6253\u4e0b\u7684\u5e95\u3001\u7075\u9b42\u7b7e\u9a71\u52a8\u7684\u5185\u5728\u3001\u884c\u8005\u7b7e\u5c55\u5f00\u7684\u884c\u52a8\uff0c\u53e0\u52a0\u4e4b\u540e\u4f60\u7684\u6838\u5fc3\u4f7f\u547d\u662f\u4ec0\u4e48\u3002", descEn: "The single highest-value section \u2014 your three signs fused into one formula, revealing your core mission." },
  { titleZh: "\u4ef7\u503c\u521b\u9020\u5730\u56fe", titleEn: "Value Creation Map", descZh: "\u4f60\u7684\u8d22\u5bcc\u539f\u578b\u662f\u4ec0\u4e48\u7c7b\u578b\u3001\u5177\u4f53\u7684\u5165\u53e3\u6709\u54ea\u51e0\u4e2a\u65b9\u5411\uff0c\u4e8b\u4e1a\u4e0a\u9002\u5408\u5f80\u54ea\u51e0\u4e2a\u5177\u4f53\u65b9\u5411\u53d1\u5c55\u2014\u2014\u4e0d\u662f\u300c\u5404\u884c\u5404\u4e1a\u90fd\u53ef\u4ee5\u300d\u8fd9\u79cd\u7a7a\u8bdd\u3002", descEn: "Your specific wealth archetype, the actual entry points, and the concrete career directions suited to you." },
  { titleZh: "\u5173\u7cfb\u6620\u5c04", titleEn: "Relationship Mapping", descZh: "\u4f60\u5728\u5173\u7cfb\u91cc\u771f\u6b63\u5bfb\u627e\u7684\u662f\u4ec0\u4e48\u3001\u5bb9\u6613\u5438\u5f15\u4ec0\u4e48\u6837\u7684\u4eba\u3001\u5173\u7cfb\u91cc\u6700\u5927\u7684\u8bfe\u9898\u662f\u4ec0\u4e48\u3002", descEn: "What you're really looking for in a relationship, who you tend to attract, and your biggest relational lesson." },
  { titleZh: "\u5f53\u4e0b\u751f\u547d\u4e3b\u9898", titleEn: "Current Life Theme", descZh: "\u4f60\u6b64\u523b\u6b63\u5904\u4e8e\u54ea\u4e2a\u5177\u4f53\u9636\u6bb5\u3001\u6b63\u5728\u4ece\u4ec0\u4e48\u65e7\u7ed3\u6784\u8f6c\u5411\u4ec0\u4e48\u65b0\u7ed3\u6784\u2014\u2014\u4e0d\u662f\u6cdb\u6cdb\u7684\u4eba\u751f\u5efa\u8bae\u3002", descEn: "The specific stage you're in right now, and exactly what old structure you're moving out of." },
  { titleZh: "\u9690\u85cf\u529b\u91cf", titleEn: "Hidden Strength", descZh: "\u4e00\u9879\u4f60\u8fd8\u6ca1\u5b8c\u5168\u4f7f\u7528\u7684\u80fd\u529b\uff0c\u548c\u4e00\u9879\u5bb9\u6613\u88ab\u81ea\u5df1\u6216\u522b\u4eba\u4f4e\u4f30\u7684\u80fd\u529b\u2014\u2014\u8981\u5177\u4f53\u3001\u8981\u6709\u753b\u9762\u611f\uff0c\u4e0d\u662f\u7a7a\u6cdb\u7684\u5938\u5956\u3002", descEn: "One ability you haven't fully used yet, and one that's easy to underrate \u2014 named specifically, not just flattered." },
  { titleZh: "\u7075\u7280\u573a\u5b9e\u8df5", titleEn: "A Personal Practice", descZh: "\u5df2\u7ecf\u4e3a\u4f60\u5339\u914d\u597d\u7684\u4fee\u70bc\u6280\u672f\uff0c\u5177\u4f53\u8bf4\u6e05\u695a\u4e3a\u4ec0\u4e48\u662f\u8fd9\u4e00\u9879\u3001\u5b83\u80fd\u5e2e\u4f60\u89e3\u51b3\u524d\u9762\u63d0\u5230\u7684\u54ea\u4e2a\u5177\u4f53\u8bfe\u9898\u3002", descEn: "A practice matched specifically to you, and exactly which of your challenges it's meant to address." },
  { titleZh: "\u751f\u547d\u7075\u7b7e\u603b\u7ed3", titleEn: "Oracle Summary", descZh: "\u4ee5\u7b2c\u4e00\u4eba\u79f0\u5199\u4e0b\u5c5e\u4e8e\u4f60\u7684\u751f\u547d\u5ba3\u8a00\uff0c\u547c\u5e94\u524d\u9762\u6240\u6709\u7ae0\u8282\u63d0\u70bc\u51fa\u7684\u6838\u5fc3\u7279\u8d28\uff0c\u6536\u5c3e\u8981\u6709\u529b\u91cf\u611f\u3002", descEn: "A first-person declaration that echoes everything the report has found \u2014 a real close, not a greeting-card line." },
];

export default function QianFlow() {
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
  const [signs, setSigns] = useState<LifeSign[] | null>(null);
  const [signIndexes, setSignIndexes] = useState<number[] | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  const shake = async () => {
    if (!year || !month || !day) return;
    setError("");
    setStage("gathering");
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/account";
        return;
      }

      const res = await fetch("/api/qian/save", {
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
        setError(data.error || t("生命灵签读取失败，请稍后再试。", "The reading failed — please try again."));
        setStage("form");
        return;
      }

      // signIndexes 一拿到就存下来——不用等到"revealed"阶段才知道是
      // 哪三枚，"shaking"这一步，宇宙签库环形组件就可以直接高亮这
      // 三个位置，视觉上是"环停下来，三枚签亮起来"，不是揭示阶段
      // 才突然冒出来。
      setSignIndexes(data.signIndexes as number[]);
      setTimeout(() => setStage("shaking"), 900);
      setTimeout(async () => {
        const { LIFE_SIGNS } = await import("@/lib/qian-data");
        setSigns((data.signIndexes as number[]).map((i) => LIFE_SIGNS[i]));
        setSubmissionId(data.id);
        setStage("revealed");
      }, 2200);
    } catch (e) {
      console.error("[qian shake] 提交出错:", e);
      const detail = e instanceof Error ? e.message : String(e);
      setError(t(`连接场域时出错，请稍后再试。（技术细节：${detail}）`, `Error connecting to the field — please try again. (Detail: ${detail})`));
      setStage("form");
    }
  };

  const unlock = () => {
    if (!submissionId) return;
    // 审核模式开启时，不走真实付款流程——直接跳到结果页，generate-full
    // 接口那边看到 REVIEW_MODE=true 会跳过解锁校验，直接生成内容。
    if (REVIEW_MODE) {
      window.location.href = `/qian/full?id=${submissionId}`;
      return;
    }
    // v256：改成跳转到独立付款页，不再用弹窗。
    window.location.href = `/checkout?productId=qian-reading&submissionId=${submissionId}&name=${encodeURIComponent(name)}&redirect=${encodeURIComponent(`/qian/full?id=${submissionId}`)}`;
  };

  if (stage === "form") {
    return (
      <div className="px-6 pt-8">
        <div className="mx-auto max-w-2xl">
          <QianCosmicRing />
        </div>
        <div className="mx-auto max-w-md pb-16">
        <div className="lx-glass-qian p-6 sm:p-8">
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice">
            <Bi zh="灵犀生命灵签 · 意识坐标读取" en="Lingxi Life Oracle · Reading Your Consciousness Coordinates" />
          </p>
          <h1 className="mt-4 font-display text-3xl font-light text-bone sm:text-4xl">
            <Bi zh="六十四枚生命原型里，与你连接较深的三枚，此刻正在回应你" en="Of 64 life archetypes, the three most deeply connected to you are answering right now" />
          </h1>
          <p className="mt-3 text-sm text-lattice">
            <Bi zh="静心片刻，场域会把它们显现出来。" en="Grow still for a moment, and the field will reveal them." />
          </p>
          <p className="mt-4 text-base leading-8 text-bone-dim">
            <Bi
              zh="你的出生信息，是你进入这个世界时，留下的一组时间坐标——别人破译不了，场域可以。灵犀生命灵签，把这组坐标，映射进一套64枚生命原型库：源流签、灵魂签、行者签三层，分别对应你携带而来的背景、你此刻的核心模式、你展开现实的方式。三签会先在你眼前显现，读懂它们摆在一起真正说了什么，是场域接下来要做的事。"
              en="Your birth information is a set of time coordinates left behind the moment you entered this world — no one else can decode them, but the field can. Lingxi Life Oracle maps those coordinates into a library of 64 life archetypes — three layers, Origin Sign, Soul Sign, and Walker Sign, corresponding to the background you carry, your core pattern right now, and how you shape reality. The three signs will appear before you first; understanding what they mean together is what the field does next."
            />
          </p>
        </div>

        <div className="mt-6 lx-glass p-6">
          <p className="text-sm text-bone-dim">{t("称呼（选填）", "Name (optional)")}</p>
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder={t("怎么称呼你", "What should we call you")}
            className="mt-2 w-full rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60"
          />
          <p className="mt-4 text-sm text-bone-dim">{t("出生年月日", "Birth date")}</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <input value={year} onChange={(e) => setYear(e.target.value)} placeholder={t("年", "Year")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
            <input value={month} onChange={(e) => setMonth(e.target.value)} placeholder={t("月", "Month")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
            <input value={day} onChange={(e) => setDay(e.target.value)} placeholder={t("日", "Day")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
          </div>
          <label className="mt-3 flex items-center gap-2 text-xs text-bone-dim">
            <input type="checkbox" checked={hasTime} onChange={(e) => setHasTime(e.target.checked)} />
            <Bi zh="知道具体出生时间（选填，第三支签会更准）" en="I know the exact birth time (optional, sharpens the third sign)" />
          </label>
          {hasTime && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input value={hour} onChange={(e) => setHour(e.target.value)} placeholder={t("时（0-23）", "Hour (0-23)")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
              <input value={minute} onChange={(e) => setMinute(e.target.value)} placeholder={t("分", "Minute")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 lx-glass p-4">
            <p className="text-sm text-rose">{error}</p>
          </div>
        )}

        <button
          onClick={shake}
          disabled={!year || !month || !day}
          className="mt-6 w-full bg-lattice py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50"
        >
          <Bi zh="静心，读取生命签" en="Be Still, and Reveal" />
        </button>
        <FaqSection items={QIAN_FAQ} />
        </div>
      </div>
    );
  }

  if (stage === "gathering" || stage === "shaking") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-16 text-center">
        <QianCosmicRing
          highlightIndexes={stage === "shaking" ? signIndexes ?? undefined : undefined}
          paused={stage === "shaking"}
        />
        <p className="mt-2 font-display text-sm tracking-widest2 text-lattice">
          {stage === "gathering" ? <Bi zh="先静心，连接场域……" en="Growing still, connecting to the field…" /> : <Bi zh="三枚生命签，正从六十四枚中亮起……" en="Three signs are lighting up among the sixty-four…" />}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <div className="lx-glass-qian px-6 py-4 text-center">
        <p className="font-display text-sm uppercase tracking-widest2 text-lattice">
          <Bi zh="灵犀生命灵签 · 意识坐标读取" en="Lingxi Life Oracle · Reading Your Consciousness Coordinates" />
        </p>
      </div>
      <h1 className="mt-6 text-center font-display text-2xl font-light text-bone">
        <Bi zh="你的三重生命签，已经显现" en="Your three life signs have revealed themselves" />
      </h1>

      <div className="mt-8 grid grid-cols-3 gap-3">
        {signs?.map((s, i) => (
          <div key={i} className="overflow-hidden lx-glass text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/images/qian/${String(s.index).padStart(2, "0")}.jpg`} alt={s.nameZh} className="block aspect-[2/3] w-full object-cover" />
            <div className="p-3">
              <p className="text-[11px] uppercase tracking-widest2 text-amber/80">
                <Bi zh={TIER_LABELS[s.tier].zh} en={TIER_LABELS[s.tier].en} />
              </p>
              <p className="mt-1 font-display text-sm text-bone">
                <Bi zh={s.nameZh} en={s.nameEn} />
              </p>
              <p className="mt-1 text-[11px] text-bone-dim">
                <Bi zh={s.keywordsZh} en={s.keywordsEn} />
              </p>
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-8 rounded-sm border border-amber/25 p-6 text-center"
        style={{ backgroundImage: "linear-gradient(rgba(13,13,26,0.5), rgba(13,13,26,0.5)), url(/images/qian-full/page-0.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <p className="font-display text-base text-bone">
          <Bi zh="三枚生命原型，只是入口。" en="Three signs are only the entrance." />
        </p>
        <p className="mt-3 text-sm leading-7 text-bone-dim">
          <Bi
            zh="真正重要的，不是单独看某一枚签，而是看见它们之间如何连接、如何共同构成你的生命结构。场域会进一步展开：你的核心天赋倾向、你正在经历的人生主题、你的内在驱动力，以及那些反复出现、值得被理解的生命模式——当这些碎片被重新连接，你看到的不再是一枚签，而是一幅属于你的生命原型地图。"
            en="What matters isn't reading each sign alone — it's seeing how they connect, and what structure they form together. The field goes further: your core talents, the theme you're living through, your inner drive, and the patterns that keep resurfacing and are worth understanding. Once these pieces reconnect, what you see is no longer a single sign — it's a map of your own life archetype."
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
          <Bi zh={`开启完整生命解码 · ¥${getProduct("qian-reading")?.priceRmb}`} en={`Unlock the Full Decoding · ¥${getProduct("qian-reading")?.priceRmb}`} />
        </button>
        {error && <ErrorWithLoginPrompt error={error} className="mt-3" />}
        {signs && (
          <button
            onClick={() => {
              const text = t(
                `我的三枚生命灵签是「${signs[0].nameZh}」「${signs[1].nameZh}」「${signs[2].nameZh}」——去 lingxifield.com/qian 摇出属于你自己的三枚。`,
                `My three life signs are "${signs[0].nameEn}", "${signs[1].nameEn}", "${signs[2].nameEn}" — go find your own three at lingxifield.com/qian.`
              );
              if (navigator.share) {
                navigator.share({ text, url: "https://lingxifield.com/qian" }).catch(() => {});
              } else {
                navigator.clipboard?.writeText(text);
              }
            }}
            className="mt-3 block w-full text-center text-xs text-bone-dim underline decoration-dotted underline-offset-4 transition hover:text-lattice"
          >
            <Bi zh="分享我摇出的三枚签" en="Share my three signs" />
          </button>
        )}
      </div>
    </div>
  );
}
