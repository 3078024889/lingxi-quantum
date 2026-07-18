import * as Astronomy from "astronomy-engine";
import { signFromLongitude, type WesternElement } from "./lifemap-calc";

// ────────────────────────────────────────────────────────────────────
// 每日运势 · 天文计算层
// ────────────────────────────────────────────────────────────────────
// 跟生命图谱用的是同一个原则："真实可复核的天文数据 + 模板叙事"，不是
// AI现场编。这里两个数据都是实时算出来的：
// 1. 月亮此刻在黄道上的哪个星座（每2.5天左右换一个星座，是"每天都不
//    一样"这个新鲜感的来源，不用调用AI也能做到内容天天变）。
// 2. 月相角度（0=新月，90=上弦，180=满月，270=下弦），对应传统占星
//    里"月相能量"的说法——新月适合开始、满月适合收获/释放，这是真实
//    存在的占星技法，不是我们编的比喻。

export type MoonPhaseKey =
  | "new" | "waxingCrescent" | "firstQuarter" | "waxingGibbous"
  | "full" | "waningGibbous" | "lastQuarter" | "waningCrescent";

const PHASE_LABEL: Record<MoonPhaseKey, { zh: string; en: string }> = {
  new: { zh: "新月", en: "New Moon" },
  waxingCrescent: { zh: "娥眉月（渐盈）", en: "Waxing Crescent" },
  firstQuarter: { zh: "上弦月", en: "First Quarter" },
  waxingGibbous: { zh: "盈凸月", en: "Waxing Gibbous" },
  full: { zh: "满月", en: "Full Moon" },
  waningGibbous: { zh: "亏凸月", en: "Waning Gibbous" },
  lastQuarter: { zh: "下弦月", en: "Last Quarter" },
  waningCrescent: { zh: "残月（渐亏）", en: "Waning Crescent" },
};

function phaseKeyFromAngle(angle: number): MoonPhaseKey {
  // 把0-360度分成8段，每段45度，对应传统占星里最常用的八月相划分。
  const a = ((angle % 360) + 360) % 360;
  const idx = Math.round(a / 45) % 8;
  const keys: MoonPhaseKey[] = ["new", "waxingCrescent", "firstQuarter", "waxingGibbous", "full", "waningGibbous", "lastQuarter", "waningCrescent"];
  return keys[idx];
}

export type TodayTransit = {
  moonSignZh: string; moonSignEn: string; moonElement: WesternElement;
  moonPhaseKey: MoonPhaseKey; moonPhaseZh: string; moonPhaseEn: string;
  sunSignZh: string; sunSignEn: string; // 太阳此刻所在星座＝当下的"星座季节"
  date: string; // YYYY-MM-DD，用于判断"今天"是否已经变化，便于服务端渲染时天然按天刷新
};

export function computeTodayTransit(now: Date = new Date()): TodayTransit {
  const moonVec = Astronomy.GeoVector("Moon" as Astronomy.Body, now, false);
  const moonEcl = Astronomy.Ecliptic(moonVec);
  const moon = signFromLongitude(moonEcl.elon);

  const sunVec = Astronomy.GeoVector("Sun" as Astronomy.Body, now, false);
  const sunEcl = Astronomy.Ecliptic(sunVec);
  const sun = signFromLongitude(sunEcl.elon);

  const phaseAngle = Astronomy.MoonPhase(now);
  const phaseKey = phaseKeyFromAngle(phaseAngle);

  return {
    moonSignZh: moon.signZh, moonSignEn: moon.signEn, moonElement: moon.element,
    moonPhaseKey: phaseKey, moonPhaseZh: PHASE_LABEL[phaseKey].zh, moonPhaseEn: PHASE_LABEL[phaseKey].en,
    sunSignZh: sun.signZh, sunSignEn: sun.signEn,
    date: now.toISOString().slice(0, 10),
  };
}

// 元素关系——占星里真实存在的技法：同元素共振，相生元素（火风、土水）
// 顺畅，相克元素（火水、土风）有摩擦，不是我们编的比喻。
export type ElementRelation = "resonant" | "flowing" | "friction";

const COMPATIBLE: Record<WesternElement, WesternElement> = { fire: "air", air: "fire", earth: "water", water: "earth" };

export function elementRelation(a: WesternElement, b: WesternElement): ElementRelation {
  if (a === b) return "resonant";
  if (COMPATIBLE[a] === b) return "flowing";
  return "friction";
}
