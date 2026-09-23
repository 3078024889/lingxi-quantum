import type { SasiKnowledgeDomain } from "@/lib/sasi/knowledge/ontology";
import type { SasiIngestionSource } from "@/lib/sasi/knowledge/source-types";

export type SasiKnowledgeCandidate = {
  id: string;
  sourceIds: string[];
  concept: string;
  domain: SasiKnowledgeDomain;
  proposedDefinition: string;
  claims: Array<{
    text: string;
    confidence: number;
    sourceIds: string[];
  }>;
  relations: Array<{
    predicate: string;
    object: string;
    confidence: number;
    sourceIds: string[];
  }>;
  conditions: string[];
  counterexamples: string[];
  commonMisconceptions: string[];
  uncertaintyNotes: string[];
  createdBy:
    | { kind: "extractor"; id: string }
    | { kind: "teacher"; id: string }
    | { kind: "human"; id: string };
  createdAt: string;
};

export function validateKnowledgeCandidate(
  candidate: SasiKnowledgeCandidate,
  sources: SasiIngestionSource[],
) {
  const errors: string[] = [];
  const sourceIds = new Set(sources.map((s) => s.id));

  if (!candidate.concept.trim()) errors.push("CONCEPT_REQUIRED");
  if (!candidate.proposedDefinition.trim()) errors.push("DEFINITION_REQUIRED");
  if (candidate.sourceIds.length === 0) errors.push("SOURCE_REQUIRED");

  for (const id of candidate.sourceIds) {
    if (!sourceIds.has(id)) errors.push(`UNKNOWN_SOURCE:${id}`);
  }

  for (const claim of candidate.claims) {
    if (!claim.text.trim()) errors.push("EMPTY_CLAIM");
    if (
      !Number.isFinite(claim.confidence) ||
      claim.confidence < 0 ||
      claim.confidence > 1
    ) {
      errors.push("CLAIM_CONFIDENCE_OUT_OF_RANGE");
    }
    for (const id of claim.sourceIds) {
      if (!sourceIds.has(id)) errors.push(`UNKNOWN_CLAIM_SOURCE:${id}`);
    }
  }

  return { ok: errors.length === 0, errors };
}
