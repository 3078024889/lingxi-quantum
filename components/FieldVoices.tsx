"use client";

import { useEffect, useRef, useState } from "react";
import { VOICES } from "@/lib/voices";

/* 心声之雨 · 深空活场层（v2：仅两侧 · 流星尾巴 · 水波纹涟漪）
 * 光点只出现在视口左右两侧的窄带里，不再落入中间阅读区，避免干扰内容。
 * 每颗光点，是一道拉长的流星尾巴——亮点在下、尾迹向上淡出，随下落斜向掠过；
 * 亮点周围叠加一圈，缓缓扩散、淡出的水波纹涟漪，像光落入水面漾开的样子。
 * 部分光点会绽放出一句「场域心声」。
 * 桌面：鼠标碰到光点即停住显示；手机：无 hover，故光点更大、可点区域更大，
 *       且文字会自动轮播绽放（不点也能看到），点中则锁定该句。
 * 容器 pointer-events:none，只有光点可交互；z-30 位于导航之下。
 */

type Node = {
  id: number;
  x: number;          // 起始横向 %，仅分布在左右两条窄带里
  depth: number;      // 0 远 ~ 1 近
  color: string;
  fallDur: number;    // 下落时长
  fallDelay: number;
  driftDur: number;   // 横向漂移时长
  driftDelay: number;
  driftDist: number;  // 横向漂移幅度(px，含正负=方向)
  rippleDur: number;  // 水波纹涟漪周期
  rippleDelay: number;
  vi: number;
  isData: boolean;    // true = 右侧"数据掉落"节点，绽放时显示数字而不是引言
  statIdx: number;    // isData 为 true 时，对应 STATS 里的第几条
};

const COLORS = ["#D8B8FF", "#A0E0D0", "#FF9FD6", "#C9A6FF"];
const rand = (a: number, b: number) => a + Math.random() * (b - a);
// 左右两条窄带都有光点：左侧落场域心声引言，右侧混着场域数据一起落下。
const SIDE_MAX = 16;
function randX(): number {
  const onLeft = Math.random() < 0.5;
  return onLeft ? rand(1, SIDE_MAX) : rand(100 - SIDE_MAX, 99);
}

/* 场域数据——装饰性的氛围数字，不是接了真实数据库统计出来的（目前没有
 * 埋点/统计接口）。以后要换真实数据，把这里的 base 换成接口读回来的
 * 数字即可，下面的下落/绽放逻辑不用动。 */
const STATS = [
  { glyph: "✦", base: 128742, suffix: "+", zh: "生命图谱已生成", en: "Life maps generated" },
  { glyph: "☾", base: 98315, suffix: "+", zh: "梦境解析记录", en: "Dreams interpreted" },
  { glyph: "♡", base: 68942, suffix: "+", zh: "修炼者在场域中成长", en: "Practitioners growing here" },
  { glyph: "◈", base: 36, suffix: "", zh: "多维系统融合", en: "Systems integrated" },
];
const statValue = (i: number) => {
  const s = STATS[i];
  const jitter = Math.floor(Math.random() * 40); // 每次绽放都轻轻跳一点，看起来数字还在走
  return `${(s.base + jitter).toLocaleString()}${s.suffix}`;
};

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

// 每颗光点绽放的引言前面配一个小图标，光点本身也更有辨识度，不只是一个
// 圆点。右侧数据节点直接用对应统计项自己的图标（见 STATS）。
const GLYPHS = ["✦", "☾", "♡", "✎", "❋", "◈"];
const glyphFor = (id: number) => GLYPHS[id % GLYPHS.length];

