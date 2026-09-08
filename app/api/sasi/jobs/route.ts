import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { productionQuote, routeForQuality, type SasiQuality } from "@/lib/sasi/catalog";
import { sasiReadiness } from "@/lib/sasi/readiness";
import { dispatchSasiJob, publicSasiJob, type SasiJobRow } from "@/lib/sasi/production";
import { reviewSasiProductionInput } from "@/lib/sasi/safety";
import { selectSasiVideoProvider, type SasiVideoProviderId } from "@/lib/sasi/provider";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  const { data, error } = await supabase.from("sasi_jobs").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30);
  if (error) return NextResponse.json({ error: "JOB_LIST_FAILED" }, { status: 503 });
  return NextResponse.json({ jobs: ((data ?? []) as SasiJobRow[]).map(publicSasiJob) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const readiness = sasiReadiness();
  if (!readiness.productionReady) {
    return NextResponse.json({ error: "PRODUCTION_NOT_READY", readiness: {
      account: readiness.billing,
      execution: readiness.jobs,
      labeling: readiness.contentLabeling,
    } }, { status: 503 });
  }
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 }); }
  const requestId = request.headers.get("Idempotency-Key")?.trim() ?? "";
  const projectId = typeof body.projectId === "string" ? body.projectId : "";
  const nodeId = typeof body.nodeId === "string" ? body.nodeId : null;
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const duration = Number(body.duration);
  const quality: SasiQuality = body.quality === "cinema" || body.quality === "balanced" ? body.quality : "fast";
  const aspectRatio = body.aspectRatio === "9:16" || body.aspectRatio === "1:1" ? body.aspectRatio : "16:9";
  const preferredProvider: SasiVideoProviderId | null = body.providerPreference === "seedance" || body.providerPreference === "xai" || body.providerPreference === "openai" || body.providerPreference === "wan"
    ? body.providerPreference
    : null;
  if (!UUID_V4.test(requestId)) return NextResponse.json({ error: "INVALID_IDEMPOTENCY_KEY" }, { status: 400 });
  if (!UUID.test(projectId) || (nodeId && !UUID.test(nodeId))) return NextResponse.json({ error: "INVALID_PROJECT_REFERENCE" }, { status: 400 });
  if (prompt.length < 8 || prompt.length > 4000) return NextResponse.json({ error: "INVALID_PROMPT" }, { status: 400 });
  if (![8, 12].includes(duration)) return NextResponse.json({ error: "INVALID_SHOT_DURATION" }, { status: 400 });
  const safety = reviewSasiProductionInput({ prompt, rightsConfirmed: body.rightsConfirmed, aiLabelAcknowledged: body.aiLabelAcknowledged });
  if (!safety.ok) return NextResponse.json({ error: safety.error }, { status: 422 });

  const admin = createAdminClient();
  const limited = await admin.rpc("rate_limit_check", { p_key: `sasi-job:${user.id}`, p_limit: 12, p_window_seconds: 3600 });
  if (limited.error) return NextResponse.json({ error: "PRODUCTION_RATE_GUARD_UNAVAILABLE" }, { status: 503 });
  if (limited.data !== true) return NextResponse.json({ error: "PRODUCTION_RATE_LIMITED" }, { status: 429 });
  const quote = productionQuote(routeForQuality(quality), duration);
  const selection = selectSasiVideoProvider({ quality, duration, aspectRatio, preferredProvider });
  if (!selection) return NextResponse.json({ error: "NO_VERIFIED_PROVIDER_FOR_FORMAT" }, { status: 503 });
  const reserved = await admin.rpc("create_and_reserve_sasi_job", {
    p_user_id: user.id,
    p_request_id: requestId,
    p_project_id: projectId,
    p_node_id: nodeId,
    p_provider: selection.provider,
    p_model: selection.model,
    p_quoted_points: quote.points,
    p_input: {
      prompt,
      duration,
      quality,
      aspectRatio,
      routingMode: preferredProvider ? "professional" : "auto",
      preferredProvider,
      aiContentLabelRequired: true,
      rightsConfirmed: true,
      cleanVisualExportRequested: true,
      publicationLabelDutyAcknowledged: true,
      labelingAgreementVersion: "2026-09-08",
    },
  });
  const reservation = reserved.data as { ok?: boolean; error?: string; jobId?: string; created?: boolean } | null;
  if (reserved.error || !reservation?.ok || !reservation.jobId) {
    const error = reservation?.error ?? "JOB_RESERVATION_FAILED";
    return NextResponse.json({ error }, { status: error === "insufficient_balance" ? 409 : 503 });
  }
  const found = await admin.from("sasi_jobs").select("*").eq("id", reservation.jobId).eq("user_id", user.id).single();
  if (found.error || !found.data) return NextResponse.json({ error: "JOB_LOOKUP_FAILED" }, { status: 503 });
  let job = found.data as SasiJobRow;
  if (job.status === "confirmed") {
    try { job = await dispatchSasiJob(admin, job); }
    catch (error) {
      console.error("[sasi jobs] dispatch failed", error instanceof Error ? error.message : "unknown");
      const refreshed = await admin.from("sasi_jobs").select("*").eq("id", job.id).single();
      return NextResponse.json({ error: "PROVIDER_SUBMIT_FAILED", job: refreshed.data ? publicSasiJob(refreshed.data as SasiJobRow) : null }, { status: 502 });
    }
  }
  return NextResponse.json({ job: publicSasiJob(job), quote }, { status: reservation.created ? 201 : 200 });
}
