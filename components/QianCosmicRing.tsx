"use client";

// ────────────────────────────────────────────────────────────────────
// 灵犀生命灵签 · 宇宙签库环形视觉
// ────────────────────────────────────────────────────────────────────
// 参照小仙女给的两张参考图做的：中央一个发光的"灵犀核心"，64枚真实
// 签图沿一个圆环排布，用CSS 3D（perspective + rotateY + translateZ）
// 做出"卡片绕中心悬浮旋转"的效果——不是真的3D引擎，是纯CSS3D变换，
// 在能接受的性能开销下，做出接近参考图里那种"星际档案馆"的空间感，
// 而不是平面轮播。64张图分布在整圈360度上，每张之间隔 360/64=5.625度。
export default function QianCosmicRing({
  highlightIndexes,
  paused,
}: {
  highlightIndexes?: number[]; // 需要高亮/放大的签编号（0-63），三签揭示时用
  paused?: boolean; // 是否停止环绕旋转（进入揭示阶段时）
}) {
  const count = 64;
  const radius = 220;
  const highlight = new Set(highlightIndexes ?? []);

  return (
    <div className="lx-ring-scene relative mx-auto h-[340px] w-full max-w-2xl overflow-hidden">
      {/* 中央灵犀核心——复用全站统一的九彩光晕语言 */}
      <div className="lx-ring-core absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="lx-ring-core-glow absolute inset-0 rounded-full" />
        <div className="lx-ring-core-spiral absolute inset-0 rounded-full" />
        <div className="lx-ring-core-dot absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
      </div>

      <div className={`lx-ring-stage absolute left-1/2 top-1/2 ${paused ? "lx-ring-paused" : "lx-ring-spin"}`}>
        {Array.from({ length: count }).map((_, i) => {
          const angle = (360 / count) * i;
          const isHighlight = highlight.has(i);
          return (
            <div
              key={i}
              className="lx-ring-card absolute left-1/2 top-1/2"
              style={{
                transform: `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${radius}px)`,
              }}
            >
              <div
                className={`overflow-hidden rounded-sm border transition-all duration-700 ${
                  isHighlight
                    ? "scale-125 border-amber shadow-[0_0_24px_4px_rgba(232,183,101,0.5)]"
                    : "border-white/10 opacity-70"
                }`}
                style={{ width: 44, height: 66 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/images/qian/${String(i).padStart(2, "0")}.jpg`}
                  alt=""
                  className="block h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .lx-ring-scene { perspective: 900px; }
        .lx-ring-stage { transform-style: preserve-3d; width: 1px; height: 1px; }
        .lx-ring-spin { animation: lx-ring-rotate 90s linear infinite; }
        .lx-ring-paused { animation: lx-ring-rotate 90s linear infinite; animation-play-state: paused; }
        @keyframes lx-ring-rotate { from { transform: translate(-50%, -50%) rotateY(0deg); } to { transform: translate(-50%, -50%) rotateY(360deg); } }
        .lx-ring-card { transform-style: preserve-3d; }

        .lx-ring-core { width: 140px; height: 140px; }
        .lx-ring-core-glow { background: radial-gradient(circle, rgba(199,156,255,0.55), rgba(140,210,255,0.25) 45%, transparent 75%); filter: blur(14px); animation: lx-core-breathe 3.2s ease-in-out infinite; }
        .lx-ring-core-spiral { background: conic-gradient(from 0deg, #C79CFF, #8CD2FF, #7CE0D3, #E8D08A, #E8B765, #FF8FD1, #D8B8FF, #C79CFF); opacity: 0.5; filter: blur(6px); animation: lx-spin-slow 14s linear infinite; }
        @keyframes lx-spin-slow { to { transform: rotate(360deg); } }
        @keyframes lx-core-breathe { 0%,100% { opacity: 0.6; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1.08); } }
        .lx-ring-core-dot { width: 10px; height: 10px; box-shadow: 0 0 16px 6px rgba(255,255,255,0.9); }

        @media (prefers-reduced-motion: reduce) {
          .lx-ring-spin, .lx-ring-paused, .lx-ring-core-glow, .lx-ring-core-spiral { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
