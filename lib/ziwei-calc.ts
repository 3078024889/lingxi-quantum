// 紫微斗数 · 计算引擎
// 用 iztro 库（专门实现紫微斗数排盘算法的开源库）计算真实命盘。
// 已验证：用1990年5月15日午时（男）这组数据，手动按古法"生月起寅顺数、
// 生时起子逆数"推算命宫、身宫，以及用纳音反推五行局，三项均与 iztro
// 输出精确一致，确认其排盘算法可信，才正式接入。

import { astro } from "iztro";

export type Gender = "male" | "female";

export type ZiWeiStar = { name: string; brightness: string };

export type ZiWeiPalace = {
  name: string;           // 宫名：命宫/兄弟/夫妻/子女/财帛/疾厄/迁移/交友/官禄/田宅/福德/父母
  heavenlyStem: string;
  earthlyBranch: string;
  majorStars: ZiWeiStar[]; // 十四主星落在此宫的（可能为空）
  isSoulPalace: boolean;   // 是否命宫
  isBodyPalace: boolean;   // 是否身宫
  decadalRange: [number, number]; // 此宫对应的大限岁数区间
};

export type ZiWeiChart = {
  soulPalaceBranch: string;   // 命宫地支
  bodyPalaceBranch: string;   // 身宫地支
  fiveElementsClass: string;  // 五行局，如"土五局"
  zodiac: string;             // 生肖
  palaces: ZiWeiPalace[];     // 十二宫，固定按 命/兄弟/夫妻/子女/财帛/疾厄/迁移/交友/官禄/田宅/福德/父母 顺序返回
};

const PALACE_ORDER = ["命宫", "兄弟", "夫妻", "子女", "财帛", "疾厄", "迁移", "交友", "官禄", "田宅", "福德", "父母"];

export function computeZiWeiChart(
  year: number, month: number, day: number, hourIndex: number, gender: Gender
): ZiWeiChart {
  // iztro 的时辰参数：0=早子时(00-01) 1=丑 2=寅 3=卯 4=辰 5=巳 6=午 7=未 8=申 9=酉 10=戌 11=亥 12=晚子时(23-00)
  const dateStr = `${year}-${month}-${day}`;
  const result = astro.bySolar(dateStr, hourIndex, gender, true, "zh-CN");

  const palacesByName = new Map<string, (typeof result.palaces)[number]>();
  result.palaces.forEach((p) => {
    // iztro 用"仆役"称交友宫、"官禄"不变，做一次名称归一化，便于统一展示
    const name = p.name === "仆役" ? "交友" : p.name;
    palacesByName.set(name, p);
  });

  const palaces: ZiWeiPalace[] = PALACE_ORDER.map((name) => {
    const p = palacesByName.get(name);
    return {
      name,
      heavenlyStem: p?.heavenlyStem ?? "",
      earthlyBranch: p?.earthlyBranch ?? "",
      majorStars: (p?.majorStars ?? []).map((s) => ({ name: s.name, brightness: s.brightness ?? "" })),
      isSoulPalace: name === "命宫",
      isBodyPalace: !!p?.isBodyPalace,
      decadalRange: p?.decadal?.range ?? [0, 0],
    };
  });

  return {
    soulPalaceBranch: result.earthlyBranchOfSoulPalace,
    bodyPalaceBranch: result.earthlyBranchOfBodyPalace,
    fiveElementsClass: result.fiveElementsClass,
    zodiac: result.zodiac,
    palaces,
  };
}
