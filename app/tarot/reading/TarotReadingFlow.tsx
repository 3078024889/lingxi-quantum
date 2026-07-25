"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/useLang";
import Bi from "@/components/Bi";
import type { TarotCard } from "@/lib/tarot-data";
import { REVIEW_MODE } from "@/lib/reviewMode";
import WechatPayModal from "@/components/WechatPayModal";
import { getProduct } from "@/lib/plans";

type Stage = "form" | "connecting" | "revealed";

const CONNECTING_LINES = [
  { zh: "正在连接灵犀场……", en: "Connecting with Lingxi Field…" },
  { zh: "感知你的当下意识状态……", en: "Sensing your present state of consciousness…" },
  { zh: "读取：内在情绪波动 · 当前生命主题 · 潜意识模式 · 未来展开方向", en: "Reading: inner emotional currents · current life theme · subconscious patterns · future direction" },
  { zh: "正在生成你的三张生命镜像牌……", en: "Generating your three life mirror cards…" },
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
  const [showWechatPay, setShowWechatPay] = useState(false);

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
    } catch {
      setError(t("连接场域时出错，请稍后再试。", "Error connecting to the field — please try again."));
      setStage("form");
    }
  };

  const unlock = () => {
    if (!submissionId) return;
    if (REVIEW_MODE) {
      window.location.href = `/tarot/reading/full?id=${submissionId}`;
      return;
    }
    // PayPal企业账户被注销、暂时无法使用，改成微信扫码支付。
    setShowWechatPay(true);
  };

  if (stage === "form") {
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <div className="rounded-sm border border-white/10 bg-void-deep p-6 sm:p-8">
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
            <Bi zh="灵犀量子塔罗" en="Lingxi Quantum Tarot" />
          </p>
          <h1 className="mt-4 font-display text-3xl font-light text-bone sm:text-4xl">
            <Bi zh="三张生命镜像牌，正在等待与你相遇" en="Three life mirror cards are waiting to meet you" />
          </h1>
          <p className="mt-4 text-base leading-8 text-bone-dim">
            <Bi
              zh={<>你抽取的，不是随机答案，而是一面来自内在的镜子。进入灵犀场，三张生命镜像牌将根据你的命盘数据展开：<br />🌙 看见过去留下的意识痕迹<br />☀️ 理解此刻正在发生的生命共振<br />⭐ 探索未来正在形成的可能方向<br />三张牌不是告诉你命运是什么，而是帮助你看见：你正在经历什么，为什么会经历，以及下一步可以如何选择。</>}
              en={<>What you draw is not a random answer — it's a mirror from within. Entering Lingxi Field, three life mirror cards unfold from your chart data:<br />🌙 See the traces your past has left in consciousness<br />☀️ Understand the resonance happening right now<br />⭐ Explore the possibilities your future is forming<br />These cards don't tell you what fate is. They help you see what you're going through, why, and what you can choose next.</>}
            />
          </p>
        </div>

        <div className="mt-6 rounded-sm border border-white/10 bg-void-deep p-6">
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
          <div className="mt-4 rounded-sm border border-rose/30 bg-void-deep p-4">
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
          href="/tarot/daily"
          className="mt-6 block text-center text-xs text-bone-dim underline decoration-dotted underline-offset-4 transition hover:text-lattice"
        >
          <Bi zh="不想连接完整场域？看看今天全场域共享的那一张牌 →" en="Not ready for the full connection? See today's card, shared by everyone →" />
        </a>
      </div>
    );
  }

  if (stage === "connecting") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
        <div className="lx-tr-glow h-20 w-20 rounded-full" />
        <div className="mt-8 space-y-3 rounded-sm border border-white/10 bg-void-deep px-6 py-6 backdrop-blur-sm">
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
      <div className="rounded-sm border border-white/10 bg-void-deep px-6 py-4 text-center">
        <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
          <Bi zh="灵犀量子塔罗 · 三张牌阵深度解读" en="Lingxi Quantum Tarot · Three-Card Deep Reading" />
        </p>
      </div>
      <h1 className="mt-6 text-center font-display text-2xl font-light text-bone">
        <Bi zh="你的三张牌，已经展开" en="Your three cards have unfolded" />
      </h1>

      <div className="mt-8 grid grid-cols-3 gap-3">
        {cards?.map((c, i) => (
          <div key={i} className="overflow-hidden rounded-sm border border-lattice/25 bg-void-deep text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/images/tarot/${String(c.index).padStart(2, "0")}.jpg`} alt={c.nameZh} className="block aspect-[2/3] w-full object-cover" />
            <div className="p-2">
              <p className="text-[10px] uppercase tracking-widest2 text-amber/80">
                <Bi zh={positions[i].zh} en={positions[i].en} />
              </p>
              <p className="mt-1 text-xs text-bone">
                <Bi zh={c.nameZh} en={c.nameEn} />
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-sm border border-amber/25 bg-amber/5 p-6 text-center">
        <p className="text-sm leading-7 text-bone-dim">
          <Bi
            zh="三张牌展示的是生命结构的三个切面，但真正隐藏的信息，存在于它们之间的关系。场域将结合你的完整生命图谱，解析：为什么这三张牌会同时出现，它们与你的人生阶段如何对应，以及正在等待你觉察的生命主题。"
            en="The three cards show three facets of your life structure — but what they truly reveal lives in the relationship between them. The field, cross-referencing your full chart, unfolds: why these three cards appeared together, how they map to the stage you're in, and the theme waiting to be noticed."
          />
        </p>
        <button
          onClick={unlock}
          disabled={unlocking}
          className="mt-5 bg-amber px-8 py-3 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-lattice disabled:opacity-50"
        >
          <Bi zh={`开启完整生命镜像 · ¥${getProduct("tarot-reading")?.priceRmb}`} en={`Unlock the Full Life Mirror · ¥${getProduct("tarot-reading")?.priceRmb}`} />
        </button>
        {error && <p className="mt-3 text-xs text-rose">{error}</p>}
        {showWechatPay && submissionId && (
          <WechatPayModal
            productId="tarot-reading"
            submissionId={submissionId}
            priceRmb={getProduct("tarot-reading")?.priceRmb ?? 0}
            productName={{ zh: "灵犀量子塔罗 · 生命镜像档案", en: "Lingxi Quantum Tarot · Life Mirror" }}
            onClose={() => setShowWechatPay(false)}
            onSuccess={() => { window.location.href = `/tarot/reading/full?id=${submissionId}`; }}
          />
        )}
      </div>
    </div>
  );
}