export default function FieldVoices() {
  // 光点只在视口两侧窄带出现、不进中间阅读列，全站统一开启，不再按路径关闭。
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
      // 左右两条窄带都分布，按可用面积（约为总宽的 32%）折算密度
      const count = Math.max(10, Math.min(mobile ? 16 : 42, Math.round((area * 0.34) / (mobile ? 26000 : 32000))));
      const arr: Node[] = [];
      for (let k = 0; k < count; k++) {
        const x = randX();
        // 右侧（x>50）的光点里，约三分之一绽放时显示"场域数据"而不是引言，
        // 跟左侧的心声引言混在一起落下，不是另开一个固定不动的面板。
        const isData = x > 50 && Math.random() < 0.34;
        arr.push({
          id: seq.current++,
          x,
          depth: Math.random(),
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          fallDur: rand(mobile ? 20 : 26, mobile ? 34 : 40) - Math.random() * 12,
          fallDelay: -rand(0, 34),
          driftDur: rand(9, 20),
          driftDelay: -rand(0, 20),
          driftDist: rand(-30, 30),
          rippleDur: rand(2.6, 4.2),
          rippleDelay: -rand(0, 4),
          vi: pick(),
          isData,
          statIdx: Math.floor(Math.random() * STATS.length),
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
        const x = randX();
        return { ...d, x, vi: pick(), driftDist: rand(-30, 30), isData: x > 50 && Math.random() < 0.34, statIdx: Math.floor(Math.random() * STATS.length) };
      })
    );
  };

  // 自动绽放。手机上并发更多，保证不点也能看到文字。
  useEffect(() => {
    if (nodes.length === 0) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const total = Math.max(1, nodes.length);
    const maxActive = reduce ? 2 : isMobile ? Math.min(5, Math.ceil(total / 2.4)) : Math.min(6, Math.ceil(total / 3));
    const tick = () => {
      setSpeaking((prev) => {
        if (Object.keys(prev).length >= maxActive) return prev;
        const cands = nodes.filter((d) => !(d.id in prev));
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
        const openRight = d.x < 50; // 左侧节点文字向右（朝内）展开，右侧节点向左（朝内）展开
        const base = (2.2 + d.depth * 5.5) * (isMobile ? 1.5 : 1);
        const headSize = lit ? base + 4 : base;
        const tailLen = headSize * (7 + d.depth * 5); // 尾巴长度随深度变化，制造远近层次
        const opacity = lit ? 1 : 0.32 + d.depth * 0.42;
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
              <div className="relative">
                {/* 流星尾巴：从亮点向上拉长、淡出的渐变条，随下落方向自然拖出轨迹感 */}
                <div
                  className="fv-tail pointer-events-none absolute left-1/2 -translate-x-1/2"
                  style={{
                    bottom: headSize * 0.4,
                    width: Math.max(1.4, headSize * 0.32),
                    height: tailLen,
                    background: `linear-gradient(to top, ${d.color}, ${d.color}00)`,
                    opacity: opacity * 0.75,
                    filter: `blur(${(1 - d.depth) * 0.8}px)`,
                  }}
                />
                {/* 水波纹涟漪：从亮点缓缓扩散、淡出的圆环，营造光落入水面的感觉 */}
                <span
                  className="fv-ripple pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    border: `1px solid ${d.color}`,
                    animationDuration: `${d.rippleDur}s`,
                    animationDelay: `${d.rippleDelay}s`,
                    opacity: lit ? 0.5 : 0.28,
                  }}
                />
                {/* 可点区域：透明大热区，手机更大，方便点中 */}
                <span
                  className="fv-hit pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ width: isMobile ? 40 : 26, height: isMobile ? 40 : 26 }}
                  onMouseEnter={() => setHovered(d.id)}
                  onMouseLeave={() => setHovered((h) => (h === d.id ? null : h))}
                  onClick={() => setHovered((h) => (h === d.id ? null : d.id))}
                />
                {/* 亮点头部 */}
                <span
                  className="fv-point block rounded-full"
                  style={{
                    width: headSize, height: headSize, background: d.color,
                    boxShadow: lit ? `0 0 18px 4px ${d.color}` : `0 0 ${4 + d.depth * 6}px 1px ${d.color}55`,
                    opacity,
                  }}
                />
                {v && !d.isData && (
                  <div
                    className={`fv-say absolute top-1/2 -translate-y-1/2 ${openRight ? "left-6 text-left" : "right-6 text-right"}`}
                    style={{ borderColor: `${d.color}55`, boxShadow: `0 2px 14px rgba(0,0,0,0.35), 0 0 16px ${d.color}22` }}
                  >
                    <span className="fv-glyph" style={{ color: d.color }}>{glyphFor(d.id)}</span>
                    <span data-lang="zh">{v.zh}</span>
                    <span data-lang="en">{v.en}</span>
                  </div>
                )}
                {d.isData && (hovered === d.id || d.id in speaking) && (
                  <div
                    className={`fv-data absolute top-1/2 -translate-y-1/2 ${openRight ? "left-6 text-left" : "right-6 text-right"}`}
                    style={{ borderColor: `${d.color}55`, boxShadow: `0 2px 14px rgba(0,0,0,0.35), 0 0 16px ${d.color}22` }}
                  >
                    <span className="fv-glyph" style={{ color: d.color }}>{STATS[d.statIdx].glyph}</span>
                    <span className="fv-data-num" style={{ color: d.color }}>{statValue(d.statIdx)}</span>
                    <span className="fv-data-label" data-lang="zh">{STATS[d.statIdx].zh}</span>
                    <span className="fv-data-label" data-lang="en">{STATS[d.statIdx].en}</span>
                  </div>
                )}
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
        .fv-tail { border-radius: 999px; transition: opacity .55s ease, height .55s ease; }
        .fv-ripple {
          width: 6px; height: 6px;
          animation-name: fv-ripple-out; animation-iteration-count: infinite; animation-timing-function: ease-out;
        }
        @keyframes fv-ripple-out {
          0%   { transform: translate(-50%,-50%) scale(1);   opacity: .6; }
          100% { transform: translate(-50%,-50%) scale(6.5); opacity: 0; }
        }
        .fv-point { transition: width .55s ease, height .55s ease, opacity .55s ease, box-shadow .55s ease; }
        .fv-say {
          width: max-content; max-width: 17rem;
          font-family: "Cormorant Garamond", serif;
          font-size: 0.98rem; line-height: 1.6; letter-spacing: 0.015em;
          color: var(--text-primary, #DDE6FF);
          padding: 5px 12px;
          border-radius: 999px;
          background: linear-gradient(135deg, rgba(24,30,64,0.62), rgba(10,20,40,0.68));
          border: 1px solid rgba(200,180,255,0.4);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          box-shadow: 0 2px 18px rgba(0,0,0,0.3);
          animation: fv-say-in 1s ease both;
        }
        .fv-glyph { color: rgba(160,224,208,0.95); margin: 0 .4em; font-size: .8em; vertical-align: 0.08em; }
        /* 右侧"数据掉落"绽放出来的小卡：图标 + 数字 + 一行说明，跟左侧的
           引言气泡是同一套玻璃质感，只是内容换成了数字。 */
        .fv-data {
          width: max-content; max-width: 13rem;
          display: flex; flex-direction: column; gap: 2px;
          padding: 7px 14px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(24,30,64,0.62), rgba(10,20,40,0.68));
          border: 1px solid rgba(200,180,255,0.4);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          box-shadow: 0 2px 18px rgba(0,0,0,0.3);
          animation: fv-say-in 1s ease both;
        }
        .fv-data-num {
          font-family: "Cormorant Garamond", serif;
          font-size: 1.1rem; font-weight: 600;
          text-shadow: var(--glow-soft, 0 0 8px rgba(224,230,255,0.45));
        }
        .fv-data-label { font-size: 0.68rem; color: var(--text-secondary, #B8C9E6); line-height: 1.3; }
        @keyframes fv-say-in { from { opacity: 0; letter-spacing: 0.12em; } to { opacity: 1; letter-spacing: 0.015em; } }
        @media (max-width: 719px) {
          .fv-say { max-width: 60vw; font-size: 1.02rem; }
          .fv-data { max-width: 50vw; }
        }
        @media (prefers-reduced-motion: reduce) {
          .fv-fall, .fv-drift { animation-duration: 0s !important; }
          .fv-ripple { animation: none; opacity: .35; }
        }
      `}</style>
    </div>
  );
}
