import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CREDIT_PACKS } from "@/lib/sasi/catalog";
import { sasiRmbBalanceV1Enabled, sasiTopupProductEnabled } from "@/lib/sasi/payment-gate";
import { sasiPublicReadiness } from "@/lib/sasi/readiness";
import { publicSasiJob, type SasiJobRow } from "@/lib/sasi/production";
import { readUnifiedBalanceSnapshot } from "@/lib/money/unified-balance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  const admin = createAdminClient();
  const rmbBalanceV1 = sasiRmbBalanceV1Enabled();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const [balancesResult, wallet, ledger, jobs, deliveries] = await Promise.all([
    readUnifiedBalanceSnapshot(admin,user.id).then(data=>({data,error:null as Error|null})).catch(error=>({data:null,error:error as Error})),
    admin.from("sasi_wallets").select("available_points,reserved_points,updated_at").eq("user_id", user.id).maybeSingle(),
    admin.from("sasi_credit_ledger").select("id,kind,delta_available,delta_reserved,available_after,reserved_after,reference_id,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30),
    admin.from("sasi_jobs").select("*").eq("user_id", user.id).gte("updated_at", thirtyDaysAgo).order("updated_at", { ascending: false }).limit(1000),
    admin.from("sasi_deliveries").select("id,project_id,job_id,media_kind,mime_type,byte_size,ai_generated,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30),
  ]);
  const firstError = balancesResult.error ?? wallet.error ?? ledger.error ?? jobs.error ?? deliveries.error;
  const errorCode = firstError && "code" in firstError && typeof firstError.code === "string" ? firstError.code : "UNKNOWN";
  if (firstError && errorCode !== "PGRST116") {
    console.error("[sasi account] read failed", errorCode);
    return NextResponse.json({ error: "PRODUCTION_ACCOUNT_UNAVAILABLE" }, { status: 503 });
  }
  return NextResponse.json({
    wallet: {
      balanceFen: balancesResult.data?.CNY.availableMinor ?? 0,
      balanceUsdCents: balancesResult.data?.USD.availableMinor ?? 0,
      activeBalanceFen: balancesResult.data?.CNY.activeAvailableMinor ?? 0,
      legacyBalanceFen: balancesResult.data?.CNY.legacyAvailableMinor ?? 0,
      reservedAmountFen: wallet.data?.reserved_points ?? 0,
      updatedAt: wallet.data?.updated_at ?? null,
    },
    ledger: (ledger.data ?? []).map((entry) => ({
      id: entry.id,
      kind: entry.kind,
      deltaBalanceFen: entry.delta_available,
      deltaReservedFen: entry.delta_reserved,
      balanceAfterFen: entry.available_after,
      reservedAfterFen: entry.reserved_after,
      referenceId: entry.reference_id,
      createdAt: entry.created_at,
    })),
    jobs: ((jobs.data ?? []) as SasiJobRow[]).map(publicSasiJob),
    jobsTruncated: (jobs.data?.length ?? 0) >= 1000,
    deliveries: (deliveries.data ?? []).map((delivery) => ({
      id: delivery.id,
      projectId: delivery.project_id,
      jobId: delivery.job_id,
      mediaKind: delivery.media_kind,
      mimeType: delivery.mime_type,
      byteSize: delivery.byte_size,
      aiGenerated: delivery.ai_generated,
      createdAt: delivery.created_at,
    })),
    packs: CREDIT_PACKS.filter((pack) => sasiTopupProductEnabled(pack.id)),
    rmbBalanceV1,
    readiness: sasiPublicReadiness(),
  }, { headers: { "Cache-Control": "no-store" } });
}
