// Human Design（人类图）· 门（Gate）计算引擎
//
// 复用项目里已经装好的 astronomy-engine 做真实天文计算，不引入新的重型依赖：
// - 人格（Personality / 意识）：出生那一刻，各大行星的真实黄道经度
// - 设计（Design / 潜意识）：出生前"太阳弧 88 度"那一刻（不是简单的"88天前"，
//   是精确搜索太阳到达"出生时太阳经度 − 88°"那一刻的真实时间，用
//   astronomy-engine 的 SearchSunLongitude 做的，这是 Human Design 官方定义
//   的算法，比"往前推88天"的近似算法精确）
// - 64 门在黄道上的角度表：来自 Human Design 社区公开、通用的 Rave Mandala
//   参照表（门25起于双鱼28°15′，跨0°到白羊3°52′30″，每门固定5.625°，
//   64×5.625°=360°，闭合无误差），是这套系统里事实性的参照数据，跟
//   十二星座度数表性质一样，不是我们自己编的。
//
// 【范围说明，很重要】：这一版只做到"门/闸位（gate）"这一层——门是精确、
// 可复核的天文计算结果。"能量中心是否被定义""人类图类型（生产者/投射者/
// 显示者/反映者）""内在权威"，这几项还需要另一套已验证、完整的"能量中心-
// 门"对照表和"36条通道"对照表才能算准——这两张表如果有遗漏或错误，会导致
// "类型"这个人类图里最重要的结论算错，风险最高，所以这一版先不做，等
// 核实完整数据之后再加，不把没核实过的结论当成算好的事实端出来。

import * as Astronomy from "astronomy-engine";

// ---- 64 门黄道角度表（起点角度，绝对黄经 0°=白羊0°，每门 5.625°）----
// 顺序按黄经从小到大排列，第一个门（17）从 3.875° 开始；门25横跨0°，
// 单独处理（350°~360° 和 0°~3.875° 都算门25）。
const GATE_WHEEL: { gate: number; startDeg: number }[] = [
  { gate: 17, startDeg: 3.875 }, { gate: 21, startDeg: 9.5 }, { gate: 51, startDeg: 15.125 },
  { gate: 42, startDeg: 20.75 }, { gate: 3, startDeg: 26.375 }, { gate: 27, startDeg: 32.0 },
  { gate: 24, startDeg: 37.625 }, { gate: 2, startDeg: 43.25 }, { gate: 23, startDeg: 48.875 },
  { gate: 8, startDeg: 54.5 }, { gate: 20, startDeg: 60.125 }, { gate: 16, startDeg: 65.75 },
  { gate: 35, startDeg: 71.375 }, { gate: 45, startDeg: 77.0 }, { gate: 12, startDeg: 82.625 },
  { gate: 15, startDeg: 88.25 }, { gate: 52, startDeg: 93.875 }, { gate: 39, startDeg: 99.5 },
  { gate: 53, startDeg: 105.125 }, { gate: 62, startDeg: 110.75 }, { gate: 56, startDeg: 116.375 },
  { gate: 31, startDeg: 122.0 }, { gate: 33, startDeg: 127.625 }, { gate: 7, startDeg: 133.25 },
  { gate: 4, startDeg: 138.875 }, { gate: 29, startDeg: 144.5 }, { gate: 59, startDeg: 150.125 },
  { gate: 40, startDeg: 155.75 }, { gate: 64, startDeg: 161.375 }, { gate: 47, startDeg: 167.0 },
  { gate: 6, startDeg: 172.625 }, { gate: 46, startDeg: 178.25 }, { gate: 18, startDeg: 183.875 },
  { gate: 48, startDeg: 189.5 }, { gate: 57, startDeg: 195.125 }, { gate: 32, startDeg: 200.75 },
  { gate: 50, startDeg: 206.375 }, { gate: 28, startDeg: 212.0 }, { gate: 44, startDeg: 217.625 },
  { gate: 1, startDeg: 223.25 }, { gate: 43, startDeg: 228.875 }, { gate: 14, startDeg: 234.5 },
  { gate: 34, startDeg: 240.125 }, { gate: 9, startDeg: 245.75 }, { gate: 5, startDeg: 251.375 },
  { gate: 26, startDeg: 257.0 }, { gate: 11, startDeg: 262.625 }, { gate: 10, startDeg: 268.25 },
  { gate: 58, startDeg: 273.875 }, { gate: 38, startDeg: 279.5 }, { gate: 54, startDeg: 285.125 },
  { gate: 61, startDeg: 290.75 }, { gate: 60, startDeg: 296.375 }, { gate: 41, startDeg: 302.0 },
  { gate: 19, startDeg: 307.625 }, { gate: 13, startDeg: 313.25 }, { gate: 49, startDeg: 318.875 },
  { gate: 30, startDeg: 324.5 }, { gate: 55, startDeg: 330.125 }, { gate: 37, startDeg: 335.75 },
  { gate: 63, startDeg: 341.375 }, { gate: 22, startDeg: 347.0 }, { gate: 36, startDeg: 352.625 },
  { gate: 25, startDeg: 358.25 }, // 门25起点，跨0°
];
const GATE_SPAN = 5.625;
const LINE_SPAN = GATE_SPAN / 6; // 每门6爻，每爻 0.9375°

