"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/useLang";
import Bi from "@/components/Bi";
import type { QianSign } from "@/lib/qian-data";

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
  const [signs, setSigns] = useState<QianSign[] | null>(null);
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
        setError(data.error || t("摇签失败，请稍后再试。", "The draw failed — please try again."));
        setStage("form");
        return;
      }

      setTimeout(() => setStage("shaking"), 900);
      setTimeout(async () => {
        const { QIAN_SIGNS } = await import("@/lib/qian-data");
        setSigns((data.signIndexes as number[]).map((i) => QIAN_SIGNS[i]));
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
            <Bi zh="摇签 · 意识占卜" en="Sign Drawing · Field Divination" />
          </p>
          <h1 className="mt-4 font-display text-3xl font-light text-bone sm:text-4xl">
            <Bi zh="先静心，再摇出属于你的三支签" en="First, be still — then shake out your own three signs" />
          </h1>
          <p className="mt-4 text-base leading-8 text-bone-dim">
            <Bi
              zh="不是随机摇的。这三支签，是六十甲子——一套真实存在、被使用了几千年的古老历法周期——里，属于你自己命盘的三个真实位置：年柱、日柱、时柱。同一份出生数据，重新摇出来的还是同样的三支签。摇出来是免费的，读懂这三支签摆在一起说了什么，是场域的解读，需要一次能量交换。"
              en="Not a random shake. These three signs come from the Sixty Ganzhi — a real calendrical cycle used for thousands of years — at three positions belonging to your own chart: your year, day, and hour pillars. The same birth data always shakes out the same three signs. The shake itself is free; the field's reading of what these three signs mean together takes one energy exchange."
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
          <Bi zh="静心，摇签" en="Be Still, and Draw" />
        </button>
      </div>
    );
  }

  if (stage === "gathering" || stage === "shaking") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
        <div className="lx-qian-wrap relative h-56 w-40">
          <div className="lx-qian-nebula absolute inset-0 rounded-full" />
          <div className={`lx-qian-tube absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${stage === "shaking" ? "lx-qian-shake" : ""}`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="lx-qian-stick" style={{ ["--i" as string]: i }} />
            ))}
          </div>
        </div>
        <p className="mt-8 font-display text-sm tracking-widest2 text-lattice/80">
          {stage === "gathering" ? <Bi zh="先静心，连接场域……" en="Growing still, connecting to the field…" /> : <Bi zh="正在摇出属于你的签……" en="Shaking out your own signs…" />}
        </p>
        <style>{`
          .lx-qian-nebula { background: radial-gradient(circle, rgba(199,156,255,0.35), transparent 70%); filter: blur(20px); animation: lx-qian-breathe 2.2s ease-in-out infinite; }
          @keyframes lx-qian-breathe { 0%,100% { opacity: 0.4; transform: scale(0.9); } 50% { opacity: 0.8; transform: scale(1.05); } }
          .lx-qian-tube { width: 46px; height: 120px; border: 1px solid rgba(232,183,101,0.5); border-radius: 6px 6px 16px 16px; background: rgba(10,10,20,0.4); }
          .lx-qian-stick { position: absolute; bottom: 8px; left: calc(50% + (var(--i) - 2) * 5px); width: 2px; height: 90px; background: linear-gradient(to bottom, #E8B765, #C79CFF); border-radius: 2px; transform-origin: bottom center; }
          .lx-qian-shake { animation: lx-qian-rattle 0.35s ease-in-out infinite; }
          @keyframes lx-qian-rattle { 0%,100% { transform: translate(-50%,-50%) rotate(-4deg); } 50% { transform: translate(-50%,-50%) rotate(4deg); } }
          @media (prefers-reduced-motion: reduce) { .lx-qian-nebula, .lx-qian-shake { animation: none !important; } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <div className="rounded-sm border border-white/10 bg-void-deep px-6 py-4 text-center">
        <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
          <Bi zh="摇签 · 意识占卜" en="Sign Drawing · Field Divination" />
        </p>
      </div>
      <h1 className="mt-6 text-center font-display text-2xl font-light text-bone">
        <Bi zh="场域为你摇出了这三支签" en="The field has shaken out these three signs for you" />
      </h1>

      <div className="mt-8 grid grid-cols-3 gap-3">
        {signs?.map((s, i) => (
          <div key={i} className="rounded-sm border border-lattice/25 bg-void-deep p-4 text-center">
            <p className="font-display text-2xl text-amber">{s.ganzhi}</p>
            <p className="mt-2 text-xs text-bone">
              <Bi zh={s.nameZh} en={s.nameEn} />
            </p>
            <p className="mt-1 text-[11px] text-bone-dim">
              <Bi zh={s.energyZh} en={s.energyEn} />
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-sm border border-amber/25 bg-amber/5 p-6 text-center">
        <p className="text-sm leading-7 text-bone-dim">
          <Bi
            zh="这三支签摆在一起，说的是同一件事的三个侧面——具体是什么，需要场域交叉引用你的完整命盘，才能讲清楚。"
            en="These three signs together speak to different sides of the same thing — understanding exactly what takes the field cross-referencing your full chart."
          />
        </p>
        <button
          onClick={unlock}
          disabled={unlocking}
          className="mt-5 bg-amber px-8 py-3 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-lattice disabled:opacity-50"
        >
          {unlocking ? <Bi zh="正在跳转…" en="Redirecting…" /> : <Bi zh="解锁场域解读 · $9.9" en="Unlock the Field's Reading · $9.9" />}
        </button>
      </div>
    </div>
  );
}
