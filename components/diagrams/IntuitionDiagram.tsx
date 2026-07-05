// 直觉智能 · 能量路径图（原创动态）
// 地心 → 经过我们的心 → 无限远的无限（∞）
// 强调"经过心"这一中转。人体轮廓 + 中英文标注。
export default function IntuitionDiagram({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 440 720" className={className} aria-label="直觉智能能量路径">
      <defs>
        <radialGradient id="iq-bg" cx="50%" cy="45%" r="78%">
          <stop offset="0%" stopColor="#1a1230" />
          <stop offset="55%" stopColor="#0e0a1e" />
          <stop offset="100%" stopColor="#06040d" />
        </radialGradient>
        <linearGradient id="iq-axis" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EDE7DC" stopOpacity="0.15" />
          <stop offset="45%" stopColor="#C77D9C" stopOpacity="0.9" />
          <stop offset="55%" stopColor="#E8B765" stopOpacity="1" />
          <stop offset="100%" stopColor="#7CE0D3" stopOpacity="0.6" />
        </linearGradient>
        <radialGradient id="iq-earth" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E8B765" />
          <stop offset="35%" stopColor="#C77D3A" />
          <stop offset="70%" stopColor="#3a2752" />
          <stop offset="100%" stopColor="#12081e" />
        </radialGradient>
        <linearGradient id="iq-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C77D9C" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#C77D9C" stopOpacity="0.06" />
        </linearGradient>
        <filter id="iq-glow"><feGaussianBlur stdDeviation="2.4" /></filter>
      </defs>

      <rect width="440" height="720" fill="url(#iq-bg)" />

      {/* 星尘 */}
      <g fill="#EDE7DC">
        {[...Array(42)].map((_, i) => {
          const x = (i * 77) % 440;
          const y = (i * 129) % 700;
          return (
            <circle key={i} cx={x} cy={y} r={(i % 3) * 0.4 + 0.3} opacity={0.12 + (i % 4) * 0.07}>
              <animate attributeName="opacity" values={`${0.12 + (i % 4) * 0.07};0.03;${0.12 + (i % 4) * 0.07}`} dur={`${3 + (i % 5)}s`} repeatCount="indefinite" />
            </circle>
          );
        })}
      </g>

      {/* 无限符号（顶部） */}
      <g transform="translate(220,56)" filter="url(#iq-glow)">
        <path d="M-24,0 C-24,-14 -4,-14 0,0 C4,14 24,14 24,0 C24,-14 4,-14 0,0 C-4,14 -24,14 -24,0 Z" fill="none" stroke="#EDE7DC" strokeWidth="3" strokeOpacity="0.9">
          <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="4s" repeatCount="indefinite" />
        </path>
      </g>
      <text x="220" y="98" fill="#EDE7DC" fillOpacity="0.7" fontSize="11" textAnchor="middle">无限远 · Infinity</text>

      {/* 垂直之线（地心→心→无限） */}
      <rect x="216" y="74" width="8" height="556" fill="url(#iq-axis)" filter="url(#iq-glow)">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="5s" repeatCount="indefinite" />
      </rect>

      {/* 上升光点：地心→心→无限，在心处短暂放大 */}
      <g filter="url(#iq-glow)">
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx="220" r="4" fill="#E8B765">
            <animate attributeName="cy" values="620;278;278;80" keyTimes="0;0.45;0.55;1" dur={`${5 + i * 0.5}s`} begin={`${-i * 1.2}s`} repeatCount="indefinite" />
            <animate attributeName="r" values="4;7;7;4" keyTimes="0;0.45;0.55;1" dur={`${5 + i * 0.5}s`} begin={`${-i * 1.2}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.1;0.5;0.9;1" dur={`${5 + i * 0.5}s`} begin={`${-i * 1.2}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>

      {/* 人体轮廓 */}
      <g>
        <circle cx="220" cy="200" r="26" fill="url(#iq-body)" stroke="#C77D9C" strokeOpacity="0.6" strokeWidth="1.2" />
        <path d="M220 226 C196 229 186 248 189 272 L182 355 C180 372 190 384 198 390 L212 450 L220 454 L228 450 L242 390 C250 384 260 372 258 355 L251 272 C254 248 244 229 220 226 Z" fill="url(#iq-body)" stroke="#C77D9C" strokeOpacity="0.5" strokeWidth="1.2" />
        {/* 心脏（胸腔上部，核心中转，发光最强） */}
        <circle cx="220" cy="278" r="10" fill="#E8B765" filter="url(#iq-glow)">
          <animate attributeName="r" values="8;14;8" dur="3.5s" repeatCount="indefinite" />
        </circle>
        {/* 心脏向外的慈悲涟漪 */}
        {[0, 1, 2].map((i) => (
          <circle key={i} cx="220" cy="278" r="14" fill="none" stroke="#E8B765" strokeOpacity="0.4" strokeWidth="1">
            <animate attributeName="r" values="14;46" dur="4s" begin={`${-i * 1.3}s`} repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.5;0" dur="4s" begin={`${-i * 1.3}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>

      {/* 地球（带地心） */}
      <g transform="translate(220,600)">
        <circle r="60" fill="url(#iq-earth)" />
        <g stroke="#C77D9C" strokeOpacity="0.25" strokeWidth="0.7" fill="none">
          <circle r="60" />
          <ellipse rx="60" ry="22" />
          <ellipse rx="28" ry="60" />
        </g>
        <circle r="9" fill="#E8B765" filter="url(#iq-glow)">
          <animate attributeName="r" values="7;12;7" dur="3.5s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* 标注 */}
      <g fontSize="11" fill="#C77D9C" fillOpacity="0.9">
        <text x="256" y="282">心 · Heart</text>
        <text x="252" y="600">地心 · Earth Core</text>
      </g>
      <text x="220" y="500" fill="#7CE0D3" fillOpacity="0.7" fontSize="11" textAnchor="middle">
        地心 → 经过心 → 无限
      </text>
    </svg>
  );
}
