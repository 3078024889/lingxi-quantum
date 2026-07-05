"use client";

import { useEffect, useState } from "react";

/* 场之触 · 全站点击水波螺旋
 * 任意点击/触摸处，绽开三圈涟漪 + 一道缓旋的金色螺旋，随后消融。
 * 纯装饰层：pointer-events:none，不影响任何交互。
 */

type Ripple = { id: number; x: number; y: number };

export default function ClickRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;
    let seq = 0;
    const onDown = (e: PointerEvent) => {
      const r = { id: seq++, x: e.clientX, y: e.clientY };
      setRipples((prev) => [...prev.slice(-5), r]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((p) => p.id !== r.id));
      }, 1400);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-40" aria-hidden="true">
      {ripples.map((r) => (
        <div key={r.id} className="absolute" style={{ left: r.x, top: r.y }}>
          <span className="cr-ring" />
          <span className="cr-ring cr-ring-2" />
          <span className="cr-ring cr-ring-3" />
          <svg className="cr-spiral" width="120" height="120" viewBox="0 0 120 120">
            <path
              d="M60 60 m0 -4 a4 4 0 1 1 -4 4 a8 8 0 1 1 8 -8 a14 14 0 1 1 -14 14 a22 22 0 1 1 22 -22 a32 32 0 1 1 -32 32 a44 44 0 1 1 44 -44"
              fill="none"
              stroke="rgba(232,183,101,0.55)"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
        </div>
      ))}
      <style>{`
        .cr-ring {
          position: absolute; left: 0; top: 0;
          width: 12px; height: 12px; margin: -6px 0 0 -6px;
          border-radius: 50%;
          border: 1px solid rgba(124,224,211,0.65);
          animation: cr-expand 1.2s ease-out forwards;
        }
        .cr-ring-2 { border-color: rgba(232,183,101,0.5); animation-delay: .12s; animation-duration: 1.3s; }
        .cr-ring-3 { border-color: rgba(240,234,223,0.35); animation-delay: .24s; animation-duration: 1.4s; }
        @keyframes cr-expand {
          from { transform: scale(0.4); opacity: .9; }
          to   { transform: scale(9);   opacity: 0; }
        }
        .cr-spiral {
          position: absolute; left: -60px; top: -60px;
          animation: cr-swirl 1.4s ease-out forwards;
          transform-origin: 60px 60px;
        }
        @keyframes cr-swirl {
          from { transform: rotate(0deg) scale(.25); opacity: .85; }
          to   { transform: rotate(200deg) scale(1.25); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
