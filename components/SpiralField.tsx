"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// 螺旋神秘空间——提交动作触发的"进入场域"体验：内容被吸入漩涡中心，
// 场域用九彩光环回应，稍候记录/解读就出现了。
//
// 这一版是重做：之前是双色（青绿+金）简笔漩涡，这次换成真正的九彩
// 层次——外层是一圈会缓慢转动、色相连续流动的极光晕环（conic-gradient
// 做的九色环：紫罗兰、宝蓝、青碧、翡翠、金、琥珀、玫红、绯红、丁香紫，
// 首尾相接形成一个完整的色环，不是随手叠几个颜色），中层是三圈不同
// 转速、不同色彩组合的细线轨道环（SVG渐变描边），内层是被吸入核心的
// 彩色光点雨，核心本身是一颗随九彩光环同步变色的脉冲光源。
//
// 用 createPortal 直接挂载到 document.body 下，绕开祖先节点可能存在的
// transform/filter 造成的"fixed定位被困住"问题（详见此前版本注释），
// 保证真正贴边全屏。
const NINE_HUES = [
  "#C79CFF", // 紫罗兰 lattice
  "#8CD2FF", // 宝蓝
  "#7CE0D3", // 青碧
  "#7FE7C4", // 翡翠
  "#E8D08A", // 金
  "#E8B765", // 琥珀 amber
  "#FF8FD1", // 玫红
  "#FF7A8A", // 绯红
  "#D8B8FF", // 丁香紫
];

