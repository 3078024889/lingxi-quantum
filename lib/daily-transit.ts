import * as Astronomy from "astronomy-engine";
import { signFromLongitude, type WesternElement } from "./lifemap-calc";

// ────────────────────────────────────────────────────────────────────
// 每日运势 · 天文计算层
// ────────────────────────────────────────────────────────────────────
// 跟生命图谱用的是同一个原则："真实可复核的天文数据 + 模板叙事"，不是
// AI现场编。这里的数据都是实时算出来的：
// 1. 月亮此刻在黄道上的哪个星座（每2.5天左右换一个星座，是"每天都不
//    一样"这个新鲜感的来源，不用调用AI也能做到内容天天变）。
// 2. 月相角度（0=新月，90=上弦，180=满月，270=下弦），对应传统占星
//    里"月相能量"的说法——新月适合开始、满月适合收获/释放，这是真实
//    存在的占星技法，不是我们编的比喻。
// 3.（v226新增）逆行行星、当日守护星——见下方，进一步增加"今天"这个
//    数据组合的独特性，理由见各自函数上方的注释。

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

// 逆行判断——真实的天文计算，不是猜的：比较"现在"和"24小时前"这颗
// 行星在黄道上的经度，如果经度在减小（逆着黄道十二宫顺序移动），
// 就是视觉上的逆行。传统占星最看重水星逆行，这里也把金星、火星一起
// 算出来，能显著增加"今天"这个数据组合的独特性——不再只是"月亮
// 星座+月相"两个维度，而是再叠加"今天有没有行星在逆行"这第三个
// 真实存在、每天都可能不一样的维度。
export type RetrogradeInfo = { planetZh: string; planetEn: string }[];

function isRetrograde(body: Astronomy.Body, now: Date): boolean {
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lonNow = Astronomy.Ecliptic(Astronomy.GeoVector(body, now, false)).elon;
  const lonYesterday = Astronomy.Ecliptic(Astronomy.GeoVector(body, yesterday, false)).elon;
  // 处理跨0度的边界情况（比如从359度移动到1度，看起来像是"变小了"，
  // 实际是顺行跨过了白羊座起点）。
  let diff = lonNow - lonYesterday;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

export function computeRetrogrades(now: Date = new Date()): RetrogradeInfo {
  const candidates: { body: Astronomy.Body; zh: string; en: string }[] = [
    { body: "Mercury" as Astronomy.Body, zh: "水星", en: "Mercury" },
    { body: "Venus" as Astronomy.Body, zh: "金星", en: "Venus" },
    { body: "Mars" as Astronomy.Body, zh: "火星", en: "Mars" },
  ];
  return candidates.filter((c) => isRetrograde(c.body, now)).map((c) => ({ planetZh: c.zh, planetEn: c.en }));
}

// 当日守护星——传统占星里"七曜配星期"的真实技法（周日太阳、周一月亮、
// 周二火星、周三水星、周四木星、周五金星、周六土星），不是我们编的，
// 这套对应关系本身就是"星期"这个词的词源。跟月亮星座、月相、逆行
// 叠加在一起，让"今天"在数据层面变得足够独特，不用无限增加模板数量，
// 靠真实数据的排列组合就能做到内容天天不一样。
const DAY_RULER: { zh: string; en: string }[] = [
  { zh: "太阳", en: "the Sun" }, // 周日
  { zh: "月亮", en: "the Moon" }, // 周一
  { zh: "火星", en: "Mars" }, // 周二
  { zh: "水星", en: "Mercury" }, // 周三
  { zh: "木星", en: "Jupiter" }, // 周四
  { zh: "金星", en: "Venus" }, // 周五
  { zh: "土星", en: "Saturn" }, // 周六
];

export function dayRuler(now: Date = new Date()): { zh: string; en: string } {
  return DAY_RULER[now.getUTCDay()];
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
