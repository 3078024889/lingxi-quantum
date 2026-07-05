// 源场结构图（动图）：四源经流动能量线汇入中心意识核；强发光、呼吸、缓转。
// 尊重「减少动效」系统设置（globals.css 已统一处理）。
export default function OriginField({ className = "" }: { className?: string }) {
  const C = 210;
  const nodes = [
    { x: 316, y: 104 },
    { x: 104, y: 104 },
    { x: 104, y: 316 },
    { x: 316, y: 316 },
  ];

  return (
    <svg viewBox="0 0 420 420" className={className} aria-label="源场结构图">
      <defs>
        <radialGradient id="of-bg" cx="50%" cy="50%" r="62%">
          <stop offset="0%" stopColor="#16123a" />
          <stop offset="55%" stopColor="#0b0922" />
          <stop offset="100%" stopColor="#06050a" />
        </radialGradient>
        <radialGradient id="of-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="22%" stopColor="#FBE7B0" />
          <stop offset="48%" stopColor="#7CE0D3" />
          <stop offset="100%" stopColor="#7CE0D3" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="of-node" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#9CF2E6" />
          <stop offset="100%" stopColor="#7CE0D3" stopOpacity="0" />
        </radialGradient>
        <filter id="of-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx={C} cy={C} r="208" fill="url(#of-bg)" />

      {/* 垂直之线 */}
      <line x1={C} y1="14" x2={C} y2="406" stroke="#9CF2E6" strokeOpacity="0.22" strokeWidth="1" />

      {/* 呼吸内环 */}
      <circle className="of-breathe" cx={C} cy={C} r="72" fill="none" stroke="#7CE0D3" strokeOpacity="0.45" strokeWidth="1.2" />
      <circle className="of-breathe of-breathe-2" cx={C} cy={C} r="116" fill="none" stroke="#7CE0D3" strokeOpacity="0.28" strokeWidth="1" />

      {/* 外环：缓转晶格 */}
      <g className="of-spin" style={{ transformOrigin: "210px 210px" }}>
        <circle cx={C} cy={C} r="180" fill="none" stroke="#7CE0D3" strokeOpacity="0.5" strokeWidth="1.1" strokeDasharray="2 10" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <circle key={i} cx={C + 180 * Math.cos(a)} cy={C + 180 * Math.sin(a)} r="2.4" fill="#9CF2E6" fillOpacity="0.85" />;
        })}
      </g>

      {/* 四源 → 中心：流动能量线（发光） */}
      <g filter="url(#of-glow)">
        {nodes.map((n, i) => (
          <line
            key={`l${i}`}
            className="of-flow"
            x1={n.x}
            y1={n.y}
            x2={C}
            y2={C}
            stroke="#9CF2E6"
            strokeOpacity="0.8"
            strokeWidth="1.6"
            strokeDasharray="3 7"
            style={{ animationDelay: `${i * 0.5}s` }}
          />
        ))}
      </g>

      {/* 四源节点（发光） */}
      {nodes.map((n, i) => (
        <g key={`n${i}`} className="of-twinkle" filter="url(#of-glow)" style={{ animationDelay: `${i * 0.7}s` }}>
          <circle cx={n.x} cy={n.y} r="16" fill="url(#of-node)" />
          <circle cx={n.x} cy={n.y} r="4.5" fill="#FFFFFF" />
        </g>
      ))}

      {/* 中心意识核（强发光） */}
      <g filter="url(#of-glow)">
        <circle className="of-pulse" cx={C} cy={C} r="64" fill="url(#of-core)" style={{ transformOrigin: "210px 210px" }} />
      </g>
      <circle cx={C} cy={C} r="22" fill="#06050a" fillOpacity="0.85" />
      <text x={C} y={C + 11} textAnchor="middle" fontSize="30" fill="#FFFFFF" fontFamily="serif">灵</text>

      <style>{`
        .of-spin { animation: of-spin 60s linear infinite; }
        .of-pulse { animation: of-pulse 5s ease-in-out infinite; }
        .of-breathe { animation: of-breathe 8s ease-in-out infinite; transform-origin: 210px 210px; }
        .of-breathe-2 { animation-duration: 11s; }
        .of-flow { animation: of-flow 2.4s linear infinite; }
        .of-twinkle { animation: of-twinkle 3.6s ease-in-out infinite; }
        @keyframes of-spin { to { transform: rotate(360deg); } }
        @keyframes of-pulse { 0%,100% { transform: scale(0.9); opacity: 0.9; } 50% { transform: scale(1.12); opacity: 1; } }
        @keyframes of-breathe { 0%,100% { transform: scale(0.94); opacity: 0.75; } 50% { transform: scale(1.06); opacity: 1; } }
        @keyframes of-flow { to { stroke-dashoffset: -20; } }
        @keyframes of-twinkle { 0%,100% { opacity: 0.55; } 50% { opacity: 1; } }
      `}</style>
    </svg>
  );
}
