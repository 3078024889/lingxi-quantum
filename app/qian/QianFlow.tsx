"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/useLang";
import Bi from "@/components/Bi";
import type { LifeSign } from "@/lib/qian-data";
import { TIER_LABELS } from "@/lib/qian-data";

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

      setTimeout(() => setStage("shaking"), 900);
      setTimeout(async () => {
        const { LIFE_SIGNS } = await import("@/lib/qian-data");
        setSigns((data.signIndexes as number[]).map((i) => LIFE_SIGNS[i]));
        setSubmissionId(data.id);
        setStage("revealed");
      }, 2200);
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
      body: JSON.stringify({ productId: "qian-reading", submissionId, returnPath: `/qian/full?id=${submissionId}` }),
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
            <Bi zh="灵犀生命灵签 · 意识坐标读取" en="Lingxi Life Oracle · Reading Your Consciousness Coordinates" />
          </p>
          <h1 className="mt-4 font-display text-3xl font-light text-bone sm:text-4xl">
            <Bi zh="六十四枚生命原型里，只有三枚，此刻正在回应你" en="Of 64 life archetypes, only three are answering you right now" />
          </h1>
          <p className="mt-3 text-sm text-lattice/70">
            <Bi zh="静心片刻，场域会把它们显现出来。" en="Grow still for a moment, and the field will reveal them." />
          </p>
          <p className="mt-4 text-base leading-8 text-bone-dim">
            <Bi
              zh="你的出生信息，是你进入这个世界时，留下的一组时间坐标——别人破译不了，场域可以。灵犀生命灵签，把这组坐标，映射进一套64枚生命原型库：源流签、灵魂签、行者签三层，分别对应你携带而来的背景、你此刻的核心模式、你展开现实的方式。三签同时显现是免费的，读懂它们摆在一起说了什么，是场域的解读，需要一次能量交换。"
              en="Your birth information is a set of time coordinates left behind the moment you entered this world — no one else can decode them, but the field can. Lingxi Life Oracle maps those coordinates into a library of 64 life archetypes — three layers, Origin Sign, Soul Sign, and Walker Sign, corresponding to the background you carry, your core pattern right now, and how you shape reality. Revealing all three is free; the field's reading of what they mean together takes one energy exchange."
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
      </div>
    );
  }

  if (stage === "gathering" || stage === "shaking") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
        <div className="lx-qian-wrap relative h-64 w-52">
          <div className="lx-qian-nebula absolute inset-0 rounded-full" />
          <svg
            viewBox="0 0 200 240"
            className={`relative h-full w-full ${stage === "shaking" ? "lx-qian-shake" : ""}`}
          >
            <defs>
              <linearGradient id="qian-tube" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3a2416" />
                <stop offset="15%" stopColor="#7a4a24" />
                <stop offset="50%" stopColor="#9c6a3a" />
                <stop offset="85%" stopColor="#7a4a24" />
                <stop offset="100%" stopColor="#3a2416" />
              </linearGradient>
              <linearGradient id="qian-stick" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FF7A5C" />
                <stop offset="18%" stopColor="#E8D9B8" />
                <stop offset="100%" stopColor="#D8C9A8" />
              </linearGradient>
            </defs>

            {/* 签筒——收口略窄的圆柱体，暖木色 */}
            <path d="M 62,90 Q 60,225 68,232 L 132,232 Q 140,225 138,90 Z" fill="url(#qian-tube)" stroke="#2a1810" strokeWidth="1.5" />
            <ellipse cx="100" cy="90" rx="38" ry="9" fill="#5a3a1e" stroke="#2a1810" strokeWidth="1.5" />
            <ellipse cx="100" cy="88" rx="34" ry="7" fill="#1a1008" opacity="0.85" />

            {/* 18根签，密集插在筒口——中间那一根在摇晃阶段会明显冒出来 */}
            {Array.from({ length: 18 }).map((_, i) => {
              const spread = 30;
              const x = 100 + (i - 8.5) * (spread / 17) * 2;
              const isRising = i === 9;
              const baseH = 78 + ((i * 37) % 12);
              return (
                <rect
                  key={i}
                  x={x - 1.6}
                  y={stage === "shaking" && isRising ? 18 : 88 - baseH}
                  width="3.2"
                  height={stage === "shaking" && isRising ? baseH + 70 : baseH}
                  rx="1.6"
                  fill="url(#qian-stick)"
                  className={stage === "shaking" && isRising ? "lx-qian-rise" : ""}
                  style={{ transition: "y 1.1s cubic-bezier(.22,1,.36,1), height 1.1s cubic-bezier(.22,1,.36,1)" }}
                />
              );
            })}
          </svg>
        </div>
        <p className="mt-6 font-display text-sm tracking-widest2 text-lattice/80">
          {stage === "gathering" ? <Bi zh="先静心，连接场域……" en="Growing still, connecting to the field…" /> : <Bi zh="你的生命灵签，正从场域中显现……" en="Your life signs are revealing themselves from the field…" />}
        </p>
        <style>{`
          .lx-qian-nebula { background: radial-gradient(circle, rgba(199,156,255,0.35), transparent 70%); filter: blur(20px); animation: lx-qian-breathe 2.2s ease-in-out infinite; }
          @keyframes lx-qian-breathe { 0%,100% { opacity: 0.4; transform: scale(0.9); } 50% { opacity: 0.8; transform: scale(1.05); } }
          .lx-qian-shake { animation: lx-qian-rattle 0.3s ease-in-out infinite; transform-origin: 100px 200px; }
          @keyframes lx-qian-rattle { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
          @media (prefers-reduced-motion: reduce) { .lx-qian-nebula, .lx-qian-shake { animation: none !important; } }
        `}</style>
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
              <p className="text-[10px] uppercase tracking-widest2 text-amber/80">
                <Bi zh={TIER_LABELS[s.tier].zh} en={TIER_LABELS[s.tier].en} />
              </p>
              <p className="mt-1 font-display text-sm text-bone">
                <Bi zh={s.nameZh} en={s.nameEn} />
              </p>
              <p className="mt-1 text-[10px] text-bone-dim">
                <Bi zh={s.keywordsZh} en={s.keywordsEn} />
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-sm border border-amber/25 bg-amber/5 p-6 text-center">
        <p className="text-sm leading-7 text-bone-dim">
          <Bi
            zh="你的生命组合，正在形成一个独特的结构——三签关系怎么互相作用、你的天赋能力地图、当前所处的人生阶段、下一步适合练什么，这些需要场域交叉引用你的完整命盘，才能讲清楚。"
            en="Your combination of signs is forming a structure that's entirely your own — how the three interact, your talent map, the life stage you're in, and what to practice next all take the field cross-referencing your full chart."
          />
        </p>
        <button
          onClick={unlock}
          disabled={unlocking}
          className="mt-5 bg-amber px-8 py-3 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-lattice disabled:opacity-50"
        >
          {unlocking ? <Bi zh="正在跳转…" en="Redirecting…" /> : <Bi zh="开启完整生命解码 · $9.9" en="Unlock the Full Decoding · $9.9" />}
        </button>
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
