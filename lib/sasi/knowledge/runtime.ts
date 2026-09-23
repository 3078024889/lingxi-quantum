import { randomUUID } from "node:crypto";
import type { SasiKnowledgeCandidate } from "@/lib/sasi/knowledge/candidate";
import { validateKnowledgeCandidate } from "@/lib/sasi/knowledge/candidate";
import type { SasiExtractionOutput } from "@/lib/sasi/knowledge/extract-contract";
import { validateExtractionOutput } from "@/lib/sasi/knowledge/extract-contract";
import { sourceContentHash } from "@/lib/sasi/knowledge/source-hash";
import type { SasiIngestionSource } from "@/lib/sasi/knowledge/source-types";
import { normalizeSourceClass } from "@/lib/sasi/knowledge/source-types";
import { decideKnowledgeCandidate } from "@/lib/sasi/knowledge/ingestion-pipeline";
import type { SasiTeacherReview } from "@/lib/sasi/teachers/review";

export type SasiRuntimeSourceInput = {
  kind: SasiIngestionSource["kind"];
  title: string;
  text: string;
  locator?: string;
  url?: string;
  publishedAt?: string;
  retrievedAt?: string;
  ownerUserId?: string | null;
  projectId?: string | null;
  language?: string | null;
  metadata?: Record<string, unknown>;
};

export type SasiIngestionRuntimeResult = {
  source: SasiIngestionSource;
  candidate: SasiKnowledgeCandidate;
  decision: ReturnType<typeof decideKnowledgeCandidate>;
};

export function createRuntimeSource(
  input: SasiRuntimeSourceInput,
): SasiIngestionSource {
  if (!input.title.trim()) throw new Error("SOURCE_TITLE_REQUIRED");
  if (!input.text.trim()) throw new Error("SOURCE_TEXT_REQUIRED");

  return {
    id: randomUUID(),
    kind: input.kind,
    sourceClass: normalizeSourceClass(input.kind),
    title: input.title.trim(),
    contentHash: sourceContentHash(input.text),
    locator: input.locator,
    url: input.url,
    publishedAt: input.publishedAt,
    retrievedAt: input.retrievedAt ?? new Date().toISOString(),
    ownerUserId: input.ownerUserId ?? null,
    projectId: input.projectId ?? null,
    language: input.language ?? null,
    metadata: input.metadata ?? {},
  };
}

export function extractionToCandidate(
  source: SasiIngestionSource,
  extraction: SasiExtractionOutput,
  createdBy: SasiKnowledgeCandidate["createdBy"],
): SasiKnowledgeCandidate {
  const validation = validateExtractionOutput(extraction);
  if (!validation.ok) {
    throw new Error(`INVALID_EXTRACTION:${validation.errors.join("|")}`);
  }

  const candidate: SasiKnowledgeCandidate = {
    id: randomUUID(),
    sourceIds: [source.id],
    concept: extraction.concept,
    domain: extraction.domain,
    proposedDefinition: extraction.proposedDefinition,
    claims: extraction.claims.map((claim) => ({
      text: claim.text,
      confidence: claim.confidence,
      sourceIds: [source.id],
    })),
    relations: extraction.relations.map((relation) => ({
      ...relation,
      sourceIds: [source.id],
    })),
    conditions: extraction.conditions,
    counterexamples: extraction.counterexamples,
    commonMisconceptions: extraction.commonMisconceptions,
    uncertaintyNotes: extraction.uncertaintyNotes,
    createdBy,
    createdAt: new Date().toISOString(),
  };

  const candidateValidation = validateKnowledgeCandidate(candidate, [source]);
  if (!candidateValidation.ok) {
    throw new Error(
      `INVALID_CANDIDATE:${candidateValidation.errors.join("|")}`,
    );
  }

  return candidate;
}

export function runIngestionDecision(input: {
  sourceInput: SasiRuntimeSourceInput;
  extraction: SasiExtractionOutput;
  createdBy: SasiKnowledgeCandidate["createdBy"];
  reviews?: SasiTeacherReview[];
}): SasiIngestionRuntimeResult {
  const source = createRuntimeSource(input.sourceInput);
  const candidate = extractionToCandidate(
    source,
    input.extraction,
    input.createdBy,
  );
  const decision = decideKnowledgeCandidate(
    candidate,
    [source],
    input.reviews ?? [],
  );

  return { source, candidate, decision };
}
