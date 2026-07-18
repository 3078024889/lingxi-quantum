// 生命频率图谱 · 计算引擎
// 西方部分：astronomy-engine 计算太阳/月亮/水金火木土在出生时刻的真实黄道经度 → 星座
// 中式部分：lunar-javascript 计算真实的四柱八字、十神、大运 → 日主五行与命局结构
// 两者都是可复核的天文/历法算法，不是语言模型现场编造的数字——
// 这一点，是灵犀生命图谱与市面上大多数"AI算命"最根本的区别。

import * as Astronomy from "astronomy-engine";
import { Solar, Lunar } from "lunar-javascript";

// 出生日期可能有三种记法：阳历（西历/公历，国际通用）、农历（中国传统历法，
// 身份证上常见的另一种记法）——两者是完全不同的历法系统，同一串数字，
// 按不同历法解读，对应的是相差最多一个月的两个不同真实日期，所有后续的
// 天文/命理计算，都必须先统一换算成阳历，才不会全盘算错。
export function lunarToSolar(year: number, month: number, day: number): { year: number; month: number; day: number } {
  const lunar = Lunar.fromYmd(year, month, day);
  const solar = lunar.getSolar();
  return { year: solar.getYear(), month: solar.getMonth(), day: solar.getDay() };
}

export type WesternElement = "fire" | "earth" | "air" | "water";
export type ChineseElement = "wood" | "fire" | "earth" | "metal" | "water";

const SIGNS = ["白羊", "金牛", "双子", "巨蟹", "狮子", "处女", "天秤", "天蝎", "射手", "摩羯", "水瓶", "双鱼"] as const;
const SIGNS_EN = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"] as const;
const SIGN_ELEMENT: WesternElement[] = ["fire", "earth", "air", "water", "fire", "earth", "air", "water", "fire", "earth", "air", "water"];

// 天干 → 五行（日主五行由日柱天干决定，这是四柱八字的标准算法）
const GAN_ELEMENT: Record<string, ChineseElement> = {
  "甲": "wood", "乙": "wood",
  "丙": "fire", "丁": "fire",
  "戊": "earth", "己": "earth",
  "庚": "metal", "辛": "metal",
  "壬": "water", "癸": "water",
};

export type BirthInput = {
  year: number; month: number; day: number;
  hour: number; minute: number; // 不知道具体时间时，用 12:00 近似（月亮/内行星位置会有误差，日柱不受影响）
  hasTime: boolean;
};

export type PlanetPlacement = { signZh: string; signEn: string; element: WesternElement; longitude: number };

export type PillarDetail = {
  ganZhi: string;
  shiShenGan: string;
  shiShenZhi: string;
  naYin: string;
  diShi: string; // 十二长生：长生/沐浴/冠带/临官/帝旺/衰/病/死/墓/绝/胎/养
  hideGan: string[];
};

export type LifeMapFacts = {
  sunSignZh: string; sunSignEn: string; sunElement: WesternElement; sunLongitude: number;
  moonSignZh: string; moonSignEn: string; moonElement: WesternElement; moonLongitude: number;
  // 五大行星：真实黄道经度换算，不是免费版才有、付费版瞎编——完整报告解锁的是"解读"，不是"编数据"
  mercury: PlanetPlacement; venus: PlanetPlacement; mars: PlanetPlacement; jupiter: PlanetPlacement; saturn: PlanetPlacement;
  yearPillar: string; monthPillar: string; dayPillar: string; hourPillar: string | null;
  dayMasterGan: string; dayMasterElement: ChineseElement;
  // 十神：年干、月干、时干相对日主的关系，命理分析的核心骨架（保留字段，向后兼容）
  yearShiShen: string; monthShiShen: string; hourShiShen: string | null;
  // 大运：从第几岁开始起运（真实历法排大运算法，不是随口一说）
  daYunStartAge: number | null;
  // 四柱详情：干支/十神干/十神支/纳音/地势(十二长生)/藏干，每一柱都是完整的真实命理数据
  yearDetail: PillarDetail; monthDetail: PillarDetail; dayDetail: PillarDetail; timeDetail: PillarDetail | null;
  // 胎元、命宫、身宫：传统命理的三个附加宫位，各自也有纳音
  taiYuan: string; taiYuanNaYin: string;
  mingGong: string; mingGongNaYin: string;
  shenGong: string; shenGongNaYin: string;
  // 五行统计：四柱天干地支藏干里，五种元素各出现了几次，反映命局五行的强弱分布
  wuXingCount: Record<ChineseElement, number>;
  vedic: VedicChart;
};

