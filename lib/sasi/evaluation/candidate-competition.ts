import type {
  SasiCandidateMetrics,
  SasiMetricBounds,
  SasiMetricWeights,
} from "@/lib/sasi/evaluation/metrics";
import { weightedCandidateScore } from "@/lib/sasi/evaluation/metrics";
import type { SasiCandidateGatePolicy } from "@/lib/sasi/evaluation/gates";
import { evaluateCandidateGates } from "@/lib/sasi/evaluation/gates";

export type SasiCandidateEvaluation = {
  candidateId: string;
  strategyId: string;
  metrics: SasiCandidateMetrics;
  developmentPassed: boolean;
  sealedPassed: boolean;
  regressionPassed: boolean;
  sandboxPassed: boolean;
  testedHeadSha: string;
};

export type SasiCompetitionPolicy = {
  weights: SasiMetricWeights;
  bounds: SasiMetricBounds;
  gates: SasiCandidateGatePolicy;
  minAbsoluteImprovement: number;
  minRelativeImprovement: number;
};

export type SasiCompetitionDecision =
  | {
      action: "keep-baseline";
      reasons: string[];
      baselineScore: number;
      candidateScores: Array<{ candidateId: string; score: number }>;
    }
  | {
      action: "candidate-qualified";
      reasons: string[];
      baselineScore: number;
      candidateId: string;
      candidateScore: number;
      absoluteImprovement: number;
      relativeImprovement: number;
    };

function fullGate(candidate: SasiCandidateEvaluation, policy: SasiCompetitionPolicy) {
  const metricGate = evaluateCandidateGates(candidate.metrics, policy.gates);
  const reasons = [...metricGate.reasons];

  if (!candidate.sandboxPassed) reasons.push("SANDBOX_REQUIRED");
  if (!candidate.developmentPassed) reasons.push("DEVELOPMENT_REQUIRED");
  if (!candidate.sealedPassed) reasons.push("SEALED_REQUIRED");
  if (!candidate.regressionPassed) reasons.push("REGRESSION_REQUIRED");
  if (!candidate.testedHeadSha.trim()) reasons.push("TESTED_HEAD_REQUIRED");

  return { ok: reasons.length === 0, reasons };
}

export function compareCandidates(input: {
  baseline: SasiCandidateEvaluation;
  candidates: SasiCandidateEvaluation[];
  policy: SasiCompetitionPolicy;
}): SasiCompetitionDecision {
  const baselineScore = weightedCandidateScore(
    input.baseline.metrics,
    input.policy.weights,
    input.policy.bounds,
  ).score;

  const evaluated = input.candidates.map((candidate) => {
    const gate = fullGate(candidate, input.policy);
    const score = weightedCandidateScore(
      candidate.metrics,
      input.policy.weights,
      input.policy.bounds,
    ).score;
    return { candidate, gate, score };
  });

  const qualified = evaluated
    .filter((item) => item.gate.ok)
    .map((item) => {
      const absoluteImprovement = item.score - baselineScore;
      const relativeImprovement =
        baselineScore > 0 ? absoluteImprovement / baselineScore : absoluteImprovement;
      return { ...item, absoluteImprovement, relativeImprovement };
    })
    .filter(
      (item) =>
        item.absoluteImprovement >= input.policy.minAbsoluteImprovement &&
        item.relativeImprovement >= input.policy.minRelativeImprovement,
    )
    .sort((a, b) => b.score - a.score);

  const best = qualified[0];

  if (!best) {
    return {
      action: "keep-baseline",
      reasons: evaluated.flatMap((item) =>
        item.gate.ok
          ? [`NO_MATERIAL_IMPROVEMENT:${item.candidate.candidateId}`]
          : item.gate.reasons.map(
              (reason) => `${item.candidate.candidateId}:${reason}`,
            ),
      ),
      baselineScore,
      candidateScores: evaluated.map((item) => ({
        candidateId: item.candidate.candidateId,
        score: item.score,
      })),
    };
  }

  return {
    action: "candidate-qualified",
    reasons: ["MEASURED_IMPROVEMENT_CONFIRMED"],
    baselineScore,
    candidateId: best.candidate.candidateId,
    candidateScore: best.score,
    absoluteImprovement: best.absoluteImprovement,
    relativeImprovement: best.relativeImprovement,
  };
}
