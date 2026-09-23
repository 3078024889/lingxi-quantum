import { SASI_CORE_ZERO } from "@/lib/sasi/core/core-zero";

export type SasiStrategyGenome = {
  id: string;
  taskFamily: string;
  version: number;
  perception: Record<string, unknown>;
  retrieval: {
    semanticWeight: number;
    episodicWeight: number;
    proceduralWeight: number;
    selfWeight: number;
  };
  reasoningStages: string[];
  modelRoles: Record<string, string>;
  toolPolicy: Record<string, unknown>;
  reflectionDepth: number;
  parentIds: string[];
};

export type SasiEvolutionProposal = {
  id: string;
  strategy: SasiStrategyGenome;
  hypothesis: string;
  failureIds: string[];
  coreZero: string;
  requestedWriteTargets: string[];
};

const FORBIDDEN_TARGET_PREFIXES = [
  "lib/sasi/core/",
  "app/api/pay/",
  "app/api/tools/pay/",
  "lib/fulfill-order",
  "lib/sasi/payment-gate",
  "lib/sasi/readiness",
  ".env",
];

export function validateEvolutionProposal(proposal: SasiEvolutionProposal) {
  const errors: string[] = [];

  if (proposal.coreZero !== SASI_CORE_ZERO) {
    errors.push("CORE_ZERO_MUTATION_FORBIDDEN");
  }

  for (const target of proposal.requestedWriteTargets) {
    const normalized = target.replaceAll("\\", "/");
    if (FORBIDDEN_TARGET_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
      errors.push(`FORBIDDEN_WRITE_TARGET:${normalized}`);
    }
  }

  const weights = proposal.strategy.retrieval;
  const values = [
    weights.semanticWeight,
    weights.episodicWeight,
    weights.proceduralWeight,
    weights.selfWeight,
  ];
  if (values.some((value) => !Number.isFinite(value) || value < 0 || value > 1)) {
    errors.push("INVALID_MEMORY_WEIGHT");
  }

  const sum = values.reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 1) > 0.001) {
    errors.push("MEMORY_WEIGHTS_MUST_SUM_TO_ONE");
  }

  if (
    !Number.isInteger(proposal.strategy.reflectionDepth) ||
    proposal.strategy.reflectionDepth < 0 ||
    proposal.strategy.reflectionDepth > 8
  ) {
    errors.push("INVALID_REFLECTION_DEPTH");
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}
