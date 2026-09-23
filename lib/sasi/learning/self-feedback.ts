import type { SasiMeasuredCapability } from "@/lib/sasi/self/self-model";

export type SasiCapabilityObservation = {
  capability: string;
  benchmark: string;
  score: number;
  passed: boolean;
  sampleCount: number;
  measuredAt: string;
};

function bounded(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
}

export function mergeCapabilityObservation(
  previous: SasiMeasuredCapability | undefined,
  observation: SasiCapabilityObservation,
): SasiMeasuredCapability {
  const currentScore = bounded(observation.score);
  const previousN = previous?.sampleSize ?? 0;
  const incomingN = Math.max(1, Math.floor(observation.sampleCount || 1));
  const total = previousN + incomingN;

  const weightedScore =
    total > 0
      ? (((previous?.score ?? 0) * previousN) + currentScore * incomingN) / total
      : currentScore;

  return {
    capability: observation.capability,
    score: bounded(weightedScore),
    sampleSize: total,
    benchmark: observation.benchmark,
    measuredAt: observation.measuredAt,
  };
}

export function inferStrengthsAndWeaknesses(
  capabilities: SasiMeasuredCapability[],
) {
  const strengths = capabilities
    .filter((item) => item.sampleSize >= 3 && item.score >= 0.8)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.capability);

  const weaknesses = capabilities
    .filter((item) => item.sampleSize >= 3 && item.score <= 0.55)
    .sort((a, b) => a.score - b.score)
    .map((item) => item.capability);

  return { strengths, weaknesses };
}
