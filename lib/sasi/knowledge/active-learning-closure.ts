import type { SasiActiveLearningItem } from "@/lib/sasi/knowledge/active-learning";
import type { SasiIngestionDecision } from "@/lib/sasi/knowledge/ingestion-pipeline";

export type SasiLearningClosure = {
  queueItemId: string;
  closed: boolean;
  nextState: "verified" | "researching" | "deferred";
  reason: string;
};

export function closeActiveLearningItem(
  item: SasiActiveLearningItem,
  decision: SasiIngestionDecision,
): SasiLearningClosure {
  if (decision.action === "candidate-ready") {
    return {
      queueItemId: item.id,
      closed: true,
      nextState: "verified",
      reason: "KNOWLEDGE_CANDIDATE_READY",
    };
  }

  if (decision.action === "needs-evidence") {
    return {
      queueItemId: item.id,
      closed: false,
      nextState: "researching",
      reason: decision.reasons.join("|") || "MORE_EVIDENCE_REQUIRED",
    };
  }

  return {
    queueItemId: item.id,
    closed: false,
    nextState: "deferred",
    reason: decision.reasons.join("|") || "CANDIDATE_REJECTED",
  };
}
