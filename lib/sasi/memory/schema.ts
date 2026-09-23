export type SasiMemoryKind =
  | "semantic"
  | "episodic"
  | "procedural"
  | "self";

export type SasiEvidenceRef = {
  sourceId: string;
  locator?: string;
  url?: string;
  retrievedAt?: string;
};

export type SasiMemoryRecord = {
  id: string;
  kind: SasiMemoryKind;
  scope: "global" | "user" | "project" | "task";
  subject: string;
  body: Record<string, unknown>;
  evidence: SasiEvidenceRef[];
  confidence: number;
  createdAt: string;
  updatedAt: string;
  supersedes?: string | null;
};

export type SasiKnowledgeUnit = {
  id: string;
  concept: string;
  domain: string;
  definition: string;
  relations: Array<{
    predicate: string;
    object: string;
    confidence: number;
  }>;
  conditions: string[];
  counterexamples: string[];
  evidence: SasiEvidenceRef[];
  confidence: number;
};

export function validConfidence(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}
