"use client";

import { useLang } from "@/lib/useLang";

// ────────────────────────────────────────────────────────────────
// 量子息法 · 五秒节律呼吸结构图
// ────────────────────────────────────────────────────────────────
// v300 重画。原图是「四秒」（每段刻度 1–4），但法典正文写的是
// 「每一个阶段保持五秒节律」——图与文一直是矛盾的，用户照着图练
// 就会练成四秒。这是一处内容层面的 BUG，不是审美问题。
//
// 这一版做了四件事：
//   1. 刻度改为 1–5，与正文的五秒节律完全一致
//   2. 补上「我是 / 我们是」的分区——法典里这是核心结构
//      （吸气+停留 = 我是，呼气+静置 = 我们是），原图完全没体现
//   3. 双语。原图是纯中文硬编码，英文用户看到的是一张看不懂的图
//   4. 曲线改为平滑贝塞尔，不再是折线；呼吸本身没有尖角
//
// 配色沿用灵犀场的极光色系：吸气偏青（上扬）、停留转金（融合）、
// 呼气偏翡翠（展开）、静置转柔紫（合一）。
export default function BreathStructure({ className = "" }: { className?: string }) {
  const langEn = useLang();

  const segments = [
    { zh: "吸气", en: "Inhale", subZh: "上扬", subEn: "Rise", color: "#7CE0D3" },
    { zh: "停留", en: "Pause", subZh: "融合", subEn: "Merge", color: "#E8B765" },
    { zh: "呼气", en: "Exhale", subZh: "展开", subEn: "Expand", color: "#7CC79C" },
    { zh: "静置", en: "Stillness", subZh: "合一", subEn: "Unite", color: "#B9A6D6" },
  ];

  const W = 640;
  const segW = W / 4;
  const TOP = 46;   // 曲线高点（吸满）
  const BOT = 150;  // 曲线低点（呼尽）

  // 平滑呼吸曲线：升 → 保持高 → 降 → 保持低
  // 用三次贝塞尔让起落有缓冲，避免折线的尖角
  const path =
    `M0,${BOT} ` +
    `C${segW * 0.45},${BOT} ${segW * 0.55},${TOP} ${segW},${TOP} ` +
    `L${segW * 2},${TOP} ` +
    `C${segW * 2.45},${TOP} ${segW * 2.55},${BOT} ${segW * 3},${BOT} ` +
    `L${segW * 4},${BOT}`;

  return (
    <svg viewBox="0 0 640 268" className={className} role="img"
      aria-label={langEn
        ? "Quantum Breath Method five-second rhythm: inhale, pause, exhale, stillness"
        : "量子息法五秒节律：吸气、停留、呼气、静置"}>
      <defs>
        <linearGradient id="bs-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7CE0D3" />
          <stop offset="32%" stopColor="#E8B765" />
          <stop offset="68%" stopColor="#7CC79C" />
          <stop offset="100%" stopColor="#B9A6D6" />
        </linearGradient>
        <linearGradient id="bs-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7CE0D3" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#7CE0D3" stopOpacity="0" />
        </linearGradient>
        <filter id="bs-glow" x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── 「我是」/「我们是」分区 ── */}
      {/* 法典结构：吸气+停留 = 我是；呼气+静置 = 我们是。
          这是量子息法最核心的一层，图上必须看得见。 */}
      <g>
        <rect x="0" y="14" width={segW * 2} height="1" fill="#7CE0D3" fillOpacity="0.34" />
        <rect x={segW * 2} y="14" width={segW * 2} height="1" fill="#B9A6D6" fillOpacity="0.34" />
        <text x={segW} y="9" fill="#7CE0D3" fillOpacity="0.9" fontSize="12"
          letterSpacing="1.5" textAnchor="middle">
          {langEn ? "I AM" : "「我是」 · I AM"}
        </text>
        <text x={segW * 3} y="9" fill="#B9A6D6" fillOpacity="0.9" fontSize="12"
          letterSpacing="1.5" textAnchor="middle">
          {langEn ? "WE ARE" : "「我们是」 · WE ARE"}
        </text>
      </g>

      {/* ── 分段底与五秒刻度 ── */}
      {segments.map((s, i) => (
        <g key={i}>
          <rect x={i * segW} y={26} width={segW} height={162}
            fill={s.color} fillOpacity="0.05" />
          <line x1={i * segW} y1={26} x2={i * segW} y2={188}
            stroke="#ffffff" strokeOpacity="0.07" />
          {[1, 2, 3, 4, 5].map((n) => (
            <g key={n}>
              <line
                x1={i * segW + (segW / 5) * n}
                y1={168}
                x2={i * segW + (segW / 5) * n}
                y2={174}
                stroke={s.color}
                strokeOpacity="0.28"
              />
              <text
                x={i * segW + (segW / 5) * (n - 0.5)}
                y={182}
                fill={s.color}
                fillOpacity="0.62"
                fontSize="10"
                textAnchor="middle"
              >
                {n}
              </text>
            </g>
          ))}
        </g>
      ))}

      {/* 曲线下的柔光，让「吸满」那一段有体积感 */}
      <path d={`${path} L${W},188 L0,188 Z`} fill="url(#bs-fill)" />

      {/* ── 呼吸曲线 ── */}
      <path d={path} fill="none" stroke="url(#bs-line)" strokeWidth="2.6"
        strokeLinecap="round" filter="url(#bs-glow)" />

      {/* 沿曲线运行的光点。20 秒 = 四段各五秒，与真实节律同步，
          用户可以直接跟着它呼吸。 */}
      <circle r="5.5" fill="#EDE7DC" filter="url(#bs-glow)">
        <animateMotion dur="20s" repeatCount="indefinite" path={path} calcMode="linear" />
      </circle>

      {/* ── 阶段标签 ── */}
      {segments.map((s, i) => (
        <g key={`l${i}`}>
          <text x={i * segW + segW / 2} y={214} fill={s.color}
            fontSize="16" fontWeight="500" textAnchor="middle">
            {langEn ? s.en : s.zh}
          </text>
          <text x={i * segW + segW / 2} y={234} fill={s.color} fillOpacity="0.72"
            fontSize="11.5" textAnchor="middle">
            {langEn ? s.subEn : s.subZh}
          </text>
        </g>
      ))}

      {/* ── 底部：鼻/口的出入口提示 ── */}
      <text x={segW / 2} y={256} fill="#8C93A8" fontSize="10.5" textAnchor="middle">
        {langEn ? "through the nose" : "由鼻吸入"}
      </text>
      <text x={segW * 2.5} y={256} fill="#8C93A8" fontSize="10.5" textAnchor="middle">
        {langEn ? "through the mouth" : "由口呼出"}
      </text>
      <text x={W - 4} y={256} fill="#6F7488" fontSize="10" textAnchor="end">
        {langEn ? "5 seconds per phase" : "每段五秒"}
      </text>
    </svg>
  );
}
