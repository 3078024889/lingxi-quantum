export type SasiPromotionSnapshot = {
  id: string;
  evolutionCycleId?: string | null;
  strategyId: string;
  proposalId?: string | null;
  repositoryHeadSha: string;
  benchmarkEvidenceId: string;
  promotedAt: string;
  promotedBy: string;
  previousStableSnapshotId?: string | null;
  state: "stable" | "canary" | "degraded" | "rolled-back" | "superseded";
  metadata: Record<string, unknown>;
};

export function assertPromotionSnapshot(snapshot: SasiPromotionSnapshot) {
  const errors: string[] = [];
  if (!snapshot.strategyId.trim()) errors.push("STRATEGY_REQUIRED");
  if (!snapshot.repositoryHeadSha.trim()) errors.push("HEAD_SHA_REQUIRED");
  if (!snapshot.benchmarkEvidenceId.trim()) errors.push("BENCHMARK_EVIDENCE_REQUIRED");
  if (!snapshot.promotedBy.trim()) errors.push("PROMOTER_REQUIRED");
  return { ok: errors.length === 0, errors };
}
