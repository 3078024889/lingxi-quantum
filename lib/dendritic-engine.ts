import { createHash } from "crypto";

export const DENDRITIC_ENGINE_VERSION = "1.0.0";
export const DEFAULT_KNOWLEDGE_VERSION = "2026.08";

export type DendriteKind =
  | "basic"
  | "cross"
  | "context"
  | "temporal"
  | "action"
  | "counterevidence"
  | "narrative"
  | "safety";

export type BandResolution = 9 | 13 | 21;

export type ScoreBand = {
  index: number;
  count: BandResolution;
  min: number;
  max: number;
  exact: number;
  intensity: number;
};

export type DendriticCondition =
  | { op: "score"; dim: string; min?: number; max?: number }
  | { op: "gap"; left: string; right: string; min: number; max?: number }
  | { op: "rank"; dim: string; withinTop: number }
  | { op: "context"; key: string; value: string }
  | { op: "all"; conditions: DendriticCondition[] }
  | { op: "any"; conditions: DendriticCondition[] }
  | { op: "not"; condition: DendriticCondition };

export type DendriticFragments = {
  judgment?: string;
  mechanism?: string;
  scenario?: string;
  shadow?: string;
  counterevidence?: string;
  action?: string;
  narrative?: string;
};

export type DendriticNode = {
  id: string;
  knowledgeVersion: string;
  product: string;
  chapter: string;
  kind: DendriteKind;
  priority: number;
  conditions: DendriticCondition;
  dimensions: string[];
  fragments: DendriticFragments;
  safetyTags?: string[];
};

export type ActivationInput = {
  product: string;
  scores: Record<string, number>;
  context: Record<string, string>;
  seed: string;
  locale: "zh" | "en";
};

export type ActivatedNode = {
  node: DendriticNode;
  reason: string;
  deterministicOrder: number;
};

export type EvidenceItem = {
  key: string;
  label: string;
  value: string | number;
  source: "calculation" | "fact" | "comparison" | "context";
};

export type ChapterSlots = {
  judgment: string;
  evidence: string;
  mechanism: string;
  scenario: string;
  shadow: string;
  counterevidence: string;
  action: string;
  narrative?: string;
};

export type ChapterTrace = {
  engineVersion: string;
  knowledgeVersion: string;
  chapter: string;
  activatedNodeIds: string[];
  evidence: EvidenceItem[];
  safetyFlags: string[];
};

export type ComposedChapter = {
  text: string;
  trace: ChapterTrace;
};

const PROHIBITED_PATTERNS: { id: string; pattern: RegExp }[] = [
  { id: "fate-verdict", pattern: /(注定|必然会|命中注定|你天生就是|决定了你会)/u },
  { id: "medical-diagnosis", pattern: /(确诊|治愈|疗效|替代治疗|停止服药)/u },
  { id: "fear-manipulation", pattern: /(不购买.*灾|错过.*厄运|必须立即付费)/u },
  { id: "dependency", pattern: /(只能依靠灵犀|离开灵犀.*无法|必须每天购买)/u },
  { id: "false-science", pattern: /(科学已经证明.*命运|量子力学证明.*性格)/u },
];

export function semanticBand(score: number, count: BandResolution = 13): ScoreBand {
  const exact = Math.max(0, Math.min(100, Number.isFinite(score) ? score : 50));
  const index = Math.min(count - 1, Math.floor((exact / 101) * count));
  const min = Math.ceil((index * 101) / count);
  const max = Math.min(100, Math.ceil(((index + 1) * 101) / count) - 1);
  const midpoint = (min + max) / 2;
  const halfWidth = Math.max(1, (max - min + 1) / 2);
  return {
    index,
    count,
    min,
    max,
    exact,
    intensity: Math.max(-1, Math.min(1, (exact - midpoint) / halfWidth)),
  };
}

function rankedDimensions(scores: Record<string, number>): string[] {
  return Object.keys(scores).sort((a, b) => {
    const scoreDelta = (scores[b] ?? 0) - (scores[a] ?? 0);
    return scoreDelta !== 0 ? scoreDelta : a.localeCompare(b);
  });
}

function matches(condition: DendriticCondition, input: ActivationInput): boolean {
  if (condition.op === "score") {
    const value = input.scores[condition.dim];
    if (value == null) return false;
    if (condition.min != null && value < condition.min) return false;
    if (condition.max != null && value > condition.max) return false;
    return true;
  }
  if (condition.op === "gap") {
    const left = input.scores[condition.left];
    const right = input.scores[condition.right];
    if (left == null || right == null) return false;
    const gap = Math.abs(left - right);
    return gap >= condition.min && (condition.max == null || gap <= condition.max);
  }
  if (condition.op === "rank") {
    return rankedDimensions(input.scores).slice(0, condition.withinTop).includes(condition.dim);
  }
  if (condition.op === "context") {
    return input.context[condition.key] === condition.value;
  }
  if (condition.op === "all") return condition.conditions.every((child) => matches(child, input));
  if (condition.op === "any") return condition.conditions.some((child) => matches(child, input));
  return !matches(condition.condition, input);
}

