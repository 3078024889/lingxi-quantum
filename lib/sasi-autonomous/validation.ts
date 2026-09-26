import type { SasiResult } from "./types";

export function validateResult(result: SasiResult): SasiResult {
  if (!result.ok) return result;
  if (!Array.isArray(result.artifacts) || result.artifacts.length === 0) {
    return { ...result, ok: false, error: { code: "EMPTY_RESULT", message: "这次没有生成可用结果，请重新尝试。" } };
  }
  const invalid = result.artifacts.some((artifact) => !artifact || !artifact.type || (artifact.value == null && !artifact.path));
  if (invalid) {
    return { ...result, ok: false, error: { code: "INVALID_ARTIFACT", message: "结果没有完整生成，请重新尝试。" } };
  }
  return result;
}
