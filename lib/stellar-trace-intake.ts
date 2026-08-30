export const STELLAR_TRACE_DRAFT_KEY = "lingxifield:stellar-trace:draft:v1";

export type StellarTraceDraft = {
  name: string;
  relationship: "self" | "family" | "partner" | "friend" | "colleague" | "other";
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  lastContactAt: string;
  lastKnownPlace: string;
  lastKnownLat: string;
  lastKnownLon: string;
  movementDirection: string;
  context: string;
};

export const EMPTY_STELLAR_TRACE_DRAFT: StellarTraceDraft = {
  name: "", relationship: "family", birthDate: "", birthTime: "", birthPlace: "",
  lastContactAt: "", lastKnownPlace: "", lastKnownLat: "", lastKnownLon: "",
  movementDirection: "", context: "",
};

const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

export function sanitizeStellarTraceDraft(value: unknown): StellarTraceDraft {
  const input = value && typeof value === "object" ? value as Partial<StellarTraceDraft> : {};
  const relationships = new Set<StellarTraceDraft["relationship"]>(["self", "family", "partner", "friend", "colleague", "other"]);
  return {
    name: clean(input.name, 40),
    relationship: relationships.has(input.relationship as StellarTraceDraft["relationship"]) ? input.relationship as StellarTraceDraft["relationship"] : "other",
    birthDate: clean(input.birthDate, 10), birthTime: clean(input.birthTime, 5), birthPlace: clean(input.birthPlace, 80),
    lastContactAt: clean(input.lastContactAt, 40), lastKnownPlace: clean(input.lastKnownPlace, 120),
    lastKnownLat: clean(input.lastKnownLat, 20), lastKnownLon: clean(input.lastKnownLon, 20),
    movementDirection: clean(input.movementDirection, 60), context: clean(input.context, 500),
  };
}

export function stellarTraceCompleteness(draft: StellarTraceDraft) {
  return [draft.name, draft.relationship, draft.birthDate, draft.birthTime, draft.birthPlace,
    draft.lastContactAt, draft.lastKnownPlace, draft.lastKnownLat, draft.lastKnownLon,
    draft.movementDirection, draft.context]
    .filter(Boolean).length;
}

export function stellarTraceCoreCompleteness(draft: StellarTraceDraft) {
  return [!!draft.name, /^\d{4}-\d{2}-\d{2}$/.test(draft.birthDate), /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}$/.test(draft.lastContactAt), !!draft.lastKnownPlace].filter(Boolean).length;
}

export function stellarTraceEssentialComplete(draft: StellarTraceDraft) {
  return stellarTraceCoreCompleteness(draft) === 4;
}
