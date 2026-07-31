// ────────────────────────────────────────────────────────────────
// 灵犀场 · 规则引擎（结构层 × 状态层）
// ────────────────────────────────────────────────────────────────
// 这是整套自主知识体系的心脏。它做的事只有一件：
//   拿到分数和状态 → 挑出该说的那几段话 → 拼成报告。
// 它**不生成**任何文字。所有文字都来自 knowledge/ 下人工审定过的
// 节点库。引擎只负责"挑"和"排"，不负责"写"。
//
// 三条设计约束（改动前先读 docs/KNOWLEDGE-BASE-DESIGN.md）：
// 1. 确定性——同一份输入永远得到同一份输出。变体选择用 hash 做种子，
//    不用 Math.random()。这是"可复算"这个信任承诺的技术基础。
// 2. 零外部调用——纯函数，不碰网络、不碰数据库。好测、好复算、
//    断网也能跑。
// 3. 组合优先——交叉节点永远压过单维节点。"你危机反弹92、日常恢复26"
//    这种话，才是让人觉得"说的就是我"的东西；单维内容容易像模板。

import bandsConfig from "@/knowledge/_shared/bands.json";

export type BandKey = "vlow" | "low" | "mid" | "high" | "vhigh";

export type StructureNode = {
  id: string;
  chapter: string;
  dim: string;
  band: BandKey;
  weight?: number;
  // 写作脚手架，不输出给用户，但 lint 强制要求填写
  corePattern: string;
  shadowSide: string;
  growthDirection: string;
  fieldText: { zh: string; en: string };
};

export type ComboCond = {
  contrast?: [string, string]; // [高维, 低维]
  bothLow?: string[];
  bothHigh?: string[];
  gapMin?: number;             // 反差阈值，默认 40
};

export type ComboNode = {
  id: string;
  chapter: string;
  when: ComboCond;
  priority: number;
  fieldText: { zh: string; en: string };
};

// 状态层节点——只有当用户真的有练习记录/自评历史时才会命中
export type StateNode = {
  id: string;
  chapter: string;
  when: {
    cadence?: "high" | "mid" | "low" | "none";
    shift?: "deepening" | "steady" | "strained";
    focusDim?: string;         // 这段时间主要在动哪一维
    spanMonthsMin?: number;    // 距上次至少过了几个月
    structureBand?: BandKey;   // 与结构层交叉：仅在该维处于此带时适用
    structureDim?: string;
  };
  priority: number;
  fieldText: { zh: string; en: string };
};

export type FieldState = {
  spanMonths: number;
  cadence: "high" | "mid" | "low" | "none";
  focusDim?: string;
  shift?: "deepening" | "steady" | "strained";
};

export type Scores = Record<string, number>;

// ── 分数 → 分数带 ──
// 阈值全部来自 knowledge/_shared/bands.json，不在代码里写死。
// 这样调整阈值是改数据，不是改代码，也就不需要重新发版。
export function bandOf(score: number): BandKey {
  const s = Math.max(0, Math.min(100, Math.round(score)));
  const hit = bandsConfig.bands.find((b) => s >= b.min && s <= b.max);
  return (hit?.key ?? "mid") as BandKey;
}

