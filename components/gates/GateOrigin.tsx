// 出身 · 源 —— 星门光涡：从中心源点向外旋出的光尘
export default function GateOrigin({ className = "" }: { className?: string }) {
  const arms = [0, 60, 120, 180, 240, 300];
  return (
    <svg viewBox="0 0 320 320" className={className} aria-label="源 · 星门光涡">
      <defs>
        <radialGradient id="o-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EDE7DC" stopOpacity="0.9" />
          <stop offset="25%" stopColor="#C77D9C" stopOpacity="0.5" />
          <stop offset="70%" stopColor="#3E2740" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#06050a" stopOpacity="0" />
        </radialGradient>
        <filter id="o-glow"><feGaussianBlur stdDeviation="2" /></filter>
      </defs>
      <rect width="320" height="320" fill="#0a0710" />
      <circle cx="160" cy="160" r="150" fill="url(#o-core)" />

      {/* 旋臂光尘 */}
      <g>
        {arms.map((a, i) => (
          <g key={i} transform={`rotate(${a} 160 160)`}>
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`${a} 160 160`}
                to={`${a + 360} 160 160`}
                dur="48s"
                repeatCount="indefinite"
              />
              {[...Array(9)].map((_, j) => {
                const r = 26 + j * 15;
                const op = 0.7 - j * 0.06;
                return (
                  <circle
                    key={j}
                    cx={160 + r}
                    cy={160 - j * 6}
                    r={2.4 - j * 0.15}
                    fill="#E8B765"
                    opacity={op}
                    filter="url(#o-glow)"
                  >
                    <animate
                      attributeName="opacity"
                      values={`${op};${op * 0.3};${op}`}
                      dur={`${3 + j * 0.3}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                );
              })}
            </g>
          </g>
        ))}
      </g>

      {/* 中心源点脉动 */}
      <circle cx="160" cy="160" r="10" fill="#EDE7DC" filter="url(#o-glow)">
        <animate
          attributeName="r"
          values="8;14;8"
          dur="4s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.8;1;0.8"
          dur="4s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}
