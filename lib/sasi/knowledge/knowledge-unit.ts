import type {
  SasiEpistemicState,
  SasiKnowledgeDomain,
  SasiSourceClass,
} from "@/lib/sasi/knowledge/ontology";

export type SasiKnowledgeEvidence = {
  sourceId: string;
  sourceClass: SasiSourceClass;
  title?: string;
  locator?: string;
  url?: string;
  publishedAt?: string;
  retrievedAt?: string;
  excerptHash?: string;
};

export type SasiKnowledgeRelation = {
  predicate: string;
  object: string;
  confidence: number;
};

export type SasiKnowledgeUnit = {
  id: string;
  concept: string;
  domain: SasiKnowledgeDomain;
  definition: string;
  epistemicState: SasiEpistemicState;
  confidence: number;
  prerequisites: string[];
  relations: SasiKnowledgeRelation[];
  conditions: string[];
  counterexamples: string[];
  commonMisconceptions: string[];
  evidence: SasiKnowledgeEvidence[];
  validFrom?: string | null;
  validUntil?: string | null;
  lastVerifiedAt?: string | null;
  supersedes?: string | null;
  tags: string[];
};

export function validateKnowledgeUnit(unit: SasiKnowledgeUnit) {
  const errors: string[] = [];

  if (!unit.id.trim()) errors.push("ID_REQUIRED");
  if (!unit.concept.trim()) errors.push("CONCEPT_REQUIRED");
  if (!unit.definition.trim()) errors.push("DEFINITION_REQUIRED");
  if (!Number.isFinite(unit.confidence) || unit.confidence < 0 || unit.confidence > 1) {
    errors.push("CONFIDENCE_OUT_OF_RANGE");
  }

  if (unit.epistemicState === "verified-fact") {
    if (unit.evidence.length === 0) errors.push("VERIFIED_FACT_REQUIRES_EVIDENCE");
    if (unit.evidence.every((e) => e.sourceClass === "model-generated")) {
      errors.push("MODEL_ONLY_CANNOT_BE_VERIFIED_FACT");
    }
  }

  if (
    unit.epistemicState === "model-derived-hypothesis" &&
    unit.confidence > 0.8
  ) {
    errors.push("MODEL_HYPOTHESIS_CONFIDENCE_TOO_HIGH");
  }

  for (const relation of unit.relations) {
    if (
      !Number.isFinite(relation.confidence) ||
      relation.confidence < 0 ||
      relation.confidence > 1
    ) {
      errors.push(`RELATION_CONFIDENCE_OUT_OF_RANGE:${relation.predicate}`);
    }
  }

  return { ok: errors.length === 0, errors };
}
