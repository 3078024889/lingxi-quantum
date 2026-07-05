// 关系 · 络 —— 共振连接网：节点间脉动的连线
export default function GateRelation({ className = "" }: { className?: string }) {
  const nodes = [
    { x: 80, y: 90 }, { x: 220, y: 70 }, { x: 160, y: 150 },
    { x: 70, y: 200 }, { x: 250, y: 180 }, { x: 130, y: 250 },
    { x: 200, y: 240 }, { x: 110, y: 140 },
  ];
  const links = [
    [0, 2], [1, 2], [2, 7], [7, 3], [2, 4], [4, 6], [6, 5], [5, 3], [2, 6], [0, 7],
  ];
  return (
    <svg viewBox="0 0 320 320" className={className} aria-label="络 · 共振连接网">
      <defs>
        <radialGradient id="r-bg" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#10202a" />
          <stop offset="100%" stopColor="#06050a" />
        </radialGradient>
        <filter id="r-glow"><feGaussianBlur stdDeviation="1.6" /></filter>
      </defs>
      <rect width="320" height="320" fill="url(#r-bg)" />

      {/* 连线 */}
      <g stroke="#7CE0D3" strokeWidth="1">
        {links.map(([a, b], i) => (
          <line
            key={i}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            strokeOpacity="0.3"
          >
            <animate
              attributeName="stroke-opacity"
              values="0.08;0.55;0.08"
              dur={`${3 + (i % 4)}s`}
              repeatCount="indefinite"
            />
          </line>
        ))}
      </g>

      {/* 沿线流动的光点 */}
      <g>
        {links.slice(0, 6).map(([a, b], i) => (
          <circle key={i} r="2.5" fill="#E8B765" filter="url(#r-glow)">
            <animate
              attributeName="cx"
              values={`${nodes[a].x};${nodes[b].x}`}
              dur={`${2.5 + i * 0.4}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values={`${nodes[a].y};${nodes[b].y}`}
              dur={`${2.5 + i * 0.4}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </g>

      {/* 节点 */}
      <g filter="url(#r-glow)">
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={i === 2 ? 6 : 4} fill="#7CE0D3">
            <animate
              attributeName="r"
              values={`${i === 2 ? 6 : 4};${i === 2 ? 9 : 6};${i === 2 ? 6 : 4}`}
              dur={`${3 + (i % 3)}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </g>
    </svg>
  );
}
