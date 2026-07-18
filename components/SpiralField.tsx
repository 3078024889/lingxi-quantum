"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// 螺旋黑洞「场」动图：内容被吸入、被光改写。
// active=true 时显示全屏覆盖的旋涡 + 状态文字。
//
// 用 createPortal 直接挂载到 document.body 下——不用 fixed inset-0
// 直接嵌在调用它的组件原本的位置。原因：CSS 里 position:fixed 的元素，
// 如果祖先链上有任何一层带 transform/filter/perspective/will-change
// 这类属性（页面里做动画效果的容器很容易踩上，比如极光背景那几层），
// fixed 元素就不再是相对"浏览器视口"定位，而是被限制在那个祖先节点
// 的框里——效果就是这个"全屏"黑洞旋涡，实际只在页面中间一小块区域
// 里显示，背景其余部分的极光颜色都还亮着，没有真正接管全屏。这个问题
// 很隐蔽，不好一个个排查是哪层容器造成的，用 Portal 直接跳过整条
// 祖先链，保证不管这个组件被套在页面多深的位置，都能真正贴边全屏。
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

  return createPortal(
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
    </div>,
    document.body
  );
}
