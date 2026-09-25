import {
  compareCandidates,
  type SasiCompetitionPolicy,
} from "../../lib/sasi/evaluation/candidate-competition.ts";
import {
  runBenchmarkSuite,
} from "../../lib/sasi/evaluation/benchmark-runtime.ts";
import {
  verifySealedBenchmark,
} from "../../lib/sasi/evaluation/sealed-guard.ts";
import { createHash } from "node:crypto";

const suite = {
  id: "development-fixture",
  version: 1,
  kind: "development" as const,
  cases: [
    { id: "a", input: 2, expected: 4 },
    { id: "b", input: 3, expected: 6 },
    { id: "c", input: 4, expected: 8 },
    { id: "d", input: 5, expected: 10 },
    { id: "e", input: 6, expected: 12 },
  ],
};

const candidateRun = await runBenchmarkSuite({
  suite,
  execute: async (value: number) => ({
    output: value * 2,
    latencyMs: 60,
    costMinor: 1,
  }),
  judge: async ({ benchmarkCase, output }) => ({
    passed: output === benchmarkCase.expected,
    correctness: output === benchmarkCase.expected ? 1 : 0,
    quality: output === benchmarkCase.expected ? 0.95 : 0,
  }),
});

if (candidateRun.passRate !== 1) throw new Error("BENCHMARK_RUNTIME_FAILED");
if (candidateRun.sampleCount !== 5) throw new Error("BENCHMARK_SAMPLE_COUNT_FAILED");

const sealedSerialized = JSON.stringify([{id:"s1"},{id:"s2"}]);
const expectedHash = createHash("sha256").update(sealedSerialized,"utf8").digest("hex");
const sealed = verifySealedBenchmark({
  descriptor: {
    id: "sealed-fixture",
    version: 1,
    expectedHash,
    caseCount: 2,
  },
  serializedFixture: sealedSerialized,
  actualCaseCount: 2,
});
if (!sealed.ok) throw new Error("SEALED_GUARD_FAILED");

const policy: SasiCompetitionPolicy = {
  weights: {
    correctness: 0.35,
    quality: 0.30,
    stability: 0.20,
    latency: 0.10,
    cost: 0.05,
  },
  bounds: {
    latencyTargetMs: 100,
    latencyWorstMs: 1500,
    costTargetMinor: 1,
    costWorstMinor: 100,
  },
  gates: {
    minSamples: 5,
    minCorrectness: 0.8,
    minQuality: 0.75,
    minStability: 0.8,
    maxRegressionCount: 0,
    maxLatencyMs: 1500,
    maxCostMinor: 100,
  },
  minAbsoluteImprovement: 0.02,
  minRelativeImprovement: 0.02,
};

const baseline = {
  candidateId: "baseline",
  strategyId: "baseline-strategy",
  metrics: {
    correctness: 0.84,
    quality: 0.80,
    stability: 0.88,
    latencyMs: 300,
    costMinor: 10,
    sampleCount: 10,
    regressionCount: 0,
  },
  developmentPassed: true,
  sealedPassed: true,
  regressionPassed: true,
  sandboxPassed: true,
  testedHeadSha: "same",
};

const strong = {
  candidateId: "candidate-strong",
  strategyId: "candidate-strategy",
  metrics: {
    correctness: 0.96,
    quality: 0.94,
    stability: 0.97,
    latencyMs: 180,
    costMinor: 8,
    sampleCount: 10,
    regressionCount: 0,
  },
  developmentPassed: true,
  sealedPassed: true,
  regressionPassed: true,
  sandboxPassed: true,
  testedHeadSha: "same",
};

const unsafe = {
  candidateId: "candidate-regression",
  strategyId: "candidate-regression-strategy",
  metrics: {
    correctness: 0.99,
    quality: 0.99,
    stability: 0.99,
    latencyMs: 100,
    costMinor: 1,
    sampleCount: 10,
    regressionCount: 1,
  },
  developmentPassed: true,
  sealedPassed: true,
  regressionPassed: false,
  sandboxPassed: true,
  testedHeadSha: "same",
};

const decision = compareCandidates({
  baseline,
  candidates: [unsafe, strong],
  policy,
});

if (decision.action !== "candidate-qualified") {
  throw new Error("MEASURED_CANDIDATE_NOT_QUALIFIED");
}
if (decision.candidateId !== "candidate-strong") {
  throw new Error("WRONG_CANDIDATE_SELECTED");
}

console.log(JSON.stringify({
  version:"v10.90",
  pass:true,
  benchmarkRuntime:true,
  sealedFixtureGuard:true,
  metricGates:true,
  baselineComparison:true,
  regressionCandidateRejected:true,
  measuredCandidateQualified:true,
  providerCalls:0,
  providerSpend:0
}, null, 2));
