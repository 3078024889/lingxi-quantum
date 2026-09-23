export type SasiCodeZone =
  | "immutable"
  | "protected"
  | "evolvable"
  | "generated-only";

export type SasiCodeChangeRequest = {
  paths: string[];
  reason: string;
  failureIds: string[];
  strategyId: string;
};

const IMMUTABLE_PREFIXES = [
  "lib/sasi/core/core-zero.ts",
];

const PROTECTED_PREFIXES = [
  ".env",
  "app/api/pay/",
  "app/api/tools/pay/",
  "lib/fulfill-order",
  "lib/sasi/payment-gate",
  "lib/sasi/readiness",
  "supabase/migrations/",
  ".github/workflows/",
];

const EVOLVABLE_PREFIXES = [
  "lib/sasi/ask/",
  "lib/sasi/learning/",
  "lib/sasi/memory/",
  "lib/sasi/models/",
  "lib/sasi/self/",
  "lib/sasi/cangxuan/",
];

const GENERATED_ONLY_PREFIXES = [
  "var/sasi-evolution/",
  ".sasi-sandbox/",
];

function normalized(path: string) {
  return path.replaceAll("\\", "/").replace(/^\.?\//, "");
}

export function classifySasiCodePath(path: string): SasiCodeZone {
  const p = normalized(path);

  if (IMMUTABLE_PREFIXES.some((prefix) => p === prefix || p.startsWith(`${prefix}/`))) {
    return "immutable";
  }

  if (PROTECTED_PREFIXES.some((prefix) => p.startsWith(prefix))) {
    return "protected";
  }

  if (GENERATED_ONLY_PREFIXES.some((prefix) => p.startsWith(prefix))) {
    return "generated-only";
  }

  if (EVOLVABLE_PREFIXES.some((prefix) => p.startsWith(prefix))) {
    return "evolvable";
  }

  return "protected";
}

export function validateSasiCodeChangeRequest(request: SasiCodeChangeRequest) {
  const classified = request.paths.map((path) => ({
    path: normalized(path),
    zone: classifySasiCodePath(path),
  }));

  const blocked = classified.filter(
    (item) => item.zone === "immutable" || item.zone === "protected",
  );

  return {
    ok: classified.length > 0 && blocked.length === 0,
    classified,
    blocked,
    requiresSandbox: true,
    requiresSealedBenchmark: true,
    requiresHumanApprovalForMerge: true,
  };
}
