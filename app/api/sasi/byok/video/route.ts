import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptProviderKey } from "@/lib/sasi/credential-vault";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { enforceAbuseGuard } from "@/lib/security/abuse-guard";
import { reviewSasiProductionInput } from "@/lib/sasi/safety";
import { applyProjectMemory, loadProjectMemory } from "@/lib/sasi/load-project-memory";
import { loadVideoReferences, type VideoReference } from "@/lib/sasi/video-references";
import { seedanceProfile, seedanceProfileVersion, submitSeedanceByok, pollSeedanceByok, type SeedanceRequest } from "@/lib/sasi/seedance-byok";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PUBLIC_FIELDS = "id,project_id,state,request,estimated_fen,price_source,expires_at,approved_at,provider_task_id,output,created_at,updated_at";
const reply = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(request: NextRequest) {
  const profile = seedanceProfile();
  const enabled = process.env.SASI_BYOK_VIDEO_ENABLED === "true" && !!profile;
  const { data: { user } } = await createClient().auth.getUser();
  if (!user) return reply({ error: "AUTH_REQUIRED", enabled }, 401);
  const projectId = request.nextUrl.searchParams.get("projectId") ?? "";
  if (!UUID.test(projectId)) return reply({ error: "INVALID_PROJECT" }, 400);
  const admin = createAdminClient();
  const { data: project } = await admin.from("sasi_projects").select("id").eq("id", projectId).eq("user_id", user.id).maybeSingle();
  if (!project) return reply({ error: "PROJECT_NOT_FOUND" }, 404);
  const [tasks, connection, assets] = await Promise.all([
    admin.from("sasi_byok_video_tasks").select(PUBLIC_FIELDS).eq("user_id", user.id).eq("project_id", projectId).order("created_at", { ascending: false }).limit(30),
    admin.from("sasi_provider_connections").select("health_status").eq("user_id", user.id).eq("provider", "volcengine").maybeSingle(),
    admin.from("sasi_assets").select("id,original_name,status,verified_size").eq("user_id", user.id).eq("project_id", projectId).in("status", ["ready", "external_scan_required"]).order("created_at", { ascending: false }).limit(100),
  ]);
  if (tasks.error || connection.error) return reply({ error: "BYOK_FOUNDATION_UNAVAILABLE" }, 503);
  if (assets.error) return reply({ error: "REFERENCE_LIST_UNAVAILABLE" }, 503);
  return reply({ enabled, profile, connected: connection.data?.health_status === "healthy", tasks: tasks.data,
    assets: (assets.data ?? []).filter(row => /\.(png|jpe?g|webp)$/i.test(row.original_name) && Number(row.verified_size) <= 10 * 1024 * 1024),
    billing: "supplier_direct", reason: !profile ? "CURRENT_PRICE_UNVERIFIED" : !enabled ? "ACCEPTANCE_PENDING" : null });
}

