import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

type CountResult = {
  table: string;
  count: number | null;
  available: boolean;
};

async function safeCount(table: string): Promise<CountResult> {
  const admin = createAdminClient();
  const { count, error } = await admin
    .from(table)
    .select("*", { count: "exact", head: true });

  return {
    table,
    count: error ? null : count ?? 0,
    available: !error,
  };
}

export async function sasiOperatorReadiness() {
  const tables = await Promise.all([
    safeCount("sasi_runtime_learning_events"),
    safeCount("sasi_user_learning_feedback"),
    safeCount("sasi_learning_runs"),
    safeCount("sasi_model_observations"),
    safeCount("sasi_candidate_evaluations"),
    safeCount("sasi_candidate_competitions"),
    safeCount("sasi_promotion_snapshots"),
    safeCount("sasi_rollback_plans"),
    safeCount("sasi_external_work_queue"),
  ]);

  return {
    tables,
    schemaReady: tables.every((table) => table.available),
    checkedAt: new Date().toISOString(),
  };
}
