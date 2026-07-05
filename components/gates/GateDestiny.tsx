// 命运 · 锚 —— 垂直锚定光柱：连接地核与无限的垂直之线
export default function GateDestiny({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 320" className={className} aria-label="锚 · 垂直光柱">
      <defs>
        <radialGradient id="d-bg" cx="50%" cy="55%" r="60%">
          <stop offset="0%" stopColor="#0a1426" />
          <stop offset="100%" stopColor="#06050a" />
        </radialGradient>
        <linearGradient id="d-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7CE0D3" stopOpacity="0" />
          <stop offset="50%" stopColor="#7CE0D3" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#E8B765" stopOpacity="0" />
        </linearGradient>
        <filter id="d-glow"><feGaussianBlur stdDeviation="2" /></filter>
      </defs>
      <rect width="320" height="320" fill="url(#d-bg)" />

      {/* 地平网格 */}
      <g stroke="#3E7C76" strokeOpacity="0.3" strokeWidth="0.7">
        {[...Array(6)].map((_, i) => (
          <ellipse
            key={i}
            cx="160"
            cy="250"
            rx={30 + i * 28}
            ry={8 + i * 6}
            fill="none"
          />
        ))}
      </g>

      {/* 垂直光柱 */}
      <rect x="155" y="20" width="10" height="230" fill="url(#d-beam)" filter="url(#d-glow)">
        <animate
          attributeName="opacity"
          values="0.6;1;0.6"
          dur="4s"
          repeatCount="indefinite"
        />
      </rect>
      <line x1="160" y1="20" x2="160" y2="250" stroke="#EDE7DC" strokeWidth="1.2" strokeOpacity="0.7" />

      {/* 上升光点 */}
      <g filter="url(#d-glow)">
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx="160" r="3" fill="#E8B765">
            <animate
              attributeName="cy"
              values="250;30"
              dur={`${3 + i * 0.6}s`}
              begin={`${-i * 0.8}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              dur={`${3 + i * 0.6}s`}
              begin={`${-i * 0.8}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </g>

      {/* 锚点 */}
      <circle cx="160" cy="250" r="7" fill="#E8B765" filter="url(#d-glow)">
        <animate attributeName="r" values="6;10;6" dur="3s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
