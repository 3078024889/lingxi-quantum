import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { publicSasiJob, refreshSasiJob, type SasiJobRow } from "@/lib/sasi/production";

export const runtime = "nodejs";
export const maxDuration = 90;
export const dynamic = "force-dynamic";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  const admin = createAdminClient();
  const limited = await admin.rpc("rate_limit_check", { p_key: `sasi-refresh:${user.id}`, p_limit: 120, p_window_seconds: 3600 });
  if (limited.error) return NextResponse.json({ error: "PRODUCTION_RATE_GUARD_UNAVAILABLE" }, { status: 503 });
  if (limited.data !== true) return NextResponse.json({ error: "PRODUCTION_RATE_LIMITED" }, { status: 429 });
  const found = await admin.from("sasi_jobs").select("*").eq("id", params.id).eq("user_id", user.id).maybeSingle();
  if (found.error || !found.data) return NextResponse.json({ error: "JOB_NOT_FOUND" }, { status: 404 });
  try {
    const job = await refreshSasiJob(admin, found.data as SasiJobRow);
    return NextResponse.json({ job: publicSasiJob(job) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[sasi job refresh] failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "JOB_REFRESH_PENDING", job: publicSasiJob(found.data as SasiJobRow) }, { status: 503 });
  }
}
