// 远古符文图标——每个导航项配一个手绘线条符文，不是随手挑的 icon 库图案。
// 造型逻辑跟对应板块的内核呼应：
//   eye     意识显化——观测本身即创造
//   mandala 生命图谱——星盘/命盘的同心结构
//   crescent 探索梦境——夜与潜意识的古老符号
//   flame   修炼技术——呼吸/内在火
//   spiral  重塑潜意识——向内收束的螺旋，改写的动作感
//   infinity 多维叙事——维度之间的往复通道
//   compass 探索——導向、未知领域的探勘
//   crystal 能量交换场——凝结的能量结构
//   figure  场域入口（账户）——小金人，郑重的、值得被看见的一个入口
// 统一用 currentColor 线条 + rune-breathe 呼吸光，颜色由外层文字色决定，
// 不需要额外传色值，跟随所在按钮的 hover 状态自然变化。
export type RuneKind =
  | "eye" | "mandala" | "crescent" | "flame"
  | "spiral" | "infinity" | "compass" | "crystal" | "mark" | "figure";

const paths: Record<RuneKind, JSX.Element> = {
  eye: (
    <g fill="none" stroke="currentColor" strokeWidth="1.1">
      <path d="M2 12c2.8-4.5 6.4-6.5 10-6.5S19.2 7.5 22 12c-2.8 4.5-6.4 6.5-10 6.5S4.8 16.5 2 12Z" />
      <circle cx="12" cy="12" r="2.6" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" />
    </g>
  ),
  mandala: (
    <g fill="none" stroke="currentColor" strokeWidth="1.1">
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <line key={a} x1="12" y1="12" x2={12 + 8.5 * Math.cos((a * Math.PI) / 180)} y2={12 + 8.5 * Math.sin((a * Math.PI) / 180)} />
      ))}
      <circle cx="12" cy="12" r="0.9" fill="currentColor" />
    </g>
  ),
  crescent: (
    <g fill="none" stroke="currentColor" strokeWidth="1.1">
      <path d="M15.5 4.2A8.5 8.5 0 1 0 15.5 19.8 7 7 0 0 1 15.5 4.2Z" />
      <circle cx="18.5" cy="6" r="0.7" fill="currentColor" stroke="none" />
    </g>
  ),
  flame: (
    <g fill="none" stroke="currentColor" strokeWidth="1.1">
      <path d="M12 3.5c1.4 2.7-.4 4-.4 6.2 0 1.4 1 2.3 1 2.3s1.8-1.6 1.8-3.6c2 2 3.1 4.4 3.1 6.6 0 3.5-2.7 6-5.5 6s-5.5-2.3-5.5-5.8c0-4.4 3.4-6.6 5.5-11.7Z" />
    </g>
  ),
  spiral: (
    <g fill="none" stroke="currentColor" strokeWidth="1.1">
      <path d="M12 12a2 2 0 1 1-2-2 3.6 3.6 0 0 1 3.6 3.6A5.2 5.2 0 0 1 8.4 18.8 6.8 6.8 0 0 1 1.9 12a8.4 8.4 0 0 1 8.1-8.1" />
    </g>
  ),
  infinity: (
    <g fill="none" stroke="currentColor" strokeWidth="1.1">
      <path d="M7 8.5a3.5 3.5 0 1 0 0 7c2.8 0 3.3-2.2 5-4.2M17 8.5a3.5 3.5 0 1 1 0 7c-2.8 0-3.3-2.2-5-4.2" />
    </g>
  ),
  compass: (
    <g fill="none" stroke="currentColor" strokeWidth="1.1">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M14.6 9.4 13 13l-3.6 1.6L11 11l3.6-1.6Z" />
    </g>
  ),
  crystal: (
    <g fill="none" stroke="currentColor" strokeWidth="1.1">
      <path d="M12 2.5 19 8l-2 8.5-5 5-5-5L5 8Z" />
      <path d="M12 2.5V21.5M5 8h14M9 16.5h6" />
    </g>
  ),
  figure: (
    <g fill="none" stroke="currentColor" strokeWidth="1.1">
      <circle cx="12" cy="5.4" r="2.3" />
      <path d="M12 7.7c-2.5 0-4.2 1.7-4.2 4v3.4h1.7L9.1 20h5.8l-.4-4.9h1.7v-3.4c0-2.3-1.7-4-4.2-4Z" />
      <path d="M6.5 21h11" strokeLinecap="round" />
    </g>
  ),
  // LOGO 印记：中心一点星芒 + 外圈双环，呼应品牌图标里"星芒穿环"的构图，
  // 用在站名前，替代原来单一的 ✦ 字符。
  mark: (
    <g fill="none" stroke="currentColor" strokeWidth="0.9">
      <circle cx="12" cy="12" r="9" opacity="0.55" />
      <circle cx="12" cy="12" r="6.2" opacity="0.8" />
      <path d="M12 5v3.4M12 15.6V19M5 12h3.4M15.6 12H19" strokeWidth="1" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </g>
  ),
};

export default function RuneIcon({ kind, className = "h-4 w-4" }: { kind: RuneKind; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`rune-breathe ${className}`} aria-hidden="true">
      {paths[kind]}
    </svg>
  );
}
