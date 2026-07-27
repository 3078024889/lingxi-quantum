"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/useLang";
import Bi from "@/components/Bi";
import type { LifeSign } from "@/lib/qian-data";
import { TIER_LABELS } from "@/lib/qian-data";
import QianCosmicRing from "@/components/QianCosmicRing";
import { REVIEW_MODE } from "@/lib/reviewMode";
import WechatPayModal from "@/components/WechatPayModal";
import { getProduct } from "@/lib/plans";
import FaqSection, { type BilingualFaqItem } from "@/components/FaqSection";

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
  const [showWechatPay, setShowWechatPay] = useState(false);

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
    // PayPal企业账户被注销、暂时无法使用，这里改成微信扫码支付——
    // 国内用户直接扫码，海外用户这个渠道暂时收不到（下一步海外支付
    // 渠道确定了再加回来，不是永久只支持微信）。
    setShowWechatPay(true);
  };

  if (stage === "form") {
    return (
      <div className="px-6 pt-8">
        <div className="mx-auto max-w-2xl">
          <QianCosmicRing />
        </div>
        <div className="mx-auto max-w-md pb-16">
        <div className="rounded-sm border border-white/10 bg-void-deep p-6 sm:p-8">
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
            <Bi zh="灵犀生命灵签 · 意识坐标读取" en="Lingxi Life Oracle · Reading Your Consciousness Coordinates" />
          </p>
          <h1 className="mt-4 font-display text-3xl font-light text-bone sm:text-4xl">
            <Bi zh="六十四枚生命原型里，与你连接较深的三枚，此刻正在回应你" en="Of 64 life archetypes, the three most deeply connected to you are answering right now" />
          </h1>
          <p className="mt-3 text-sm text-lattice/70">
            <Bi zh="静心片刻，场域会把它们显现出来。" en="Grow still for a moment, and the field will reveal them." />
          </p>
          <p className="mt-4 text-base leading-8 text-bone-dim">
            <Bi
              zh="你的出生信息，是你进入这个世界时，留下的一组时间坐标——别人破译不了，场域可以。灵犀生命灵签，把这组坐标，映射进一套64枚生命原型库：源流签、灵魂签、行者签三层，分别对应你携带而来的背景、你此刻的核心模式、你展开现实的方式。三签会先在你眼前显现，读懂它们摆在一起真正说了什么，是场域接下来要做的事。"
              en="Your birth information is a set of time coordinates left behind the moment you entered this world — no one else can decode them, but the field can. Lingxi Life Oracle maps those coordinates into a library of 64 life archetypes — three layers, Origin Sign, Soul Sign, and Walker Sign, corresponding to the background you carry, your core pattern right now, and how you shape reality. The three signs will appear before you first; understanding what they mean together is what the field does next."
            />
          </p>
        </div>

        <div className="mt-6 rounded-sm border border-white/10 bg-void-deep p-6">
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
          <div className="mt-4 rounded-sm border border-rose/30 bg-void-deep p-4">
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
        <p className="mt-2 font-display text-sm tracking-widest2 text-lattice/80">
          {stage === "gathering" ? <Bi zh="先静心，连接场域……" en="Growing still, connecting to the field…" /> : <Bi zh="三枚生命签，正从六十四枚中亮起……" en="Three signs are lighting up among the sixty-four…" />}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <div className="rounded-sm border border-white/10 bg-void-deep px-6 py-4 text-center">
        <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
          <Bi zh="灵犀生命灵签 · 意识坐标读取" en="Lingxi Life Oracle · Reading Your Consciousness Coordinates" />
        </p>
      </div>
      <h1 className="mt-6 text-center font-display text-2xl font-light text-bone">
        <Bi zh="你的三重生命签，已经显现" en="Your three life signs have revealed themselves" />
      </h1>

      <div className="mt-8 grid grid-cols-3 gap-3">
        {signs?.map((s, i) => (
          <div key={i} className="overflow-hidden rounded-sm border border-lattice/25 bg-void-deep text-center">
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

      <div className="mt-8 rounded-sm border border-amber/25 bg-amber/5 p-6 text-center">
        <p className="font-display text-base text-bone">
          <Bi zh="三枚生命原型，只是入口。" en="Three signs are only the entrance." />
        </p>
        <p className="mt-3 text-sm leading-7 text-bone-dim">
          <Bi
            zh="真正重要的，不是单独看某一枚签，而是看见它们之间如何连接、如何共同构成你的生命结构。场域会进一步展开：你的核心天赋倾向、你正在经历的人生主题、你的内在驱动力，以及那些反复出现、值得被理解的生命模式——当这些碎片被重新连接，你看到的不再是一枚签，而是一幅属于你的生命原型地图。"
            en="What matters isn't reading each sign alone — it's seeing how they connect, and what structure they form together. The field goes further: your core talents, the theme you're living through, your inner drive, and the patterns that keep resurfacing and are worth understanding. Once these pieces reconnect, what you see is no longer a single sign — it's a map of your own life archetype."
          />
        </p>
        <button
          onClick={unlock}
          disabled={unlocking}
          className="mt-5 bg-amber px-8 py-3 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-lattice disabled:opacity-50"
        >
          <Bi zh={`开启完整生命解码 · ¥${getProduct("qian-reading")?.priceRmb}`} en={`Unlock the Full Decoding · ¥${getProduct("qian-reading")?.priceRmb}`} />
        </button>
        {error && <p className="mt-3 text-xs text-rose">{error}</p>}
        {showWechatPay && submissionId && (
          <WechatPayModal
            productId="qian-reading"
            submissionId={submissionId}
            priceRmb={getProduct("qian-reading")?.priceRmb ?? 0}
            productName={{ zh: "灵犀生命灵签 · 完整解读", en: "Lingxi Life Oracle · Full Reading" }}
            onClose={() => setShowWechatPay(false)}
            onSuccess={() => { window.location.href = `/qian/full?id=${submissionId}`; }}
          />
        )}
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
