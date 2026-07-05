// 健康 · 息 —— 呼吸光环：随呼吸节律扩张收缩的同心圆
export default function GateHealth({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 320" className={className} aria-label="息 · 呼吸光环">
      <defs>
        <radialGradient id="h-bg" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#0c1f1a" />
          <stop offset="100%" stopColor="#06050a" />
        </radialGradient>
        <radialGradient id="h-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7CE0D3" stopOpacity="0.7" />
          <stop offset="60%" stopColor="#7CE0D3" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#7CE0D3" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="320" fill="url(#h-bg)" />

      {[0, 1, 2, 3, 4].map((i) => (
        <circle
          key={i}
          cx="160"
          cy="160"
          r={30 + i * 26}
          fill="none"
          stroke={i % 2 ? "#E8B765" : "#7CE0D3"}
          strokeWidth="1.2"
          strokeOpacity={0.5 - i * 0.06}
        >
          <animate
            attributeName="r"
            values={`${30 + i * 26};${42 + i * 26};${30 + i * 26}`}
            dur="9s"
            begin={`${-i * 0.5}s`}
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
            keyTimes="0;0.5;1"
          />
          <animate
            attributeName="stroke-opacity"
            values={`${0.5 - i * 0.06};${0.8 - i * 0.06};${0.5 - i * 0.06}`}
            dur="9s"
            begin={`${-i * 0.5}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}

      <circle cx="160" cy="160" r="60" fill="url(#h-core)">
        <animate
          attributeName="r"
          values="50;72;50"
          dur="9s"
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
          keyTimes="0;0.5;1"
        />
      </circle>
    </svg>
  );
}
