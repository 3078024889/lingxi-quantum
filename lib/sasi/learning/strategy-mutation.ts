import { randomUUID } from "node:crypto";
import type { SasiStrategyGenome } from "@/lib/sasi/learning/strategy-genome";

export type SasiStrategyMutation = {
  id: string;
  parentStrategyId: string;
  child: SasiStrategyGenome;
  changes: string[];
  createdAt: string;
};

function normalizeWeights(input: SasiStrategyGenome["retrieval"]) {
  const raw = {
    semanticWeight: Math.max(0, input.semanticWeight),
    episodicWeight: Math.max(0, input.episodicWeight),
    proceduralWeight: Math.max(0, input.proceduralWeight),
    selfWeight: Math.max(0, input.selfWeight),
  };
  const sum =
    raw.semanticWeight +
    raw.episodicWeight +
    raw.proceduralWeight +
    raw.selfWeight;

  if (sum <= 0) {
    return {
      semanticWeight: 0.25,
      episodicWeight: 0.25,
      proceduralWeight: 0.25,
      selfWeight: 0.25,
    };
  }

  return {
    semanticWeight: raw.semanticWeight / sum,
    episodicWeight: raw.episodicWeight / sum,
    proceduralWeight: raw.proceduralWeight / sum,
    selfWeight: raw.selfWeight / sum,
  };
}

export function mutateStrategy(input: {
  parent: SasiStrategyGenome;
  retrievalDelta?: Partial<SasiStrategyGenome["retrieval"]>;
  appendReasoningStage?: string | null;
  reflectionDepthDelta?: number;
}): SasiStrategyMutation {
  const parent = input.parent;

  const candidateRetrieval = {
    semanticWeight:
      parent.retrieval.semanticWeight +
      (input.retrievalDelta?.semanticWeight ?? 0),
    episodicWeight:
      parent.retrieval.episodicWeight +
      (input.retrievalDelta?.episodicWeight ?? 0),
    proceduralWeight:
      parent.retrieval.proceduralWeight +
      (input.retrievalDelta?.proceduralWeight ?? 0),
    selfWeight:
      parent.retrieval.selfWeight +
      (input.retrievalDelta?.selfWeight ?? 0),
  };

  const nextDepth = Math.max(
    0,
    Math.min(8, parent.reflectionDepth + (input.reflectionDepthDelta ?? 0)),
  );

  const child: SasiStrategyGenome = {
    ...parent,
    id: randomUUID(),
    version: parent.version + 1,
    parentIds: [parent.id, ...parent.parentIds].slice(0, 8),
    retrieval: normalizeWeights(candidateRetrieval),
    reasoningStages: input.appendReasoningStage
      ? [...parent.reasoningStages, input.appendReasoningStage]
      : [...parent.reasoningStages],
    reflectionDepth: nextDepth,
  };

  const changes: string[] = [];
  if (input.retrievalDelta) changes.push("retrieval-weights");
  if (input.appendReasoningStage) changes.push(`reasoning-stage:${input.appendReasoningStage}`);
  if (input.reflectionDepthDelta) changes.push("reflection-depth");

  return {
    id: randomUUID(),
    parentStrategyId: parent.id,
    child,
    changes,
    createdAt: new Date().toISOString(),
  };
}
