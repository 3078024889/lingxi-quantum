// 量子暂停 · 能量路径图（原创动态）
// 垂直轴：地心 → 人体（松果腺/心脏）→ 无限（∞）
// 水平轴：心脏向外环绕地球
// 中英文标注。优雅人体轮廓 + 流动光能。
export default function BreathDiagram({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 440 720" className={className} aria-label="量子暂停能量路径">
      <defs>
        <radialGradient id="qp-bg" cx="50%" cy="42%" r="75%">
          <stop offset="0%" stopColor="#0e1430" />
          <stop offset="55%" stopColor="#080a1c" />
          <stop offset="100%" stopColor="#05050d" />
        </radialGradient>
        <linearGradient id="qp-axis" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EDE7DC" stopOpacity="0.1" />
          <stop offset="20%" stopColor="#E8B765" stopOpacity="0.9" />
          <stop offset="55%" stopColor="#7CE0D3" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#E8B765" stopOpacity="0.7" />
        </linearGradient>
        <radialGradient id="qp-earth" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E8B765" />
          <stop offset="30%" stopColor="#C77D3A" />
          <stop offset="60%" stopColor="#2a5a52" />
          <stop offset="100%" stopColor="#0c2630" />
        </radialGradient>
        <linearGradient id="qp-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7CE0D3" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#7CE0D3" stopOpacity="0.08" />
        </linearGradient>
        <filter id="qp-glow"><feGaussianBlur stdDeviation="2.4" /></filter>
        <filter id="qp-soft"><feGaussianBlur stdDeviation="1" /></filter>
      </defs>

      <rect width="440" height="720" fill="url(#qp-bg)" />

      {/* 背景星尘 */}
      <g fill="#EDE7DC">
        {[...Array(45)].map((_, i) => {
          const x = (i * 71) % 440;
          const y = (i * 137) % 700;
          return (
            <circle key={i} cx={x} cy={y} r={(i % 3) * 0.4 + 0.4} opacity={0.15 + (i % 4) * 0.08}>
              <animate attributeName="opacity" values={`${0.15 + (i % 4) * 0.08};0.04;${0.15 + (i % 4) * 0.08}`} dur={`${3 + (i % 5)}s`} repeatCount="indefinite" />
            </circle>
          );
        })}
      </g>

      {/* 无限符号 ∞（顶部） */}
      <g transform="translate(220,52)" filter="url(#qp-glow)">
        <path
          d="M-22,0 C-22,-13 -4,-13 0,0 C4,13 22,13 22,0 C22,-13 4,-13 0,0 C-4,13 -22,13 -22,0 Z"
          fill="none"
          stroke="#EDE7DC"
          strokeWidth="3"
          strokeOpacity="0.9"
        >
          <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="4s" repeatCount="indefinite" />
        </path>
      </g>
      <text x="220" y="92" fill="#EDE7DC" fillOpacity="0.7" fontSize="11" textAnchor="middle">无限 · Infinity</text>

      {/* 垂直之线（地心→无限） */}
      <rect x="216" y="70" width="8" height="560" fill="url(#qp-axis)" filter="url(#qp-glow)">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="5s" repeatCount="indefinite" />
      </rect>
      <line x1="220" y1="70" x2="220" y2="630" stroke="#EDE7DC" strokeWidth="1" strokeOpacity="0.5" />

      {/* 上升光点（地心 → 无限，吸气） */}
      <g filter="url(#qp-glow)">
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx="220" r="3.5" fill="#E8B765">
            <animate attributeName="cy" values="620;75" dur={`${4 + i * 0.5}s`} begin={`${-i}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;1;0" dur={`${4 + i * 0.5}s`} begin={`${-i}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>

      {/* 人体轮廓（优雅站姿，张开双臂—水平之线） */}
      <g>
        {/* 头 */}
        <circle cx="220" cy="190" r="26" fill="url(#qp-body)" stroke="#7CE0D3" strokeOpacity="0.6" strokeWidth="1.2" />
        {/* 躯干 */}
        <path
          d="M220 216 C196 219 186 238 189 262 L180 345 C178 362 188 374 196 380 L210 440 L220 444 L230 440 L244 380 C252 374 262 362 260 345 L251 262 C254 238 244 219 220 216 Z"
          fill="url(#qp-body)"
          stroke="#7CE0D3"
          strokeOpacity="0.55"
          strokeWidth="1.2"
        />
        {/* 双臂（水平张开，与心脏同高） */}
        <path d="M196 272 C156 272 120 272 86 272" fill="none" stroke="#7CE0D3" strokeOpacity="0.5" strokeWidth="6" strokeLinecap="round" />
        <path d="M244 272 C284 272 320 272 354 272" fill="none" stroke="#7CE0D3" strokeOpacity="0.5" strokeWidth="6" strokeLinecap="round" />

        {/* 水平之线（心脏向两侧穿过双臂环绕地球）——与心脏、双臂同高 */}
        <line x1="70" y1="272" x2="370" y2="272" stroke="#7CE0D3" strokeWidth="2" strokeOpacity="0.5" filter="url(#qp-soft)">
          <animate attributeName="stroke-opacity" values="0.3;0.7;0.3" dur="5s" repeatCount="indefinite" />
        </line>

        {/* 松果腺光点 */}
        <circle cx="220" cy="184" r="5" fill="#EDE7DC" filter="url(#qp-glow)">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="4s" repeatCount="indefinite" />
        </circle>
        {/* 心脏光点（胸腔上部，双臂展开高度） */}
        <circle cx="220" cy="272" r="8" fill="#E8B765" filter="url(#qp-glow)">
          <animate attributeName="r" values="6;11;6" dur="4s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* 地球（带地心剖面） */}
      <g transform="translate(220,600)">
        <circle r="62" fill="url(#qp-earth)" />
        {/* 经纬 */}
        <g stroke="#7CE0D3" strokeOpacity="0.25" strokeWidth="0.7" fill="none">
          <circle r="62" />
          <ellipse rx="62" ry="24" />
          <ellipse rx="30" ry="62" />
        </g>
        {/* 环绕光环（水平之线绕地球） */}
        <ellipse rx="80" ry="26" fill="none" stroke="#7CE0D3" strokeWidth="1.4" strokeOpacity="0.55" strokeDasharray="4 9">
          <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="28s" repeatCount="indefinite" />
        </ellipse>
        {/* 地心 */}
        <circle r="9" fill="#E8B765" filter="url(#qp-glow)">
          <animate attributeName="r" values="7;12;7" dur="3.5s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* 标注（中英文） */}
      <g fontSize="11" fill="#7CE0D3" fillOpacity="0.85">
        <text x="252" y="188">松果腺 · Pineal</text>
        <text x="252" y="290">心脏 · Heart</text>
        <text x="300" y="246">行星轴 · Planetary</text>
        <text x="252" y="600">地心 · Earth Core</text>
      </g>
      <g fontSize="11" fill="#E8B765" fillOpacity="0.85" textAnchor="end">
        <text x="150" y="258">我是 · I AM</text>
      </g>
      <g fontSize="11" fill="#7CC79C" fillOpacity="0.85">
        <text x="290" y="290">我们是 · WE ARE</text>
      </g>
    </svg>
  );
}
