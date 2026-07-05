// 心灵 · 忆 —— 向内螺旋光：旋入中心的记忆螺旋
export default function GateMind({ className = "" }: { className?: string }) {
  // 生成对数螺旋上的点
  const points: { x: number; y: number; r: number }[] = [];
  const turns = 4;
  const total = 80;
  for (let i = 0; i < total; i++) {
    const t = (i / total) * turns * Math.PI * 2;
    const rad = 8 + (i / total) * 140;
    points.push({
      x: 160 + rad * Math.cos(t),
      y: 160 + rad * Math.sin(t),
      r: 0.6 + (1 - i / total) * 2.4,
    });
  }
  return (
    <svg viewBox="0 0 320 320" className={className} aria-label="忆 · 向内螺旋">
      <defs>
        <radialGradient id="m-bg" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#1a1226" />
          <stop offset="100%" stopColor="#06050a" />
        </radialGradient>
        <filter id="m-glow"><feGaussianBlur stdDeviation="1.4" /></filter>
      </defs>
      <rect width="320" height="320" fill="url(#m-bg)" />

      <g filter="url(#m-glow)">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 160 160"
          to="-360 160 160"
          dur="60s"
          repeatCount="indefinite"
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.r}
            fill={i % 5 === 0 ? "#E8B765" : "#C77D9C"}
            opacity={0.3 + (1 - i / points.length) * 0.6}
          >
            <animate
              attributeName="opacity"
              values={`${0.3 + (1 - i / points.length) * 0.6};${
                0.1 + (1 - i / points.length) * 0.3
              };${0.3 + (1 - i / points.length) * 0.6}`}
              dur={`${2 + (i % 5)}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </g>

      <circle cx="160" cy="160" r="6" fill="#EDE7DC" filter="url(#m-glow)">
        <animate
          attributeName="r"
          values="5;9;5"
          dur="3.5s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}
