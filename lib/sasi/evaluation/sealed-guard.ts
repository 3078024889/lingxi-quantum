import { createHash } from "node:crypto";

export type SasiSealedBenchmarkDescriptor = {
  id: string;
  version: number;
  expectedHash: string;
  caseCount: number;
};

export function verifySealedBenchmark(input: {
  descriptor: SasiSealedBenchmarkDescriptor;
  serializedFixture: string;
  actualCaseCount: number;
}) {
  const actualHash = createHash("sha256")
    .update(input.serializedFixture, "utf8")
    .digest("hex");

  const reasons: string[] = [];

  if (actualHash !== input.descriptor.expectedHash) {
    reasons.push("SEALED_FIXTURE_HASH_MISMATCH");
  }
  if (input.actualCaseCount !== input.descriptor.caseCount) {
    reasons.push("SEALED_CASE_COUNT_MISMATCH");
  }

  return {
    ok: reasons.length === 0,
    reasons,
    actualHash,
  };
}
