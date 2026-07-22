export type ChineseElement = "wood" | "fire" | "earth" | "metal" | "water";

const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
const STEM_ELEMENT: ChineseElement[] = ["wood", "wood", "fire", "fire", "earth", "earth", "metal", "metal", "water", "water"];
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
const BRANCH_ZODIAC = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
const BRANCH_ZODIAC_EN = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];

// 五行——签的"质地"，来自天干
const ELEMENT_QUALITY: Record<ChineseElement, { zh: string; en: string }> = {
  wood: { zh: "生长之签", en: "Sign of Growth" },
  fire: { zh: "燃烧之签", en: "Sign of Fire" },
  earth: { zh: "承载之签", en: "Sign of Ground" },
  metal: { zh: "淬炼之签", en: "Sign of Forging" },
  water: { zh: "流动之签", en: "Sign of Flow" },
};

// 生肖——签的"动势"，来自地支，每个生肖对应一个简短的能量描述
const ZODIAC_ENERGY: { zh: string; en: string }[] = [
  { zh: "潜藏蓄势", en: "gathering in stillness" },
  { zh: "沉稳负重", en: "steady under weight" },
  { zh: "破势而出", en: "breaking through" },
  { zh: "轻盈试探", en: "moving with light steps" },
  { zh: "翻涌变化", en: "surging into change" },
  { zh: "静默蜕变", en: "transforming in silence" },
  { zh: "全力奔驰", en: "running at full stride" },
  { zh: "群体共鸣", en: "resonating with others" },
  { zh: "灵巧应变", en: "adapting on the fly" },
  { zh: "准时报晓", en: "announcing what's due" },
  { zh: "忠守边界", en: "guarding a boundary" },
  { zh: "归于安顿", en: "settling into rest" },
];

export type QianSign = {
  index: number;
  ganzhi: string;
  stem: string; stemElement: ChineseElement;
  branch: string; zodiacZh: string; zodiacEn: string;
  nameZh: string; nameEn: string;
  energyZh: string; energyEn: string;
};

function buildSigns(): QianSign[] {
  const signs: QianSign[] = [];
  for (let i = 0; i < 60; i++) {
    const stem = STEMS[i % 10];
    const stemElement = STEM_ELEMENT[i % 10];
    const branch = BRANCHES[i % 12];
    const zodiacZh = BRANCH_ZODIAC[i % 12];
    const zodiacEn = BRANCH_ZODIAC_EN[i % 12];
    const quality = ELEMENT_QUALITY[stemElement];
    const energy = ZODIAC_ENERGY[i % 12];
    signs.push({
      index: i,
      ganzhi: stem + branch,
      stem, stemElement, branch, zodiacZh, zodiacEn,
      nameZh: `${quality.zh}·${zodiacZh}`,
      nameEn: `${quality.en} · ${zodiacEn}`,
      energyZh: energy.zh,
      energyEn: energy.en,
    });
  }
  return signs;
}

// 六十甲子——不是我们编的一套新符号体系，是真实存在、被使用了几千年的
// 古代历法周期（干支纪年纪日的基础），每一签对应一个真实的干支组合，
// "来源于古老的星历系统"这句话，字面意义上是真的。
export const QIAN_SIGNS: QianSign[] = buildSigns();
