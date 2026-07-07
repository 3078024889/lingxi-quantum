// 量子息法呼吸结构 —— 原创：一个小节的四个均等部分
// 吸气「上扬」→ 暂停 → 呼气「展开」→ 暂停
export default function BreathStructure({ className = "" }: { className?: string }) {
  const segments = [
    { label: "吸气", sub: "上扬", color: "#7CE0D3", up: true },
    { label: "暂停", sub: "停留", color: "#5BAAC0", up: false, top: true },
    { label: "呼气", sub: "展开", color: "#7CC79C", up: false },
    { label: "暂停", sub: "静置", color: "#9CB8A0", down: true },
  ];
  const w = 600;
  const segW = w / 4;
  // 呼吸曲线点（吸气上升、暂停保持高、呼气下降、暂停保持低）
  const path = `M0,140 L${segW},40 L${segW * 2},40 L${segW * 3},140 L${segW * 4},140`;

  return (
    <svg viewBox="0 0 600 220" className={className} aria-label="量子息法呼吸结构">
      <defs>
        <linearGradient id="bs-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7CE0D3" />
          <stop offset="50%" stopColor="#E8B765" />
          <stop offset="100%" stopColor="#7CC79C" />
        </linearGradient>
        <filter id="bs-glow"><feGaussianBlur stdDeviation="2" /></filter>
      </defs>

      {/* 分段背景 */}
      {segments.map((s, i) => (
        <g key={i}>
          <rect
            x={i * segW}
            y={0}
            width={segW}
            height={170}
            fill={s.color}
            fillOpacity="0.06"
          />
          <line
            x1={i * segW}
            y1={0}
            x2={i * segW}
            y2={170}
            stroke="#ffffff"
            strokeOpacity="0.08"
          />
          {/* 计数刻度 1234 */}
          {[1, 2, 3, 4].map((n) => (
            <text
              key={n}
              x={i * segW + (segW / 4) * (n - 0.5)}
              y={162}
              fill={s.color}
              fillOpacity="0.6"
              fontSize="9"
              textAnchor="middle"
            >
              {n}
            </text>
          ))}
        </g>
      ))}

      {/* 呼吸曲线 */}
      <path d={path} fill="none" stroke="url(#bs-line)" strokeWidth="2.5" filter="url(#bs-glow)" />

      {/* 沿曲线流动的光点 */}
      <circle r="5" fill="#EDE7DC" filter="url(#bs-glow)">
        <animateMotion dur="11s" repeatCount="indefinite" path={path} />
      </circle>

      {/* 标签 */}
      {segments.map((s, i) => (
        <g key={`l${i}`}>
          <text
            x={i * segW + segW / 2}
            y={192}
            fill={s.color}
            fontSize="15"
            fontWeight="500"
            textAnchor="middle"
          >
            {s.label}
          </text>
          <text
            x={i * segW + segW / 2}
            y={210}
            fill={s.color}
            fillOpacity="0.7"
            fontSize="11"
            textAnchor="middle"
          >
            {s.sub}
          </text>
        </g>
      ))}
    </svg>
  );
}