function planet(body: string, date: Date): PlanetPlacement {
  const vec = Astronomy.GeoVector(body as Astronomy.Body, date, false);
  const ecl = Astronomy.Ecliptic(vec);
  const lon = ((ecl.elon % 360) + 360) % 360;
  const idx = Math.floor(lon / 30);
  return { signZh: SIGNS[idx], signEn: SIGNS_EN[idx], element: SIGN_ELEMENT[idx], longitude: lon };
}

export function computeLifeMapFacts(b: BirthInput): LifeMapFacts {
  // ---- 西方：真实天文黄道经度（太阳、月亮 + 五大行星）----
  // 这里原来写的是 new Date(Date.UTC(b.year, ...))——JS 的 Date.UTC()
  // 对 0-99 之间的年份，有一个几乎所有人都会踩一次的经典陷阱：会自动
  // 当成"19xx年"处理（Date.UTC(12,...) 实际生成的是 1912 年，不是
  // 字面意义的公元12年）。这个陷阱只影响这一处西方天文计算，下面的
  // 中式八字/紫微部分用的是 lunar-javascript / iztro，直接传数字年份，
  // 不会被这个陷阱影响——两套系统对同一个"12年"的理解会因此完全不
  // 一致（西方部分算的是1912年的星盘，中式部分算的是真实公元12年的
  // 八字），这才是"填12年，结果不对"背后真正的原因，不是系统故意
  // 要求年份必须以19开头。
  // 修法：用 setUTCFullYear() 显式设置年份——这个方法不会做0-99的
  // 特殊处理，传12就是公元12年，两套系统就能真正算的是同一个年份了。
  const date = new Date(0);
  date.setUTCFullYear(b.year, b.month - 1, b.day);
  date.setUTCHours(b.hour, b.minute, 0, 0);
  const sunLon = Astronomy.SunPosition(date).elon;
  const moonLon = Astronomy.EclipticGeoMoon(date).lon;
  const sunIdx = Math.floor(((sunLon % 360) + 360) % 360 / 30);
  const moonIdx = Math.floor(((moonLon % 360) + 360) % 360 / 30);

  // ---- 中式：真实四柱八字 + 十神 + 纳音 + 地势 + 藏干 + 胎元/命宫/身宫 + 大运 ----
  const solar = Solar.fromYmdHms(b.year, b.month, b.day, b.hasTime ? b.hour : 12, b.hasTime ? b.minute : 0, 0);
  const lunar = solar.getLunar();
  const ec = lunar.getEightChar();
  const dayGan = ec.getDayGan();

  const pillar = (ganZhi: string, shiShenGan: string, shiShenZhi: string, naYin: string, diShi: string, hideGan: string[]): PillarDetail =>
    ({ ganZhi, shiShenGan, shiShenZhi, naYin, diShi, hideGan });

  const yearDetail = pillar(ec.getYear(), ec.getYearShiShenGan(), ec.getYearShiShenZhi(), ec.getYearNaYin(), ec.getYearDiShi(), ec.getYearHideGan());
  const monthDetail = pillar(ec.getMonth(), ec.getMonthShiShenGan(), ec.getMonthShiShenZhi(), ec.getMonthNaYin(), ec.getMonthDiShi(), ec.getMonthHideGan());
  const dayDetail = pillar(ec.getDay(), "日主", ec.getDayShiShenZhi(), ec.getDayNaYin(), ec.getDayDiShi(), ec.getDayHideGan());
  const timeDetail = b.hasTime
    ? pillar(ec.getTime(), ec.getTimeShiShenGan(), ec.getTimeShiShenZhi(), ec.getTimeNaYin(), ec.getTimeDiShi(), ec.getTimeHideGan())
    : null;

  let daYunStartAge: number | null = null;
  try {
    // getYun 需要性别参数（1男/0女），此处用男性排法取起运年龄的近似值，仅作为「大运即将解锁」的引子，
    // 完整、按性别区分的大运排盘，属于付费完整报告的内容。
    const yun = ec.getYun(1);
    daYunStartAge = yun.getStartYear ? Math.round(yun.getStartYear()) : null;
  } catch {
    daYunStartAge = null;
  }

  // 五行统计：四柱天干 + 日主 + 四柱藏干，各元素出现次数，反映命局五行强弱的真实分布
  const wuXingCount: Record<ChineseElement, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const allGan = [ec.getYear()[0], ec.getMonth()[0], ec.getDay()[0], ...(b.hasTime ? [ec.getTime()[0]] : [])];
  const allHideGan = [...ec.getYearHideGan(), ...ec.getMonthHideGan(), ...ec.getDayHideGan(), ...(b.hasTime ? ec.getTimeHideGan() : [])];
  [...allGan, ...allHideGan].forEach((g) => {
    const el = GAN_ELEMENT[g];
    if (el) wuXingCount[el]++;
  });

  const vedic = computeVedicChart(sunLon, moonLon, b.year);

  return {
    sunSignZh: SIGNS[sunIdx], sunSignEn: SIGNS_EN[sunIdx], sunElement: SIGN_ELEMENT[sunIdx], sunLongitude: ((sunLon % 360) + 360) % 360,
    moonSignZh: SIGNS[moonIdx], moonSignEn: SIGNS_EN[moonIdx], moonElement: SIGN_ELEMENT[moonIdx], moonLongitude: ((moonLon % 360) + 360) % 360,
    mercury: planet("Mercury", date), venus: planet("Venus", date), mars: planet("Mars", date),
    jupiter: planet("Jupiter", date), saturn: planet("Saturn", date),
    yearPillar: ec.getYear(), monthPillar: ec.getMonth(), dayPillar: ec.getDay(),
    hourPillar: b.hasTime ? ec.getTime() : null,
    dayMasterGan: dayGan, dayMasterElement: GAN_ELEMENT[dayGan] ?? "earth",
    yearShiShen: ec.getYearShiShenGan(), monthShiShen: ec.getMonthShiShenGan(),
    hourShiShen: b.hasTime ? ec.getTimeShiShenGan() : null,
    daYunStartAge,
    vedic,
    yearDetail, monthDetail, dayDetail, timeDetail,
    taiYuan: ec.getTaiYuan(), taiYuanNaYin: ec.getTaiYuanNaYin(),
    mingGong: ec.getMingGong(), mingGongNaYin: ec.getMingGongNaYin(),
    shenGong: ec.getShenGong(), shenGongNaYin: ec.getShenGongNaYin(),
    wuXingCount,
  };
}

