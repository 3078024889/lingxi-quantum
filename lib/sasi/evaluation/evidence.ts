import type { SasiCompetitionDecision } from "@/lib/sasi/evaluation/candidate-competition";

export type SasiEvaluationEvidence = {
  id: string;
  evolutionCycleId?: string | null;
  baselineCandidateId: string;
  evaluatedCandidateIds: string[];
  developmentSuiteHash: string;
  sealedSuiteHash: string;
  regressionSuiteHash: string;
  decision: SasiCompetitionDecision;
  testedHeadSha: string;
  createdAt: string;
};

export function validateEvaluationEvidence(
  evidence: SasiEvaluationEvidence,
) {
  const errors: string[] = [];

  if (!evidence.baselineCandidateId.trim()) errors.push("BASELINE_REQUIRED");
  if (evidence.evaluatedCandidateIds.length === 0) {
    errors.push("CANDIDATE_REQUIRED");
  }
  if (!evidence.developmentSuiteHash.trim()) {
    errors.push("DEVELOPMENT_HASH_REQUIRED");
  }
  if (!evidence.sealedSuiteHash.trim()) {
    errors.push("SEALED_HASH_REQUIRED");
  }
  if (!evidence.regressionSuiteHash.trim()) {
    errors.push("REGRESSION_HASH_REQUIRED");
  }
  if (!evidence.testedHeadSha.trim()) errors.push("TESTED_HEAD_REQUIRED");

  return { ok: errors.length === 0, errors };
}