export async function POST(request: NextRequest) {
  if (!isSameOriginMutation(request)) return reply({ error: "ORIGIN_REJECTED" }, 403);
  const { data: { user } } = await createClient().auth.getUser();
  if (!user) return reply({ error: "AUTH_REQUIRED" }, 401);
  const body = await request.json().catch(() => null);
  if (!body || !["quote", "confirm", "refresh"].includes(body.action)) return reply({ error: "INVALID_ACTION" }, 400);
  const admin = createAdminClient();
  const abuse = await enforceAbuseGuard(request, {
    scope: "byok-video",
    userId: user.id,
    accountLimit: 120,
    ipLimit: 300,
  });
  if (!abuse.ok) return reply({ error: abuse.error }, abuse.status);
  const connection = await admin.from("sasi_provider_connections").select("encrypted_credential,fingerprint,health_status").eq("user_id", user.id).eq("provider", "volcengine").maybeSingle();
  if (connection.error || !connection.data || connection.data.health_status !== "healthy") return reply({ error: "SEEDANCE_CONNECTION_REQUIRED" }, 409);
  const credential = connection.data;
  const profile = seedanceProfile();

  if (body.action === "quote") {
    if (!profile) return reply({ error: "CURRENT_PRICE_UNVERIFIED" }, 503);
    if (process.env.SASI_BYOK_VIDEO_ENABLED !== "true") return reply({ error: "ACCEPTANCE_PENDING" }, 503);
    const projectId = String(body.projectId ?? "");
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (!UUID.test(projectId) || prompt.length < 8 || prompt.length > 3000 || !Number.isInteger(body.duration)
      || body.duration < 4 || body.duration > profile.maxDuration || !["16:9", "9:16", "1:1"].includes(body.ratio)) return reply({ error: "INVALID_VIDEO_INPUT" }, 400);
    const assetIds = body.assetIds ?? [];
    if (!Array.isArray(assetIds) || assetIds.some(id => typeof id !== "string")) return reply({ error: "INVALID_REFERENCE_SELECTION" }, 400);
    const maxImages = profile.imageMode === "reference_image" ? 9 : profile.imageMode === "first_frame" ? 1 : 0;
    if (assetIds.length > maxImages) return reply({ error: "REFERENCE_MODE_NOT_SUPPORTED" }, 422);
    const safety = reviewSasiProductionInput({ prompt, rightsConfirmed: body.rightsConfirmed, aiLabelAcknowledged: body.aiLabelAcknowledged });
    if (!safety.ok) return reply({ error: safety.error }, 422);
    const { data: project } = await admin.from("sasi_projects").select("id").eq("id", projectId).eq("user_id", user.id).eq("kind", "drama").maybeSingle();
    if (!project) return reply({ error: "PROJECT_NOT_FOUND" }, 404);
    try {
      const memory = await loadProjectMemory(admin, user.id, projectId);
      const references = await loadVideoReferences(admin, user.id, projectId, assetIds);
      const input: SeedanceRequest & { references: VideoReference[]; imageMode: string } = { model: profile.model, prompt: applyProjectMemory(prompt, memory.active),
        duration: body.duration, ratio: body.ratio, resolution: profile.resolution, generateAudio: profile.generateAudio,
        references: references.map(({ assetId, name, sha256 }) => ({ assetId, name, sha256 })), imageMode: profile.imageMode ?? "none" };
      const { data, error } = await admin.from("sasi_byok_video_tasks").insert({ user_id: user.id, project_id: projectId,
        request: input, profile_version: seedanceProfileVersion(profile), memory_version: memory.version,
        key_fingerprint: credential.fingerprint, estimated_fen: profile.estimatedFenPerSecond * body.duration,
        price_source: profile.priceSource, expires_at: new Date(Math.min(Date.now() + 600000, Date.parse(profile.validUntil))).toISOString() }).select(PUBLIC_FIELDS).single();
      if (error) return reply({ error: "QUOTE_SAVE_FAILED" }, 503);
      return reply({ task: data }, 201);
    } catch { return reply({ error: "PROJECT_CONTEXT_UNAVAILABLE_OR_TOO_LARGE" }, 422); }
  }

  const taskId = String(body.taskId ?? "");
  if (!UUID.test(taskId)) return reply({ error: "INVALID_TASK" }, 400);
  const { data: task, error } = await admin.from("sasi_byok_video_tasks").select("*").eq("id", taskId).eq("user_id", user.id).maybeSingle();
  if (error || !task) return reply({ error: "TASK_NOT_FOUND" }, 404);
  if (task.key_fingerprint !== credential.fingerprint) return reply({ error: "ORIGINAL_CONNECTION_REQUIRED" }, 409);
  if (body.action === "confirm") {
    if (body.acceptSupplierBilling !== true) return reply({ error: "BUDGET_CONFIRMATION_REQUIRED" }, 422);
    if (task.state !== "quoted") return reply({ taskId: task.id, state: task.state });
    if (!profile || process.env.SASI_BYOK_VIDEO_ENABLED !== "true") return reply({ error: "CURRENT_PRICE_OR_EXECUTION_UNAVAILABLE" }, 503);
    if (Date.parse(task.expires_at) <= Date.now() || task.profile_version !== seedanceProfileVersion(profile)) return reply({ error: "REQUOTE_REQUIRED" }, 409);
    let memory;
    try { memory = await loadProjectMemory(admin, user.id, task.project_id); }
    catch { return reply({ error: "PROJECT_CONTEXT_UNAVAILABLE" }, 503); }
    if (memory.version !== task.memory_version) return reply({ error: "REQUOTE_REQUIRED" }, 409);
    let apiKey: string;
    try { apiKey = decryptProviderKey(user.id, "volcengine", credential.encrypted_credential); }
    catch { return reply({ error: "CONNECTION_UNAVAILABLE" }, 503); }
    let images: { url: string; role: "first_frame" | "reference_image" }[] = [];
    try {
      const snapshots = (task.request.references ?? []) as VideoReference[];
      const fresh = await loadVideoReferences(admin, user.id, task.project_id, snapshots.map(ref => ref.assetId));
      if (fresh.some((ref, index) => ref.sha256 !== snapshots[index].sha256)) return reply({ error: "REFERENCE_CONTENT_CHANGED_REQUOTE" }, 409);
      if (fresh.length && task.request.imageMode !== "first_frame" && task.request.imageMode !== "reference_image") return reply({ error: "REFERENCE_MODE_NOT_SUPPORTED" }, 422);
      images = fresh.map(ref => ({ url: ref.url, role: task.request.imageMode }));
    } catch { return reply({ error: "REFERENCE_CONTENT_UNAVAILABLE" }, 422); }
    // Atomic compare-and-set prevents duplicate supplier charges across tabs/retries.
    const claimed = await admin.from("sasi_byok_video_tasks").update({ state: "submitting", approved_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", task.id).eq("user_id", user.id).eq("state", "quoted").select("id").maybeSingle();
    if (claimed.error) return reply({ error: "TASK_CLAIM_FAILED" }, 503);
    if (!claimed.data) return reply({ taskId: task.id, state: "submitting" }, 202);
    try {
      const supplierId = await submitSeedanceByok(apiKey, task.request as SeedanceRequest, images);
      const saved = await admin.from("sasi_byok_video_tasks").update({ state: "queued", provider_task_id: supplierId, updated_at: new Date().toISOString() }).eq("id", task.id).eq("user_id", user.id);
      if (saved.error) return reply({ error: "SUBMITTED_RECONCILIATION_REQUIRED", taskId: task.id, providerTaskId: supplierId }, 503);
      return reply({ taskId: task.id, state: "queued" }, 202);
    } catch {
      // A timeout does not prove rejection. Never auto-resubmit a billable request.
      await admin.from("sasi_byok_video_tasks").update({ state: "uncertain", updated_at: new Date().toISOString() }).eq("id", task.id).eq("user_id", user.id);
      return reply({ error: "SUBMISSION_UNCERTAIN_CHECK_ARK", taskId: task.id }, 409);
    }
  }
  if (!["queued", "running"].includes(task.state) || !task.provider_task_id) return reply({ taskId: task.id, state: task.state });
  try {
    const apiKey = decryptProviderKey(user.id, "volcengine", credential.encrypted_credential);
    const result = await pollSeedanceByok(apiKey, task.provider_task_id);
    const saved = await admin.from("sasi_byok_video_tasks").update({ state: result.state, output: result.output, updated_at: new Date().toISOString() })
      .eq("id", task.id).eq("user_id", user.id).in("state", ["queued", "running"]);
    if (saved.error) return reply({ error: "TASK_STATUS_SAVE_FAILED" }, 503);
    return reply({ taskId: task.id, state: result.state });
  } catch { return reply({ error: "SUPPLIER_QUERY_UNAVAILABLE" }, 503); }
}
