"use client";

import { useEffect, useRef, useState } from "react";
import { VOICES } from "@/lib/voices";

/* 心声之雨 · 深空活场层
 * 每颗光点像深空里的一个主权体节点：在下落的同时叠加自己的横向漂移与轻微振动，
 * 斜向缓缓穿过整片时空。部分节点绽放出一句「场域心声」。
 * 桌面：鼠标碰到光点即停住显示；手机：无 hover，故光点更大、可点区域更大，
 *       且文字会自动轮播绽放（不点也能看到），点中则锁定该句。
 * 容器 pointer-events:none，只有光点可交互；z-30 位于导航之下。
 */

type Node = {
  id: number;
  x: number;          // 起始横向 %
  zone: "side" | "middle"; // side：允许自动绽放文字；middle：仅悬停/点击才显示文字
  depth: number;      // 0 远 ~ 1 近
  color: string;
  fallDur: number;    // 下落时长
  fallDelay: number;
  driftDur: number;   // 横向漂移时长
  driftDelay: number;
  driftDist: number;  // 横向漂移幅度(px，含正负=方向)
  vibDur: number;     // 振动时长
  vi: number;
};

const COLORS = ["#E8B765", "#7CE0D3", "#C9A5D8", "#F2E2C4"];
const rand = (a: number, b: number) => a + Math.random() * (b - a);
// 全宽度分布：光点在整个视口宽度上都会出现、都会动，
// 但只有两侧区域（约 0~18% 和 82~100%）的光点，允许自动绽放文字，
// 中间阅读列的光点，文字只在悬停/点击时才出现，不打扰阅读。
const SIDE_MAX = 18;
function randXZone(): { x: number; zone: "side" | "middle" } {
  const x = rand(1, 99);
  const zone: "side" | "middle" = x <= SIDE_MAX || x >= 100 - SIDE_MAX ? "side" : "middle";
  return { x, zone };
}

const PRIORITY = /(修炼|显化片刻|邀请)/;
const BAG: number[] = (() => {
  const bag: number[] = [];
  VOICES.forEach((v, i) => {
    const w = PRIORITY.test(v.theme) ? 3 : 1;
    for (let j = 0; j < w; j++) bag.push(i);
  });
  return bag;
})();
const pick = () => BAG[Math.floor(Math.random() * BAG.length)];

