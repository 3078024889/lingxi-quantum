import type { SasiSourceClass } from "@/lib/sasi/knowledge/ontology";

export type SasiIngestionSourceKind =
  | "user-file"
  | "book-sasi"
  | "official-web"
  | "peer-reviewed"
  | "reference"
  | "reputable-web"
  | "teacher-model"
  | "manual";

export type SasiIngestionSource = {
  id: string;
  kind: SasiIngestionSourceKind;
  sourceClass: SasiSourceClass;
  title: string;
  contentHash: string;
  locator?: string;
  url?: string;
  publishedAt?: string;
  retrievedAt: string;
  ownerUserId?: string | null;
  projectId?: string | null;
  language?: string | null;
  metadata: Record<string, unknown>;
};

export function sourceCanGroundFacts(source: SasiIngestionSource) {
  return !["teacher-model", "manual"].includes(source.kind);
}

export function normalizeSourceClass(
  kind: SasiIngestionSourceKind,
): SasiSourceClass {
  switch (kind) {
    case "official-web":
      return "official-source";
    case "peer-reviewed":
      return "peer-reviewed";
    case "reference":
      return "reference-work";
    case "reputable-web":
      return "reputable-secondary";
    case "user-file":
    case "book-sasi":
      return "user-provided";
    case "teacher-model":
      return "model-generated";
    default:
      return "unknown-source";
  }
}
