export type SasiCandidateMetrics = {
  correctness: number;
  quality: number;
  stability: number;
  latencyMs: number;
  costMinor: number;
  sampleCount: number;
  regressionCount: number;
};

export type SasiMetricWeights = {
  correctness: number;
  quality: number;
  stability: number;
  latency: number;
  cost: number;
};

export type SasiMetricBounds = {
  latencyTargetMs: number;
  latencyWorstMs: number;
  costTargetMinor: number;
  costWorstMinor: number;
};

function unit(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
}

function lowerIsBetter(value: number, target: number, worst: number) {
  if (!Number.isFinite(value)) return 0;
  if (value <= target) return 1;
  if (value >= worst) return 0;
  if (worst <= target) return 0;
  return 1 - (value - target) / (worst - target);
}

export function normalizedCandidateMetrics(
  metrics: SasiCandidateMetrics,
  bounds: SasiMetricBounds,
) {
  return {
    correctness: unit(metrics.correctness),
    quality: unit(metrics.quality),
    stability: unit(metrics.stability),
    latency: unit(
      lowerIsBetter(
        metrics.latencyMs,
        bounds.latencyTargetMs,
        bounds.latencyWorstMs,
      ),
    ),
    cost: unit(
      lowerIsBetter(
        metrics.costMinor,
        bounds.costTargetMinor,
        bounds.costWorstMinor,
      ),
    ),
  };
}

export function weightedCandidateScore(
  metrics: SasiCandidateMetrics,
  weights: SasiMetricWeights,
  bounds: SasiMetricBounds,
) {
  const normalized = normalizedCandidateMetrics(metrics, bounds);
  const positiveWeights = {
    correctness: Math.max(0, weights.correctness),
    quality: Math.max(0, weights.quality),
    stability: Math.max(0, weights.stability),
    latency: Math.max(0, weights.latency),
    cost: Math.max(0, weights.cost),
  };

  const totalWeight = Object.values(positiveWeights).reduce(
    (sum, value) => sum + value,
    0,
  );

  if (totalWeight <= 0) throw new Error("EVALUATION_WEIGHTS_INVALID");

  const score =
    normalized.correctness * positiveWeights.correctness +
    normalized.quality * positiveWeights.quality +
    normalized.stability * positiveWeights.stability +
    normalized.latency * positiveWeights.latency +
    normalized.cost * positiveWeights.cost;

  return {
    score: score / totalWeight,
    normalized,
  };
}
