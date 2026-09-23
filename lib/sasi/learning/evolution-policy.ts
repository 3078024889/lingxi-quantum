export type SasiExperimentStage =
  | "proposal"
  | "sandbox"
  | "development-eval"
  | "sealed-eval"
  | "candidate"
  | "promoted"
  | "rejected";

export type SasiEvaluationVector = {
  taskQuality: number;
  truthfulness: number;
  robustness: number;
  efficiency: number;
  regressionRisk: number;
};

export type SasiPromotionInput = {
  stage: SasiExperimentStage;
  sandboxPassed: boolean;
  sealedBenchmarkPassed: boolean;
  sealedBenchmarkHashVerified: boolean;
  evaluation: SasiEvaluationVector;
  regressionCount: number;
};

function unit(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
}

export function sasiFitness(vector: SasiEvaluationVector) {
  return (
    unit(vector.taskQuality) * 0.4 +
    unit(vector.truthfulness) * 0.25 +
    unit(vector.robustness) * 0.2 +
    unit(vector.efficiency) * 0.15 -
    unit(vector.regressionRisk) * 0.35
  );
}

export function canPromoteStrategy(input: SasiPromotionInput) {
  const reasons: string[] = [];

  if (!input.sandboxPassed) reasons.push("SANDBOX_REQUIRED");
  if (!input.sealedBenchmarkPassed) reasons.push("SEALED_BENCHMARK_REQUIRED");
  if (!input.sealedBenchmarkHashVerified) reasons.push("SEALED_BENCHMARK_HASH_REQUIRED");
  if (input.regressionCount > 0) reasons.push("REGRESSION_PRESENT");

  const fitness = sasiFitness(input.evaluation);
  if (fitness < 0.65) reasons.push("FITNESS_BELOW_THRESHOLD");

  return {
    ok: reasons.length === 0,
    fitness,
    reasons,
  };
}
