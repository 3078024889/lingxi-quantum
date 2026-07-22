"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

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

export default function QianCosmicRing({
  highlightIndexes,
  paused,
}: {
  highlightIndexes?: number[];
  paused?: boolean;
}) {
  return (
    <div className="mx-auto h-[340px] w-full max-w-2xl">
      <Suspense fallback={<RingPlaceholder />}>
        <QianCosmicRingScene highlightIndexes={highlightIndexes} paused={paused} />
      </Suspense>
    </div>
  );
}
