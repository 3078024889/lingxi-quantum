"use client";

// 练习挂图：展示完整练习图（用户可长按/右键保存到手机），
// 上方叠加动态光效层（流光、星闪），让静态图"动起来"养眼。
export default function PracticeChart({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <figure className="mx-auto max-w-2xl">
      <div className="relative overflow-hidden rounded-sm border border-white/10">
        {/* 完整练习图 */}
        <img src={src} alt={alt} className="block w-full" />

        {/* 动态光效层（不挡住保存，pointer-events-none） */}
        <div className="pointer-events-none absolute inset-0">
          {/* 缓慢扫过的流光 */}
          <div className="chart-sheen absolute inset-0" />
          {/* 漂浮星点 */}
          <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
            {[...Array(18)].map((_, i) => {
              const left = (i * 53) % 100;
              const top = (i * 37) % 100;
              const dur = 3 + (i % 5);
              return (
                <circle
                  key={i}
                  cx={`${left}%`}
                  cy={`${top}%`}
                  r={(i % 3) * 0.6 + 0.6}
                  fill="#EDE7DC"
                >
                  <animate
                    attributeName="opacity"
                    values="0.1;0.7;0.1"
                    dur={`${dur}s`}
                    begin={`${-i * 0.4}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              );
            })}
          </svg>
        </div>
      </div>

      <figcaption className="mt-4 text-center text-sm leading-7 text-bone-dim/70">
        {alt}
        <span className="mt-1 block text-xs text-lattice/70">
          长按（手机）或右键（电脑）即可保存这张练习图，随时查看
        </span>
      </figcaption>

      <style>{`
        .chart-sheen {
          background: linear-gradient(
            115deg,
            transparent 30%,
            rgba(124, 224, 211, 0.06) 45%,
            rgba(232, 183, 101, 0.10) 50%,
            rgba(124, 224, 211, 0.06) 55%,
            transparent 70%
          );
          background-size: 250% 250%;
          animation: chartSheen 7s ease-in-out infinite;
        }
        @keyframes chartSheen {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }
      `}</style>
    </figure>
  );
}