function longitudeToGateLine(lonDeg: number): { gate: number; line: number } {
  const lon = ((lonDeg % 360) + 360) % 360;
  // 门25特殊处理：358.25°~360° 和 0°~3.875°
  if (lon >= 358.25 || lon < 3.875) {
    const offset = lon >= 358.25 ? lon - 358.25 : lon + (360 - 358.25);
    const line = Math.min(6, Math.floor(offset / LINE_SPAN) + 1);
    return { gate: 25, line };
  }
  for (let i = 0; i < GATE_WHEEL.length - 1; i++) {
    const cur = GATE_WHEEL[i];
    const next = GATE_WHEEL[i + 1];
    if (lon >= cur.startDeg && lon < next.startDeg) {
      const offset = lon - cur.startDeg;
      const line = Math.min(6, Math.floor(offset / LINE_SPAN) + 1);
      return { gate: cur.gate, line };
    }
  }
  return { gate: 25, line: 1 };
}

const BODIES: { key: string; zh: string; en: string; body: Astronomy.Body }[] = [
  { key: "sun", zh: "太阳", en: "Sun", body: Astronomy.Body.Sun },
  { key: "earth", zh: "地球", en: "Earth", body: Astronomy.Body.Sun }, // 地球门=太阳门对宫（+180°），单独处理
  { key: "moon", zh: "月亮", en: "Moon", body: Astronomy.Body.Moon },
  { key: "mercury", zh: "水星", en: "Mercury", body: Astronomy.Body.Mercury },
  { key: "venus", zh: "金星", en: "Venus", body: Astronomy.Body.Venus },
  { key: "mars", zh: "火星", en: "Mars", body: Astronomy.Body.Mars },
  { key: "jupiter", zh: "木星", en: "Jupiter", body: Astronomy.Body.Jupiter },
  { key: "saturn", zh: "土星", en: "Saturn", body: Astronomy.Body.Saturn },
  { key: "uranus", zh: "天王星", en: "Uranus", body: Astronomy.Body.Uranus },
  { key: "neptune", zh: "海王星", en: "Neptune", body: Astronomy.Body.Neptune },
  { key: "pluto", zh: "冥王星", en: "Pluto", body: Astronomy.Body.Pluto },
];

function bodyLongitude(body: Astronomy.Body, date: Date): number {
  if (body === Astronomy.Body.Sun) {
    return Astronomy.SunPosition(date).elon;
  }
  if (body === Astronomy.Body.Moon) {
    return Astronomy.EclipticGeoMoon(date).lon;
  }
  const vec = Astronomy.GeoVector(body, date, false);
  return Astronomy.Ecliptic(vec).elon;
}

export type GateActivation = { key: string; zh: string; en: string; gate: number; line: number; longitude: number };

export type HumanDesignResult = {
  personality: GateActivation[]; // 意识（黑）：出生那一刻
  design: GateActivation[];      // 潜意识（红）：出生前太阳弧88度那一刻
  designDate: Date;
  sunConsciousGate: number;      // 太阳门（意识）——占人格印记约70%权重，是HD里最重要的单一信息
  sunUnconsciousGate: number;    // 太阳门（潜意识）
};

export function computeHumanDesign(birthUTC: Date): HumanDesignResult {
  const sunLonAtBirth = ((Astronomy.SunPosition(birthUTC).elon % 360) + 360) % 360;
  const targetLon = ((sunLonAtBirth - 88) % 360 + 360) % 360;

  // 从出生前约100天开始，向前搜索太阳到达"出生太阳经度-88°"的精确时刻——
  // 这是 Human Design 官方"设计"时刻的定义，比粗略的"88天前"更准确。
  const searchStart = new Date(birthUTC.getTime() - 100 * 24 * 3600 * 1000);
  const found = Astronomy.SearchSunLongitude(targetLon, searchStart, 20);
  const designDate = found ? found.date : new Date(birthUTC.getTime() - 88 * 24 * 3600 * 1000);

  const compute = (date: Date): GateActivation[] =>
    BODIES.map((b) => {
      let lon = bodyLongitude(b.body, date);
      if (b.key === "earth") lon = lon + 180; // 地球永远与太阳成180°对宫
      const { gate, line } = longitudeToGateLine(lon);
      return { key: b.key, zh: b.zh, en: b.en, gate, line, longitude: ((lon % 360) + 360) % 360 };
    });

  const personality = compute(birthUTC);
  const design = compute(designDate);

  return {
    personality,
    design,
    designDate,
    sunConsciousGate: personality.find((p) => p.key === "sun")!.gate,
    sunUnconsciousGate: design.find((p) => p.key === "sun")!.gate,
  };
}