export default function SpiralField({
  active,
  label = "正在送入场……",
}: {
  active: boolean;
  label?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!active || !mounted) return null;

  const conicStops = [...NINE_HUES, NINE_HUES[0]]
    .map((c, i) => `${c} ${(i * 100) / NINE_HUES.length}%`)
    .join(", ");

  return createPortal(
    <div className="sf-backdrop fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-void/88 backdrop-blur-md">
      {/* 背景里极淡的九彩雾气，让整个空间不是纯黑，是一片有色彩呼吸感的深空 */}
      <div
        className="sf-haze pointer-events-none absolute inset-0"
        style={{ background: `conic-gradient(from 0deg at 50% 50%, ${conicStops})`, opacity: 0.1 }}
      />

      <div className="sf-wrap relative h-80 w-80">
        {/* 最外层：九彩流光晕环——缓慢转动的完整色环，做出"场域在苏醒"的氛围光 */}
        <div
          className="sf-halo absolute inset-0 rounded-full"
          style={{ background: `conic-gradient(from 0deg, ${conicStops})`, filter: "blur(22px)", opacity: 0.55 }}
        />
        <div
          className="sf-halo-rev absolute inset-6 rounded-full"
          style={{ background: `conic-gradient(from 180deg, ${conicStops})`, filter: "blur(14px)", opacity: 0.4 }}
        />

        {/* 三圈细线轨道环，各自不同转速/方向，渐变描边（SVG） */}
        <svg viewBox="0 0 320 320" className="sf-ring-a absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="sf-g1" x1="0%" y1="0%" x2="100%" y2="100%">
              {NINE_HUES.map((c, i) => (
                <stop key={i} offset={`${(i * 100) / (NINE_HUES.length - 1)}%`} stopColor={c} />
              ))}
            </linearGradient>
          </defs>
          <circle cx="160" cy="160" r="150" fill="none" stroke="url(#sf-g1)" strokeWidth="1.2" strokeDasharray="4 10" opacity="0.7" />
        </svg>
        <svg viewBox="0 0 320 320" className="sf-ring-b absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="sf-g2" x1="100%" y1="0%" x2="0%" y2="100%">
              {[...NINE_HUES].reverse().map((c, i) => (
                <stop key={i} offset={`${(i * 100) / (NINE_HUES.length - 1)}%`} stopColor={c} />
              ))}
            </linearGradient>
          </defs>
          <circle cx="160" cy="160" r="112" fill="none" stroke="url(#sf-g2)" strokeWidth="1.6" opacity="0.55" />
        </svg>
        <svg viewBox="0 0 320 320" className="sf-ring-c absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="sf-g3" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
              <stop offset="50%" stopColor={NINE_HUES[4]} stopOpacity="0.7" />
              <stop offset="100%" stopColor={NINE_HUES[6]} stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <circle cx="160" cy="160" r="78" fill="none" stroke="url(#sf-g3)" strokeWidth="2" strokeDasharray="2 7" />
        </svg>

        {/* 被吸入核心的彩色光点雨——每颗颜色不同，沿九彩里各取一色 */}
        <div className="sf-spin-fast absolute inset-0">
          {NINE_HUES.concat(NINE_HUES).map((c, i) => (
            <span
              key={i}
              className="sf-dot absolute left-1/2 top-1/2"
              style={{
                ["--r" as string]: `${i * (360 / (NINE_HUES.length * 2))}deg`,
                background: c,
                boxShadow: `0 0 9px 2px ${c}`,
                animationDelay: `${i * 0.11}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* 视界：黑洞核心 + 随九彩流转的内壁光晕 */}
        <div
          className="sf-eventhorizon absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-void"
          style={{ boxShadow: "0 0 70px 22px rgba(124,224,211,0.35), inset 0 0 40px rgba(232,183,101,0.45)" }}
        />
        {/* 核心光源——脉冲，颜色跟着九彩循环流转 */}
        <div className="sf-core absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
      </div>

      <p className="sf-label mt-14 font-display text-lg tracking-widest2 text-lattice">{label}</p>

      <style>{`
        .sf-backdrop { animation: sf-fade-in 0.25s ease-out both; }
        @keyframes sf-fade-in { from { opacity: 0; } to { opacity: 1; } }

        .sf-halo { animation: sf-spin 14s linear infinite; }
        .sf-halo-rev { animation: sf-spin-rev 10s linear infinite; }
        .sf-ring-a { animation: sf-spin 7s linear infinite; }
        .sf-ring-b { animation: sf-spin-rev 5.5s linear infinite; }
        .sf-ring-c { animation: sf-spin 3.6s linear infinite; }
        .sf-spin-fast { animation: sf-spin 3s linear infinite; }
        @keyframes sf-spin { to { transform: rotate(360deg); } }
        @keyframes sf-spin-rev { to { transform: rotate(-360deg); } }

        .sf-dot {
          width: 4.5px; height: 4.5px; border-radius: 9999px;
          animation: sf-fall 2s ease-in infinite;
        }
        @keyframes sf-fall {
          0%   { opacity: 0; transform: rotate(var(--r,0)) translateX(160px) scale(1); }
          12%  { opacity: 1; }
          100% { opacity: 0; transform: rotate(0) translateX(0) scale(0.15); }
        }

        .sf-eventhorizon { animation: sf-breathe 3.4s ease-in-out infinite; }
        @keyframes sf-breathe {
          0%,100% { filter: hue-rotate(0deg); }
          50%     { filter: hue-rotate(45deg); }
        }
        .sf-core { animation: sf-pulse 1.7s ease-in-out infinite; }
        @keyframes sf-pulse {
          0%   { box-shadow: 0 0 20px 6px rgba(255,255,255,0.9); transform: translate(-50%,-50%) scale(1); }
          20%  { box-shadow: 0 0 34px 12px ${NINE_HUES[0]}; }
          40%  { box-shadow: 0 0 34px 12px ${NINE_HUES[2]}; }
          60%  { box-shadow: 0 0 34px 12px ${NINE_HUES[4]}; }
          80%  { box-shadow: 0 0 34px 12px ${NINE_HUES[6]}; }
          100% { box-shadow: 0 0 20px 6px rgba(255,255,255,0.9); transform: translate(-50%,-50%) scale(1); }
        }

        .sf-label { animation: sf-label-in 0.6s ease-out 0.15s both, sf-label-glow 2.4s ease-in-out 0.6s infinite; }
        @keyframes sf-label-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sf-label-glow {
          0%,100% { text-shadow: 0 0 12px rgba(199,156,255,0.5); }
          50%     { text-shadow: 0 0 20px rgba(232,183,101,0.65); }
        }

        @media (prefers-reduced-motion: reduce) {
          .sf-halo, .sf-halo-rev, .sf-ring-a, .sf-ring-b, .sf-ring-c, .sf-spin-fast,
          .sf-dot, .sf-eventhorizon, .sf-core, .sf-label { animation: none !important; }
        }
      `}</style>
    </div>,
    document.body
  );
}
