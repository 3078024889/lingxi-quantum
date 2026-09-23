import type { SasiCandidateMetrics } from "@/lib/sasi/evaluation/metrics";

export type SasiCandidateGatePolicy = {
  minSamples: number;
  minCorrectness: number;
  minQuality: number;
  minStability: number;
  maxRegressionCount: number;
  maxLatencyMs: number;
  maxCostMinor: number;
};

export function evaluateCandidateGates(
  metrics: SasiCandidateMetrics,
  policy: SasiCandidateGatePolicy,
) {
  const reasons: string[] = [];

  if (metrics.sampleCount < policy.minSamples) {
    reasons.push("INSUFFICIENT_SAMPLES");
  }
  if (metrics.correctness < policy.minCorrectness) {
    reasons.push("CORRECTNESS_BELOW_FLOOR");
  }
  if (metrics.quality < policy.minQuality) {
    reasons.push("QUALITY_BELOW_FLOOR");
  }
  if (metrics.stability < policy.minStability) {
    reasons.push("STABILITY_BELOW_FLOOR");
  }
  if (metrics.regressionCount > policy.maxRegressionCount) {
    reasons.push("REGRESSION_LIMIT_EXCEEDED");
  }
  if (metrics.latencyMs > policy.maxLatencyMs) {
    reasons.push("LATENCY_LIMIT_EXCEEDED");
  }
  if (metrics.costMinor > policy.maxCostMinor) {
    reasons.push("COST_LIMIT_EXCEEDED");
  }

  return { ok: reasons.length === 0, reasons };
}
