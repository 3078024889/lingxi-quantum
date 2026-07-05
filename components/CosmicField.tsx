// 宇宙人形意识场 —— 原创：巨大的人形轮廓立于地球之上，
// 垂直之线穿过松果腺伸向无限，水平之线环绕地球，全身布满意识节点。
export default function CosmicField({ className = "" }: { className?: string }) {
  // 人形轮廓上的意识节点（沿身体分布）
  const bodyNodes = [
    { x: 160, y: 70 }, { x: 160, y: 92 }, // 头-颈
    { x: 138, y: 120 }, { x: 182, y: 120 }, // 肩
    { x: 160, y: 130 }, { x: 160, y: 160 }, // 胸-心
    { x: 122, y: 150 }, { x: 198, y: 150 }, // 臂
    { x: 160, y: 190 }, // 腹
    { x: 146, y: 230 }, { x: 174, y: 230 }, // 腿
  ];
  return (
    <svg viewBox="0 0 320 340" className={className} aria-label="宇宙人形意识场">
      <defs>
        <radialGradient id="cf-bg" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#141033" />
          <stop offset="55%" stopColor="#0a0820" />
          <stop offset="100%" stopColor="#06050a" />
        </radialGradient>
        <radialGradient id="cf-earth" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a4a4a" />
          <stop offset="70%" stopColor="#0c2630" />
          <stop offset="100%" stopColor="#081018" />
        </radialGradient>
        <linearGradient id="cf-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C77D9C" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#7CE0D3" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#7CE0D3" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="cf-vbeam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EDE7DC" stopOpacity="0" />
          <stop offset="40%" stopColor="#E8B765" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#7CE0D3" stopOpacity="0.2" />
        </linearGradient>
        <filter id="cf-glow"><feGaussianBlur stdDeviation="2" /></filter>
      </defs>

      <rect width="320" height="340" fill="url(#cf-bg)" />

      {/* 背景星尘 */}
      <g fill="#EDE7DC">
        {[...Array(40)].map((_, i) => {
          const x = (i * 53) % 320;
          const y = (i * 97) % 300;
          const r = (i % 3) * 0.4 + 0.4;
          return (
            <circle key={i} cx={x} cy={y} r={r} opacity={0.2 + (i % 4) * 0.1}>
              <animate
                attributeName="opacity"
                values={`${0.2 + (i % 4) * 0.1};${0.05};${0.2 + (i % 4) * 0.1}`}
                dur={`${3 + (i % 5)}s`}
                repeatCount="indefinite"
              />
            </circle>
          );
        })}
      </g>

      {/* 垂直之线（穿过松果腺伸向无限） */}
      <rect x="156" y="0" width="8" height="280" fill="url(#cf-vbeam)" filter="url(#cf-glow)">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="5s" repeatCount="indefinite" />
      </rect>

      {/* 地球 */}
      <g>
        <ellipse cx="160" cy="292" rx="135" ry="42" fill="url(#cf-earth)" />
        {/* 经纬 */}
        <g stroke="#7CE0D3" strokeOpacity="0.3" strokeWidth="0.7" fill="none">
          <ellipse cx="160" cy="292" rx="135" ry="42" />
          <ellipse cx="160" cy="292" rx="90" ry="42" />
          <ellipse cx="160" cy="292" rx="45" ry="42" />
          <line x1="25" y1="292" x2="295" y2="292" />
          <ellipse cx="160" cy="292" rx="135" ry="20" />
        </g>
        {/* 水平之线（从心脏环绕地球）的光环 */}
        <ellipse cx="160" cy="292" rx="135" ry="42" fill="none" stroke="#E8B765" strokeWidth="1.4" strokeOpacity="0.6" strokeDasharray="4 10">
          <animateTransform attributeName="transform" type="rotate" from="0 160 292" to="360 160 292" dur="30s" repeatCount="indefinite" />
        </ellipse>
      </g>

      {/* 巨大人形轮廓 */}
      <g>
        {/* 头 */}
        <circle cx="160" cy="74" r="20" fill="url(#cf-body)" stroke="#7CE0D3" strokeOpacity="0.5" strokeWidth="1" />
        {/* 身体 */}
        <path
          d="M160 94 C140 96 132 110 134 130 L126 185 C124 200 132 210 138 215 L150 250 L160 252 L170 250 L182 215 C188 210 196 200 194 185 L186 130 C188 110 180 96 160 94 Z"
          fill="url(#cf-body)"
          stroke="#7CE0D3"
          strokeOpacity="0.5"
          strokeWidth="1"
        />
        {/* 心脏光点（水平之线起点） */}
        <circle cx="160" cy="150" r="6" fill="#E8B765" filter="url(#cf-glow)">
          <animate attributeName="r" values="5;9;5" dur="4s" repeatCount="indefinite" />
        </circle>
        {/* 松果腺光点（垂直之线穿过点） */}
        <circle cx="160" cy="74" r="4" fill="#EDE7DC" filter="url(#cf-glow)">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="4s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* 身体意识节点脉动 */}
      <g filter="url(#cf-glow)">
        {bodyNodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r="2.2" fill="#7CE0D3">
            <animate
              attributeName="opacity"
              values="0.3;1;0.3"
              dur={`${2.5 + (i % 4)}s`}
              begin={`${-i * 0.3}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </g>
    </svg>
  );
}
