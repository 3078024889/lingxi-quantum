import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { refreshSasiJob, type SasiJobRow } from "@/lib/sasi/production";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const expected = process.env.CRON_SECRET?.trim() ?? "";
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (expected.length < 24 || supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const admin = createAdminClient();
  const { data, error } = await admin.from("sasi_jobs").select("*").in("status", ["queued", "running"]).order("updated_at").limit(10);
  if (error) return NextResponse.json({ error: "JOB_SCAN_FAILED" }, { status: 503 });
  const results = [];
  for (const row of (data ?? []) as SasiJobRow[]) {
    try {
      const job = await refreshSasiJob(admin, row);
      results.push({ id: job.id, status: job.status });
    } catch (refreshError) {
      console.error("[sasi reconcile] job pending", { id: row.id, error: refreshError instanceof Error ? refreshError.message : "unknown" });
      results.push({ id: row.id, status: row.status, pending: true });
    }
  }
  return NextResponse.json({ scanned: data?.length ?? 0, results });
}

export const GET = POST;