function stableOrder(seed: string, id: string): number {
  const hex = createHash("sha256").update(seed + "|" + id).digest("hex").slice(0, 12);
  return Number.parseInt(hex, 16);
}

function describeCondition(condition: DendriticCondition): string {
  if (condition.op === "score") return "score:" + condition.dim;
  if (condition.op === "gap") return "gap:" + condition.left + ":" + condition.right;
  if (condition.op === "rank") return "rank:" + condition.dim;
  if (condition.op === "context") return "context:" + condition.key + "=" + condition.value;
  if (condition.op === "not") return "not(" + describeCondition(condition.condition) + ")";
  return condition.op + "(" + condition.conditions.map(describeCondition).join(",") + ")";
}

export function activateDendrites(
  nodes: DendriticNode[],
  input: ActivationInput,
  chapter: string,
  limit = 8,
): ActivatedNode[] {
  const seen = new Set<string>();
  return nodes
    .filter((node) => node.product === input.product && node.chapter === chapter)
    .filter((node) => matches(node.conditions, input))
    .map((node) => ({
      node,
      reason: describeCondition(node.conditions),
      deterministicOrder: stableOrder(input.seed, node.id),
    }))
    .sort((a, b) => b.node.priority - a.node.priority || a.deterministicOrder - b.deterministicOrder)
    .filter((activation) => {
      if (seen.has(activation.node.id)) return false;
      seen.add(activation.node.id);
      return true;
    })
    .slice(0, Math.max(1, limit));
}

export function auditSafety(text: string): string[] {
  return PROHIBITED_PATTERNS
    .filter((rule) => rule.pattern.test(text))
    .map((rule) => rule.id);
}

function assertChapterSlots(slots: ChapterSlots): void {
  const required: (keyof ChapterSlots)[] = [
    "judgment",
    "evidence",
    "mechanism",
    "scenario",
    "shadow",
    "counterevidence",
    "action",
  ];
  const missing = required.filter((key) => !slots[key]?.trim());
  if (missing.length > 0) {
    throw new Error("Dendritic chapter missing slots: " + missing.join(", "));
  }
}

export function composeDendriticChapter(args: {
  chapter: string;
  knowledgeVersion?: string;
  slots: ChapterSlots;
  activated: ActivatedNode[];
  evidence: EvidenceItem[];
  presentation?: "diagnostic" | "editorial";
  editorialIndex?: number;
}): ComposedChapter {
  assertChapterSlots(args.slots);
  const diagnosticParagraphs = [
    args.slots.judgment,
    args.slots.evidence,
    args.slots.mechanism,
    args.slots.scenario,
    args.slots.shadow,
    args.slots.counterevidence,
    args.slots.action,
    args.slots.narrative,
  ].filter((value): value is string => Boolean(value?.trim()));
  const stripDiagnosticHeading = (value: string) => value
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(
      /^(结构证据|深层机制|现实观察|阴影机制|反证校验|行动协议|Structural evidence|Mechanism|Reality check|Shadow mechanism|Counter-check|Action protocol)\s*[:：]\s*/i,
      "",
    ))
    .join("\n\n");
  const editorialIndex = args.editorialIndex ?? 0;
  const editorialParagraphs = [
    args.slots.judgment,
    args.slots.mechanism,
    editorialIndex % 2 === 0 ? args.slots.scenario : args.slots.shadow,
    editorialIndex % 3 === 2 ? args.slots.counterevidence : undefined,
    args.slots.action,
    args.slots.narrative,
  ]
    .filter((value): value is string => Boolean(value?.trim()))
    .map(stripDiagnosticHeading);
  const sourceParagraphs = args.presentation === "editorial" ? editorialParagraphs : diagnosticParagraphs;
  const seen = new Set<string>();
  const paragraphs = sourceParagraphs.filter((paragraph) => {
    const key = paragraph.replace(/\s+/g, " ").trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const text = paragraphs.join("\n\n");
  const safetyFlags = auditSafety(text);
  if (safetyFlags.length > 0) {
    throw new Error("Dendritic safety violation: " + safetyFlags.join(", "));
  }
  return {
    text,
    trace: {
      engineVersion: DENDRITIC_ENGINE_VERSION,
      knowledgeVersion: args.knowledgeVersion ?? DEFAULT_KNOWLEDGE_VERSION,
      chapter: args.chapter,
      activatedNodeIds: args.activated.map((item) => item.node.id),
      evidence: args.evidence,
      safetyFlags,
    },
  };
}

export function validateNode(node: DendriticNode): string[] {
  const errors: string[] = [];
  if (!node.id.trim()) errors.push("missing-id");
  if (!node.knowledgeVersion.trim()) errors.push("missing-knowledge-version");
  if (!node.product.trim()) errors.push("missing-product");
  if (!node.chapter.trim()) errors.push("missing-chapter");
  if (node.dimensions.length === 0 && node.kind !== "context" && node.kind !== "safety") {
    errors.push("missing-dimensions");
  }
  const fragmentText = Object.values(node.fragments).filter(Boolean).join("\n");
  if (!fragmentText.trim()) errors.push("missing-fragments");
  errors.push(...auditSafety(fragmentText).map((flag) => "safety:" + flag));
  return errors;
}
