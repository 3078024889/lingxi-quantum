"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";

// ────────────────────────────────────────────────────────────────────
// 灵犀生命灵签 · 宇宙签库环形视觉（真·3D版）
// ────────────────────────────────────────────────────────────────────
// 底层是 react-three-fiber（Three.js 的 React 绑定）渲染的真实 WebGL
// 场景（见 QianCosmicRingScene.tsx）——64枚真实签图作为纹理贴图，
// 绕中心发光核心做真正的3D旋转，不再是CSS模拟的伪3D。
// WebGL 只能在浏览器端运行，这里用 next/dynamic + ssr:false 确保
// 服务端渲染阶段完全跳过这个组件，避免"window/document未定义"这类
// 服务端渲染报错；配合 Suspense，纹理还没加载完的时候，先显示一个
// 轻量的静态光晕占位，不会让页面在加载纹理的几百毫秒里空白一片。
const QianCosmicRingScene = dynamic(() => import("./QianCosmicRingScene"), {
  ssr: false,
  loading: () => <RingPlaceholder />,
});

function RingPlaceholder() {
  return (
    <div className="relative flex h-[340px] w-full items-center justify-center">
      <div className="lx-ring-fallback-glow h-24 w-24 rounded-full" />
      <style>{`
        .lx-ring-fallback-glow { background: radial-gradient(circle, rgba(199,156,255,0.5), transparent 70%); filter: blur(16px); animation: lx-ring-fallback-breathe 2.4s ease-in-out infinite; }
        @keyframes lx-ring-fallback-breathe { 0%,100% { opacity: 0.5; transform: scale(0.9); } 50% { opacity: 0.9; transform: scale(1.1); } }
      `}</style>
    </div>
  );
}

function MiniRingFallback() {
  return (
    <div className="relative flex h-[340px] w-full items-center justify-center overflow-hidden">
      <div className="absolute h-64 w-64 rounded-full border border-violet-200/20 shadow-[0_0_90px_rgba(165,116,255,.22)]" />
      <div className="absolute h-48 w-48 rotate-45 rounded-full border border-cyan-200/20" />
      <div className="absolute h-32 w-32 rounded-full border border-amber/25" />
      <div className="lx-ring-fallback-glow h-24 w-24 rounded-full" />
      <p className="absolute bottom-8 font-display text-xs tracking-[0.3em] text-violet-100/70">六十四枚生命原型 · 正在回应</p>
      <style>{`
        .lx-ring-fallback-glow { background: radial-gradient(circle, rgba(199,156,255,0.58), transparent 70%); filter: blur(16px); animation: lx-ring-fallback-breathe 2.4s ease-in-out infinite; }
        @keyframes lx-ring-fallback-breathe { 0%,100% { opacity: 0.5; transform: scale(0.9); } 50% { opacity: 0.95; transform: scale(1.12); } }
      `}</style>
    </div>
  );
}

export default function QianCosmicRing({
  highlightIndexes,
  paused,
}: {
  highlightIndexes?: number[];
  paused?: boolean;
}) {
  const [mode, setMode] = useState<"checking" | "webgl" | "mini">("checking");

  useEffect(() => {
    // WeChat DevTools' simulated web-view can crash while initializing the
    // Three.js renderer even though physical phones support it. The Mini
    // Program receives a stable branded fallback; the full website keeps 3D.
    const embedded = new URLSearchParams(window.location.search).get("mini") === "1";
    setMode(embedded ? "mini" : "webgl");
  }, []);

  return (
    <div className="mx-auto h-[340px] w-full max-w-2xl">
      {mode === "webgl" ? (
        <Suspense fallback={<RingPlaceholder />}>
          <QianCosmicRingScene highlightIndexes={highlightIndexes} paused={paused} />
        </Suspense>
      ) : mode === "mini" ? <MiniRingFallback /> : <RingPlaceholder />}
    </div>
  );
}
