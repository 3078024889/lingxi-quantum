import type { SasiPromotionSnapshot } from "@/lib/sasi/learning/promotion-snapshot";

export type SasiRollbackPlan = {
  id: string;
  fromSnapshotId: string;
  toSnapshotId: string;
  fromHeadSha: string;
  toHeadSha: string;
  reasonCodes: string[];
  requiresHumanApproval: boolean;
  createdAt: string;
};

export function buildRollbackPlan(input: {
  id: string;
  current: SasiPromotionSnapshot;
  previousStable: SasiPromotionSnapshot;
  reasonCodes: string[];
}): SasiRollbackPlan {
  if (input.current.id === input.previousStable.id) {
    throw new Error("ROLLBACK_TARGET_EQUALS_CURRENT");
  }
  if (input.previousStable.state !== "stable") {
    throw new Error("ROLLBACK_TARGET_NOT_STABLE");
  }
  if (!input.reasonCodes.length) {
    throw new Error("ROLLBACK_REASON_REQUIRED");
  }

  return {
    id: input.id,
    fromSnapshotId: input.current.id,
    toSnapshotId: input.previousStable.id,
    fromHeadSha: input.current.repositoryHeadSha,
    toHeadSha: input.previousStable.repositoryHeadSha,
    reasonCodes: input.reasonCodes,
    requiresHumanApproval: true,
    createdAt: new Date().toISOString(),
  };
}
