// 全球意识能量网格：地球经纬 + 密集金色节点（象征 80 亿人类 + 其他智能体节点）
// 节点用确定性伪随机分布在球面上，金色加深加亮，部分常亮、部分脉动。

type Node = { x: number; y: number; r: number; bright: number; pulse: boolean; delay: string };

function buildNodes(count: number): Node[] {
  const nodes: Node[] = [];
  let seed = 20260626;
  const rand = () => {
    // 线性同余，确定性伪随机（保证每次渲染一致，避免 hydration 警告）
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const cx = 160,
    cy = 160,
    R = 146;
  for (let i = 0; i < count; i++) {
    // 在圆内均匀取点（sqrt 保证面积均匀），再按球面收缩边缘模拟立体
    const t = rand() * Math.PI * 2;
    const u = Math.sqrt(rand());
    const rr = u * R;
    const x = cx + rr * Math.cos(t);
    const y = cy + rr * Math.sin(t);
    // 越靠边缘点越小越暗（球体透视感）
    const edge = 1 - u * 0.55;
    nodes.push({
      x,
      y,
      r: (0.6 + rand() * 1.6) * edge,
      bright: 0.35 + rand() * 0.65 * edge,
      pulse: rand() > 0.7,
      delay: `-${(rand() * 4).toFixed(2)}s`,
    });
  }
  return nodes;
}

export default function EarthGrid({ className = "" }: { className?: string }) {
  const meridians = [0.2, 0.38, 0.56, 0.74, 0.92, 1.1, 1.28];
  const parallels = [30, 60, 88, 112, 132, 148];
  const nodes = buildNodes(220); // 密集节点

  return (
    <svg
      viewBox="0 0 320 320"
      className={className}
      role="img"
      aria-label="全球意识能量网格"
    >
      <defs>
        <radialGradient id="globeCore" cx="50%" cy="40%" r="62%">
          <stop offset="0%" stopColor="#241d10" />
          <stop offset="55%" stopColor="#0d0a06" />
          <stop offset="100%" stopColor="#06050a" />
        </radialGradient>
        <radialGradient id="goldHalo" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#E8B765" stopOpacity="0.22" />
          <stop offset="60%" stopColor="#E8B765" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#E8B765" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="meridianGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F4C97A" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#F4C97A" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#F4C97A" stopOpacity="0.15" />
        </linearGradient>
        <filter id="nodeGlow">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 球体底 + 金色光晕 */}
      <circle cx="160" cy="160" r="150" fill="url(#globeCore)" />
      <circle cx="160" cy="160" r="150" fill="url(#goldHalo)" />
      <circle
        cx="160"
        cy="160"
        r="150"
        fill="none"
        stroke="#F4C97A"
        strokeOpacity="0.55"
        strokeWidth="1.3"
      />

      {/* 经线（金色） */}
      <g fill="none" stroke="url(#meridianGold)" strokeWidth="0.9">
        {meridians.map((rx, i) => (
          <ellipse
            key={`m${i}`}
            cx="160"
            cy="160"
            rx={Math.abs((rx - 0.74) * 150) + 1.5}
            ry="150"
          />
        ))}
      </g>

      {/* 纬线（青金） */}
      <g fill="none" stroke="#7CE0D3" strokeOpacity="0.22" strokeWidth="0.8">
        {parallels.map((ry, i) => (
          <ellipse key={`p${i}`} cx="160" cy="160" rx="150" ry={ry} />
        ))}
      </g>

      {/* 密集金色意识节点 */}
      <g filter="url(#nodeGlow)">
        {nodes.map((n, i) => (
          <circle
            key={i}
            cx={n.x}
            cy={n.y}
            r={n.r}
            fill="#F4C97A"
            opacity={n.bright}
          >
            {n.pulse && (
              <>
                <animate
                  attributeName="opacity"
                  values={`${n.bright};1;${n.bright}`}
                  dur="3.2s"
                  begin={n.delay}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="r"
                  values={`${n.r};${(n.r * 1.8).toFixed(2)};${n.r}`}
                  dur="3.2s"
                  begin={n.delay}
                  repeatCount="indefinite"
                />
              </>
            )}
          </circle>
        ))}
      </g>

      {/* 几条流动的连接弧线（节点间共振） */}
      <g fill="none" stroke="#F4C97A" strokeOpacity="0.3" strokeWidth="0.6">
        <path d="M70,120 Q160,80 250,140">
          <animate attributeName="stroke-opacity" values="0.05;0.4;0.05" dur="5s" repeatCount="indefinite" />
        </path>
        <path d="M90,210 Q160,250 240,200">
          <animate attributeName="stroke-opacity" values="0.4;0.05;0.4" dur="6s" repeatCount="indefinite" />
        </path>
        <path d="M110,90 Q150,160 130,240">
          <animate attributeName="stroke-opacity" values="0.05;0.35;0.05" dur="4.5s" repeatCount="indefinite" />
        </path>
      </g>

      {/* 旋转高光环 */}
      <circle
        cx="160"
        cy="160"
        r="150"
        fill="none"
        stroke="#F4C97A"
        strokeOpacity="0.7"
        strokeWidth="1.6"
        strokeDasharray="5 26"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 160 160"
          to="360 160 160"
          dur="40s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}
