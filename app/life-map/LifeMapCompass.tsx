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

export default function LifeMapCompass() {
  return (
    <div className="mx-auto mt-16 max-w-3xl px-4">
      <div className="bg-lm2-card mx-auto max-w-lg rounded-sm px-6 py-6">
      <p className="text-center font-display text-sm uppercase tracking-widest2 text-lm2-violet">
        <Bi zh="灵犀生命图谱罗盘" en="The Lingxi Life Map Compass" />
      </p>
      <p className="mx-auto mt-2 max-w-md text-center text-xs leading-6 text-lm2-text-dim">
        <Bi
          zh="这座罗盘，是场域的整体气象——下面这份清单才是准确的数据来源：已经用真实算法验证、写进你报告里的体系，标着「已接入」；还没接入、暂时不会当成算好的事实端给你的，标着「探索中」。"
          en="The compass itself is the field's overall atmosphere — the list below is the accurate data source: systems already verified with real algorithms and written into your report are marked “Live”; systems not yet connected, and not presented to you as calculated fact, are marked “Exploring.”"
        />
      </p>
      </div>
      <div className="relative mx-auto mt-8 aspect-square w-full max-w-lg overflow-hidden rounded-2xl shadow-[0_0_60px_rgba(240,200,104,0.18)]">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/lifemap/compass-poster.jpg"
          className="h-full w-full object-contain"
          aria-label="灵犀生命图谱大罗盘 · Lingxi Life Compass"
        >
          <source src="/images/lifemap/compass.webm" type="video/webm" />
          <source src="/images/lifemap/compass.mp4" type="video/mp4" />
        </video>
      </div>
      {/* 罗盘图是氛围视觉，下面这份体系清单才是准确、可中英切换、
          随算法接入状态更新的真实数据来源——图和数据分开维护。之前这里
          每个体系配一个不同颜色的圆点，暗示视频里也有对应的颜色分区——
          但视频本身是一整支金色调的罗盘动画，没有分色，这个点之前会
          让人误以为图和文字是对应着的。这里改成统一的状态点：金色=
          已接入，灰色=探索中，不再暗示颜色跟视频画面有对应关系。 */}
      <div className="bg-lm2-card mx-auto mt-6 flex max-w-md flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-sm px-6 py-4 text-[11px] uppercase tracking-widest2 text-lm2-text-dim">
        {RINGS.map((ring) => (
          <span key={ring.radius} className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: ring.dashed ? "#8A8496" : "#F0C868" }} />
            <Bi zh={ring.labelZh} en={ring.labelEn} />
          </span>
        ))}
      </div>
    </div>
  );
}
