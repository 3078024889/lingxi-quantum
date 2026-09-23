import { randomUUID } from "node:crypto";
import type { SasiEpisodicMemoryRecord } from "@/lib/sasi/memory/episodic-memory";
import {
  validateFailureAttribution,
  type SasiFailureAttribution,
} from "@/lib/sasi/learning/failure-attribution";
import {
  hypothesisFromFailure,
  type SasiImprovementHypothesis,
} from "@/lib/sasi/learning/hypothesis-engine";
import type { SasiStrategyGenome } from "@/lib/sasi/learning/strategy-genome";
import {
  mutateStrategy,
  type SasiStrategyMutation,
} from "@/lib/sasi/learning/strategy-mutation";

export type SasiEvolutionCycle = {
  id: string;
  episodeId: string;
  failure: SasiFailureAttribution;
  hypothesis: SasiImprovementHypothesis;
  strategyMutation: SasiStrategyMutation;
  state:
    | "attributed"
    | "hypothesis-created"
    | "strategy-mutated"
    | "awaiting-sandbox"
    | "sandboxed"
    | "evaluated"
    | "awaiting-human-approval"
    | "promoted"
    | "rejected";
  createdAt: string;
  updatedAt: string;
};

export function buildEvolutionCycle(input: {
  episode: SasiEpisodicMemoryRecord;
  parentStrategy: SasiStrategyGenome;
  failureCategory: SasiFailureAttribution["category"];
  failureObservation: string;
  likelyCause: string;
  affectedCapabilities: string[];
  hypothesisStatement: string;
  expectedEffect: string;
  interventionTarget: string;
}): SasiEvolutionCycle {
  if (input.episode.failureCodes.length === 0) {
    throw new Error("EVOLUTION_REQUIRES_FAILURE_EPISODE");
  }

  const failure: SasiFailureAttribution = {
    id: randomUUID(),
    runId: null,
    taskFamily: input.episode.taskFamily,
    failureCode: input.episode.failureCodes[0],
    category: input.failureCategory,
    observation: input.failureObservation,
    likelyCauses: [
      {
        cause: input.likelyCause,
        confidence: 0.7,
        evidenceRefs: input.episode.evidenceRefs,
      },
    ],
    affectedCapabilities: input.affectedCapabilities,
    severity: "medium",
    reproducible: false,
    createdAt: new Date().toISOString(),
  };

  const validated = validateFailureAttribution(failure);
  if (!validated.ok) {
    throw new Error(`FAILURE_ATTRIBUTION_INVALID:${validated.errors.join("|")}`);
  }

  const hypothesis = hypothesisFromFailure({
    id: randomUUID(),
    failure,
    statement: input.hypothesisStatement,
    expectedEffect: input.expectedEffect,
    proposedInterventions: [
      { kind: "strategy", target: input.interventionTarget },
    ],
    falsificationCriteria: [
      "Development benchmark does not improve.",
      "Sealed benchmark does not pass.",
      "Regression benchmark detects a regression.",
    ],
    confidence: 0.65,
  });

  const strategyMutation = mutateStrategy({
    parent: input.parentStrategy,
    reflectionDepthDelta: 1,
    appendReasoningStage: "targeted-self-critique",
  });

  return {
    id: randomUUID(),
    episodeId: input.episode.id,
    failure,
    hypothesis,
    strategyMutation,
    state: "awaiting-sandbox",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
