import type { SasiKernelResult } from "./types";
export function validateKernelResult(result: SasiKernelResult): SasiKernelResult {
  if (!result.ok) return result;
  if (!Array.isArray(result.artifacts) || result.artifacts.length === 0) return { ...result, ok: false, error: { code: "EMPTY_RESULT", message: "这次没有生成可用结果，请重新尝试。" } };
  if (result.artifacts.some(a => !a || !a.type || (a.value == null && !a.path))) return { ...result, ok: false, error: { code: "INVALID_ARTIFACT", message: "结果没有完整生成，请重新尝试。" } };
  return result;
}
