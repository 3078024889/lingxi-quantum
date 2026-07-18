"use client";

// 小尺寸的"送入场"动效——跟 components/SpiralField.tsx 是同一套视觉
// 语言的缩小版（黑洞核心 + 光点被吸入），不是另起一套新的转圈动画。
// 之前这里用的是一个跟场域视觉毫无关系的双环旋转spinner，看起来像是
// 随手抓的通用loading组件，跟"点提交后进入螺旋神秘空间"这个场域本身
// 的语言对不上——这次改成SpiralField同一套语言的迷你版，配色
// （白核心+青绿光环+金色）也跟SpiralField保持一致。
//
// 用法：
// - 按钮内联小尺寸（默认）：{loading ? <PortalSpinner /> : "提交"}
//   小到可以直接嵌在按钮文字旁边，不需要接管全屏——真正需要接管全屏
//   的大动作（比如AI生成报告、发送至场），应该直接用 SpiralField 组件
//   本身，不是这个小尺寸版本放大。
export default function PortalSpinner() {
  return (
    <span className="lx-ps-wrap relative inline-block h-5 w-5 shrink-0" aria-hidden="true">
      <span className="lx-ps-dot lx-ps-dot-1" />
      <span className="lx-ps-dot lx-ps-dot-2" />
      <span className="lx-ps-dot lx-ps-dot-3" />
      <span className="lx-ps-core" />
      <style>{`
        .lx-ps-core {
          position: absolute; left: 50%; top: 50%; width: 5px; height: 5px;
          border-radius: 9999px; background: #fff; transform: translate(-50%,-50%);
          box-shadow: 0 0 6px 2px rgba(255,255,255,0.85);
          animation: lx-ps-pulse 1.2s ease-in-out infinite;
        }
        .lx-ps-dot {
          position: absolute; left: 50%; top: 50%; width: 2.5px; height: 2.5px;
          border-radius: 9999px; background: #fff;
          box-shadow: 0 0 4px 1px rgba(156,242,230,0.9);
        }
        .lx-ps-dot-1 { animation: lx-ps-fall 1.1s ease-in infinite; }
        .lx-ps-dot-2 { animation: lx-ps-fall 1.1s ease-in infinite 0.37s; }
        .lx-ps-dot-3 { animation: lx-ps-fall 1.1s ease-in infinite 0.74s; }
        @keyframes lx-ps-fall {
          0%   { opacity: 0; transform: rotate(0deg) translateX(9px) scale(1); }
          15%  { opacity: 1; }
          100% { opacity: 0; transform: rotate(320deg) translateX(0) scale(0.3); }
        }
        @keyframes lx-ps-pulse {
          0%,100% { box-shadow: 0 0 6px 2px rgba(255,255,255,0.85); }
          50%     { box-shadow: 0 0 10px 4px rgba(232,183,101,0.9); }
        }
        @media (prefers-reduced-motion: reduce) {
          .lx-ps-dot-1, .lx-ps-dot-2, .lx-ps-dot-3, .lx-ps-core { animation: none !important; }
        }
      `}</style>
    </span>
  );
}
