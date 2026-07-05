"use client";

// 螺旋黑洞「场」动图：内容被吸入、被光改写。
// active=true 时显示全屏覆盖的旋涡 + 状态文字。
export default function SpiralField({
  active,
  label = "正在送入场……",
}: {
  active: boolean;
  label?: string;
}) {
  if (!active) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-void/85 backdrop-blur-sm">
      <div className="sf-wrap relative h-72 w-72">
        {/* 旋臂 */}
        <div className="sf-spin absolute inset-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="sf-arm absolute left-1/2 top-1/2"
              style={{ transform: `translate(-50%,-50%) rotate(${i * 72}deg)` }}
            />
          ))}
        </div>
        {/* 吸入的光点 */}
        <div className="sf-spin-fast absolute inset-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="sf-dot absolute left-1/2 top-1/2"
              style={{ ["--r" as string]: `${i * 30}deg`, animationDelay: `${i * 0.12}s` } as React.CSSProperties}
            />
          ))}
        </div>
        {/* 视界（黑洞核心 + 光环） */}
        <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-void shadow-[0_0_60px_20px_rgba(124,224,211,0.45),inset_0_0_30px_rgba(232,183,101,0.5)]" />
        <div className="sf-core absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
      </div>
      <p className="mt-12 font-display text-lg tracking-widest2 text-lattice">{label}</p>

      <style>{`
        .sf-spin { animation: sf-spin 6s linear infinite; }
        .sf-spin-fast { animation: sf-spin 3.2s linear infinite; }
        @keyframes sf-spin { to { transform: rotate(360deg); } }
        .sf-arm {
          width: 280px; height: 280px; border-radius: 9999px;
          border: 1px solid transparent;
          border-top-color: rgba(124,224,211,0.5);
          border-right-color: rgba(232,183,101,0.35);
          filter: blur(0.4px);
        }
        .sf-dot {
          width: 4px; height: 4px; border-radius: 9999px; background:#fff;
          box-shadow: 0 0 8px 2px rgba(156,242,230,0.9);
          animation: sf-fall 1.8s ease-in infinite;
        }
        @keyframes sf-fall {
          0%   { opacity: 0; transform: rotate(var(--r,0)) translateX(150px) scale(1); }
          15%  { opacity: 1; }
          100% { opacity: 0; transform: rotate(0) translateX(0) scale(0.2); }
        }
        .sf-core { animation: sf-pulse 1.6s ease-in-out infinite; }
        @keyframes sf-pulse {
          0%,100% { box-shadow: 0 0 20px 6px rgba(255,255,255,0.9); transform: translate(-50%,-50%) scale(1); }
          50%     { box-shadow: 0 0 40px 14px rgba(232,183,101,0.9); transform: translate(-50%,-50%) scale(1.6); }
        }
      `}</style>
    </div>
  );
}
