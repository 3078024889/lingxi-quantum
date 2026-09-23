import { randomUUID } from "node:crypto";
import type { SasiKnowledgeCandidate } from "@/lib/sasi/knowledge/candidate";
import type { SasiKnowledgeUnit } from "@/lib/sasi/knowledge/knowledge-unit";
import type { SasiIngestionDecision } from "@/lib/sasi/knowledge/ingestion-pipeline";
import type { SasiIngestionSource } from "@/lib/sasi/knowledge/source-types";

export function buildKnowledgeUnitDraft(input: {
  candidate: SasiKnowledgeCandidate;
  sources: SasiIngestionSource[];
  decision: SasiIngestionDecision;
}): SasiKnowledgeUnit {
  if (input.decision.action !== "candidate-ready") {
    throw new Error("CANDIDATE_NOT_READY_FOR_KNOWLEDGE_DRAFT");
  }

  const sourceMap = new Map(input.sources.map((source) => [source.id, source]));
  const evidence = input.candidate.sourceIds
    .map((id) => sourceMap.get(id))
    .filter((source): source is SasiIngestionSource => Boolean(source))
    .map((source) => ({
      sourceId: source.id,
      sourceClass: source.sourceClass,
      title: source.title,
      locator: source.locator,
      url: source.url,
      publishedAt: source.publishedAt,
      retrievedAt: source.retrievedAt,
      excerptHash: source.contentHash,
    }));

  const confidence =
    Math.min(
      input.decision.confidenceCeiling,
      input.candidate.claims.length
        ? input.candidate.claims.reduce((sum, claim) => sum + claim.confidence, 0) /
            input.candidate.claims.length
        : 0.5,
      0.8,
    );

  return {
    id: randomUUID(),
    concept: input.candidate.concept,
    domain: input.candidate.domain,
    definition: input.candidate.proposedDefinition,
    epistemicState: "model-derived-hypothesis",
    confidence,
    prerequisites: [],
    relations: input.candidate.relations.map((relation) => ({
      predicate: relation.predicate,
      object: relation.object,
      confidence: relation.confidence,
    })),
    conditions: input.candidate.conditions,
    counterexamples: input.candidate.counterexamples,
    commonMisconceptions: input.candidate.commonMisconceptions,
    evidence,
    lastVerifiedAt: null,
    supersedes: null,
    tags: ["teacher-derived", "pending-promotion"],
  };
}