export default function FieldVoices() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [speaking, setSpeaking] = useState<Record<number, number>>({});
  const [hovered, setHovered] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const seq = useRef(0);

  useEffect(() => {
    const build = () => {
      const w = window.innerWidth;
      const mobile = w < 720;
      setIsMobile(mobile);
      const area = w * window.innerHeight;
      const count = Math.max(12, Math.min(mobile ? 20 : 54, Math.round(area / (mobile ? 30000 : 37000))));
      const arr: Node[] = [];
      for (let k = 0; k < count; k++) {
        const { x, zone } = randXZone();
        arr.push({
          id: seq.current++,
          x,
          zone,
          depth: Math.random(),
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          fallDur: rand(mobile ? 20 : 26, mobile ? 34 : 40) - Math.random() * 12,
          fallDelay: -rand(0, 34),
          driftDur: rand(9, 20),
          driftDelay: -rand(0, 20),
          driftDist: rand(-40, 40),
          vibDur: rand(2.6, 5),
          vi: pick(),
        });
      }
      setNodes(arr);
    };
    build();
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(t); t = setTimeout(build, 300); };
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); clearTimeout(t); };
  }, []);

  const reseed = (id: number) => {
    setNodes((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const { x, zone } = randXZone();
        return { ...d, x, zone, vi: pick(), driftDist: rand(-40, 40) };
      })
    );
  };

  // 自动绽放。手机上并发更多，保证不点也能看到文字。
  useEffect(() => {
    if (nodes.length === 0) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const sideCount = Math.max(1, nodes.filter((d) => d.zone === "side").length);
    const maxActive = reduce ? 2 : isMobile ? Math.min(5, Math.ceil(sideCount / 2.4)) : Math.min(6, Math.ceil(sideCount / 3));
    const tick = () => {
      setSpeaking((prev) => {
        if (Object.keys(prev).length >= maxActive) return prev;
        const cands = nodes.filter((d) => d.zone === "side" && !(d.id in prev));
        if (!cands.length) return prev;
        const d = cands[Math.floor(Math.random() * cands.length)];
        const next = { ...prev, [d.id]: d.vi };
        const to = setTimeout(() => {
          setSpeaking((p) => { const c = { ...p }; delete c[d.id]; return c; });
        }, isMobile ? 6400 : 6000);
        timers.current.push(to);
        return next;
      });
    };
    const iv = setInterval(tick, reduce ? 3400 : isMobile ? 1300 : 1600);
    const first = setTimeout(tick, 150);
    const second = setTimeout(tick, 500);
    const third = setTimeout(tick, 950);
    return () => {
      clearInterval(iv); clearTimeout(first); clearTimeout(second); clearTimeout(third);
      timers.current.forEach(clearTimeout); timers.current = [];
    };
  }, [nodes, isMobile]);

  const voiceOf = (d: Node) =>
    hovered === d.id ? VOICES[d.vi] : d.id in speaking ? VOICES[d.vi] : null;

  return (
    <div className="fv-rain pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-hidden="true">
      {nodes.map((d) => {
        const v = voiceOf(d);
        const lit = hovered === d.id || d.id in speaking;
        const openRight = d.x < 50; // 左侧节点文字向右（朝内）展开，右侧节点向左（朝内）展开，确保气泡在视口内可见
        const base = (2 + d.depth * 6) * (isMobile ? 1.5 : 1); // 手机上更大
        const size = lit ? base + 4 : base;
        const opacity = lit ? 1 : 0.28 + d.depth * 0.42;
        const blur = (1 - d.depth) * 1.1;
        // 外层=下落(纵向)，中层=横向漂移，内层=振动 —— 三层叠加出斜向深空感
        return (
          <div
            key={d.id}
            className="fv-fall absolute top-0"
            style={{
              left: `${d.x}%`,
              animationDuration: `${d.fallDur}s`,
              animationDelay: `${d.fallDelay}s`,
              animationPlayState: hovered === d.id ? "paused" : "running",
            }}
            onAnimationIteration={() => reseed(d.id)}
          >
            <div
              className="fv-drift"
              style={{
                animationDuration: `${d.driftDur}s`,
                animationDelay: `${d.driftDelay}s`,
                ["--drift" as string]: `${d.driftDist}px`,
                animationPlayState: hovered === d.id ? "paused" : "running",
              } as React.CSSProperties}
            >
              <div className="fv-vib" style={{ animationDuration: `${d.vibDur}s` }}>
                <div className="relative">
                  {/* 可点区域：透明大热区，手机更大，方便点中 */}
                  <span
                    className="fv-hit pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{ width: isMobile ? 40 : 26, height: isMobile ? 40 : 26 }}
                    onMouseEnter={() => setHovered(d.id)}
                    onMouseLeave={() => setHovered((h) => (h === d.id ? null : h))}
                    onClick={() => setHovered((h) => (h === d.id ? null : d.id))}
                  />
                  <span
                    className="fv-point block rounded-full"
                    style={{
                      width: size, height: size, background: d.color,
                      filter: blur ? `blur(${blur}px)` : undefined,
                      boxShadow: lit ? `0 0 18px 4px ${d.color}` : `0 0 ${4 + d.depth * 6}px 1px ${d.color}55`,
                      opacity,
                    }}
                  />
                  {v && (
                    <div className={`fv-say absolute top-1/2 -translate-y-1/2 ${openRight ? "left-6 text-left" : "right-6 text-right"}`}>
                      <span className="fv-glyph">✧</span>
                      <span data-lang="zh">{v.zh}</span>
                      <span data-lang="en">{v.en}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <style>{`
        .fv-rain {
          -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 12%, #000 88%, transparent 100%);
          mask-image: linear-gradient(to bottom, transparent 0%, #000 12%, #000 88%, transparent 100%);
        }
        .fv-fall { animation-name: fv-drop; animation-iteration-count: infinite; animation-timing-function: linear; will-change: transform; }
        @keyframes fv-drop { 0% { transform: translateY(-10vh); } 100% { transform: translateY(114vh); } }
        .fv-drift { animation-name: fv-driftx; animation-iteration-count: infinite; animation-timing-function: ease-in-out; will-change: transform; }
        @keyframes fv-driftx { 0%,100% { transform: translateX(calc(var(--drift) * -0.5)); } 50% { transform: translateX(calc(var(--drift) * 0.5)); } }
        .fv-vib { animation-name: fv-vibrate; animation-iteration-count: infinite; animation-timing-function: ease-in-out; }
        @keyframes fv-vibrate { 0%,100% { transform: translate(0,0); } 25% { transform: translate(1.5px,-1.5px); } 50% { transform: translate(0,1.5px); } 75% { transform: translate(-1.5px,-0.5px); } }
        .fv-point { transition: width .55s ease, height .55s ease, opacity .55s ease, box-shadow .55s ease; }
        .fv-say {
          width: max-content; max-width: 17rem;
          font-family: "Cormorant Garamond", serif;
          font-size: 0.98rem; line-height: 1.6; letter-spacing: 0.015em;
          color: rgba(245,241,232,0.98);
          padding: 5px 12px;
          border-radius: 999px;
          background: rgba(6,5,12,0.62);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
          box-shadow: 0 2px 14px rgba(0,0,0,0.35);
          animation: fv-say-in 1s ease both;
        }
        .fv-glyph { color: rgba(232,183,101,0.95); margin: 0 .4em; font-size: .8em; vertical-align: 0.08em; }
        @keyframes fv-say-in { from { opacity: 0; letter-spacing: 0.12em; } to { opacity: 1; letter-spacing: 0.015em; } }
        @media (max-width: 719px) {
          .fv-say { max-width: 60vw; font-size: 1.02rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .fv-fall, .fv-drift, .fv-vib { animation-duration: 0s !important; }
        }
      `}</style>
    </div>
  );
}
