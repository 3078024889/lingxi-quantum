// ────────────────────────────────────────────────────────────────────
// 生命向量引擎（Life Vector Engine）
// ────────────────────────────────────────────────────────────────────
// 这是"先转结构化数据、再做矛盾检测"这层架构里，第一块真正的代码逻辑：
// 把星盘/八字这些原始命理数据，用固定的映射规则，转成一组带权重的
// 数值维度（0-100），不再是把原始数据整包丢给AI、指望AI自己从几十个
// 命理名词里"悟出"这个人的核心特质。
//
// 这一步是确定性的（同样的出生数据，永远算出同样的向量），不依赖AI，
// 这也是它跟"直接生成文字"最本质的区别——判断"这个人自由需求高不高"
// 这件事，现在是代码算出来的，不是AI猜的。
//
// 老实说在开头就要说清楚：这是一套规则驱动的v1版本，映射规则是基于
// 命理学常见的元素/十神对应关系人工编写的，不是机器学习或者统计学习
// 出来的模型，覆盖面也不可能穷尽所有命理学细节——这是"比让AI自己
// 从原始数据里挑重点"更进一步的做法，但不等同于一套经过验证的心理
// 测量模型。以后要往这个方向继续做深，可以持续往这个规则表里加规则、
// 调权重，不需要改动上层的报告生成逻辑。

import type { WesternElement, ChineseElement, PlanetPlacement } from "./lifemap-calc";

export type LifeVectorDim =
  | "freedomNeed"      // 自由需求——渴望不受束缚、自主选择
  | "stabilityNeed"    // 稳定需求——渴望确定性、安全感、可预期
  | "creativity"       // 创造倾向——原创、想象、开辟新路径
  | "discipline"       // 秩序纪律——规则感、执行力、按部就班
  | "riskTolerance"    // 风险偏好——愿意冒险、行动导向
  | "emotionalDepth"   // 情感深度——内在情绪的丰富程度与敏感度
  | "introspection"    // 内省倾向——向内审视、自我觉察
  | "socialDrive"      // 社交驱动——向外连接、影响他人的意愿
  | "ambition"         // 野心驱动——追求成就、扩张、被看见
  | "adaptability";     // 适应弹性——随环境调整、不执着于固定路径

export type LifeVector = Record<LifeVectorDim, number>;

const ZERO_VECTOR: LifeVector = {
  freedomNeed: 0, stabilityNeed: 0, creativity: 0, discipline: 0, riskTolerance: 0,
  emotionalDepth: 0, introspection: 0, socialDrive: 0, ambition: 0, adaptability: 0,
};

// 西方四元素 → 维度贡献（每个星体命中后加的分数，太阳/月亮权重更高，
// 因为它们是人格印记里权重最大的两颗星）
const WESTERN_ELEMENT_MAP: Record<WesternElement, Partial<Record<LifeVectorDim, number>>> = {
  fire: { ambition: 3, riskTolerance: 3, socialDrive: 2 },
  earth: { stabilityNeed: 3, discipline: 3 },
  air: { freedomNeed: 3, socialDrive: 2, adaptability: 2 },
  water: { emotionalDepth: 3, introspection: 3 },
};

// 中式五行 → 维度贡献（用于日主 + 五行分布加权）
const CHINESE_ELEMENT_MAP: Record<ChineseElement, Partial<Record<LifeVectorDim, number>>> = {
  wood: { creativity: 3, freedomNeed: 2, adaptability: 2 },
  fire: { ambition: 3, socialDrive: 2, riskTolerance: 2 },
  earth: { stabilityNeed: 3, discipline: 2 },
  metal: { discipline: 3, ambition: 2, introspection: 1 },
  water: { emotionalDepth: 3, introspection: 2, adaptability: 1 },
};

