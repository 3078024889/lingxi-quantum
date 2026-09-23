export type SasiBenchmarkKind =
  | "development"
  | "sealed"
  | "regression";

export type SasiBenchmarkDefinition = {
  id: string;
  taskFamily: string;
  kind: SasiBenchmarkKind;
  version: number;
  fixtureHash: string;
  minPassRate: number;
  minSamples: number;
  maxRegressionCount: number;
};

export type SasiBenchmarkResult = {
  benchmarkId: string;
  strategyId: string;
  passRate: number;
  sampleCount: number;
  regressionCount: number;
  fixtureHash: string;
  passed: boolean;
  measuredAt: string;
};

export function evaluateBenchmark(
  definition: SasiBenchmarkDefinition,
  result: SasiBenchmarkResult,
) {
  const reasons: string[] = [];

  if (result.benchmarkId !== definition.id) reasons.push("BENCHMARK_ID_MISMATCH");
  if (result.fixtureHash !== definition.fixtureHash) reasons.push("FIXTURE_HASH_MISMATCH");
  if (result.sampleCount < definition.minSamples) reasons.push("INSUFFICIENT_SAMPLES");
  if (result.passRate < definition.minPassRate) reasons.push("PASS_RATE_BELOW_THRESHOLD");
  if (result.regressionCount > definition.maxRegressionCount) reasons.push("REGRESSION_LIMIT_EXCEEDED");
  if (!result.passed) reasons.push("RUN_NOT_MARKED_PASSED");

  return { ok: reasons.length === 0, reasons };
}
