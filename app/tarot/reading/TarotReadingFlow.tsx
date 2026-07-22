"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/useLang";
import Bi from "@/components/Bi";
import type { TarotCard } from "@/lib/tarot-data";

type Stage = "form" | "connecting" | "revealed";

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
    { zh: "隐藏模式", en: "Hidden Pattern" },
    { zh: "当下共振", en: "Present Resonance" },
    { zh: "未来方向", en: "Future Direction" },
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
      }, 1800);
    } catch {
      setError(t("连接场域时出错，请稍后再试。", "Error connecting to the field — please try again."));
      setStage("form");
    }
  };

  const unlock = async () => {
    if (!submissionId) return;
    setUnlocking(true);
    const res = await fetch("/api/pay/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: "tarot-reading", submissionId, returnPath: `/tarot/reading/full?id=${submissionId}` }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setUnlocking(false);
  };

  if (stage === "form") {
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <div className="rounded-sm border border-white/10 bg-void-deep p-6 sm:p-8">
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
            <Bi zh="灵犀量子塔罗 · 三张牌阵深度解读" en="Lingxi Quantum Tarot · Three-Card Deep Reading" />
          </p>
          <h1 className="mt-4 font-display text-3xl font-light text-bone sm:text-4xl">
            <Bi zh="今天的那张牌，全场域共享。这三张，只属于你。" en="Today's card is shared by everyone. These three belong only to you." />
          </h1>
          <p className="mt-4 text-base leading-8 text-bone-dim">
            <Bi
              zh="不是随机抽的。这三张牌，由你真实的命盘数据确定性算出——隐藏模式对应年柱月柱，当下共振对应日柱与太阳月亮，未来方向对应时柱与五行旺衰。同一份出生数据，重新打开还是同样三张牌，场域只负责把它们交叉引用你的命盘，写成一段解读。"
              en="Not a random draw. These three cards are determined by your real chart data — hidden pattern from year and month pillars, present resonance from your day pillar, Sun and Moon, future direction from your hour pillar and elemental balance. The same birth data always yields the same three cards; the field's only job is weaving them into a reading, cross-referenced against your actual chart."
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
            <Bi zh="知道具体出生时间（选填，未来方向那张牌会更准）" en="I know the exact birth time (optional, sharpens the Future card)" />
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
          <Bi zh="展开我的三张牌" en="Reveal My Three Cards" />
        </button>
      </div>
    );
  }

  if (stage === "connecting") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
        <div className="lx-tr-glow h-20 w-20 rounded-full" />
        <p className="mt-8 font-display text-sm tracking-widest2 text-lattice/80">
          <Bi zh="三张牌，正从七十八张中展开……" en="Three cards are unfolding from the seventy-eight…" />
        </p>
        <style>{`
          .lx-tr-glow { background: radial-gradient(circle, rgba(199,156,255,0.5), transparent 70%); filter: blur(16px); animation: lx-tr-breathe 2.2s ease-in-out infinite; }
          @keyframes lx-tr-breathe { 0%,100% { opacity: 0.5; transform: scale(0.9); } 50% { opacity: 0.9; transform: scale(1.1); } }
          @media (prefers-reduced-motion: reduce) { .lx-tr-glow { animation: none !important; } }
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
            zh="这三张牌摆在一起，讲的是同一件事的三个侧面。具体是什么，需要场域交叉引用你的完整命盘，才能讲清楚。"
            en="These three cards together tell three sides of the same story. Understanding exactly what takes the field cross-referencing your full chart."
          />
        </p>
        <button
          onClick={unlock}
          disabled={unlocking}
          className="mt-5 bg-amber px-8 py-3 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-lattice disabled:opacity-50"
        >
          {unlocking ? <Bi zh="正在跳转…" en="Redirecting…" /> : <Bi zh="解锁三张牌阵深度解读 · $9.9" en="Unlock the Three-Card Reading · $9.9" />}
        </button>
      </div>
    </div>
  );
}
