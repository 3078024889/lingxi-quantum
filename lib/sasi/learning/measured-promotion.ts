import type { SasiCompetitionDecision } from "@/lib/sasi/evaluation/candidate-competition";
import { decideEvolutionPromotion } from "@/lib/sasi/learning/promotion-record";
import type { SasiBenchmarkResult } from "@/lib/sasi/learning/benchmark-registry";

export function competitionToPromotion(input: {
  competition: SasiCompetitionDecision;
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
}) {
  if (input.competition.action !== "candidate-qualified") {
    return {
      eligible: false as const,
      reason: "NO_MEASURED_CANDIDATE_IMPROVEMENT",
      promotion: null,
    };
  }

  const promotion = decideEvolutionPromotion({
    id: crypto.randomUUID(),
    strategyId: input.strategyId,
    hypothesisId: input.hypothesisId,
    proposalId: input.proposalId,
    development: input.development,
    sealed: input.sealed,
    regression: input.regression,
    sandboxPassed: input.sandboxPassed,
    humanApproved: input.humanApproved,
    testedHeadSha: input.testedHeadSha,
    currentHeadSha: input.currentHeadSha,
  });

  return {
    eligible: promotion.decision === "promote",
    reason:
      promotion.decision === "promote"
        ? "MEASURED_CANDIDATE_PROMOTABLE"
        : promotion.reasons.join("|"),
    promotion,
  };
}
