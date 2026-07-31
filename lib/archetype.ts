// ────────────────────────────────────────────────────────────────
// 灵犀场 · 本相判定（八相）
// ────────────────────────────────────────────────────────────────
// 这里判的是**形态**，不是高低。这是它跟分数带最根本的区别：
//   同样均分 70，五维平齐的人和五维锯齿的人，
//   分数带完全一样，本相完全不同——而后者才是"这个人是怎么搭起来的"。
//
// 判定必须是确定性的、可解释的：给定同一组分数，永远同一相，
// 而且能说清为什么是这一相。所以用的是明确的形态判据，
// 不是打分投票，也不是任何形式的随机。
//
// 判定顺序即优先级——从最有辨识度的形态开始判，逐级回落。
// 最后兜底到"经纬"，因为没有任何突出形态本身就是一种形态。

import axes from "@/knowledge/_shared/axes-72.json";

export type ArchetypeKey =
  | "keel" | "lattice" | "blade" | "ember"
  | "tide" | "anchor" | "arrow" | "well";

export type PhaseKey =
  | "unbroken" | "first" | "strain" | "crack"
  | "hold" | "turn" | "knit" | "temper" | "still";

// 五维分组：守侧（恢复/稳定）与攻侧（冲击/反弹）。
// 这个分组是"锚"与"矢"两相的判据基础。
const GUARD = ["recovery", "stability"];
const STRIKE = ["crisis", "adaptive"];

export type Scores = Record<string, number>;

function vals(s: Scores): number[] {
  return Object.values(s).filter((v) => typeof v === "number");
}
const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / (a.length || 1);
const sd = (a: number[]) => {
  const m = mean(a);
  return Math.sqrt(mean(a.map((v) => (v - m) ** 2)));
};
const avgOf = (s: Scores, keys: string[]) => {
  const picked = keys.map((k) => s[k]).filter((v) => typeof v === "number") as number[];
  return picked.length ? mean(picked) : mean(vals(s));
};

export type ArchetypeResult = {
  key: ArchetypeKey;
  zh: string;
  en: string;
  stanceZh: string;
  stanceEn: string;
  reason: string; // 为什么判成这一相——必须能对用户解释清楚
};

export function archetypeOf(scores: Scores): ArchetypeResult {
  const v = vals(scores);
  const m = mean(v);
  const spread = sd(v);
  const hi = Math.max(...v);
  const lo = Math.min(...v);
  const gap = hi - lo;
  const guard = avgOf(scores, GUARD);
  const strike = avgOf(scores, STRIKE);
  const topCount = v.filter((x) => x >= hi - 6).length;

  let key: ArchetypeKey;
  let reason: string;

  if (gap >= 55) {
    // 极端反差——最有辨识度的形态，优先判
    key = "blade";
    reason = `最高与最低相差 ${Math.round(gap)} 分，落差极大`;
  } else if (topCount === 1 && hi - m >= 18 && spread >= 12) {
    // 单点远高于其余，且其余相对聚拢 → 有明确主梁
    key = "keel";
    reason = `单项 ${Math.round(hi)} 分明显高出其余，成为结构主梁`;
  } else if (m <= 34 && spread <= 12) {
    // 整体偏低但均匀，没有塌 → 靠小输入维持
    key = "ember";
    reason = `整体均分 ${Math.round(m)} 偏低，但五项接近，没有塌陷`;
  } else if (guard - strike >= 15) {
    key = "anchor";
    reason = `恢复与稳定一侧（${Math.round(guard)}）明显厚于冲击一侧（${Math.round(strike)}）`;
  } else if (strike - guard >= 15) {
    key = "arrow";
    reason = `冲击与反弹一侧（${Math.round(strike)}）明显厚于守侧（${Math.round(guard)}）`;
  } else if (spread >= 20) {
    // 分散度大但不是极端反差，也没有单一主梁 → 呈涨落
    key = "tide";
    reason = `各项之间起伏明显（离散度 ${Math.round(spread)}），强弱随周期换位`;
  } else if (spread <= 7) {
    // 极度平齐——注意这一条必须排在"井"前面。
    // 经纬与井的分界就是离散度：经纬是几乎没有起伏（靠彼此支撑），
    // 井是中段仍有起伏但读不出深浅。68–72 这种是经纬，不是井。
    key = "lattice";
    reason = `五项几乎平齐（离散度 ${Math.round(spread)}），无单一主梁，靠彼此支撑`;
  } else if (lo >= 45 && hi <= 75) {
    // 中段密集、上不封顶也不见底 → 深浅要事情够大才见
    key = "well";
    reason = `五项集中在中段（${Math.round(lo)}–${Math.round(hi)}），表层读不出深浅`;
  } else {
    key = "lattice";
    reason = `五项接近平齐（离散度 ${Math.round(spread)}），无单一主梁，靠彼此支撑`;
  }

  const a = axes.archetypes.find((x) => x.key === key)!;
  return { key, zh: a.zh, en: a.en, stanceZh: a.stanceZh, stanceEn: a.stanceEn, reason };
}

// ── 时相判定 ──
// 来自状态层，不来自出生数据。没有状态数据时一律是"未启"——
// 这是诚实的默认：系统还没见过这个人在压力下的样子，不能假装知道。
export type FieldState = {
  spanMonths: number;
  cadence: "high" | "mid" | "low" | "none";
  shift?: "deepening" | "steady" | "strained";
  reportCount?: number; // 这是第几份报告
};

export function phaseOf(state: FieldState | null): PhaseKey {
  if (!state || (state.reportCount ?? 1) <= 1) return "unbroken";

  const { cadence, shift, spanMonths } = state;

  if (shift === "strained" && cadence === "none") return "crack";
  if (shift === "strained") return "strain";
  if (shift === "deepening" && cadence === "high" && spanMonths >= 6) return "temper";
  if (shift === "deepening" && cadence === "high") return "knit";
  if (shift === "deepening") return "turn";
  if (cadence === "high" && shift === "steady") return "still";
  if (cadence === "none" && spanMonths >= 6) return "hold";
  if (cadence === "low" || cadence === "mid") return "hold";
  return "first";
}

export function phaseInfo(key: PhaseKey) {
  return axes.phases.find((p) => p.key === key)!;
}

export function cellOf(scores: Scores, state: FieldState | null) {
  const a = archetypeOf(scores);
  const p = phaseOf(state);
  const pi = phaseInfo(p);
  // 注意：pi 本身已经带 key 字段，所以不能写成 { key: p, ...pi }——
  // 展开会把前面的 key 覆盖掉。直接用 pi 即可，它的 key 就是 p。
  return { archetype: a, phase: pi, cell: `${a.key}·${p}` };
}
