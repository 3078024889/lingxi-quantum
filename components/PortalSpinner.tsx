"use client";

// 灵犀场统一的"提交中"动效——不是转圈圈的通用loading spinner，是螺旋
// 汇聚向中心一点光的动画，视觉上呼应首页LingxiPortal那套"轨道环+
// 星层"的语言（同一套配色：紫罗兰lattice + 金色amber），让每一次提交
// 感觉像是"信息被送进了场域中心，场域正在回应"，而不是单纯的等待。
//
// 用法：
// - 按钮内联小尺寸：<PortalSpinner size="inline" /> 配合原按钮文字一起放，
//   或者直接替换按钮文字：{loading ? <PortalSpinner size="inline" /> : "提交"}
// - 大尺寸整段占位（比如AI报告生成这种需要几秒到十几秒的等待）：
//   <PortalSpinner size="large" label="灵犀正在读取你的命盘…" />
export default function PortalSpinner({
  size = "inline",
  label,
}: {
  size?: "inline" | "large";
  label?: string;
}) {
  const px = size === "inline" ? 20 : 96;
  return (
    <span className={size === "large" ? "flex flex-col items-center gap-4 py-6" : "inline-flex items-center gap-2"}>
      <svg
        viewBox="0 0 100 100"
        width={px}
        height={px}
        className="lx-portal-spin"
        style={{ filter: `drop-shadow(0 0 ${size === "large" ? 10 : 4}px rgba(216,184,255,0.55))` }}
      >
        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(232,183,101,0.18)" strokeWidth="1.5" />
        <circle
          cx="50" cy="50" r="34" fill="none" stroke="#E8B765" strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray="55 160" className="lx-portal-ring-a"
        />
        <circle
          cx="50" cy="50" r="22" fill="none" stroke="#C79CFF" strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray="38 100" className="lx-portal-ring-b"
        />
        <circle cx="50" cy="50" r="4" fill="#F4EFFF" className="lx-portal-core" />
      </svg>
      {label && (
        <span className="font-display text-sm text-lattice/90">{label}</span>
      )}
      <style>{`
        .lx-portal-spin { transform-origin: center; }
        .lx-portal-ring-a { transform-origin: 50px 50px; animation: lx-portal-spin-a 1.6s linear infinite; }
        .lx-portal-ring-b { transform-origin: 50px 50px; animation: lx-portal-spin-b 1.1s linear infinite reverse; }
        .lx-portal-core { animation: lx-portal-pulse 1.1s ease-in-out infinite; }
        @keyframes lx-portal-spin-a { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes lx-portal-spin-b { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes lx-portal-pulse { 0%,100% { opacity: 0.6; r: 3; } 50% { opacity: 1; r: 5; } }
        @media (prefers-reduced-motion: reduce) {
          .lx-portal-ring-a, .lx-portal-ring-b, .lx-portal-core { animation: none !important; }
        }
      `}</style>
    </span>
  );
}
