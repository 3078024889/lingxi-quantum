const LICENSE_OK = new Set([
  "public-domain",
  "cc0",
  "cc-by",
  "cc-by-sa",
  "odbl",
  "unknown-fixture",
]);

/** Reject text with null bytes or extensive U+FFFD replacement characters. */
export function assertUtf8Text(text: string): { ok: boolean; reason?: string } {
  if (typeof text !== "string" || text.length === 0) {
    return { ok: false, reason: "empty_or_non_string" };
  }
  if (text.includes(String.fromCharCode(0))) {
    return { ok: false, reason: "null_byte" };
  }
  const replacementCount = (text.match(/�/g) || []).length;
  if (replacementCount > 0) {
    const ratio = replacementCount / Math.max(text.length, 1);
    if (replacementCount >= 3 || ratio > 0.01) {
      return { ok: false, reason: "replacement_char_extensive" };
    }
  }
  return { ok: true };
}

export function assertLicenseOk(license: string): boolean {
  if (typeof license !== "string") return false;
  return LICENSE_OK.has(license.trim().toLowerCase());
}