// ---- 核心类型矩阵：西方四元素 × 中式五行 = 20种原创命名的核心类型 ----
// 每一格，都是灵犀场域自己的命名与描述，不直接照搬占星/命理术语的性格断言。
export type CoreType = { name: string; nameEn: string; essence: string; essenceEn: string };

const TYPE_MATRIX: Record<WesternElement, Record<ChineseElement, CoreType>> = {
  fire: {
    wood: { name: "破土者", nameEn: "The Breaker of Ground", essence: "行动的驱力，撞上生长的耐心——你习惯先做，再在做的过程里，慢慢把方向长出来。", essenceEn: "A drive to act meets a patience for growing — you tend to move first, letting direction take root along the way." },
    fire: { name: "引燃者", nameEn: "The Kindler", essence: "双重的热忱——你的行动力，从不缺燃料，缺的往往是，一处，值得持续燃烧的方向。", essenceEn: "A double measure of ardor — you rarely lack fuel to act. What you sometimes lack is a direction worth burning steadily toward." },
    earth: { name: "锻造者", nameEn: "The Forger", essence: "炽热的冲动，落进务实的模具——你，最擅长，把一时的激情，锻造成，能站得住的东西。", essenceEn: "A fiery impulse poured into a practical mold — you're skilled at forging momentary passion into something that lasts." },
    metal: { name: "淬炼者", nameEn: "The Tempered", essence: "行动的火，遇上决断的刃——你，做事，既有冲劲，又，格外，懂得，什么时候，该，收手。", essenceEn: "Fire meets a decisive edge — you act with real momentum, yet know precisely when to stop." },
    water: { name: "蒸腾者", nameEn: "The Rising Vapor", essence: "热忱与感受，彼此，推动着彼此——你的行动，很少是纯粹理性的，总，带着，一份，真实的情感重量。", essenceEn: "Ardor and feeling drive each other — your actions are rarely purely rational, always carrying real emotional weight." },
  },
  earth: {
    wood: { name: "培育者", nameEn: "The Cultivator", essence: "扎根的耐心，遇上生长的渴望——你，很少，急于求成，更愿意，把事情，一点点，养大。", essenceEn: "A rooted patience meets a hunger to grow — you rarely rush, preferring to raise things slowly, carefully." },
    fire: { name: "窑变者", nameEn: "The Kiln-Fired", essence: "务实的外壳下，藏着，一份，不常显露的热忱——一旦，被真正点燃，你，比谁都持久。", essenceEn: "Beneath a practical shell lies a rarely shown ardor — once truly kindled, you burn longer than most." },
    earth: { name: "奠基者", nameEn: "The Foundation-Layer", essence: "双重的扎实——你，天生，就，擅长，把，看不见的根基，一层一层，打得，格外稳。", essenceEn: "Doubly grounded — you're naturally skilled at laying invisible foundations, layer by careful layer." },
    metal: { name: "琢磨者", nameEn: "The Polisher", essence: "耐心的土壤，配上，精准的刃——你，做事，不追求快，追求，每一步，都，经得起，反复推敲。", essenceEn: "Patient soil paired with a precise edge — you're not after speed, but work that holds up under repeated scrutiny." },
    water: { name: "润土者", nameEn: "The Moistened Earth", essence: "扎根的踏实，被，一份，柔软的感受力，悄悄，滋润着——你，比外表看起来，更，容易，被触动。", essenceEn: "A grounded steadiness, quietly moistened by soft sensitivity — you're more easily moved than you appear." },
  },
  air: {
    wood: { name: "抽枝者", nameEn: "The Branching", essence: "思辨的风，吹动，生长的枝——你的想法，很少，停在原地，总，会，自然而然，长出，新的分支。", essenceEn: "A thinking wind stirs growing branches — your ideas rarely stay still, naturally sprouting new directions." },
    fire: { name: "煽风者", nameEn: "The Bellows", essence: "思维的风，遇上，行动的火——你，最擅长，用一句话、一个点子，把别人心里的火，重新，扇旺。", essenceEn: "A thinking wind meets a fire of action — you're gifted at reigniting others' passion with a single idea, a single word." },
    earth: { name: "拓印者", nameEn: "The Rubbing-Maker", essence: "轻盈的思辨，落在，扎实的土壤上——你，擅长，把，飘忽的想法，一点点，拓印成，看得见的形状。", essenceEn: "Light thinking settles onto solid ground — you're skilled at pressing fleeting ideas into visible, tangible shapes." },
    metal: { name: "析辨者", nameEn: "The Discerner", essence: "思辨的风，配上，锐利的刃——你，看事情，很少，只看表面，总，习惯，先，把它，拆开来看。", essenceEn: "A thinking wind paired with a sharp edge — you rarely take things at face value, habitually taking them apart first." },
    water: { name: "映照者", nameEn: "The Reflector", essence: "思考与感受，彼此，映照着对方——你，很少，只用脑子想事情，情感，总会，悄悄，参与进来。", essenceEn: "Thought and feeling mirror each other — you rarely think with the mind alone; emotion always quietly joins in." },
  },
  water: {
    wood: { name: "涌流者", nameEn: "The Welling Stream", essence: "感受的水，滋养着，生长的渴望——你的情感，从不是，静止的，总，在，悄悄，推动着，什么在生长。", essenceEn: "Feeling-water nourishes a hunger to grow — your emotions are never still, always quietly pushing something toward growth." },
    fire: { name: "潜火者", nameEn: "The Banked Ember", essence: "深沉的感受力下，藏着，一份，不轻易熄灭的热忱——你，看起来平静，内里，却，从未真正冷却。", essenceEn: "Beneath deep sensitivity lies an ardor that never quite goes out — you may look calm, yet never truly cool inside." },
    earth: { name: "凝露者", nameEn: "The Condensed Dew", essence: "流动的感受，遇上，扎实的土壤——你，擅长，把，飘忽的情绪，慢慢，沉淀成，可以，被依靠的稳定。", essenceEn: "Flowing feeling meets solid ground — you're skilled at settling fleeting emotion into a stability others can lean on." },
    metal: { name: "映刃者", nameEn: "The Mirrored Blade", essence: "深水般的感受力，配上，冷静的决断——你，很少，被情绪，冲昏头脑，反而，能，看得，格外清楚。", essenceEn: "Deep-water sensitivity paired with cool decisiveness — emotion rarely clouds your judgment; if anything, it sharpens it." },
    water: { name: "深潜者", nameEn: "The Deep Diver", essence: "双重的感受力——你，几乎，天生，就，活在，情感与直觉的深处，比多数人，更早，触到，事情的本质。", essenceEn: "Doubly attuned to feeling — you seem to live, almost by nature, in the depths of emotion and intuition, often sensing the heart of things before others do." },
  },
};

