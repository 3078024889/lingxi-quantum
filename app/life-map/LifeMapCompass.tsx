"use client";

import Bi from "@/components/Bi";

// 生命图谱罗盘：七个同心圈层，从内到外，代表不同体系的深度——
// 已经用真实算法验证、接入报告的（底层逻辑/中式命理/紫微斗数/西方占星/玛雅历法/吠陀占星），
// 与尚未接入、仍是未来计划的（外圈"更多体系"），视觉上区分开，不混为一谈。
// 全部用矢量文字渲染，不是图片，不会出现文字歪扭看不清的问题。

type RingNode = { zh: string; en: string; angle: number };
type Ring = { radius: number; color: string; labelZh: string; labelEn: string; nodes: RingNode[]; dashed?: boolean };

const RINGS: Ring[] = [
  {
    radius: 52, color: "#E8B765", labelZh: "底层逻辑", labelEn: "Primordial Matrix",
    nodes: [
      { zh: "阴阳", en: "Yin-Yang", angle: -90 },
      { zh: "五行", en: "Five Elements", angle: -18 },
      { zh: "干支", en: "Stems & Branches", angle: 54 },
      { zh: "十二长生", en: "12 Stages", angle: 126 },
      { zh: "六书", en: "Six Scripts", angle: 198 },
    ],
  },
  {
    radius: 86, color: "#7CE0D3", labelZh: "中式命理 · 已接入", labelEn: "Chinese Destiny · Live",
    nodes: [
      { zh: "四柱八字", en: "Bazi Pillars", angle: -60 },
      { zh: "十神", en: "Ten Gods", angle: 12 },
      { zh: "纳音", en: "Na Yin", angle: 84 },
      { zh: "胎元命宫身宫", en: "Three Palaces", angle: 156 },
      { zh: "大运", en: "Luck Cycles", angle: 228 },
    ],
  },
  {
    radius: 120, color: "#D8A24A", labelZh: "紫微斗数 · 已接入", labelEn: "Ziwei Doushu · Live",
    nodes: [
      { zh: "命宫 · 身宫", en: "Soul · Body Palace", angle: -54 },
      { zh: "十二宫", en: "12 Palaces", angle: 18 },
      { zh: "十四主星", en: "14 Major Stars", angle: 90 },
      { zh: "五行局", en: "Elements Bureau", angle: 162 },
      { zh: "大限", en: "Decade Cycles", angle: 234 },
      { zh: "（iztro算法验证）", en: "(iztro, verified)", angle: 306 },
    ],
  },
  {
    radius: 154, color: "#C9A5D8", labelZh: "西方占星 · 已接入", labelEn: "Western Astrology · Live",
    nodes: [
      { zh: "太阳 · 月亮", en: "Sun · Moon", angle: -36 },
      { zh: "水星 · 金星", en: "Mercury · Venus", angle: 36 },
      { zh: "火星 · 木星", en: "Mars · Jupiter", angle: 108 },
      { zh: "土星", en: "Saturn", angle: 180 },
      { zh: "上升（未来）", en: "Ascendant (soon)", angle: 252 },
    ],
  },
  {
    radius: 188, color: "#8AD8C4", labelZh: "玛雅历法 · 已接入", labelEn: "Maya Calendar · Live",
    nodes: [
      { zh: "Tzolkin 图腾", en: "Tzolkin Sign", angle: 0 },
      { zh: "Tzolkin 数字", en: "Tzolkin Tone", angle: 120 },
      { zh: "Haab（未来）", en: "Haab (soon)", angle: 240 },
    ],
  },
  {
    radius: 220, color: "#6FA8DC", labelZh: "吠陀占星 · 已接入", labelEn: "Vedic Jyotish · Live",
    nodes: [
      { zh: "恒星太阳", en: "Sidereal Sun", angle: -30 },
      { zh: "恒星月亮", en: "Sidereal Moon", angle: 90 },
      { zh: "Lahiri岁差", en: "Lahiri Ayanamsa", angle: 210 },
    ],
  },
  {
    radius: 254, color: "#6a6478", labelZh: "更多体系 · 探索中", labelEn: "More Systems · Exploring", dashed: true,
    nodes: [
      { zh: "七政四余", en: "Seven Regulators", angle: -18 },
      { zh: "奇门遁甲", en: "Qimen Dunjia", angle: 36 },
      { zh: "风水堪舆", en: "Feng Shui", angle: 90 },
      { zh: "六壬 · 太乙", en: "Liu Ren · Tai Yi", angle: 144 },
      { zh: "相学", en: "Physiognomy", angle: 198 },
      { zh: "全球民间占法", en: "Global Folk Omens", angle: 252 },
      { zh: "六爻 · 梅花易数", en: "Six Lines · Plum Blossom", angle: 306 },
    ],
  },
];

