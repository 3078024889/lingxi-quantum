import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { sasiOperatorReadiness } from "@/lib/sasi/operator/readiness";
import { loadSasiOperatorEvidence } from "@/lib/sasi/operator/evidence";
import { resolveSasiReasoningConfig } from "@/lib/sasi/execution/model-config";

async function countTable(table: string) {
  const admin = createAdminClient();
  const { count, error } = await admin
    .from(table)
    .select("*", { count: "exact", head: true });
  return { table, available: !error, count: error ? null : count ?? 0 };
}

export async function loadSasiProductionHealth() {
  const reasoning = resolveSasiReasoningConfig();

  const [readiness, evidence, wallet, requests] = await Promise.all([
    sasiOperatorReadiness(),
    loadSasiOperatorEvidence(),
    countTable("ai_wallets"),
    countTable("ai_requests"),
  ]);

  const critical = [
    ...readiness.tables,
    wallet,
    requests,
  ];

  return {
    schemaReady: readiness.schemaReady,
    reasoning: {
      provider: reasoning.provider,
      apiKeyConfigured: reasoning.apiKeyConfigured,
      model: reasoning.model,
      source: reasoning.source,
    },
    billing: {
      walletTableAvailable: wallet.available,
      requestTableAvailable: requests.available,
    },
    evidenceAvailability: {
      learningEvents: evidence.learningEvents.available,
      feedback: evidence.feedback.available,
      externalWork: evidence.externalWork.available,
      candidateCompetitions: evidence.candidateCompetitions.available,
      promotions: evidence.promotions.available,
      rollbacks: evidence.rollbacks.available,
    },
    criticalTables: critical,
    checkedAt: new Date().toISOString(),
  };
}
