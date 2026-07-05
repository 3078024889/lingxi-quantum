// 心的重置 · 能量路径图（原创动态）
// 由心发出绿色光 → 上升 → 充满整个头部
// 人体上半身 + 中英文标注。
export default function HeartResetDiagram({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 440 620" className={className} aria-label="心的重置能量路径">
      <defs>
        <radialGradient id="hr-bg" cx="50%" cy="40%" r="75%">
          <stop offset="0%" stopColor="#0c2018" />
          <stop offset="55%" stopColor="#08140e" />
          <stop offset="100%" stopColor="#040a08" />
        </radialGradient>
        <radialGradient id="hr-head" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#9CF0B4" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#4FBF7A" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#2E8B57" stopOpacity="0.1" />
        </radialGradient>
        <radialGradient id="hr-heart" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#9CF0B4" />
          <stop offset="60%" stopColor="#4FBF7A" />
          <stop offset="100%" stopColor="#2E8B57" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hr-beam" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#4FBF7A" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#9CF0B4" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="hr-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4FBF7A" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#4FBF7A" stopOpacity="0.06" />
        </linearGradient>
        <filter id="hr-glow"><feGaussianBlur stdDeviation="2.6" /></filter>
      </defs>

      <rect width="440" height="620" fill="url(#hr-bg)" />

      {/* 绿色光尘 */}
      <g fill="#9CF0B4">
        {[...Array(36)].map((_, i) => {
          const x = (i * 89) % 440;
          const y = (i * 109) % 600;
          return (
            <circle key={i} cx={x} cy={y} r={(i % 3) * 0.4 + 0.3} opacity={0.1 + (i % 4) * 0.06}>
              <animate attributeName="opacity" values={`${0.1 + (i % 4) * 0.06};0.03;${0.1 + (i % 4) * 0.06}`} dur={`${3 + (i % 5)}s`} repeatCount="indefinite" />
            </circle>
          );
        })}
      </g>

      {/* 头部（被绿光充满） */}
      <g>
        <circle cx="220" cy="180" r="62" fill="url(#hr-head)">
          <animate attributeName="opacity" values="0.55;1;0.55" dur="5s" repeatCount="indefinite" />
        </circle>
        <circle cx="220" cy="180" r="50" fill="none" stroke="#9CF0B4" strokeOpacity="0.5" strokeWidth="1.2" />
        {/* 头部轮廓 */}
        <circle cx="220" cy="180" r="42" fill="url(#hr-body)" stroke="#4FBF7A" strokeOpacity="0.6" strokeWidth="1.4" />
        {/* 充盈脉冲 */}
        {[0, 1, 2].map((i) => (
          <circle key={i} cx="220" cy="180" r="20" fill="none" stroke="#9CF0B4" strokeOpacity="0.4" strokeWidth="1">
            <animate attributeName="r" values="14;46" dur="4s" begin={`${-i * 1.3}s`} repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.5;0" dur="4s" begin={`${-i * 1.3}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>

      {/* 颈 + 上身躯干 */}
      <g>
        <path d="M206 232 L206 250 C206 250 196 256 192 270 L184 360 C182 388 198 400 220 402 C242 400 258 388 256 360 L248 270 C244 256 234 250 234 250 L234 232 Z" fill="url(#hr-body)" stroke="#4FBF7A" strokeOpacity="0.5" strokeWidth="1.2" />
      </g>

      {/* 心发出的绿光柱（心→头） */}
      <rect x="216" y="180" width="8" height="180" fill="url(#hr-beam)" filter="url(#hr-glow)">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="4s" repeatCount="indefinite" />
      </rect>

      {/* 上升的绿光点（心→头） */}
      <g filter="url(#hr-glow)">
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx="220" r="4" fill="#9CF0B4">
            <animate attributeName="cy" values="345;180" dur={`${3 + i * 0.4}s`} begin={`${-i * 0.7}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;1;0" dur={`${3 + i * 0.4}s`} begin={`${-i * 0.7}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>

      {/* 心脏（绿光源头） */}
      <circle cx="220" cy="345" r="16" fill="url(#hr-heart)" filter="url(#hr-glow)">
        <animate attributeName="r" values="13;20;13" dur="3.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="220" cy="345" r="6" fill="#9CF0B4" filter="url(#hr-glow)" />

      {/* 标注 */}
      <g fontSize="12" fill="#9CF0B4" fillOpacity="0.9">
        <text x="270" y="180">头部 · Head</text>
        <text x="244" y="348">心 · Heart</text>
      </g>
      <text x="220" y="440" fill="#4FBF7A" fillOpacity="0.85" fontSize="12" textAnchor="middle">
        由心发出绿光，充满整个头部
      </text>
      <text x="220" y="460" fill="#4FBF7A" fillOpacity="0.6" fontSize="10" textAnchor="middle">
        Green light rises from the heart, filling the head
      </text>
    </svg>
  );
}
