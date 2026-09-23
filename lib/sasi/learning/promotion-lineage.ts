import type { SasiPromotionSnapshot } from "@/lib/sasi/learning/promotion-snapshot";

export function validatePromotionLineage(
  snapshots: SasiPromotionSnapshot[],
) {
  const byId = new Map(snapshots.map((item) => [item.id, item]));
  const errors: string[] = [];

  for (const snapshot of snapshots) {
    if (
      snapshot.previousStableSnapshotId &&
      !byId.has(snapshot.previousStableSnapshotId)
    ) {
      errors.push(`MISSING_PREVIOUS_SNAPSHOT:${snapshot.id}`);
    }

    const seen = new Set<string>();
    let current: SasiPromotionSnapshot | undefined = snapshot;

    while (current?.previousStableSnapshotId) {
      if (seen.has(current.id)) {
        errors.push(`PROMOTION_LINEAGE_CYCLE:${snapshot.id}`);
        break;
      }
      seen.add(current.id);
      current = byId.get(current.previousStableSnapshotId);
    }
  }

  return { ok: errors.length === 0, errors };
}
