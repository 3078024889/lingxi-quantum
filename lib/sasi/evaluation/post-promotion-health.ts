export type SasiPostPromotionObservation = {
  snapshotId: string;
  correctness?: number | null;
  quality?: number | null;
  stability?: number | null;
  latencyMs?: number | null;
  costMinor?: number | null;
  errorRate?: number | null;
  sampleCount: number;
  observedAt: string;
};

export type SasiHealthPolicy = {
  minSamples: number;
  minCorrectness?: number;
  minQuality?: number;
  minStability?: number;
  maxLatencyMs?: number;
  maxCostMinor?: number;
  maxErrorRate?: number;
};

export function detectPromotionDegradation(
  observation: SasiPostPromotionObservation,
  policy: SasiHealthPolicy,
) {
  const reasons: string[] = [];

  if (observation.sampleCount < policy.minSamples) {
    return {
      degraded: false,
      reasons: ["INSUFFICIENT_POST_PROMOTION_SAMPLES"],
      decisive: false,
    };
  }

  if (
    policy.minCorrectness != null &&
    observation.correctness != null &&
    observation.correctness < policy.minCorrectness
  ) {
    reasons.push("POST_PROMOTION_CORRECTNESS_DROP");
  }
  if (
    policy.minQuality != null &&
    observation.quality != null &&
    observation.quality < policy.minQuality
  ) {
    reasons.push("POST_PROMOTION_QUALITY_DROP");
  }
  if (
    policy.minStability != null &&
    observation.stability != null &&
    observation.stability < policy.minStability
  ) {
    reasons.push("POST_PROMOTION_STABILITY_DROP");
  }
  if (
    policy.maxLatencyMs != null &&
    observation.latencyMs != null &&
    observation.latencyMs > policy.maxLatencyMs
  ) {
    reasons.push("POST_PROMOTION_LATENCY_REGRESSION");
  }
  if (
    policy.maxCostMinor != null &&
    observation.costMinor != null &&
    observation.costMinor > policy.maxCostMinor
  ) {
    reasons.push("POST_PROMOTION_COST_REGRESSION");
  }
  if (
    policy.maxErrorRate != null &&
    observation.errorRate != null &&
    observation.errorRate > policy.maxErrorRate
  ) {
    reasons.push("POST_PROMOTION_ERROR_RATE_REGRESSION");
  }

  return {
    degraded: reasons.length > 0,
    reasons,
    decisive: true,
  };
}
