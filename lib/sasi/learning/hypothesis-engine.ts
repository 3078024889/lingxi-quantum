import type { SasiFailureAttribution } from "@/lib/sasi/learning/failure-attribution";

export type SasiImprovementHypothesis = {
  id: string;
  failureAttributionId: string;
  taskFamily: string;
  statement: string;
  expectedEffect: string;
  targetCapabilities: string[];
  proposedInterventions: Array<
    | { kind: "strategy"; target: string }
    | { kind: "memory"; target: string }
    | { kind: "model-routing"; target: string }
    | { kind: "prompt"; target: string }
    | { kind: "code"; target: string }
  >;
  falsificationCriteria: string[];
  confidence: number;
  createdAt: string;
};

export function hypothesisFromFailure(input: {
  id: string;
  failure: SasiFailureAttribution;
  statement: string;
  expectedEffect: string;
  proposedInterventions: SasiImprovementHypothesis["proposedInterventions"];
  falsificationCriteria: string[];
  confidence: number;
}): SasiImprovementHypothesis {
  if (!input.statement.trim()) throw new Error("HYPOTHESIS_STATEMENT_REQUIRED");
  if (!input.expectedEffect.trim()) throw new Error("EXPECTED_EFFECT_REQUIRED");
  if (input.proposedInterventions.length === 0) {
    throw new Error("INTERVENTION_REQUIRED");
  }
  if (
    !Number.isFinite(input.confidence) ||
    input.confidence < 0 ||
    input.confidence > 1
  ) {
    throw new Error("HYPOTHESIS_CONFIDENCE_OUT_OF_RANGE");
  }

  return {
    id: input.id,
    failureAttributionId: input.failure.id,
    taskFamily: input.failure.taskFamily,
    statement: input.statement,
    expectedEffect: input.expectedEffect,
    targetCapabilities: [...input.failure.affectedCapabilities],
    proposedInterventions: input.proposedInterventions,
    falsificationCriteria: input.falsificationCriteria,
    confidence: input.confidence,
    createdAt: new Date().toISOString(),
  };
}
