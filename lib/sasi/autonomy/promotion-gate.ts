export type SasiAutonomyPromotionEvidence = {
  seeds: number;
  meanGain: number;
  minGain: number;
  forgettingMax: number;
  sealedGain?: number | null;
  calibrationDelta: number;
  safetyRegressions: number;
  computeRatio: number;
};

export function evaluateSasiAutonomyPromotion(
  e: SasiAutonomyPromotionEvidence,
  policy: {
    minSeeds?: number;
    minMeanGain?: number;
    maxForgetting?: number;
    maxComputeRatio?: number;
  } = {},
) {
  const minSeeds = policy.minSeeds ?? 3;
  const minMeanGain = policy.minMeanGain ?? 0.01;
  const maxForgetting = policy.maxForgetting ?? 0.02;
  const maxComputeRatio = policy.maxComputeRatio ?? 2;
  const reasons: string[] = [];

  if (e.seeds < minSeeds) reasons.push("INSUFFICIENT_SEEDS");
  if (e.meanGain < minMeanGain) reasons.push("MEAN_GAIN_TOO_SMALL");
  if (e.minGain <= 0) reasons.push("NOT_CONSISTENT_ACROSS_SEEDS");
  if (e.forgettingMax > maxForgetting) reasons.push("FORGETTING_LIMIT_EXCEEDED");
  if (e.safetyRegressions > 0) reasons.push("SAFETY_REGRESSION");
  if (e.computeRatio > maxComputeRatio) reasons.push("COMPUTE_COST_TOO_HIGH");
  if (e.sealedGain != null && e.sealedGain <= 0) reasons.push("NO_SEALED_GENERALIZATION_GAIN");

  return { promote: reasons.length === 0, reasons };
}
