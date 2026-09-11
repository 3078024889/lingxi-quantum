import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { productionQuote, routeForQuality, type SasiQuality } from "@/lib/sasi/catalog";
import { sasiReadiness } from "@/lib/sasi/readiness";
import { dispatchSasiJob, publicSasiJob, type SasiJobRow } from "@/lib/sasi/production";
import { reviewSasiProductionInput } from "@/lib/sasi/safety";
import { selectSasiVideoProvider, type SasiVideoProviderId } from "@/lib/sasi/provider";
import { hashSasiPrompt, verifySasiTaskQuote } from "@/lib/sasi/task-quote";
import {
  assertDirectorFoundryLoaded,
  composeDirectorProductionPrompt,
  loadDirectorFoundryPack,
  summarizeFoundryPackMeta,
} from "@/lib/sasi/cangxuan/load-series-context";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseCharacterKeys(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const keys = value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
  return keys.length ? keys.slice(0, 24) : undefined;
}

function parseEpisode(value: unknown): number | undefined {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(n) || n < 1) return undefined;
  return Math.floor(n);
}

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
  const quoteToken = typeof body.quoteToken === "string" ? body.quoteToken : "";
  const duration = Number(body.duration);
  const quality: SasiQuality = body.quality === "cinema" || body.quality === "balanced" ? body.quality : "fast";
  const aspectRatio = body.aspectRatio === "9:16" || body.aspectRatio === "1:1" ? body.aspectRatio : "16:9";
  const preferredProvider: SasiVideoProviderId | null = body.providerPreference === "seedance" || body.providerPreference === "xai" || body.providerPreference === "openai" || body.providerPreference === "wan"
    ? body.providerPreference
    : null;
  if (!UUID_V4.test(requestId)) return NextResponse.json({ error: "INVALID_IDEMPOTENCY_KEY" }, { status: 400 });
  if (!UUID.test(projectId) || (nodeId && !UUID.test(nodeId))) return NextResponse.json({ error: "INVALID_PROJECT_REFERENCE" }, { status: 400 });
  if (prompt.length < 8 || prompt.length > 4000) return NextResponse.json({ error: "INVALID_PROMPT" }, { status: 400 });
  const safety = reviewSasiProductionInput({ prompt, rightsConfirmed: body.rightsConfirmed, aiLabelAcknowledged: body.aiLabelAcknowledged });
  if (!safety.ok) return NextResponse.json({ error: safety.error }, { status: 422 });

  const admin = createAdminClient();
  const quote = productionQuote(routeForQuality(quality), duration);
  const selection = selectSasiVideoProvider({ quality, duration, aspectRatio, preferredProvider });
  if (!selection) return NextResponse.json({ error: "NO_VERIFIED_PROVIDER_FOR_FORMAT" }, { status: 503 });
  const approved = verifySasiTaskQuote(quoteToken);
  if (!approved || approved.expiresAt < Date.now()) return NextResponse.json({ error: "QUOTE_REQUIRED_OR_EXPIRED" }, { status: 409 });
  if (approved.userId !== user.id || approved.projectId !== projectId || approved.nodeId !== nodeId || approved.promptHash !== hashSasiPrompt(prompt)
    || approved.duration !== quote.duration || approved.quality !== quality || approved.aspectRatio !== aspectRatio
    || approved.provider !== selection.provider || approved.model !== selection.model || approved.amountFen !== quote.amountFen) {
    return NextResponse.json({ error: "QUOTE_CHANGED_REQUOTE_REQUIRED" }, { status: 409 });
  }
  const limited = await admin.rpc("rate_limit_check", { p_key: `sasi-job:${user.id}`, p_limit: 12, p_window_seconds: 3600 });
  if (limited.error) return NextResponse.json({ error: "PRODUCTION_RATE_GUARD_UNAVAILABLE" }, { status: 503 });
  if (limited.data !== true) return NextResponse.json({ error: "PRODUCTION_RATE_LIMITED" }, { status: 429 });

  // L5: force-read Foundry identity boards before video brief dispatch (soft-fail if empty/unavailable).
  let productionPrompt = prompt;
  let foundryPack: ReturnType<typeof summarizeFoundryPackMeta> | null = null;
  try {
    const pack = assertDirectorFoundryLoaded(
      await loadDirectorFoundryPack(admin, user.id, {
        projectId,
        characterKeys: parseCharacterKeys(body.characterKeys),
        episode: parseEpisode(body.episode),
      }),
    );
    productionPrompt = composeDirectorProductionPrompt(prompt, pack, 4000);
    foundryPack = summarizeFoundryPackMeta(pack);
  } catch (error) {
    console.warn("[cangxuan L5] foundry load failed — soft continue without pack", error instanceof Error ? error.message : "unknown");
  }

  const reserved = await admin.rpc("create_and_reserve_sasi_job", {
    p_user_id: user.id,
    p_request_id: requestId,
    p_project_id: projectId,
    p_node_id: nodeId,
    p_provider: selection.provider,
    p_model: selection.model,
    // Legacy database column name; its integer value is RMB fen.
    p_quoted_points: quote.amountFen,
    p_input: {
      prompt: productionPrompt,
      userPrompt: prompt,
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
      foundryPack,
      foundryInjected: Boolean(foundryPack && !foundryPack.empty),
      approvedAmountFen: quote.amountFen,
      quoteExpiresAt: approved.expiresAt,
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
  return NextResponse.json({ job: publicSasiJob(job), quote, foundryPack }, { status: reservation.created ? 201 : 200 });
}
