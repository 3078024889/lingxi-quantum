import { createHash } from "node:crypto";

export type SubjectIdentity = {
  subjectId: string;
  displayName: string;
  normalizedName: string;
  birthDate?: string;
  birthTime?: string;
  gender?: string;
  createdByAccountId: string;
};

export function normalizeSubjectName(value: unknown) {
  return typeof value === "string"
    ? value.normalize("NFKC").trim().toLocaleLowerCase("zh-CN").replace(/[\s·•._-]+/g, "")
    : "";
}

export function makeSubjectIdentity(accountId: string, input: Record<string, unknown>): SubjectIdentity | null {
  const displayName = typeof input.name === "string" ? input.name.trim().slice(0, 40) : "";
  const normalizedName = normalizeSubjectName(displayName);
  if (!normalizedName) return null;
  const birthDate = typeof input.birthDate === "string" ? input.birthDate.trim().slice(0, 10) : undefined;
  const birthTime = typeof input.birthTime === "string" ? input.birthTime.trim().slice(0, 8) : undefined;
  // Name is the required cross-product join key. Birth data remains useful
  // metadata, but cannot be mandatory because several products do not collect
  // it. Including it in the ID would split one person into two incomplete
  // streams merely because one report has richer profile data.
  const fingerprint = `${accountId}\u0000${normalizedName}`;
  return {
    subjectId: `sub_${createHash("sha256").update(fingerprint).digest("hex").slice(0, 24)}`,
    displayName,
    normalizedName,
    ...(birthDate ? { birthDate } : {}),
    ...(birthTime ? { birthTime } : {}),
    ...(typeof input.gender === "string" && input.gender ? { gender: input.gender.slice(0, 16) } : {}),
    createdByAccountId: accountId,
  };
}

export function subjectFromAssessment(accountId: string, input: unknown): SubjectIdentity | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const record = input as Record<string, unknown>;
  const stored = record.subjectIdentity;
  if (stored && typeof stored === "object" && !Array.isArray(stored)) {
    const value = stored as Partial<SubjectIdentity>;
    if (value.displayName) return makeSubjectIdentity(accountId, { ...record, ...value, name: value.displayName });
  }
  return makeSubjectIdentity(accountId, record);
}
