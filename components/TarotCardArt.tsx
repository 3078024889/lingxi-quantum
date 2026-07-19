import type { TarotIcon } from "@/lib/tarot-data";

// 塔罗卡面插画 v2——第一版用的是几何线条图腾（无限符号、天平、闪电
// 这种简笔画风格），效果不好，看起来像随手画的icon，不像"艺术"。
// 这次整个换掉思路：不再画"图形符号"，改成跟首页LingxiPortal、
// 极光背景同一种语言的星云/极光光雾——用很多层模糊的、颜色不同的
// 光斑叠在一起，做出那种"深空中一团发光云雾"的质感，每张牌靠配色+
// 云雾的聚散位置区分，不是靠一个清晰的线条图标。这是在"没有生图
// 工具、画不出具象插画"这个真实限制下，能做到的最接近"有质感的
// 艺术"而不是"简笔画icon"的方案——用抽象的光影氛围，而不是具象符号，
// 来承载"这张牌专属的样子"。
//
// 每张牌的云雾聚散位置，用卡片key做一个简单的确定性哈希算出来，
// 22张牌各自的构图会不一样，但同一张牌每次渲染都是同样的构图
// （不是每次刷新都变，那样反而没有"这张牌该有的样子"这种识别度）。
function seedFrom(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h;
}

export default function TarotCardArt({ c1, c2, icon }: { c1: string; c2: string; icon: TarotIcon }) {
  const seed = seedFrom(icon);
  const rand = (n: number, spread: number, offset = 0) => offset + (((seed * (n + 7)) % 1000) / 1000) * spread;
  const gid = `tarot-${icon}`;

  // 5朵模糊光云，位置和大小由种子决定，两种主题色交替，营造"深空
  // 星云"的层次感，而不是平铺一片纯色。
  const blobs = Array.from({ length: 5 }).map((_, i) => ({
    cx: rand(i * 3 + 1, 130, 15),
    cy: rand(i * 5 + 2, 190, 10),
    r: 34 + rand(i * 7 + 3, 30),
    color: i % 2 === 0 ? c1 : c2,
    opacity: 0.28 + (rand(i * 11 + 4, 20) / 100),
  }));

  return (
    <svg viewBox="0 0 160 220" className="h-full w-full">
      <defs>
        <filter id={`${gid}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
        <filter id={`${gid}-blur-soft`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <radialGradient id={`${gid}-vignette`} cx="50%" cy="42%" r="75%">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#050b18" stopOpacity="0.75" />
        </radialGradient>
        <radialGradient id={`${gid}-core`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="35%" stopColor={c1} stopOpacity="0.5" />
          <stop offset="100%" stopColor={c1} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 深空底色 */}
      <rect width="160" height="220" fill="#0b1226" />

      {/* 星云光云层 */}
      <g filter={`url(#${gid}-blur)`}>
        {blobs.map((b, i) => (
          <ellipse key={i} cx={b.cx} cy={b.cy} rx={b.r} ry={b.r * 0.8} fill={b.color} opacity={b.opacity} />
        ))}
      </g>

      {/* 中心发光核心，柔光模糊，是"这张牌的灵魂所在"，不是符号，是光本身 */}
      <circle cx="80" cy="98" r="46" fill={`url(#${gid}-core)`} filter={`url(#${gid}-blur-soft)`} />
      <circle cx="80" cy="98" r="6" fill="#fff" opacity="0.95" />

      {/* 细线轨道环，呼应LingxiPortal视觉语言 */}
      <circle cx="80" cy="98" r="64" fill="none" stroke={c2} strokeOpacity="0.25" strokeWidth="0.6" />
      <circle cx="80" cy="98" r="80" fill="none" stroke={c1} strokeOpacity="0.12" strokeWidth="0.6" />

      {/* 星点 */}
      {Array.from({ length: 14 }).map((_, i) => {
        const x = rand(i * 13 + 1, 150, 5);
        const y = rand(i * 17 + 2, 210, 5);
        const r = 0.6 + (rand(i * 19 + 3, 10) / 10);
        return <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={0.35 + rand(i * 23 + 4, 45) / 100} />;
      })}

      {/* 边缘暗角，让中心的光更聚焦，也让卡面四角跟卡壳边框更融合 */}
      <rect width="160" height="220" fill={`url(#${gid}-vignette)`} />
    </svg>
  );
}
