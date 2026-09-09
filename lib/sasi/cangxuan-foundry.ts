import "server-only";

import { createHash } from "crypto";

export const FOUNDRY_CATEGORIES = ["RULE", "PREFERENCE", "CORRECTION", "CONTINUITY", "SHOT", "SCRIPT", "CRITIQUE"] as const;
export type FoundryCategory = typeof FOUNDRY_CATEGORIES[number];
export type DatasetTier = "bronze" | "silver" | "gold";
export type RightsScope = "private_reference" | "opted_in_training" | "open_licensed" | "research_only" | "blocked";

export type ExtractedKnowledge = {
  category: FoundryCategory;
  title: string;
  statement: string;
  evidence: string;
  tier: DatasetTier;
  qualityScore: number;
  contentHash: string;
};

const CATEGORY_RULES: Array<{ category: FoundryCategory; pattern: RegExp; title: string }> = [
  { category: "CONTINUITY", pattern: /一致|固定|换脸|换衣|服装|声音|声纹|受伤|年龄|场景|连续|identity|continuity|costume|voice/i, title: "连续性约束" },
  { category: "SHOT", pattern: /镜头|景别|运镜|机位|构图|光影|摄影|轴线|shot|camera|framing/i, title: "镜头与摄影规则" },
  { category: "SCRIPT", pattern: /剧本|剧情|故事|世界观|人物弧|分集|叙事|script|story|episode/i, title: "剧本结构规则" },
  { category: "CRITIQUE", pattern: /不好|太慢|太少|错误|穿帮|不够|失败|审片|批评|bad|wrong|slow|critic/i, title: "审片与失败信号" },
  { category: "CORRECTION", pattern: /应该|改成|重做|纠正|修复|不要|不能|必须|should|must|never|repair/i, title: "用户纠错" },
  { category: "PREFERENCE", pattern: /喜欢|更好|保留|选择|偏好|满意|prefer|chosen|better/i, title: "导演偏好" },
];

export function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function normalizeFoundryText(value: string) {
  return value.replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export function redactCommonSecrets(value: string) {
  return value
    .replace(/\b(?:sk|xai|sb_secret|AIza)[-_][A-Za-z0-9_-]{12,}\b/g, "[REDACTED_CREDENTIAL]")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[REDACTED_EMAIL]")
    .replace(/(?<!\d)1[3-9]\d{9}(?!\d)/g, "[REDACTED_PHONE]")
    .replace(/https?:\/\/[^\s)\]}]+/gi, "[REDACTED_URL]");
}

function sentences(value: string) {
  return normalizeFoundryText(value)
    .split(/(?<=[。！？!?；;])\s*|\n+/)
    .map((item) => item.trim().replace(/^[-*#>\d.、\s]+/, ""))
    .filter((item) => item.length >= 8 && item.length <= 500);
}

export function extractDirectorKnowledge(value: string): ExtractedKnowledge[] {
  const unique = new Map<string, ExtractedKnowledge>();
  for (const evidence of sentences(redactCommonSecrets(value))) {
    const matched = CATEGORY_RULES.find((rule) => rule.pattern.test(evidence));
    if (!matched) continue;
    const normalized = evidence.replace(/^(用户|我|user)[:：]\s*/i, "").trim();
    const contentHash = sha256(`${matched.category}:${normalized.toLowerCase()}`);
    if (unique.has(contentHash)) continue;
    const signalCount = CATEGORY_RULES.filter((rule) => rule.pattern.test(evidence)).length;
    unique.set(contentHash, {
      category: matched.category,
      title: matched.title,
      statement: normalized,
      evidence,
      tier: "bronze",
      qualityScore: Math.min(0.89, 0.55 + signalCount * 0.08 + Math.min(normalized.length, 180) / 1800),
      contentHash,
    });
  }
  return [...unique.values()].slice(0, 80);
}

export function trainabilityFor(rights: RightsScope) {
  if (rights === "opted_in_training" || rights === "open_licensed") return "trainable";
  if (rights === "research_only") return "research_only";
  if (rights === "blocked") return "blocked";
  return "private_only";
}

export function mergeState(base: Record<string, unknown>, patch: Record<string, unknown>) {
  const next: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value && typeof value === "object" && !Array.isArray(value) && next[key] && typeof next[key] === "object" && !Array.isArray(next[key])) {
      next[key] = mergeState(next[key] as Record<string, unknown>, value as Record<string, unknown>);
    } else if (value === null) {
      delete next[key];
    } else {
      next[key] = value;
    }
  }
  return next;
}

export function resolveContinuityTimeline<T extends { state_patch: Record<string, unknown> }>(events: T[]) {
  let state: Record<string, unknown> = {};
  return events.map((event) => {
    state = mergeState(state, event.state_patch ?? {});
    return { ...event, resolvedState: state };
  });
}
