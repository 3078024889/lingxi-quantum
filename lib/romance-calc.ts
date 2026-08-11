import type { LifeVector } from "./life-vector";

// ────────────────────────────────────────────────────────────────────
// 桃花磁场指数 · 计算引擎
// ────────────────────────────────────────────────────────────────────
// 跟生命韧性指数用的是同一套方法论（见 life-vector.ts 顶部注释）：先用
// 确定性规则算出一个可复核的分数，AI/模板叙事只负责围绕这个已经算好
// 的结果写解读，不负责自己评分。
//
// "桃花"这个判断本身，用的是命理学里一条真实存在、可查证的古法规则
// （不是我们编的）：把十二地支按"三合局"分成四组，每组对应一个固定
// 的"桃花"地支——
//   申子辰（猴/鼠/龙）见 酉（鸡）
//   寅午戌（虎/马/狗）见 卯（兔）
//   巳酉丑（蛇/鸡/牛）见 午（马）
//   亥卯未（猪/兔/羊）见 子（鼠）
// 只要年柱/月柱/日柱/时柱四柱里的地支（每根柱子取干支的第二个字），
// 命中了自己那组对应的桃花地支，就叫"命带桃花"。这条规则真实存在于
// 传统命理文献里，不是我们发明的算法，可以查证。

const TAO_HUA_GROUPS: { triad: string[]; taohua: string }[] = [
  { triad: ["申", "子", "辰"], taohua: "酉" },
  { triad: ["寅", "午", "戌"], taohua: "卯" },
  { triad: ["巳", "酉", "丑"], taohua: "午" },
  { triad: ["亥", "卯", "未"], taohua: "子" },
];

export type TaoHuaResult = {
  hasTaoHua: boolean;
  taohuaBranch: string | null; // 命中的桃花地支是哪一个字，比如"酉"
  foundIn: string[]; // 出现在哪些柱：["年柱","日柱"] 这种
};

// 四柱字符串是"甲子"这种干支两个字，取第二个字就是地支。
function branchOf(pillar: string | null): string | null {
  if (!pillar || pillar.length < 2) return null;
  return pillar[1];
}

export function findTaoHua(pillars: {
  yearPillar: string; monthPillar: string; dayPillar: string; hourPillar: string | null;
}): TaoHuaResult {
  // 桃花地支由年支或日支所在的三合局决定（传统命理里"以年支或日支查
  // 桃花"是并行的两种常见用法，这里两个都查，只要任一个成立就采用）。
  const yearBranch = branchOf(pillars.yearPillar);
  const dayBranch = branchOf(pillars.dayPillar);
  const anchors = [yearBranch, dayBranch].filter(Boolean) as string[];

  let taohuaBranch: string | null = null;
  for (const anchor of anchors) {
    const group = TAO_HUA_GROUPS.find((g) => g.triad.includes(anchor));
    if (group) {
      taohuaBranch = group.taohua;
      break;
    }
  }
  if (!taohuaBranch) return { hasTaoHua: false, taohuaBranch: null, foundIn: [] };

  const PILLAR_LABEL: [string, string | null][] = [
    ["年柱", pillars.yearPillar], ["月柱", pillars.monthPillar],
    ["日柱", pillars.dayPillar], ["时柱", pillars.hourPillar],
  ];
  const foundIn = PILLAR_LABEL.filter(([, p]) => branchOf(p) === taohuaBranch).map(([label]) => label);

  return { hasTaoHua: foundIn.length > 0, taohuaBranch, foundIn };
}

// 吸引力风格——不是评判"桃花好不好"，是描述一种社交/情感的类型倾向。
// 用自由需求 vs 稳定需求这一组对立维度，划出"独立探索型"到"深度专一型"
// 这条轴，跟财富类型、韧性指数一样，都是从同一份生命向量里，换一个
// 切面重新解读，不是另起一套完全无关的计算。
export type AttractionStyle = "independent" | "magnetic" | "devoted" | "gentle";

export function attractionStyle(v: LifeVector): AttractionStyle {
  const social = v.socialDrive, freedom = v.freedomNeed, stability = v.stabilityNeed, depth = v.emotionalDepth;
  if (freedom - stability > 15 && social >= 50) return "independent";
  if (social >= 60 && depth < 55) return "magnetic";
  if (stability - freedom > 10 || depth >= 65) return "devoted";
  return "gentle";
}

export type RomanceDim = "socialDrive" | "creativity" | "adaptability" | "ambition" | "emotionalDepth";
export type RomanceBreakdown = Record<RomanceDim, number>;

export type RomanceProfile = {
  score: number; // 0-100，桃花磁场指数
  style: AttractionStyle;
  taoHua: TaoHuaResult;
  breakdown: RomanceBreakdown;
};

export function calculateRomance(v: LifeVector, pillars: {
  yearPillar: string; monthPillar: string; dayPillar: string; hourPillar: string | null;
}): RomanceProfile {
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
  const taoHua = findTaoHua(pillars);
  const breakdown: RomanceBreakdown = {
    socialDrive: clamp(v.socialDrive),
    creativity: clamp(v.creativity),
    adaptability: clamp(v.adaptability),
    ambition: clamp(v.ambition),
    emotionalDepth: clamp(v.emotionalDepth),
  };
  const base =
    breakdown.socialDrive * 0.35 +
    breakdown.creativity * 0.3 +
    breakdown.emotionalDepth * 0.25 +
    breakdown.adaptability * 0.1;
  // 命带桃花，在传统说法里代表"异性缘/人际吸引力更容易被看见"——
  // 给一个有限度的加分（不是决定性因素，是在已经算好的底分上，加一点
  // 传统命理视角的修正，跟其余维度一样只占一部分权重）。
  const score = clamp(base + (taoHua.hasTaoHua ? 12 : 0));
  return { score, style: attractionStyle(v), taoHua, breakdown };
}
