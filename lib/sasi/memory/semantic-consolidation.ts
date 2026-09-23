import type { SasiKnowledgeUnit } from "@/lib/sasi/knowledge/knowledge-unit";

export type SasiSemanticMemoryPayload = {
  concept: string;
  domain: string;
  definition: string;
  epistemicState: string;
  confidence: number;
  relations: SasiKnowledgeUnit["relations"];
  evidence: SasiKnowledgeUnit["evidence"];
  knowledgeUnitId: string;
};

export function knowledgeToSemanticMemory(
  unit: SasiKnowledgeUnit,
): SasiSemanticMemoryPayload {
  if (
    unit.epistemicState === "unknown" ||
    unit.epistemicState === "deprecated"
  ) {
    throw new Error("KNOWLEDGE_NOT_ELIGIBLE_FOR_SEMANTIC_MEMORY");
  }

  return {
    concept: unit.concept,
    domain: unit.domain,
    definition: unit.definition,
    epistemicState: unit.epistemicState,
    confidence: unit.confidence,
    relations: unit.relations,
    evidence: unit.evidence,
    knowledgeUnitId: unit.id,
  };
}