// ── 确定性哈希 ──
// 用出生数据（或任何稳定的种子串）+ 章节键做种子，从同 band 的多个
// 变体里挑一个。关键在于：同一个人任何时候重算都拿到同一段话，
// 不同的人拿到不一样的——既可复算，又不像模板。
// FNV-1a，短、快、分布够均匀。
function hash(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

// 按权重确定性地挑一个变体。weight 缺省为 1。
function pickVariant<T extends { weight?: number }>(items: T[], seed: string): T | null {
  if (items.length === 0) return null;
  if (items.length === 1) return items[0];
  const total = items.reduce((sum, it) => sum + (it.weight ?? 1), 0);
  let point = hash(seed) % total;
  for (const it of items) {
    point -= it.weight ?? 1;
    if (point < 0) return it;
  }
  return items[items.length - 1];
}

// ── 组合条件判定 ──
function comboMatches(cond: ComboCond, scores: Scores): boolean {
  const gapMin = cond.gapMin ?? 40;

  if (cond.contrast) {
    const [hiDim, loDim] = cond.contrast;
    const hi = scores[hiDim];
    const lo = scores[loDim];
    if (hi == null || lo == null) return false;
    if (hi - lo < gapMin) return false;
  }

  if (cond.bothLow) {
    for (const d of cond.bothLow) {
      const b = bandOf(scores[d] ?? 50);
      if (b !== "low" && b !== "vlow") return false;
    }
  }

  if (cond.bothHigh) {
    for (const d of cond.bothHigh) {
      const b = bandOf(scores[d] ?? 50);
      if (b !== "high" && b !== "vhigh") return false;
    }
  }

  return true;
}

function stateMatches(w: StateNode["when"], state: FieldState | null, scores: Scores): boolean {
  if (!state) return false; // 没有状态数据时，状态节点一律不参与
  if (w.cadence && w.cadence !== state.cadence) return false;
  if (w.shift && w.shift !== state.shift) return false;
  if (w.focusDim && w.focusDim !== state.focusDim) return false;
  if (w.spanMonthsMin != null && state.spanMonths < w.spanMonthsMin) return false;
  if (w.structureDim && w.structureBand) {
    if (bandOf(scores[w.structureDim] ?? 50) !== w.structureBand) return false;
  }
  return true;
}

export type Library = {
  nodes: StructureNode[];
  combos: ComboNode[];
  states?: StateNode[];
  chapters: { key: string; dim: string; titleZh: string; titleEn: string }[];
};

export type RenderedChapter = {
  chapter: string;
  titleZh: string;
  titleEn: string;
  blocks: { source: "combo" | "structure" | "state"; id: string; zh: string; en: string }[];
};

// ── 主入口 ──
// seed 用出生数据序列化后的字符串（如 "1990-03-05T14:20"），
// 它决定变体选择，所以必须稳定——同一个人每次传进来的必须一样。
export function buildReport(
  lib: Library,
  scores: Scores,
  seed: string,
  state: FieldState | null = null
): RenderedChapter[] {
  return lib.chapters.map((ch) => {
    const blocks: RenderedChapter["blocks"] = [];

    // 1. 组合节点优先——命中多条时取 priority 最高的一条。
    //    只取一条，不堆叠：两段组合内容放在一起会互相削弱。
    const hitCombos = lib.combos
      .filter((c) => c.chapter === ch.key && comboMatches(c.when, scores))
      .sort((a, b) => b.priority - a.priority);

    if (hitCombos.length > 0) {
      const c = hitCombos[0];
      blocks.push({ source: "combo", id: c.id, zh: c.fieldText.zh, en: c.fieldText.en });
    } else {
      // 2. 没命中组合 → 回落到本章主维度对应分数带的单维节点
      const band = bandOf(scores[ch.dim] ?? 50);
      const candidates = lib.nodes.filter(
        (n) => n.chapter === ch.key && n.dim === ch.dim && n.band === band
      );
      const picked = pickVariant(candidates, `${seed}|${ch.key}|${band}`);
      if (picked) {
        blocks.push({
          source: "structure",
          id: picked.id,
          zh: picked.fieldText.zh,
          en: picked.fieldText.en,
        });
      }
    }

    // 3. 状态层——附加在结构内容之后，不替换它。
    //    结构讲"你的地图长什么样"，状态讲"你最近在这张地图上走到哪"。
    //    两者是并列关系，不是覆盖关系。
    const hitStates = (lib.states ?? [])
      .filter((s) => s.chapter === ch.key && stateMatches(s.when, state, scores))
      .sort((a, b) => b.priority - a.priority);

    if (hitStates.length > 0) {
      const s = hitStates[0];
      blocks.push({ source: "state", id: s.id, zh: s.fieldText.zh, en: s.fieldText.en });
    }

    return { chapter: ch.key, titleZh: ch.titleZh, titleEn: ch.titleEn, blocks };
  });
}

// ── 自检：同一输入必须产出同一输出 ──
// 这不是可选的测试，是这套体系的核心承诺。任何改动之后都应该跑一遍。
export function verifyDeterminism(
  lib: Library,
  scores: Scores,
  seed: string,
  state: FieldState | null = null,
  runs = 50
): boolean {
  const first = JSON.stringify(buildReport(lib, scores, seed, state));
  for (let i = 1; i < runs; i++) {
    if (JSON.stringify(buildReport(lib, scores, seed, state)) !== first) return false;
  }
  return true;
}
