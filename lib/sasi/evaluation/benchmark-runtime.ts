import { createHash } from "node:crypto";

export type SasiBenchmarkCase<Input, Output> = {
  id: string;
  input: Input;
  expected?: Output;
  tags?: string[];
};

export type SasiBenchmarkObservation = {
  caseId: string;
  passed: boolean;
  correctness: number;
  quality: number;
  latencyMs: number;
  costMinor: number;
  errorCode?: string | null;
};

export type SasiBenchmarkSuite<Input, Output> = {
  id: string;
  version: number;
  kind: "development" | "sealed" | "regression";
  cases: Array<SasiBenchmarkCase<Input, Output>>;
};

export function benchmarkSuiteHash<Input, Output>(
  suite: SasiBenchmarkSuite<Input, Output>,
) {
  const serialized = JSON.stringify({
    id: suite.id,
    version: suite.version,
    kind: suite.kind,
    cases: suite.cases,
  });
  return createHash("sha256").update(serialized, "utf8").digest("hex");
}

export async function runBenchmarkSuite<Input, Output>(input: {
  suite: SasiBenchmarkSuite<Input, Output>;
  execute: (value: Input) => Promise<{
    output: Output;
    latencyMs: number;
    costMinor: number;
  }>;
  judge: (args: {
    benchmarkCase: SasiBenchmarkCase<Input, Output>;
    output: Output;
  }) => Promise<{
    passed: boolean;
    correctness: number;
    quality: number;
  }>;
}) {
  const observations: SasiBenchmarkObservation[] = [];

  for (const benchmarkCase of input.suite.cases) {
    try {
      const executed = await input.execute(benchmarkCase.input);
      const judged = await input.judge({
        benchmarkCase,
        output: executed.output,
      });

      observations.push({
        caseId: benchmarkCase.id,
        passed: judged.passed,
        correctness: Math.max(0, Math.min(1, judged.correctness)),
        quality: Math.max(0, Math.min(1, judged.quality)),
        latencyMs: Math.max(0, executed.latencyMs),
        costMinor: Math.max(0, executed.costMinor),
      });
    } catch (error) {
      observations.push({
        caseId: benchmarkCase.id,
        passed: false,
        correctness: 0,
        quality: 0,
        latencyMs: 0,
        costMinor: 0,
        errorCode: error instanceof Error ? error.message.slice(0, 160) : "UNKNOWN",
      });
    }
  }

  const n = observations.length || 1;
  const passCount = observations.filter((item) => item.passed).length;
  const average = (key: "correctness" | "quality" | "latencyMs" | "costMinor") =>
    observations.reduce((sum, item) => sum + item[key], 0) / n;

  return {
    suiteId: input.suite.id,
    suiteVersion: input.suite.version,
    suiteHash: benchmarkSuiteHash(input.suite),
    sampleCount: observations.length,
    passRate: passCount / n,
    correctness: average("correctness"),
    quality: average("quality"),
    stability: observations.length > 0 ? passCount / observations.length : 0,
    latencyMs: average("latencyMs"),
    costMinor: average("costMinor"),
    regressionCount: observations.filter(
      (item) => !item.passed && input.suite.kind === "regression",
    ).length,
    observations,
    measuredAt: new Date().toISOString(),
  };
}
