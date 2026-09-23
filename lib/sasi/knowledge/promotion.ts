import type { SasiKnowledgeUnit } from "@/lib/sasi/knowledge/knowledge-unit";
import { validateKnowledgeUnit } from "@/lib/sasi/knowledge/knowledge-unit";

export type SasiKnowledgeVerification = {
  independentSourceCount: number;
  primaryOrOfficialCount: number;
  peerReviewedCount: number;
  contradictionCount: number;
  staleEvidenceCount: number;
  modelAgreementCount: number;
  modelDisagreementCount: number;
};

export function evaluateKnowledgePromotion(
  unit: SasiKnowledgeUnit,
  verification: SasiKnowledgeVerification,
) {
  const validation = validateKnowledgeUnit(unit);
  const reasons = [...validation.errors];

  const externalEvidenceCount = unit.evidence.filter(
    (item) => item.sourceClass !== "model-generated",
  ).length;

  if (unit.epistemicState === "verified-fact") {
    if (externalEvidenceCount < 1) reasons.push("EXTERNAL_EVIDENCE_REQUIRED");
    if (verification.independentSourceCount < 1) {
      reasons.push("INDEPENDENT_SOURCE_REQUIRED");
    }
    if (verification.contradictionCount > 0) {
      reasons.push("UNRESOLVED_CONTRADICTION");
    }
  }

  if (verification.staleEvidenceCount > 0) {
    reasons.push("STALE_EVIDENCE_REQUIRES_REVALIDATION");
  }

  return {
    ok: reasons.length === 0,
    reasons,
    canEnterSemanticMemory:
      reasons.length === 0 &&
      unit.epistemicState !== "unknown" &&
      unit.epistemicState !== "deprecated",
  };
}

export function promoteModelHypothesis(
  unit: SasiKnowledgeUnit,
  verification: SasiKnowledgeVerification,
): SasiKnowledgeUnit {
  if (unit.epistemicState !== "model-derived-hypothesis") {
    throw new Error("ONLY_MODEL_HYPOTHESIS_CAN_BE_PROMOTED_BY_THIS_FUNCTION");
  }

  const externalEvidence = unit.evidence.filter(
    (item) => item.sourceClass !== "model-generated",
  );

  if (
    externalEvidence.length < 1 ||
    verification.independentSourceCount < 1 ||
    verification.contradictionCount > 0
  ) {
    throw new Error("INSUFFICIENT_EVIDENCE_FOR_PROMOTION");
  }

  return {
    ...unit,
    epistemicState:
      verification.primaryOrOfficialCount > 0 ||
      verification.peerReviewedCount > 0
        ? "verified-fact"
        : "well-supported",
    confidence: Math.min(0.95, Math.max(unit.confidence, 0.82)),
    lastVerifiedAt: new Date().toISOString(),
  };
}