// 十神 → 维度贡献（只覆盖最常见的几个十神名称，字符串里包含即命中，
// 兼容"正财""偏财"这种写法差异）
const SHISHEN_MAP: { match: string; dims: Partial<Record<LifeVectorDim, number>> }[] = [
  { match: "正官", dims: { discipline: 3, stabilityNeed: 2 } },
  { match: "七杀", dims: { riskTolerance: 3, ambition: 2 } },
  { match: "正印", dims: { stabilityNeed: 2, introspection: 2 } },
  { match: "偏印", dims: { introspection: 3, freedomNeed: 1 } },
  { match: "正财", dims: { discipline: 2, stabilityNeed: 2 } },
  { match: "偏财", dims: { riskTolerance: 2, socialDrive: 2, adaptability: 1 } },
  { match: "食神", dims: { creativity: 3, emotionalDepth: 1 } },
  { match: "伤官", dims: { creativity: 3, freedomNeed: 2, socialDrive: 1 } },
  { match: "比肩", dims: { ambition: 2, discipline: 1 } },
  { match: "劫财", dims: { riskTolerance: 2, socialDrive: 2 } },
];

function addWeighted(v: LifeVector, contrib: Partial<Record<LifeVectorDim, number>>, weight: number) {
  for (const k in contrib) {
    const dim = k as LifeVectorDim;
    v[dim] += (contrib[dim] ?? 0) * weight;
  }
}

// facts 用最小必要字段的形状接收，避免这个模块反过来依赖 LifeMapFlow.tsx
// 里那个大的 Facts 类型（那边才是 UI 层，不应该被底层引擎依赖）。
export type LifeVectorInput = {
  sunElement: WesternElement;
  moonElement: WesternElement;
  mercury: PlanetPlacement; venus: PlanetPlacement; mars: PlanetPlacement;
  jupiter: PlanetPlacement; saturn: PlanetPlacement;
  dayMasterElement: ChineseElement;
  wuXingCount: Record<ChineseElement, number>;
  yearShiShen: string; monthShiShen: string; hourShiShen: string | null;
};

export function computeLifeVector(input: LifeVectorInput): LifeVector {
  const v: LifeVector = { ...ZERO_VECTOR };

  // 太阳、月亮权重最高（人格印记里最重的两颗星）
  addWeighted(v, WESTERN_ELEMENT_MAP[input.sunElement], 3);
  addWeighted(v, WESTERN_ELEMENT_MAP[input.moonElement], 2.5);
  // 水星/金星/火星权重中等
  addWeighted(v, WESTERN_ELEMENT_MAP[input.mercury.element], 1.5);
  addWeighted(v, WESTERN_ELEMENT_MAP[input.venus.element], 1.5);
  addWeighted(v, WESTERN_ELEMENT_MAP[input.mars.element], 1.5);
  // 木星/土星权重较轻（更慢、更背景性的影响）
  addWeighted(v, WESTERN_ELEMENT_MAP[input.jupiter.element], 1);
  addWeighted(v, WESTERN_ELEMENT_MAP[input.saturn.element], 1);

  // 日主五行权重最高（八字里的"我"）
  addWeighted(v, CHINESE_ELEMENT_MAP[input.dayMasterElement], 3);
  // 命局五行分布——按每个元素出现的次数加权
  for (const el in input.wuXingCount) {
    const count = input.wuXingCount[el as ChineseElement] ?? 0;
    if (count > 0) addWeighted(v, CHINESE_ELEMENT_MAP[el as ChineseElement], count * 0.6);
  }

  // 十神——年柱权重较轻（早年/家族底色），月柱权重最高（本命格局核心），
  // 时柱权重中等（晚年/子女宫，也代表行动的落点）
  const applyShiShen = (label: string | null, weight: number) => {
    if (!label) return;
    for (const rule of SHISHEN_MAP) {
      if (label.includes(rule.match)) addWeighted(v, rule.dims, weight);
    }
  };
  applyShiShen(input.yearShiShen, 1);
  applyShiShen(input.monthShiShen, 2.5);
  applyShiShen(input.hourShiShen, 1.5);

  // 归一化到 0-100，用当前十个维度里最大值做基准，保留相对强弱关系
  const max = Math.max(1, ...Object.values(v));
  const normalized: LifeVector = { ...ZERO_VECTOR };
  for (const k in v) {
    const dim = k as LifeVectorDim;
    normalized[dim] = Math.round((v[dim] / max) * 100);
  }
  return normalized;
}