const toXY = (r: number, angleDeg: number, cx: number, cy: number) => {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

export default function LifeMapCompass() {
  const cx = 290, cy = 290;
  return (
    <div className="mx-auto mt-16 max-w-3xl px-4">
      <p className="text-center font-display text-sm uppercase tracking-widest2 text-lm-violet">
        <Bi zh="灵犀生命图谱罗盘" en="The Lingxi Life Map Compass" />
      </p>
      <p className="mx-auto mt-2 max-w-md text-center text-xs leading-6 text-bone-dim/60">
        <Bi
          zh="内六圈，是已经用真实算法验证、写进你报告里的体系；最外一圈虚线，是仍在验证中、尚未接入的体系——不会把没核实过的东西，当成已经算好的事实，端给你。"
          en="The inner six rings are systems already verified and written into your report. The outer dashed ring lists systems still being verified — not yet presented as calculated fact."
        />
      </p>
      <svg viewBox="0 0 580 580" className="mx-auto mt-8 w-full max-w-lg">
        <defs>
          <radialGradient id="compass-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1c1430" />
            <stop offset="100%" stopColor="#06050a" />
          </radialGradient>
          <radialGradient id="compass-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff6e8" />
            <stop offset="45%" stopColor="#C9A5D8" />
            <stop offset="100%" stopColor="#C9A5D8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="580" height="580" fill="url(#compass-bg)" />
        {/* 背景星点 */}
        {Array.from({ length: 40 }).map((_, i) => {
          const x = (i * 137.5) % 580;
          const y = (i * 71.3 + 40) % 580;
          const r = 0.5 + (i % 3) * 0.4;
          return <circle key={i} cx={x} cy={y} r={r} fill="#fff6e8" opacity={0.25 + (i % 4) * 0.12} />;
        })}

        {/* 同心圆环 */}
        {RINGS.map((ring) => (
          <circle
            key={ring.radius}
            cx={cx} cy={cy} r={ring.radius}
            fill="none"
            stroke={ring.color}
            strokeWidth={1}
            strokeDasharray={ring.dashed ? "4 5" : undefined}
            opacity={0.5}
          />
        ))}

        {/* 中心核心 */}
        <circle cx={cx} cy={cy} r={30} fill="url(#compass-core)" />
        <circle cx={cx} cy={cy} r={14} fill="#fff6e8" opacity={0.9} />
        <text data-lang="zh" x={cx} y={cy - 40} textAnchor="middle" fontSize="11" fill="#fff6e8" fontFamily="serif" opacity={0.9}>
          灵犀场域
        </text>
        <text data-lang="en" x={cx} y={cy - 40} textAnchor="middle" fontSize="9" fill="#fff6e8" fontFamily="serif" opacity={0.9}>
          The Lingxi Field
        </text>

        {/* 各圈节点 */}
        {RINGS.map((ring) =>
          ring.nodes.map((node, i) => {
            const { x, y } = toXY(ring.radius, node.angle, cx, cy);
            const labelOut = toXY(ring.radius + 15, node.angle, cx, cy);
            const anchor = Math.cos((node.angle * Math.PI) / 180) > 0.15 ? "start" : Math.cos((node.angle * Math.PI) / 180) < -0.15 ? "end" : "middle";
            return (
              <g key={`${ring.radius}-${i}`}>
                <circle cx={x} cy={y} r={2.6} fill={ring.color} opacity={ring.dashed ? 0.55 : 0.95} />
                <text
                  data-lang="zh"
                  x={labelOut.x} y={labelOut.y}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                  fontSize="8.5"
                  fill={ring.dashed ? "#8a8496" : "#EDE7DC"}
                  fontFamily="sans-serif"
                  opacity={ring.dashed ? 0.7 : 0.95}
                >
                  {node.zh}
                </text>
                <text
                  data-lang="en"
                  x={labelOut.x} y={labelOut.y}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                  fontSize="7"
                  fill={ring.dashed ? "#8a8496" : "#EDE7DC"}
                  fontFamily="sans-serif"
                  opacity={ring.dashed ? 0.7 : 0.95}
                >
                  {node.en}
                </text>
              </g>
            );
          })
        )}
      </svg>
      <div className="mx-auto mt-4 flex max-w-md flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] uppercase tracking-widest2 text-bone-dim/60">
        {RINGS.map((ring) => (
          <span key={ring.radius} className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: ring.color, opacity: ring.dashed ? 0.55 : 1 }} />
            <Bi zh={ring.labelZh} en={ring.labelEn} />
          </span>
        ))}
      </div>
    </div>
  );
}
