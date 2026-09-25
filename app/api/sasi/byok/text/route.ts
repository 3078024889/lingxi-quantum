import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { enforceAbuseGuard } from "@/lib/security/abuse-guard";
import { decryptProviderKey } from "@/lib/sasi/credential-vault";
import { TEXT_PROFILE, TEXT_VERSION, SASI_SYSTEM, DIRECTOR_CONTRACT, estimatedTextFen, runArkText, type TextMessage } from "@/lib/sasi/ark-text";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const fields = "id,state,estimated_fen,expires_at,output,created_at";
const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function GET() {
  const { data: { user } } = await createClient().auth.getUser();
  if (!user) return reply({ error: "AUTH_REQUIRED" }, 401);
  const db = createAdminClient();
  const tasks = await db.from("sasi_byok_text_tasks").select(`${fields},request`).eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
  if (tasks.error) return reply({ error: "HISTORY_UNAVAILABLE" }, 503);
  return reply({ profile: TEXT_PROFILE, tasks: tasks.data.map(row => ({ ...row, request: undefined, question: row.request.messages.at(-1)?.content ?? "" })) });
}
export async function POST(request: NextRequest) {
  if (!isSameOriginMutation(request)) return reply({ error: "ORIGIN_REJECTED" }, 403);
  const { data: { user } } = await createClient().auth.getUser();
  if (!user) return reply({ error: "AUTH_REQUIRED" }, 401);
  const body = await request.json().catch(() => null);
  if (!body || !["quote", "confirm"].includes(body.action)) return reply({ error: "INVALID_ACTION" }, 400);
  const db = createAdminClient();
  const abuse = await enforceAbuseGuard(request, {
    scope: "byok-text",
    userId: user.id,
    accountLimit: 60,
    ipLimit: 180,
  });
  if (!abuse.ok) return reply({ error: abuse.error }, abuse.status);
  if (Date.now() >= Date.parse(TEXT_PROFILE.validUntil)) return reply({ error: "PRICE_REVIEW_REQUIRED" }, 503);
  const { data: connection } = await db.from("sasi_provider_connections").select("encrypted_credential,fingerprint,health_status").eq("user_id", user.id).eq("provider", "volcengine").maybeSingle();
  if (!connection || connection.health_status !== "healthy") return reply({ error: "CONNECTION_REQUIRED" }, 409);
  if (body.action === "quote") {
    if (typeof body.question !== "string" || !body.question.trim() || body.question.length > 12000) return reply({ error: "QUESTION_LENGTH" }, 400);
    if (body.mode !== undefined && !["chat", "director"].includes(body.mode)) return reply({ error: "INVALID_MODE" }, 400);
    const director = body.mode === "director";
    const messages: TextMessage[] = [{ role: "system", content: SASI_SYSTEM + (director ? `\n${DIRECTOR_CONTRACT}` : "") }];
    // Only server-owned successful answers may become context. Never accept a
    // client-supplied system prompt or another user's conversation history.
    if (body.previousId) {
      const previous = await db.from("sasi_byok_text_tasks").select("request,output").eq("id", body.previousId).eq("user_id", user.id).eq("state", "succeeded").maybeSingle();
      if (previous.error || !previous.data) return reply({ error: "PREVIOUS_ANSWER_NOT_FOUND" }, 404);
      messages.push(...previous.data.request.messages.filter((m: TextMessage) => m.role !== "system"), { role: "assistant", content: previous.data.output.answer });
    }
    messages.push({ role: "user", content: body.question.trim() });
    if (messages.reduce((n, m) => n + Buffer.byteLength(m.content), 0) > 60000) return reply({ error: "CONTEXT_LIMIT_START_NEW" }, 422);
    const result = await db.from("sasi_byok_text_tasks").insert({ user_id: user.id, request: { messages, director }, profile_version: TEXT_VERSION,
      key_fingerprint: connection.fingerprint, estimated_fen: estimatedTextFen(messages), expires_at: new Date(Math.min(Date.now() + 600000, Date.parse(TEXT_PROFILE.validUntil))).toISOString() }).select(fields).single();
    return result.error ? reply({ error: "QUOTE_SAVE_FAILED" }, 503) : reply({ task: result.data, profile: TEXT_PROFILE }, 201);
  }
  if (body.acceptSupplierBilling !== true) return reply({ error: "BUDGET_CONFIRMATION_REQUIRED" }, 422);
  const { data: task } = await db.from("sasi_byok_text_tasks").select("*").eq("id", body.taskId).eq("user_id", user.id).maybeSingle();
  if (!task) return reply({ error: "TASK_NOT_FOUND" }, 404);
  if (task.state !== "quoted") return reply({ task: { id: task.id, state: task.state, output: task.output } });
  if (task.key_fingerprint !== connection.fingerprint || task.profile_version !== TEXT_VERSION || Date.parse(task.expires_at) <= Date.now()) return reply({ error: "REQUOTE_REQUIRED" }, 409);
  let key: string;
  try { key = decryptProviderKey(user.id, "volcengine", connection.encrypted_credential); } catch { return reply({ error: "CONNECTION_UNAVAILABLE" }, 503); }
  const claimed = await db.from("sasi_byok_text_tasks").update({ state: "running", updated_at: new Date().toISOString() }).eq("id", task.id).eq("user_id", user.id).eq("state", "quoted").select("id").maybeSingle();
  if (claimed.error || !claimed.data) return reply({ error: "ALREADY_STARTED_OR_UNAVAILABLE" }, 409);
  try {
    const output = await runArkText(key, task.request.messages, task.request.director === true);
    const saved = await db.from("sasi_byok_text_tasks").update({ state: "succeeded", output, updated_at: new Date().toISOString() }).eq("id", task.id).eq("user_id", user.id);
    return reply({ task: { id: task.id, state: "succeeded", output }, historySaved: !saved.error });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const known = /^(MODEL_NOT_OPEN|ARK_HTTP_\d+)$/.test(code);
    const state = known ? "failed" : "uncertain";
    await db.from("sasi_byok_text_tasks").update({ state, output: { error: known ? code : "RESULT_UNCERTAIN_DO_NOT_RETRY_AUTOMATICALLY" }, updated_at: new Date().toISOString() }).eq("id", task.id).eq("user_id", user.id);
    return reply({ error: known ? code : "RESULT_UNCERTAIN_DO_NOT_RETRY_AUTOMATICALLY", taskId: task.id }, 502);
  }
}