// ────────────────────────────────────────────────────────────────────
// 矛盾检测引擎（Conflict Engine）
// ────────────────────────────────────────────────────────────────────
// 在生命向量里，寻找"两个维度都很高、但语义上互相拉扯"的组合——这才是
// GPT建议里说的"内在矛盾"，不是随便挑两个高分维度拼在一起，是明确定义
// 好的、语义上真实对立的维度对。
const OPPOSING_PAIRS: { a: LifeVectorDim; b: LifeVectorDim; labelZh: string; labelEn: string }[] = [
  { a: "freedomNeed", b: "stabilityNeed", labelZh: "自由 vs 稳定", labelEn: "Freedom vs Stability" },
  { a: "riskTolerance", b: "discipline", labelZh: "冒险 vs 秩序", labelEn: "Risk vs Order" },
  { a: "ambition", b: "introspection", labelZh: "外在成就 vs 内在审视", labelEn: "Outer Ambition vs Inner Reflection" },
  { a: "socialDrive", b: "emotionalDepth", labelZh: "向外连接 vs 向内情感", labelEn: "Outward Connection vs Inward Emotion" },
  { a: "creativity", b: "discipline", labelZh: "原创冲动 vs 既定秩序", labelEn: "Creative Impulse vs Established Order" },
  { a: "adaptability", b: "stabilityNeed", labelZh: "随时调整 vs 需要确定", labelEn: "Adapting Freely vs Needing Certainty" },
];

export type Conflict = { a: LifeVectorDim; b: LifeVectorDim; labelZh: string; labelEn: string; strength: number };

// 两个维度都要"足够高"（不是随便一高一低），且分差不能太悬殊（分差太大
// 就不算真正的拉扯，是一边明显压过另一边），才算一组真实的内在矛盾。
export function findConflicts(v: LifeVector, opts?: { minScore?: number; maxGap?: number; limit?: number }): Conflict[] {
  const minScore = opts?.minScore ?? 55;
  const maxGap = opts?.maxGap ?? 35;
  const limit = opts?.limit ?? 2;

  const candidates: Conflict[] = [];
  for (const pair of OPPOSING_PAIRS) {
    const scoreA = v[pair.a];
    const scoreB = v[pair.b];
    if (scoreA < minScore || scoreB < minScore) continue;
    const gap = Math.abs(scoreA - scoreB);
    if (gap > maxGap) continue;
    // strength：两个维度的平均分，减去分差的惩罚——分数越高、越接近，
    // 说明这组矛盾越真实、越有分量
    const strength = Math.round((scoreA + scoreB) / 2 - gap * 0.3);
    candidates.push({ a: pair.a, b: pair.b, labelZh: pair.labelZh, labelEn: pair.labelEn, strength });
  }
  candidates.sort((x, y) => y.strength - x.strength);
  return candidates.slice(0, limit);
}

// 找不出"高分+高分"这种强矛盾的情况下（比如整体分数偏平均），退而求其次，
// 找差距最大的一组维度，作为"这个人身上最悬殊的一组张力"来呈现，保证
// 每一份报告都至少有一组可以写的内在矛盾，不会出现"这个人没有矛盾"
// 这种空手情况。
export function findConflictsWithFallback(v: LifeVector): Conflict[] {
  const strong = findConflicts(v);
  if (strong.length > 0) return strong;

  const candidates: Conflict[] = OPPOSING_PAIRS.map((pair) => {
    const scoreA = v[pair.a];
    const scoreB = v[pair.b];
    const gap = Math.abs(scoreA - scoreB);
    return { a: pair.a, b: pair.b, labelZh: pair.labelZh, labelEn: pair.labelEn, strength: gap };
  }).sort((x, y) => y.strength - x.strength);
  return candidates.slice(0, 2);
}

// ────────────────────────────────────────────────────────────────────
// 关系共振引擎（Resonance Engine）
// ────────────────────────────────────────────────────────────────────
// 给"灵犀关系共振图谱"（合婚/合伙/合财富通用测试）用的——两个人各自
// 算出生命向量之后，在这里做比较，不是简单的"合不合"打分，是找出
// 具体在哪些维度上两人天然互补、哪些维度上容易产生真实的摩擦。
export type ResonancePoint = { dim: LifeVectorDim; labelZh: string; labelEn: string; a: number; b: number; gap: number };

