import type { TarotIcon } from "@/lib/tarot-data";

// 塔罗卡面空灵插画——不是照片级插画（没有生成图片的工具），是用简单
// 几何符号 + 柔光渐变 + 星点，拼出一张"看起来像这张牌该有的样子"的
// 卡面，跟首页LingxiPortal、螺旋场用的是同一套视觉语言（柔光渐变、
// 细线轨道环、发光小点），22张牌各自配色+图腾不同，一眼能分清楚
// 是哪一张，不是同一个壳换个数字。
export default function TarotCardArt({ c1, c2, icon }: { c1: string; c2: string; icon: TarotIcon }) {
  const gid = `tarot-${icon}`;
  return (
    <svg viewBox="0 0 160 220" className="h-full w-full">
      <defs>
        <radialGradient id={`${gid}-bg`} cx="50%" cy="38%" r="65%">
          <stop offset="0%" stopColor={c1} stopOpacity="0.55" />
          <stop offset="55%" stopColor={c2} stopOpacity="0.22" />
          <stop offset="100%" stopColor="#0f1a30" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="160" height="220" fill={`url(#${gid}-bg)`} />

      {[[18, 24], [140, 30], [24, 190], [136, 176], [80, 14], [12, 110], [148, 108]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 === 0 ? 1.4 : 0.9} fill="#fff" opacity="0.7" />
      ))}

      <circle cx="80" cy="105" r="58" fill="none" stroke={c1} strokeOpacity="0.22" strokeWidth="0.75" />

      <g transform="translate(80,105)" stroke={c2} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <TarotIconGlyph icon={icon} c1={c1} c2={c2} />
      </g>
    </svg>
  );
}

function TarotIconGlyph({ icon, c1, c2 }: { icon: TarotIcon; c1: string; c2: string }) {
  switch (icon) {
    case "trail":
      return <>{[-30, -12, 6, 24].map((x, i) => <circle key={i} cx={x} cy={-x * 0.4} r={2 + i * 0.8} fill={c1} stroke="none" opacity={0.5 + i * 0.15} />)}</>;
    case "infinity":
      return <path d="M -22,0 C -22,-14 -6,-14 0,0 C 6,14 22,14 22,0 C 22,-14 6,-14 0,0 C -6,14 -22,14 -22,0 Z" />;
    case "crescent":
      return <><path d="M 10,-24 A 24 24 0 1 0 10,24 A 18 18 0 1 1 10,-24 Z" fill={c2} stroke="none" opacity="0.85" /><line x1="-34" y1="-30" x2="-34" y2="30" /><line x1="34" y1="-30" x2="34" y2="30" /></>;
    case "bloom":
      return <>{Array.from({ length: 6 }).map((_, i) => { const a = (i * 60 * Math.PI) / 180; return <ellipse key={i} cx={Math.cos(a) * 16} cy={Math.sin(a) * 16} rx="10" ry="5" transform={`rotate(${i * 60} ${Math.cos(a) * 16} ${Math.sin(a) * 16})`} fill={c2} stroke="none" opacity="0.55" />; })}<circle r="6" fill={c1} stroke="none" /></>;
    case "throne":
      return <><rect x="-22" y="-24" width="44" height="44" rx="2" /><line x1="-22" y1="-6" x2="22" y2="-6" opacity="0.5" /></>;
    case "pillars":
      return <><rect x="-26" y="-30" width="12" height="60" rx="2" /><rect x="14" y="-30" width="12" height="60" rx="2" /><line x1="-30" y1="-30" x2="30" y2="-30" /></>;
    case "venn":
      return <><circle cx="-12" cy="0" r="20" /><circle cx="12" cy="0" r="20" /></>;
    case "chariot":
      return <><path d="M -26,10 L -6,10 L -16,-14 Z" fill={c1} stroke="none" opacity="0.6" /><path d="M 26,10 L 6,10 L 16,-14 Z" fill={c2} stroke="none" opacity="0.6" /><line x1="-16" y1="10" x2="16" y2="10" /></>;
    case "wave":
      return <path d="M -32,4 C -20,-14 -8,18 4,0 C 16,-18 28,14 32,4" />;
    case "lantern":
      return <><circle r="8" fill={c1} stroke="none" /><circle r="22" fill="none" strokeOpacity="0.35" />{Array.from({ length: 8 }).map((_, i) => { const a = (i * 45 * Math.PI) / 180; return <line key={i} x1={Math.cos(a) * 12} y1={Math.sin(a) * 12} x2={Math.cos(a) * 20} y2={Math.sin(a) * 20} opacity="0.5" />; })}</>;
    case "wheel":
      return <><circle r="24" />{Array.from({ length: 8 }).map((_, i) => { const a = (i * 45 * Math.PI) / 180; return <line key={i} x1="0" y1="0" x2={Math.cos(a) * 24} y2={Math.sin(a) * 24} opacity="0.6" />; })}</>;
    case "scales":
      return <><line x1="0" y1="-26" x2="0" y2="20" /><line x1="-28" y1="-16" x2="28" y2="-16" /><path d="M -28,-16 A 12 12 0 0 0 -40,-4 M -28,-16 A 12 12 0 0 1 -16,-4" opacity="0.7" /><path d="M 28,-16 A 12 12 0 0 0 16,-4 M 28,-16 A 12 12 0 0 1 40,-4" opacity="0.7" /></>;
    case "invert":
      return <path d="M -22,-16 L 22,-16 L 0,20 Z" />;
    case "spiral":
      return <path d="M 0,-26 A 26 26 0 1 1 -18,-18 A 16 16 0 1 0 -4,-4 A 8 8 0 1 1 4,4" />;
    case "streams":
      return <><path d="M -20,-24 C -8,-10 -8,10 -20,24" /><path d="M 20,-24 C 8,-10 8,10 20,24" opacity="0.6" /></>;
    case "invertTriangle":
      return <><path d="M -20,-18 L 20,-18 L 0,14 Z" opacity="0.85" /><circle cy="18" r="5" fill={c1} stroke="none" /></>;
    case "lightning":
      return <path d="M -6,-28 L 8,-4 L -4,-2 L 10,28" />;
    case "starburst":
      return <>{Array.from({ length: 7 }).map((_, i) => { const a = (i * (360 / 7) * Math.PI) / 180; return <line key={i} x1="0" y1="0" x2={Math.cos(a) * 26} y2={Math.sin(a) * 26} />; })}<circle r="5" fill={c1} stroke="none" /></>;
    case "moon":
      return <><path d="M 10,-22 A 22 22 0 1 0 10,22 A 16 16 0 1 1 10,-22 Z" fill={c2} stroke="none" opacity="0.85" /><path d="M -30,26 Q -18,18 -6,26 T 18,26" opacity="0.4" /></>;
    case "sunrays":
      return <>{Array.from({ length: 10 }).map((_, i) => { const a = (i * 36 * Math.PI) / 180; return <line key={i} x1={Math.cos(a) * 16} y1={Math.sin(a) * 16} x2={Math.cos(a) * 27} y2={Math.sin(a) * 27} />; })}<circle r="13" fill={c1} stroke="none" /></>;
    case "trumpet":
      return <>{[-24, -12, 0, 12, 24].map((x, i) => <line key={i} x1={x * 0.4} y1="18" x2={x} y2="-24" opacity={0.9 - Math.abs(i - 2) * 0.15} />)}</>;
    case "wreath":
      return <><circle r="26" /><circle r="26" strokeDasharray="2 6" opacity="0.5" transform="rotate(15)" /></>;
    default:
      return <circle r="10" fill={c1} stroke="none" />;
  }
}
