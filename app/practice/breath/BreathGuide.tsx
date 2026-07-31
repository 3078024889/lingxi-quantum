"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/useLang";

type Phase = { key: "inhale" | "hold" | "exhale"; labelZh: string; labelEn: string; tagZh: string; tagEn: string; seconds: number };

const buildCycle = (count: number): Phase[] => [
  { key: "inhale", labelZh: "吸气", labelEn: "Inhale", tagZh: "上扬", tagEn: "Rising", seconds: count },
  { key: "hold", labelZh: "停顿", labelEn: "Pause", tagZh: "上扬", tagEn: "Rising", seconds: count },
  { key: "exhale", labelZh: "呼气", labelEn: "Exhale", tagZh: "展开", tagEn: "Opening", seconds: count },
  { key: "hold", labelZh: "停顿", labelEn: "Pause", tagZh: "展开", tagEn: "Opening", seconds: count },
];

export default function BreathGuide() {
  const [count, setCount] = useState(4);
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [remain, setRemain] = useState(4);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const cycle = buildCycle(count);
  const phase = cycle[phaseIdx];
  const en = useLang();

  useEffect(() => {
    if (!running) return;
    setRemain(cycle[phaseIdx].seconds);
    timer.current = setInterval(() => {
      setRemain((r) => {
        if (r <= 1) {
          setPhaseIdx((p) => (p + 1) % cycle.length);
          return cycle[(phaseIdx + 1) % cycle.length].seconds;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phaseIdx, count]);

  const start = () => { setPhaseIdx(0); setRemain(count); setRunning(true); };
  const stop = () => { setRunning(false); if (timer.current) clearInterval(timer.current); };

  const scale =
    phase.key === "inhale" ? 1.15 : phase.key === "exhale" ? 0.82 : phaseIdx === 1 ? 1.15 : 0.82;

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-[300px] w-[300px] items-center justify-center sm:h-[380px] sm:w-[380px]">
        <div className="absolute h-[64%] w-[64%] rounded-full border border-lattice/40 bg-lattice/5"
          style={{ transform: `scale(${running ? scale : 0.9})`, transition: `transform ${count}s ease-in-out` }} />
        <div className="absolute h-[44%] w-[44%] rounded-full border border-amber/30"
          style={{ transform: `scale(${running ? scale : 0.9})`, transition: `transform ${count}s ease-in-out` }} />
        <div className="relative z-10 text-center">
          <p className="font-display text-4xl text-bone sm:text-5xl">
            {running ? (en ? phase.labelEn : phase.labelZh) : (en ? "Ready" : "准备")}
          </p>
          <p className="mt-2 font-display text-lg tracking-widest2 text-lattice">
            {running ? (en ? phase.tagEn : phase.tagZh) : (en ? "Rising · Opening" : "上扬 · 展开")}
          </p>
          {running && <p className="mt-4 font-display text-6xl text-amber/90">{remain}</p>}
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center gap-6">
        {!running ? (
          <>
            <div className="flex items-center gap-3">
              <span className="text-sm text-bone-dim">
                <span data-lang="zh">每步计数时长：</span><span data-lang="en">Count per part:</span>
              </span>
              {[3, 4, 5, 6].map((c) => (
                <button key={c} onClick={() => setCount(c)}
                  className={`h-10 w-10 rounded-full border font-display text-lg transition ${count === c ? "border-lattice bg-lattice/15 text-lattice" : "border-white/15 text-bone-dim hover:border-lattice/40"}`}>
                  {c}
                </button>
              ))}
            </div>
            <button onClick={start}
              className="bg-lattice px-12 py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber">
              <span data-lang="zh">开始量子息法</span><span data-lang="en">Begin the Quantum Breath Method</span>
            </button>
            <p className="max-w-sm text-center text-sm leading-7 text-bone-dim">
              <span data-lang="zh">建议先设定意图，再开始。以 3–4 组为一轮，然后回到自然呼吸（巩固期）。</span>
              <span data-lang="en">Set an intention first, then begin. Do 3–4 rounds as one set, then return to natural breathing (the consolidation period).</span>
            </p>
          </>
        ) : (
          <button onClick={stop}
            className="border border-white/20 px-12 py-4 font-display text-sm uppercase tracking-widest2 text-bone-dim transition hover:border-lattice/40 hover:text-lattice">
            <span data-lang="zh">结束 · 进入巩固期</span><span data-lang="en">End · enter consolidation</span>
          </button>
        )}
      </div>
    </div>
  );
}