export function compareLifeVectors(vA: LifeVector, vB: LifeVector) {
  const dims = Object.keys(vA) as LifeVectorDim[];
  const points: ResonancePoint[] = dims.map((dim) => ({
    dim, labelZh: DIM_LABEL[dim].zh, labelEn: DIM_LABEL[dim].en,
    a: vA[dim], b: vB[dim], gap: Math.abs(vA[dim] - vB[dim]),
  }));

  // 共鸣点：两人在同一维度上都很高——共享的价值观/驱动力，容易一拍即合
  const resonant = points.filter((p) => p.a >= 55 && p.b >= 55).sort((x, y) => (x.a + x.b) - (y.a + y.b)).reverse().slice(0, 3);

  // 互补点：在"对立维度对"里，一个人这一端高、另一个人恰好是对立那一端高——
  // 天然分工，比如一个人自由需求高、另一个人稳定需求高，凑在一起反而
  // 比两个人都一样更稳定。
  const complementary: { pairA: ResonancePoint; pairB: ResonancePoint; labelZh: string; labelEn: string }[] = [];
  for (const pair of OPPOSING_PAIRS) {
    const pA = points.find((p) => p.dim === pair.a)!;
    const pB = points.find((p) => p.dim === pair.b)!;
    // A的这一端明显高于B，且B的对立端明显高于A——互补
    if (pA.a - pA.b > 20 && pB.b - pB.a > 20) {
      complementary.push({ pairA: pA, pairB: pB, labelZh: pair.labelZh, labelEn: pair.labelEn });
    } else if (pA.b - pA.a > 20 && pB.a - pB.b > 20) {
      complementary.push({ pairA: pA, pairB: pB, labelZh: pair.labelZh, labelEn: pair.labelEn });
    }
  }

  // 摩擦点：在同一组对立维度对里，两人都在同一端很高（比如两人风险偏好
  // 都很高、秩序纪律都很低）——不是互补，是同一种倾向的叠加，容易在
  // 需要另一种力量平衡的时候，两人都缺那一块。
  const friction: { pairA: ResonancePoint; pairB: ResonancePoint; labelZh: string; labelEn: string }[] = [];
  for (const pair of OPPOSING_PAIRS) {
    const pA = points.find((p) => p.dim === pair.a)!;
    const pB = points.find((p) => p.dim === pair.b)!;
    if (pA.a >= 55 && pB.a >= 55 && Math.abs(pA.a - pB.a) < 20) {
      friction.push({ pairA: pA, pairB: pB, labelZh: pair.labelZh, labelEn: pair.labelEn });
    }
  }

  return { resonant, complementary: complementary.slice(0, 2), friction: friction.slice(0, 2) };
}

// 找出向量里分数最高的几个维度，作为"核心特质"——报告方法论第一步
// 要用到的"贯穿全篇的主干"
const DIM_LABEL: Record<LifeVectorDim, { zh: string; en: string }> = {
  freedomNeed: { zh: "自由需求", en: "need for freedom" },
  stabilityNeed: { zh: "稳定需求", en: "need for stability" },
  creativity: { zh: "创造倾向", en: "creative drive" },
  discipline: { zh: "秩序纪律", en: "discipline" },
  riskTolerance: { zh: "风险偏好", en: "risk tolerance" },
  emotionalDepth: { zh: "情感深度", en: "emotional depth" },
  introspection: { zh: "内省倾向", en: "introspection" },
  socialDrive: { zh: "社交驱动", en: "social drive" },
  ambition: { zh: "野心驱动", en: "ambition" },
  adaptability: { zh: "适应弹性", en: "adaptability" },
};

export function topTraits(v: LifeVector, n = 3): { dim: LifeVectorDim; score: number; labelZh: string; labelEn: string }[] {
  return (Object.keys(v) as LifeVectorDim[])
    .map((dim) => ({ dim, score: v[dim], labelZh: DIM_LABEL[dim].zh, labelEn: DIM_LABEL[dim].en }))
    .sort((x, y) => y.score - x.score)
    .slice(0, n);
}

// 财富来源类型分类——从生命向量里判断最接近哪一到两种财富来源倾向，
// 对应报告第8章现在要求AI"先判断类型、再展开"的那个分类体系。
export type WealthArchetype = "creator" | "connector" | "specialist" | "opportunist" | "builder";
const WEALTH_LABEL: Record<WealthArchetype, { zh: string; en: string }> = {
  creator: { zh: "创造型", en: "Creator" },
  connector: { zh: "资源型", en: "Connector" },
  specialist: { zh: "专业型", en: "Specialist" },
  opportunist: { zh: "机会型", en: "Opportunist" },
  builder: { zh: "经营型", en: "Builder" },
};

