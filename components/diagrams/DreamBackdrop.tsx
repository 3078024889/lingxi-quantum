// 梦境 · 玄幻高维背景（原创动态）
// 多层旋转的维度环、漂浮光点、极光流，营造世人未见的高维梦境感。
export default function DreamBackdrop({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 440 440" className={className} aria-label="高维梦境">
      <defs>
        <radialGradient id="dr-bg" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#1e1242" />
          <stop offset="45%" stopColor="#120a2e" />
          <stop offset="100%" stopColor="#06040f" />
        </radialGradient>
        <radialGradient id="dr-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EDE7DC" stopOpacity="0.9" />
          <stop offset="30%" stopColor="#C77D9C" stopOpacity="0.6" />
          <stop offset="70%" stopColor="#5B4AC0" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#5B4AC0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dr-aurora" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7CE0D3" stopOpacity="0" />
          <stop offset="50%" stopColor="#C77D9C" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#5B4AC0" stopOpacity="0" />
        </linearGradient>
        <filter id="dr-glow"><feGaussianBlur stdDeviation="3" /></filter>
        <filter id="dr-soft"><feGaussianBlur stdDeviation="6" /></filter>
      </defs>

      <rect width="440" height="440" fill="url(#dr-bg)" />

      {/* 极光流带 */}
      <g filter="url(#dr-soft)" opacity="0.7">
        <path d="M-40,160 Q140,80 240,180 T480,160" fill="none" stroke="url(#dr-aurora)" strokeWidth="40">
          <animate attributeName="d"
            values="M-40,160 Q140,80 240,180 T480,160;M-40,180 Q140,200 240,120 T480,200;M-40,160 Q140,80 240,180 T480,160"
            dur="14s" repeatCount="indefinite" />
        </path>
        <path d="M-40,280 Q160,360 280,260 T480,300" fill="none" stroke="url(#dr-aurora)" strokeWidth="34">
          <animate attributeName="d"
            values="M-40,280 Q160,360 280,260 T480,300;M-40,300 Q160,240 280,340 T480,260;M-40,280 Q160,360 280,260 T480,300"
            dur="18s" repeatCount="indefinite" />
        </path>
      </g>

      {/* 多层维度环 */}
      <g fill="none">
        {[0, 1, 2, 3].map((i) => (
          <ellipse
            key={i}
            cx="220"
            cy="220"
            rx={70 + i * 36}
            ry={28 + i * 14}
            stroke={i % 2 ? "#7CE0D3" : "#C77D9C"}
            strokeOpacity={0.4 - i * 0.06}
            strokeWidth="1.2"
            transform={`rotate(${i * 30} 220 220)`}
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`${i * 30} 220 220`}
              to={`${i * 30 + (i % 2 ? 360 : -360)} 220 220`}
              dur={`${30 + i * 12}s`}
              repeatCount="indefinite"
            />
          </ellipse>
        ))}
      </g>

      {/* 漂浮光点 */}
      <g filter="url(#dr-glow)">
        {[...Array(28)].map((_, i) => {
          const a = (i * 47) % 360;
          const rad = 40 + ((i * 53) % 160);
          const x = 220 + Math.cos((a * Math.PI) / 180) * rad;
          const y = 220 + Math.sin((a * Math.PI) / 180) * rad * 0.6;
          return (
            <circle key={i} cx={x} cy={y} r={(i % 3) * 0.7 + 1} fill={i % 3 ? "#EDE7DC" : "#7CE0D3"} opacity={0.4 + (i % 4) * 0.12}>
              <animate attributeName="opacity" values={`${0.4 + (i % 4) * 0.12};0.08;${0.4 + (i % 4) * 0.12}`} dur={`${3 + (i % 6)}s`} repeatCount="indefinite" />
              <animate attributeName="cy" values={`${y};${y - 8};${y}`} dur={`${5 + (i % 5)}s`} repeatCount="indefinite" />
            </circle>
          );
        })}
      </g>

      {/* 中心梦核 */}
      <circle cx="220" cy="220" r="70" fill="url(#dr-core)">
        <animate attributeName="r" values="60;82;60" dur="8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.7;1;0.7" dur="8s" repeatCount="indefinite" />
      </circle>
      <circle cx="220" cy="220" r="8" fill="#EDE7DC" filter="url(#dr-glow)">
        <animate attributeName="r" values="6;11;6" dur="4s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
