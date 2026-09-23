import type { SasiKnowledgeUnit } from "@/lib/sasi/knowledge/knowledge-unit";

const FAST_CHANGING_DOMAINS = new Set([
  "medicine-health",
  "computer-science",
  "software-engineering",
  "economics",
  "finance",
  "business",
  "law-institutions",
  "politics-civics",
  "media-information",
]);

export function knowledgeRevalidationIntervalDays(unit: SasiKnowledgeUnit) {
  if (unit.epistemicState === "contested") return 14;
  if (unit.epistemicState === "model-derived-hypothesis") return 7;
  if (FAST_CHANGING_DOMAINS.has(unit.domain)) return 30;
  return 180;
}

export function knowledgeNeedsRevalidation(
  unit: SasiKnowledgeUnit,
  now = new Date(),
) {
  if (!unit.lastVerifiedAt) return true;

  const verified = new Date(unit.lastVerifiedAt);
  if (Number.isNaN(verified.getTime())) return true;

  const ageMs = now.getTime() - verified.getTime();
  const maxAgeMs =
    knowledgeRevalidationIntervalDays(unit) * 24 * 60 * 60 * 1000;

  return ageMs > maxAgeMs;
}
