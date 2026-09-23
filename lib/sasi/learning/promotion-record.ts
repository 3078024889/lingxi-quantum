import type { SasiBenchmarkResult } from "@/lib/sasi/learning/benchmark-registry";

export type SasiEvolutionPromotionRecord = {
  id: string;
  strategyId: string;
  hypothesisId: string;
  proposalId?: string | null;
  development: SasiBenchmarkResult;
  sealed: SasiBenchmarkResult;
  regression: SasiBenchmarkResult;
  sandboxPassed: boolean;
  humanApproved: boolean;
  testedHeadSha: string;
  currentHeadSha: string;
  decision: "promote" | "reject" | "stale";
  reasons: string[];
  createdAt: string;
};

export function decideEvolutionPromotion(input: {
  id: string;
  strategyId: string;
  hypothesisId: string;
  proposalId?: string | null;
  development: SasiBenchmarkResult;
  sealed: SasiBenchmarkResult;
  regression: SasiBenchmarkResult;
  sandboxPassed: boolean;
  humanApproved: boolean;
  testedHeadSha: string;
  currentHeadSha: string;
}): SasiEvolutionPromotionRecord {
  const reasons: string[] = [];

  if (!input.sandboxPassed) reasons.push("SANDBOX_REQUIRED");
  if (!input.development.passed) reasons.push("DEVELOPMENT_BENCHMARK_FAILED");
  if (!input.sealed.passed) reasons.push("SEALED_BENCHMARK_FAILED");
  if (!input.regression.passed || input.regression.regressionCount > 0) {
    reasons.push("REGRESSION_FAILED");
  }
  if (!input.humanApproved) reasons.push("HUMAN_APPROVAL_REQUIRED");

  const stale =
    !input.testedHeadSha ||
    !input.currentHeadSha ||
    input.testedHeadSha !== input.currentHeadSha;

  if (stale) reasons.push("TESTED_HEAD_STALE");

  return {
    ...input,
    decision: stale ? "stale" : reasons.length === 0 ? "promote" : "reject",
    reasons,
    createdAt: new Date().toISOString(),
  };
}
