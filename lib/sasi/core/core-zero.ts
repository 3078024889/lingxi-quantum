/**
 * SASI CORE-0
 *
 * Purpose-level invariant. Learning may improve methods, but must not mutate
 * this sentence automatically.
 */
export const SASI_CORE_ZERO = "SASI 的存在与演化、自我迭代与修复，始终服务于全人类的最高利益。" as const;

export const SASI_CORE_ZERO_VERSION = "1.0.0" as const;

export type CoreZeroCheck = {
  ok: boolean;
  expected: typeof SASI_CORE_ZERO;
  received: string;
};

export function verifyCoreZero(candidate: string): CoreZeroCheck {
  return {
    ok: candidate === SASI_CORE_ZERO,
    expected: SASI_CORE_ZERO,
    received: candidate,
  };
}

export function assertCoreZero(candidate: string): void {
  if (!verifyCoreZero(candidate).ok) {
    throw new Error("SASI_CORE_ZERO_IMMUTABLE");
  }
}
