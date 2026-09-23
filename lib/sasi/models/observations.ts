import type { SasiModelCapability } from "@/lib/sasi/models/model-mesh";

export type SasiModelObservation = {
  provider: string;
  model: string;
  capability: SasiModelCapability;
  score: number;
  latencyMs?: number | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  costMinor?: number | null;
  currency?: string | null;
  success: boolean;
  benchmark: string;
  observedAt: string;
};

export type SasiObservedModelProfile = {
  provider: string;
  model: string;
  observations: SasiModelObservation[];
};

export function aggregateModelObservations(
  observations: SasiModelObservation[],
) {
  const byCapability = new Map<
    SasiModelCapability,
    { weighted: number; count: number }
  >();

  for (const item of observations) {
    if (!item.success) continue;
    const score = Math.max(0, Math.min(1, item.score));
    const current = byCapability.get(item.capability) ?? {
      weighted: 0,
      count: 0,
    };
    current.weighted += score;
    current.count += 1;
    byCapability.set(item.capability, current);
  }

  return Object.fromEntries(
    [...byCapability.entries()].map(([capability, value]) => [
      capability,
      value.count > 0 ? value.weighted / value.count : 0,
    ]),
  );
}
