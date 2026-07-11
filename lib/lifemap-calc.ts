// 生命频率图谱 · 计算引擎
// 西方部分：astronomy-engine 计算太阳/月亮在出生时刻的真实黄道经度 → 星座
// 中式部分：lunar-javascript 计算真实的四柱八字 → 日主五行
// 两者都是可复核的天文/历法算法，不是语言模型现场编造的数字。

import * as Astronomy from "astronomy-engine";
import { Solar } from "lunar-javascript";

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
  hour: number; minute: number; // 不知道具体时间时，用 12:00 近似（月亮位置会有误差，日柱不受影响）
  hasTime: boolean;
};

export type LifeMapFacts = {
  sunSignZh: string; sunSignEn: string; sunElement: WesternElement;
  moonSignZh: string; moonSignEn: string; moonElement: WesternElement;
  yearPillar: string; monthPillar: string; dayPillar: string; hourPillar: string | null;
  dayMasterGan: string; dayMasterElement: ChineseElement;
};

export function computeLifeMapFacts(b: BirthInput): LifeMapFacts {
  // ---- 西方：真实天文黄道经度 ----
  const date = new Date(Date.UTC(b.year, b.month - 1, b.day, b.hour, b.minute));
  const sunLon = Astronomy.SunPosition(date).elon;
  const moonLon = Astronomy.EclipticGeoMoon(date).lon;
  const sunIdx = Math.floor(((sunLon % 360) + 360) % 360 / 30);
  const moonIdx = Math.floor(((moonLon % 360) + 360) % 360 / 30);

  // ---- 中式：真实四柱八字 ----
  const solar = Solar.fromYmdHms(b.year, b.month, b.day, b.hasTime ? b.hour : 12, b.hasTime ? b.minute : 0, 0);
  const lunar = solar.getLunar();
  const ec = lunar.getEightChar();
  const dayGan = ec.getDayGan();

  return {
    sunSignZh: SIGNS[sunIdx], sunSignEn: SIGNS_EN[sunIdx], sunElement: SIGN_ELEMENT[sunIdx],
    moonSignZh: SIGNS[moonIdx], moonSignEn: SIGNS_EN[moonIdx], moonElement: SIGN_ELEMENT[moonIdx],
    yearPillar: ec.getYear(), monthPillar: ec.getMonth(), dayPillar: ec.getDay(),
    hourPillar: b.hasTime ? ec.getTime() : null,
    dayMasterGan: dayGan, dayMasterElement: GAN_ELEMENT[dayGan] ?? "earth",
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

export function getCoreType(sunElement: WesternElement, dayMasterElement: ChineseElement): CoreType {
  return TYPE_MATRIX[sunElement][dayMasterElement];
}