// ---- 玛雅 Tzolkin 圣历：20 图腾 × 13 数字 = 260 种真实组合 ----
// 用标准儒略日数 + GMT 相关常数（584283）计算，已用两个公认历史节点验证：
// 公元前3114年8月11日创世日 = 4 Ahau；2012年12月21日（第13白克顿终止日）同为 4 Ahau。
const MAYA_SIGNS = [
  { en: "Imix", zh: "红龙", meaning: "本源、滋养" },
  { en: "Ik", zh: "白风", meaning: "灵感、气息" },
  { en: "Akbal", zh: "蓝夜", meaning: "梦境、直觉" },
  { en: "Kan", zh: "黄种子", meaning: "萌发、潜能" },
  { en: "Chicchan", zh: "红蛇", meaning: "生命力、本能" },
  { en: "Cimi", zh: "白世界桥", meaning: "转化、放下" },
  { en: "Manik", zh: "蓝手", meaning: "疗愈、成就" },
  { en: "Lamat", zh: "黄星星", meaning: "和谐、优雅" },
  { en: "Muluc", zh: "红月", meaning: "净化、流动" },
  { en: "Oc", zh: "白狗", meaning: "忠诚、爱" },
  { en: "Chuen", zh: "蓝猴", meaning: "游戏、创造" },
  { en: "Eb", zh: "黄人", meaning: "自由意志、道路" },
  { en: "Ben", zh: "红天行者", meaning: "探索、成长" },
  { en: "Ix", zh: "白巫师", meaning: "魔法、临在" },
  { en: "Men", zh: "蓝鹰", meaning: "远见、视野" },
  { en: "Cib", zh: "黄战士", meaning: "无畏、智慧" },
  { en: "Caban", zh: "红地球", meaning: "共时、导航" },
  { en: "Etznab", zh: "白镜", meaning: "映照、真相" },
  { en: "Cauac", zh: "蓝风暴", meaning: "净化、能量" },
  { en: "Ahau", zh: "黄太阳", meaning: "开悟、圆满" },
] as const;
const MAYA_TONES = [
  { n: 1, zh: "磁性", meaning: "引动、目的" },
  { n: 2, zh: "月亮", meaning: "极性、挑战" },
  { n: 3, zh: "电力", meaning: "服务、连接" },
  { n: 4, zh: "自我存在", meaning: "度量、形式" },
  { n: 5, zh: "超频", meaning: "光耀、赋能" },
  { n: 6, zh: "韵律", meaning: "组织、平衡" },
  { n: 7, zh: "共振", meaning: "调频、通感" },
  { n: 8, zh: "银河星系", meaning: "完整、和谐" },
  { n: 9, zh: "太阳", meaning: "脉动、点燃" },
  { n: 10, zh: "行星", meaning: "显化、圆满" },
  { n: 11, zh: "光谱", meaning: "释放、解放" },
  { n: 12, zh: "水晶", meaning: "合作、普及" },
  { n: 13, zh: "宇宙", meaning: "临在、超越" },
] as const;
const GMT_CORRELATION = 584283;

