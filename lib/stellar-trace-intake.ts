export const STELLAR_TRACE_DRAFT_KEY = "lingxifield:stellar-trace:draft:v3";

export type StellarTraceDraft = {
  name: string;
  relationship: "self" | "family" | "partner" | "friend" | "colleague" | "other";
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  lastContactAt: string;
  lastKnownPlace: string;
  lastKnownMapLabel: string;
  lastKnownLat: string;
  lastKnownLon: string;
  movementDirection: string;
  context: string;
};

export const EMPTY_STELLAR_TRACE_DRAFT: StellarTraceDraft = {
  name: "", relationship: "family", birthDate: "", birthTime: "", birthPlace: "",
  lastContactAt: "", lastKnownPlace: "", lastKnownMapLabel: "", lastKnownLat: "", lastKnownLon: "",
  movementDirection: "", context: "",
};

const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

export function sanitizeStellarTraceDraft(value: unknown): StellarTraceDraft {
  const input = value && typeof value === "object" ? value as Partial<StellarTraceDraft> : {};
  const relationships = new Set<StellarTraceDraft["relationship"]>(["self", "family", "partner", "friend", "colleague", "other"]);
  const birthDate = clean(input.birthDate, 10);
  const birthTime = clean(input.birthTime, 5);
  const lastContactAt = clean(input.lastContactAt, 40);
  const lastKnownLat = clean(input.lastKnownLat, 20);
  const lastKnownLon = clean(input.lastKnownLon, 20);
  const coordinatesValid = validCoordinates({ lastKnownLat, lastKnownLon });
  return {
    name: clean(input.name, 40),
    relationship: relationships.has(input.relationship as StellarTraceDraft["relationship"]) ? input.relationship as StellarTraceDraft["relationship"] : "other",
    birthDate: validIsoDate(birthDate) ? birthDate : "", birthTime: /^([01]\d|2[0-3]):[0-5]\d$/.test(birthTime) ? birthTime : "", birthPlace: clean(input.birthPlace, 80),
    lastContactAt: validContactAt(lastContactAt) ? lastContactAt : "", lastKnownPlace: clean(input.lastKnownPlace, 120), lastKnownMapLabel: clean(input.lastKnownMapLabel, 160),
    lastKnownLat: coordinatesValid ? lastKnownLat : "", lastKnownLon: coordinatesValid ? lastKnownLon : "",
    movementDirection: clean(input.movementDirection, 60), context: clean(input.context, 500),
  };
}

export function stellarTraceCompleteness(draft: StellarTraceDraft) {
  const [contactDate = "", contactTime = ""] = draft.lastContactAt.split(/[T ]/);
  const mapPoint = validCoordinates(draft);
  return [draft.name, draft.relationship, validIsoDate(draft.birthDate), /^([01]\d|2[0-3]):[0-5]\d$/.test(draft.birthTime), draft.birthPlace,
    validIsoDate(contactDate), validContactAt(draft.lastContactAt) && !!contactTime, draft.lastKnownPlace, mapPoint,
    draft.movementDirection, draft.context]
    .filter(Boolean).length;
}

export function validCoordinates(draft: Pick<StellarTraceDraft, "lastKnownLat" | "lastKnownLon">) {
  const lat = Number(draft.lastKnownLat);
  const lon = Number(draft.lastKnownLon);
  return draft.lastKnownLat !== "" && draft.lastKnownLon !== "" && Number.isFinite(lat) && lat >= -90 && lat <= 90 && Number.isFinite(lon) && lon >= -180 && lon <= 180;
}

export function validIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  return year >= 1 && date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day && date.getTime() <= Date.now();
}

export function validContactAt(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}$/.test(value)) return false;
  const [date, time] = value.split(/[T ]/);
  if (!validIsoDate(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return false;
  return new Date(`${date}T${time}:00`).getTime() <= Date.now();
}

export function stellarTraceCoreCompleteness(draft: StellarTraceDraft) {
  return 5 - stellarTraceMissingFields(draft).length;
}

export function stellarTraceMissingFields(draft: StellarTraceDraft) {
  return [
    !draft.name && "寻踪对象姓名",
    !validIsoDate(draft.birthDate) && "有效出生日期（公元 0001 年至今）",
    !validContactAt(draft.lastContactAt) && "最后有效联系日期与时间（不得晚于现在）",
    !draft.lastKnownPlace && "最后已知位置说明",
    !validCoordinates(draft) && "精准地图选点",
  ].filter((field): field is string => !!field);
}

export function stellarTraceEssentialComplete(draft: StellarTraceDraft) {
  return stellarTraceCoreCompleteness(draft) === 5;
}
