"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Bi from "./Bi";
import { VOICES } from "@/lib/voices";

// 无限符号（∞）路径 —— viewBox 1000×400，中心交叉于 (500,200)
const INFINITY_PATH =
  "M500,200 C420,90 190,90 190,200 C190,310 420,310 500,200 C580,90 810,90 810,200 C810,310 580,310 500,200 Z";

const NODE_COUNT = 88;   // 可点的心声节点
const AMBIENT_COUNT = 180; // 密布的装饰小光点
const ROTATE_MS = 5200;

type Pt = { x: number; y: number; r: number; c: string };
const COLORS = ["#E8B765", "#7CE0D3", "#C9A5D8", "#F2E2C4"];

// 从 333 条心声里均匀取 NODE_COUNT 条，主题更丰富
const NODE_VOICES = Array.from({ length: NODE_COUNT }, (_, k) =>
  VOICES[Math.floor((k * VOICES.length) / NODE_COUNT) % VOICES.length]
);

export default function ManifestInfinity() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [nodes, setNodes] = useState<Pt[]>([]);
  const [ambient, setAmbient] = useState<Pt[]>([]);
  const pathRef = useRef<SVGPathElement | null>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    // 节点：均匀分布，大小不一
    const nd: Pt[] = [];
    for (let k = 0; k < NODE_COUNT; k++) {
      const p = path.getPointAtLength((len * k) / NODE_COUNT);
      const seed = (k * 2654435761) % 1000 / 1000;
      nd.push({ x: p.x, y: p.y, r: 2.2 + seed * 4, c: COLORS[k % COLORS.length] });
    }
    setNodes(nd);
    // 装饰小光点：随机落点，密密麻麻
    const am: Pt[] = [];
    for (let k = 0; k < AMBIENT_COUNT; k++) {
      const p = path.getPointAtLength((len * Math.random()));
      const jx = (Math.random() - 0.5) * 6;
      const jy = (Math.random() - 0.5) * 6;
      am.push({ x: p.x + jx, y: p.y + jy, r: 0.5 + Math.random() * 1.4, c: COLORS[Math.floor(Math.random() * COLORS.length)] });
    }
    setAmbient(am);
  }, []);

  const go = useCallback(
    (n: number) => setI(((n % NODE_COUNT) + NODE_COUNT) % NODE_COUNT),
    []
  );

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((p) => (p + 1) % NODE_COUNT), ROTATE_MS);
    return () => clearInterval(t);
  }, [paused, i]);

  const v = NODE_VOICES[i];

  return (
    <section className="relative overflow-hidden border-t border-white/5 bg-void px-6 py-28 sm:py-36">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[52vh] w-[86vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber/[0.05] blur-[140px]" />

      <div className="mx-auto max-w-5xl text-center">
        <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
          <Bi zh="场 域 回 响" en="Reflections from the Field" />
        </p>
        <h2 className="mt-6 font-display text-4xl font-light text-bone sm:text-5xl">
          <Bi zh="整个场，是活的" en="The whole Field is alive" />
        </h2>
        <p className="mt-5 text-sm leading-relaxed text-bone-dim">
          <Bi
            zh="在无限之环上，每一点都是一次共振。轻触任一光点，聆听此刻浮现的心声。"
            en="On the infinite loop, each point is a resonance. Touch any light to hear the voice that surfaces."
          />
        </p>
      </div>

      <div
        className="relative mx-auto mt-14 max-w-5xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative w-full" style={{ aspectRatio: "1000 / 400" }}>
          <svg viewBox="0 0 1000 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <linearGradient id="lx-inf-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#7CE0D3" />
                <stop offset="50%" stopColor="#E8B765" />
                <stop offset="100%" stopColor="#C9A5D8" />
              </linearGradient>
              <filter id="lx-inf-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <path ref={pathRef} d={INFINITY_PATH} fill="none" stroke="none" />
            <path d={INFINITY_PATH} fill="none" stroke="#7CE0D3" strokeOpacity="0.08" strokeWidth="1" />
            <path
              className="lx-inf-flow"
              d={INFINITY_PATH}
              fill="none"
              stroke="url(#lx-inf-grad)"
              strokeWidth="1.6"
              strokeLinecap="round"
              filter="url(#lx-inf-glow)"
            />

            {/* 密布装饰小光点 */}
            {ambient.map((p, idx) => (
              <circle
                key={`a${idx}`}
                cx={p.x}
                cy={p.y}
                r={p.r}
                fill={p.c}
                fillOpacity={0.35}
                className="lx-amb"
                style={{ animationDelay: `${(idx % 20) * 0.2}s` }}
              />
            ))}

            {/* 可点的心声节点 */}
            {nodes.map((p, idx) => {
              const active = idx === i;
              return (
                <circle
                  key={`n${idx}`}
                  cx={p.x}
                  cy={p.y}
                  r={active ? p.r + 3 : p.r}
                  fill={active ? "#E8B765" : p.c}
                  fillOpacity={active ? 1 : 0.7}
                  filter={active ? "url(#lx-inf-glow)" : undefined}
                  style={{ cursor: "pointer" }}
                  onClick={() => go(idx)}
                >
                  {active && (
                    <animate attributeName="r" values={`${p.r + 2};${p.r + 5};${p.r + 2}`} dur="2.4s" repeatCount="indefinite" />
                  )}
                </circle>
              );
            })}
          </svg>
        </div>

        {/* 心声浮现在环下方，不遮挡曲线 */}
        <div className="mx-auto mt-6 min-h-[9rem] max-w-2xl px-2 text-center">
          <div key={i} className="lx-voice-in">
            <span className="font-display text-xs uppercase tracking-widest2 text-amber/80">
              {v.theme}
            </span>
            <p className="mt-4 font-display text-2xl leading-relaxed text-bone sm:text-3xl">
              <Bi zh={v.zh} en={v.en} />
            </p>
          </div>
          <div className="mt-8 flex items-center justify-center gap-10">
            <button onClick={() => go(i - 1)} aria-label="上一个" className="font-display text-2xl text-bone-dim/85 transition hover:text-amber">‹</button>
            <span className="h-px w-16 bg-white/10" />
            <button onClick={() => go(i + 1)} aria-label="下一个" className="font-display text-2xl text-bone-dim/85 transition hover:text-amber">›</button>
          </div>
        </div>
      </div>

      <style>{`
        .lx-inf-flow { stroke-dasharray: 300 1500; animation: lx-inf-dash 11s linear infinite; }
        @keyframes lx-inf-dash { to { stroke-dashoffset: -1800; } }
        .lx-amb { animation: lx-amb-tw 3.6s ease-in-out infinite; }
        @keyframes lx-amb-tw { 0%,100% { opacity: .5; } 50% { opacity: .12; } }
        .lx-voice-in { animation: lx-voice-in .9s ease; }
        @keyframes lx-voice-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) {
          .lx-inf-flow, .lx-amb, .lx-voice-in { animation: none; }
          .lx-inf-flow { stroke-dasharray: none; }
        }
      `}</style>
    </section>
  );
}