function toJDN(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

export type MayaTzolkin = { sign: string; signEn: string; meaning: string; tone: number; toneZh: string; toneMeaning: string };

export function computeMayaTzolkin(year: number, month: number, day: number): MayaTzolkin {
  const jdn = toJDN(year, month, day);
  const kin = jdn - GMT_CORRELATION;
  const tone = (((kin + 3) % 13) + 13) % 13 + 1;
  const signIdx = (((kin + 19) % 20) + 20) % 20;
  const sign = MAYA_SIGNS[signIdx];
  const toneInfo = MAYA_TONES[tone - 1];
  return { sign: sign.zh, signEn: sign.en, meaning: sign.meaning, tone, toneZh: toneInfo.zh, toneMeaning: toneInfo.meaning };
}

// ---- 吠陀占星（恒星黄道 / Vedic Sidereal）----
// 用 Lahiri Ayanamsa（最广泛采用的岁差修正值，印度政府官方标准）把回归黄道
// 换算成恒星黄道。J2000.0基准值 23.853222°，已用ICRC国际标准核对（多个独立
// 来源确认该数值），岁差速率用 50.2388475"/年 的线性近似——注意：这是线性
// 近似，不是瑞士星历表级别的完整非线性精度，可能有零点几度以内的偏差，
// 足够判断"落在哪个恒星星座"，不足以做到角分级别的精确宫位换算。
const LAHIRI_J2000 = 23.853222;
const PRECESSION_RATE_PER_YEAR = 50.2388475 / 3600; // 度/年

export function lahiriAyanamsa(year: number): number {
  return LAHIRI_J2000 + (year - 2000) * PRECESSION_RATE_PER_YEAR;
}

export type VedicPlacement = { signZh: string; signEn: string };

export function toSidereal(tropicalLon: number, year: number): VedicPlacement {
  const ayanamsa = lahiriAyanamsa(year);
  const siderealLon = ((tropicalLon - ayanamsa) % 360 + 360) % 360;
  const idx = Math.floor(siderealLon / 30);
  const VEDIC_SIGNS_ZH = ["白羊", "金牛", "双子", "巨蟹", "狮子", "处女", "天秤", "天蝎", "射手", "摩羯", "水瓶", "双鱼"];
  const VEDIC_SIGNS_EN = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  return { signZh: VEDIC_SIGNS_ZH[idx], signEn: VEDIC_SIGNS_EN[idx] };
}

export type VedicChart = {
  ayanamsa: number;
  sunSidereal: VedicPlacement;
  moonSidereal: VedicPlacement;
};

export function computeVedicChart(tropicalSunLon: number, tropicalMoonLon: number, year: number): VedicChart {
  return {
    ayanamsa: lahiriAyanamsa(year),
    sunSidereal: toSidereal(tropicalSunLon, year),
    moonSidereal: toSidereal(tropicalMoonLon, year),
  };
}

export function getCoreType(sunElement: WesternElement, dayMasterElement: ChineseElement): CoreType {
  return TYPE_MATRIX[sunElement][dayMasterElement];
}

// ---- 生命密码（生命路径数）----
// 西方数字命理学里最广泛使用的方法：把出生年月日的全部数字相加，
// 反复求和直到剩一位数，除非中途出现11/22/33这三个"大师数"就保留不再简化——
// 这是数字命理学界公认的标准算法，可以独立验证。
export type LifeCode = { number: number; isMaster: boolean };

function digitSum(n: number): number {
  return String(n).split("").reduce((s, d) => s + parseInt(d, 10), 0);
}

export function computeLifeCode(year: number, month: number, day: number): LifeCode {
  let total = digitSum(year) + digitSum(month) + digitSum(day);
  while (total > 9 && total !== 11 && total !== 22 && total !== 33) {
    total = digitSum(total);
  }
  return { number: total, isMaster: total === 11 || total === 22 || total === 33 };
}
