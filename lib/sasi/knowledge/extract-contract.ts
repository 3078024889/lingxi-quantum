import type { SasiKnowledgeDomain } from "@/lib/sasi/knowledge/ontology";

export type SasiExtractionInput = {
  sourceId: string;
  title: string;
  text: string;
  language?: string | null;
  hintedDomain?: SasiKnowledgeDomain | null;
};

export type SasiExtractedClaim = {
  text: string;
  confidence: number;
  sourceSpan?: {
    start: number;
    end: number;
  };
};

export type SasiExtractionOutput = {
  concept: string;
  domain: SasiKnowledgeDomain;
  proposedDefinition: string;
  claims: SasiExtractedClaim[];
  relations: Array<{
    predicate: string;
    object: string;
    confidence: number;
  }>;
  conditions: string[];
  counterexamples: string[];
  commonMisconceptions: string[];
  uncertaintyNotes: string[];
};

export function validateExtractionOutput(output: SasiExtractionOutput) {
  const errors: string[] = [];

  if (!output.concept.trim()) errors.push("CONCEPT_REQUIRED");
  if (!output.proposedDefinition.trim()) errors.push("DEFINITION_REQUIRED");
  if (output.claims.length === 0) errors.push("AT_LEAST_ONE_CLAIM_REQUIRED");

  for (const claim of output.claims) {
    if (!claim.text.trim()) errors.push("EMPTY_CLAIM");
    if (
      !Number.isFinite(claim.confidence) ||
      claim.confidence < 0 ||
      claim.confidence > 1
    ) {
      errors.push("CLAIM_CONFIDENCE_OUT_OF_RANGE");
    }
    if (claim.sourceSpan) {
      if (
        !Number.isInteger(claim.sourceSpan.start) ||
        !Number.isInteger(claim.sourceSpan.end) ||
        claim.sourceSpan.start < 0 ||
        claim.sourceSpan.end <= claim.sourceSpan.start
      ) {
        errors.push("INVALID_SOURCE_SPAN");
      }
    }
  }

  return { ok: errors.length === 0, errors };
}