export function wealthArchetypes(v: LifeVector, n = 2): { type: WealthArchetype; labelZh: string; labelEn: string; score: number }[] {
  const scores: Record<WealthArchetype, number> = {
    creator: v.creativity * 0.7 + v.freedomNeed * 0.3,
    connector: v.socialDrive * 0.7 + v.adaptability * 0.3,
    specialist: v.discipline * 0.6 + v.introspection * 0.4,
    opportunist: v.riskTolerance * 0.7 + v.adaptability * 0.3,
    builder: v.stabilityNeed * 0.6 + v.discipline * 0.4,
  };
  return (Object.keys(scores) as WealthArchetype[])
    .map((type) => ({ type, score: Math.round(scores[type]), labelZh: WEALTH_LABEL[type].zh, labelEn: WEALTH_LABEL[type].en }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

// ────────────────────────────────────────────────────────────────────
// 生命韧性指数（Life Resilience Index）
// ────────────────────────────────────────────────────────────────────
// 跟财富类型、内在矛盾用的是同一套方法论：不是让AI自己判断"这个人命硬
// 不硬"，是从已经算出来的生命向量里，用固定规则，先算出一个0-100的
// 确定性分数，AI只负责围绕这个已经算好的分数、和它的五个子维度，写
// 有画面感的解读——不负责自己评分。
//
// 五个子维度，全部由现有十个生命向量维度组合得出，不需要额外向用户
// 收集新的数据：
// - 抗压恢复（stressRecovery）：适应弹性高、情感深度不过载，说明遇事
//   更容易"消化过去、回到状态"，而不是被情绪长期困住
// - 变化适应（adaptability）：直接复用生命向量里的"适应弹性"维度
// - 危机反弹（crisisRebound）：风险偏好与野心的组合——愿意冒险、又有
//   往前冲的驱动力，遇到低谷时更容易主动寻找下一个突破口，而不是原地等待
// - 长期坚持（persistence）：秩序纪律与野心的组合——既有执行力、又有
//   想要达成的目标，是"能不能扛住一件事的长期消耗"的底层支撑
// - 精神稳定（emotionalStability）：情感深度不过载、内省倾向高——情绪
//   有出口、且有自我觉察能力，不容易被情绪本身反噬
export type ResilienceDim = "stressRecovery" | "adaptability" | "crisisRebound" | "persistence" | "emotionalStability";
export type ResilienceBreakdown = Record<ResilienceDim, number>;

const RESILIENCE_LABEL: Record<ResilienceDim, { zh: string; en: string }> = {
  stressRecovery: { zh: "压力恢复能力", en: "Stress Recovery" },
  adaptability: { zh: "变化适应能力", en: "Adaptability" },
  crisisRebound: { zh: "危机反弹能力", en: "Crisis Rebound" },
  persistence: { zh: "长期坚持能力", en: "Persistence" },
  emotionalStability: { zh: "精神稳定能力", en: "Emotional Stability" },
};

export function calculateResilience(v: LifeVector): { score: number; breakdown: ResilienceBreakdown; labels: typeof RESILIENCE_LABEL } {
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
  const breakdown: ResilienceBreakdown = {
    stressRecovery: clamp(v.adaptability * 0.6 + (100 - v.emotionalDepth) * 0.4),
    adaptability: clamp(v.adaptability),
    crisisRebound: clamp(v.riskTolerance * 0.5 + v.ambition * 0.5),
    persistence: clamp(v.discipline * 0.5 + v.ambition * 0.5),
    emotionalStability: clamp((100 - v.emotionalDepth) * 0.5 + v.introspection * 0.5),
  };
  const score = clamp(
    breakdown.stressRecovery * 0.25 +
    breakdown.adaptability * 0.2 +
    breakdown.crisisRebound * 0.15 +
    breakdown.persistence * 0.25 +
    breakdown.emotionalStability * 0.15
  );
  return { score, breakdown, labels: RESILIENCE_LABEL };
}
