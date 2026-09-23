import type { SasiKnowledgeUnit } from "@/lib/sasi/knowledge/knowledge-unit";

export type SasiKnowledgeConflict = {
  concept: string;
  incumbentId: string;
  challengerId: string;
  reason:
    | "definition-conflict"
    | "relation-conflict"
    | "temporal-conflict"
    | "source-conflict";
  incumbentConfidence: number;
  challengerConfidence: number;
};

export type SasiConflictResolution =
  | { action: "keep-both"; reason: string }
  | { action: "prefer-incumbent"; reason: string }
  | { action: "prefer-challenger"; reason: string }
  | { action: "needs-verification"; reason: string };

function hasStrongExternalEvidence(unit: SasiKnowledgeUnit) {
  return unit.evidence.some((e) =>
    ["primary-source", "official-source", "peer-reviewed"].includes(e.sourceClass),
  );
}

export function resolveKnowledgeConflict(
  incumbent: SasiKnowledgeUnit,
  challenger: SasiKnowledgeUnit,
): SasiConflictResolution {
  if (incumbent.concept !== challenger.concept) {
    return { action: "keep-both", reason: "DIFFERENT_CONCEPTS" };
  }

  const incumbentStrong = hasStrongExternalEvidence(incumbent);
  const challengerStrong = hasStrongExternalEvidence(challenger);

  if (incumbentStrong && !challengerStrong) {
    return { action: "prefer-incumbent", reason: "STRONGER_EXTERNAL_EVIDENCE" };
  }

  if (!incumbentStrong && challengerStrong) {
    return { action: "prefer-challenger", reason: "STRONGER_EXTERNAL_EVIDENCE" };
  }

  if (
    challenger.lastVerifiedAt &&
    incumbent.lastVerifiedAt &&
    challenger.lastVerifiedAt > incumbent.lastVerifiedAt &&
    challenger.confidence >= incumbent.confidence
  ) {
    return { action: "prefer-challenger", reason: "NEWER_EQUIVALENT_OR_STRONGER_EVIDENCE" };
  }

  if (Math.abs(challenger.confidence - incumbent.confidence) < 0.1) {
    return { action: "needs-verification", reason: "SIMILAR_CONFIDENCE_CONFLICT" };
  }

  return challenger.confidence > incumbent.confidence
    ? { action: "prefer-challenger", reason: "HIGHER_CONFIDENCE" }
    : { action: "prefer-incumbent", reason: "HIGHER_CONFIDENCE" };
}
