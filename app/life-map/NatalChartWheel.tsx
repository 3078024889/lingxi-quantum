"use client";

import Bi from "@/components/Bi";

// 星盘轮：把已经验证过的七大行星真实黄经，画成传统占星图的样子——
// 外圈十二星座刻度、内圈行星符号按精确角度排布。用的是标准占星符号
// （太阳☉、月亮☽、水星☿、金星♀、火星♂、木星♃、土星♄，以及十二星座符号），
// 国际通用，不是自创图标。

const ZODIAC_GLYPHS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
const ZODIAC_NAMES_ZH = ["白羊", "金牛", "双子", "巨蟹", "狮子", "处女", "天秤", "天蝎", "射手", "摩羯", "水瓶", "双鱼"];

type PlanetPoint = { glyph: string; nameZh: string; nameEn: string; longitude: number; color: string };

export default function NatalChartWheel({
  sunLongitude, moonLongitude,
  mercury, venus, mars, jupiter, saturn,
}: {
  sunLongitude: number; moonLongitude: number;
  mercury: number; venus: number; mars: number; jupiter: number; saturn: number;
}) {
  const points: PlanetPoint[] = [
    { glyph: "☉", nameZh: "太阳", nameEn: "Sun", longitude: sunLongitude, color: "#E7B85C" },
    { glyph: "☽", nameZh: "月亮", nameEn: "Moon", longitude: moonLongitude, color: "#A47ADC" },
    { glyph: "☿", nameZh: "水星", nameEn: "Mercury", longitude: mercury, color: "#5FC79B" },
    { glyph: "♀", nameZh: "金星", nameEn: "Venus", longitude: venus, color: "#E8869E" },
    { glyph: "♂", nameZh: "火星", nameEn: "Mars", longitude: mars, color: "#D9694F" },
    { glyph: "♃", nameZh: "木星", nameEn: "Jupiter", longitude: jupiter, color: "#5A9FDE" },
    { glyph: "♄", nameZh: "土星", nameEn: "Saturn", longitude: saturn, color: "#6E6580" },
  ];

  const cx = 200, cy = 200;
  const outerR = 178;   // 星座刻度环
  const zodiacR = 158;  // 星座符号位置
  const planetRingR = 118; // 行星符号所在环

  // 占星图惯例：0°白羊在左侧（9点钟方向），逆时针（黄经增大方向）排布
  const toXY = (lonDeg: number, r: number) => {
    const angle = 180 - lonDeg; // 0°在左侧，逆时针增大
    const rad = (angle * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
  };

  // 简单避让：行星角度太接近时，径向错开显示，避免符号重叠看不清
  const sorted = [...points].sort((a, b) => a.longitude - b.longitude);
  const adjusted = sorted.map((p, i) => {
    let rOffset = 0;
    if (i > 0) {
      const prev = sorted[i - 1];
      const diff = Math.min(Math.abs(p.longitude - prev.longitude), 360 - Math.abs(p.longitude - prev.longitude));
      if (diff < 8) rOffset = 16;
    }
    return { ...p, r: planetRingR - rOffset };
  });

  return (
    <div className="mx-auto mt-6 max-w-sm">
      <svg viewBox="0 0 400 400" className="mx-auto w-full">
        <defs>
          <radialGradient id="natal-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFDF8" />
            <stop offset="100%" stopColor="#F2ECDF" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={outerR + 8} fill="url(#natal-bg)" stroke="#E0D8C4" strokeWidth="1" />

        {/* 十二星座分界线与刻度环 */}
        {Array.from({ length: 12 }).map((_, i) => {
          const lon = i * 30;
          const { x: x1, y: y1 } = toXY(lon, outerR);
          const { x: x2, y: y2 } = toXY(lon, zodiacR - 14);
          const glyphPos = toXY(lon + 15, zodiacR);
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#D8CDB4" strokeWidth="1" />
              <text x={glyphPos.x} y={glyphPos.y} textAnchor="middle" dominantBaseline="middle" fontSize="15" fill="#8a7f9e">
                {ZODIAC_GLYPHS[i]}
              </text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="#D8CDB4" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={zodiacR - 28} fill="none" stroke="#E5DCC8" strokeWidth="1" />

        {/* 行星连线到黄道环（细线标出精确角度），符号本身径向错开避让 */}
        {adjusted.map((p) => {
          const edge = toXY(p.longitude, zodiacR - 28);
          const dot = toXY(p.longitude, p.r);
          return (
            <g key={p.nameZh}>
              <line x1={edge.x} y1={edge.y} x2={dot.x} y2={dot.y} stroke={p.color} strokeWidth="0.75" opacity="0.5" />
              <circle cx={dot.x} cy={dot.y} r="13" fill="#FFFDF8" stroke={p.color} strokeWidth="1.5" />
              <text x={dot.x} y={dot.y} textAnchor="middle" dominantBaseline="central" fontSize="14" fill={p.color}>
                {p.glyph}
              </text>
            </g>
          );
        })}

        <circle cx={cx} cy={cy} r={3} fill="#8a7f9e" />
      </svg>

      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[11px] text-lm2-text-dim">
        {points.map((p) => (
          <span key={p.nameZh} className="inline-flex items-center gap-1">
            <span style={{ color: p.color }}>{p.glyph}</span>
            <Bi zh={`${p.nameZh} ${ZODIAC_NAMES_ZH[Math.floor(p.longitude / 30)]}座`} en={`${p.nameEn} ${Math.floor(p.longitude / 30) + 1}`} />
          </span>
        ))}
      </div>
    </div>
  );
}
