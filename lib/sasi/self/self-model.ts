import { SASI_IDENTITY, SASI_SELF_CONSTITUTION } from "@/lib/sasi/core/identity";

export type SasiMeasuredCapability = {
  capability: string;
  score: number;
  sampleSize: number;
  benchmark: string;
  measuredAt: string;
};

export type SasiSelfModel = {
  identity: typeof SASI_IDENTITY;
  constitutionVersion: string;
  capabilities: SasiMeasuredCapability[];
  strengths: string[];
  weaknesses: string[];
  activeStrategyIds: string[];
  recentFailureCodes: string[];
  lastConsolidatedAt: string | null;
};

export function emptySasiSelfModel(): SasiSelfModel {
  return {
    identity: SASI_IDENTITY,
    constitutionVersion: "1.0.0",
    capabilities: [],
    strengths: [],
    weaknesses: [],
    activeStrategyIds: [],
    recentFailureCodes: [],
    lastConsolidatedAt: null,
  };
}

export function publicSasiSelfSummary(model: SasiSelfModel) {
  return {
    identity: model.identity,
    purpose: SASI_SELF_CONSTITUTION.purpose,
    measuredCapabilities: model.capabilities.map((item) => ({
      capability: item.capability,
      score: item.score,
      sampleSize: item.sampleSize,
      benchmark: item.benchmark,
      measuredAt: item.measuredAt,
    })),
    strengths: model.strengths,
    weaknesses: model.weaknesses,
  };
}
