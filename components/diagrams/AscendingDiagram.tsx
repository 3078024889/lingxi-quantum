// 升维心经 · 节律路径图（原创动态）
// 清明之源（顶）→ 降入人体 → 汇聚点（心脏下方），金色降入
// 呼气沿舒展轴向外展开。坐姿人形 + 中英文标注。
export default function AscendingDiagram({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 440 720" className={className} aria-label="升维心经节律路径">
      <defs>
        <radialGradient id="ah-bg" cx="50%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#3a2410" />
          <stop offset="45%" stopColor="#1a1206" />
          <stop offset="100%" stopColor="#0a0604" />
        </radialGradient>
        <radialGradient id="ah-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF4D6" />
          <stop offset="35%" stopColor="#F4C97A" />
          <stop offset="70%" stopColor="#E8943A" />
          <stop offset="100%" stopColor="#E8943A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ah-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF4D6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#E8B765" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="ah-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8B765" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#E8B765" stopOpacity="0.06" />
        </linearGradient>
        <filter id="ah-glow"><feGaussianBlur stdDeviation="2.6" /></filter>
      </defs>

      <rect width="440" height="720" fill="url(#ah-bg)" />

      {/* 金色光尘 */}
      <g fill="#FFF4D6">
        {[...Array(40)].map((_, i) => {
          const x = (i * 83) % 440;
          const y = (i * 113) % 700;
          return (
            <circle key={i} cx={x} cy={y} r={(i % 3) * 0.4 + 0.3} opacity={0.12 + (i % 4) * 0.07}>
              <animate attributeName="opacity" values={`${0.12 + (i % 4) * 0.07};0.03;${0.12 + (i % 4) * 0.07}`} dur={`${3 + (i % 5)}s`} repeatCount="indefinite" />
            </circle>
          );
        })}
      </g>

      {/* 清明之源（顶部） */}
      <circle cx="220" cy="80" r="46" fill="url(#ah-sun)">
        <animate attributeName="r" values="42;52;42" dur="6s" repeatCount="indefinite" />
      </circle>
      <g stroke="#FFF4D6" strokeWidth="1.5" strokeOpacity="0.6">
        {[...Array(12)].map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          return (
            <line key={i} x1={220 + Math.cos(a) * 48} y1={80 + Math.sin(a) * 48} x2={220 + Math.cos(a) * 60} y2={80 + Math.sin(a) * 60}>
              <animate attributeName="stroke-opacity" values="0.2;0.7;0.2" dur={`${3 + (i % 4)}s`} repeatCount="indefinite" />
            </line>
          );
        })}
      </g>
      <text x="220" y="150" fill="#FFF4D6" fillOpacity="0.8" fontSize="11" textAnchor="middle">清明之源 · Source of Clarity</text>

      {/* 垂直光柱（太阳→人体） */}
      <rect x="216" y="120" width="8" height="400" fill="url(#ah-beam)" filter="url(#ah-glow)">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="5s" repeatCount="indefinite" />
      </rect>

      {/* 金色降入光点 */}
      <g filter="url(#ah-glow)">
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx="220" r="4" fill="#FFF4D6">
            <animate attributeName="cy" values="130;470" dur={`${3.5 + i * 0.5}s`} begin={`${-i * 0.9}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;1;0" dur={`${3.5 + i * 0.5}s`} begin={`${-i * 0.9}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>

      {/* 坐姿人形（盘腿打坐轮廓） */}
      <g>
        {/* 头 */}
        <circle cx="220" cy="250" r="28" fill="url(#ah-body)" stroke="#E8B765" strokeOpacity="0.6" strokeWidth="1.2" />
        {/* 躯干（上宽下盘坐） */}
        <path
          d="M220 278 C192 281 182 302 186 330 L188 400 C150 430 130 470 196 478 L244 478 C310 470 290 430 252 400 L254 330 C258 302 248 281 220 278 Z"
          fill="url(#ah-body)"
          stroke="#E8B765"
          strokeOpacity="0.5"
          strokeWidth="1.2"
        />
        {/* 舒展轴（水平，呼气展开） */}
        <line x1="80" y1="360" x2="360" y2="360" stroke="#7CE0D3" strokeWidth="2" strokeOpacity="0.5" filter="url(#ah-glow)">
          <animate attributeName="stroke-opacity" values="0.25;0.6;0.25" dur="5s" repeatCount="indefinite" />
        </line>
        {/* 向外绽放光点 */}
        <g filter="url(#ah-glow)">
          {[0, 1].map((i) => (
            <g key={i}>
              <circle cx="220" cy="360" r="3.5" fill="#7CE0D3">
                <animate attributeName="cx" values="220;100" dur={`${4 + i}s`} begin={`${-i * 2}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0" dur={`${4 + i}s`} begin={`${-i * 2}s`} repeatCount="indefinite" />
              </circle>
              <circle cx="220" cy="360" r="3.5" fill="#7CE0D3">
                <animate attributeName="cx" values="220;340" dur={`${4 + i}s`} begin={`${-i * 2}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0" dur={`${4 + i}s`} begin={`${-i * 2}s`} repeatCount="indefinite" />
              </circle>
            </g>
          ))}
        </g>

        {/* 松果腺 */}
        <circle cx="220" cy="244" r="5" fill="#C77D9C" filter="url(#ah-glow)">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="4s" repeatCount="indefinite" />
        </circle>
        {/* 胸腺/上升之心 */}
        <circle cx="220" cy="330" r="6" fill="#C77D9C" filter="url(#ah-glow)">
          <animate attributeName="r" values="5;8;5" dur="4s" repeatCount="indefinite" />
        </circle>
        {/* 心脏 */}
        <circle cx="220" cy="360" r="6" fill="#7CC79C" filter="url(#ah-glow)">
          <animate attributeName="r" values="5;8;5" dur="4s" begin="-1s" repeatCount="indefinite" />
        </circle>
        {/* 汇聚点（金色，心脏下方） */}
        <circle cx="220" cy="395" r="9" fill="#F4C97A" filter="url(#ah-glow)">
          <animate attributeName="r" values="7;12;7" dur="3.5s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* 标注（中英文） */}
      <g fontSize="11" fill="#E8B765" fillOpacity="0.85">
        <text x="254" y="246">松果腺 · Pineal</text>
        <text x="254" y="332">升维之心 · Ascending Heart</text>
        <text x="254" y="362">心脏 · Heart</text>
        <text x="254" y="398">汇聚点 · Convergence Point</text>
      </g>
      <g fontSize="11" fill="#7CE0D3" fillOpacity="0.8">
        <text x="296" y="352">舒展轴 · Extension Axis</text>
      </g>
    </svg>
  );
}
