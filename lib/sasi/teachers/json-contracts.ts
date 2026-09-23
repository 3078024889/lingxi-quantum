import type { SasiExtractionOutput } from "@/lib/sasi/knowledge/extract-contract";
import type { SasiTeacherReview } from "@/lib/sasi/teachers/review";

function parseJsonObject(text: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("TEACHER_JSON_INVALID");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("TEACHER_JSON_OBJECT_REQUIRED");
  }
  return parsed as Record<string, unknown>;
}

export function parseTeacherExtraction(text: string): SasiExtractionOutput {
  const obj = parseJsonObject(text);

  const output: SasiExtractionOutput = {
    concept: typeof obj.concept === "string" ? obj.concept : "",
    domain: obj.domain as SasiExtractionOutput["domain"],
    proposedDefinition:
      typeof obj.proposedDefinition === "string" ? obj.proposedDefinition : "",
    claims: Array.isArray(obj.claims) ? (obj.claims as SasiExtractionOutput["claims"]) : [],
    relations: Array.isArray(obj.relations)
      ? (obj.relations as SasiExtractionOutput["relations"])
      : [],
    conditions: Array.isArray(obj.conditions)
      ? obj.conditions.filter((x): x is string => typeof x === "string")
      : [],
    counterexamples: Array.isArray(obj.counterexamples)
      ? obj.counterexamples.filter((x): x is string => typeof x === "string")
      : [],
    commonMisconceptions: Array.isArray(obj.commonMisconceptions)
      ? obj.commonMisconceptions.filter((x): x is string => typeof x === "string")
      : [],
    uncertaintyNotes: Array.isArray(obj.uncertaintyNotes)
      ? obj.uncertaintyNotes.filter((x): x is string => typeof x === "string")
      : [],
  };

  return output;
}

export function parseTeacherReview(
  text: string,
  candidateId: string,
  teacherId: string,
): SasiTeacherReview {
  const obj = parseJsonObject(text);
  const verdicts = new Set([
    "support",
    "challenge",
    "insufficient-evidence",
    "out-of-domain",
  ]);
  const verdict =
    typeof obj.verdict === "string" && verdicts.has(obj.verdict)
      ? (obj.verdict as SasiTeacherReview["verdict"])
      : "insufficient-evidence";

  const confidence =
    typeof obj.confidence === "number" && Number.isFinite(obj.confidence)
      ? Math.max(0, Math.min(1, obj.confidence))
      : 0;

  const strings = (value: unknown) =>
    Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];

  return {
    id: crypto.randomUUID(),
    candidateId,
    teacherId,
    verdict,
    confidence,
    issues: strings(obj.issues),
    suggestedCorrections: strings(obj.suggestedCorrections),
    evidenceRequests: strings(obj.evidenceRequests),
    createdAt: new Date().toISOString(),
  };
}
