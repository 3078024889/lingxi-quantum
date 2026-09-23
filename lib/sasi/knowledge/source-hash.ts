import { createHash } from "node:crypto";

export function sha256Utf8(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function normalizeKnowledgeText(value: string) {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function sourceContentHash(value: string) {
  return sha256Utf8(normalizeKnowledgeText(value));
}
