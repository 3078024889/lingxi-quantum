import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { productionQuote, routeForQuality, type SasiQuality } from "@/lib/sasi/catalog";
import { selectSasiVideoProvider, type SasiVideoProviderId } from "@/lib/sasi/provider";
import { reviewSasiProductionInput } from "@/lib/sasi/safety";
import { hashSasiPrompt, signSasiTaskQuote } from "@/lib/sasi/task-quote";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 }); }
  const projectId = typeof body.projectId === "string" ? body.projectId : "";
  const nodeId = typeof body.nodeId === "string" ? body.nodeId : null;
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const duration = Math.round(Number(body.duration));
  const quality: SasiQuality = body.quality === "cinema" || body.quality === "balanced" ? body.quality : "fast";
  const aspectRatio = body.aspectRatio === "9:16" || body.aspectRatio === "1:1" ? body.aspectRatio : "16:9";
  const preferredProvider: SasiVideoProviderId | null = body.providerPreference === "seedance" || body.providerPreference === "xai" || body.providerPreference === "openai" || body.providerPreference === "wan" ? body.providerPreference : null;
  if (!UUID.test(projectId) || (nodeId && !UUID.test(nodeId))) return NextResponse.json({ error: "INVALID_PROJECT_REFERENCE" }, { status: 400 });
  if (prompt.length < 8 || prompt.length > 4000 || duration < 5 || duration > 600) return NextResponse.json({ error: "INVALID_TASK_SPEC" }, { status: 400 });
  const safety = reviewSasiProductionInput({ prompt, rightsConfirmed: body.rightsConfirmed, aiLabelAcknowledged: body.aiLabelAcknowledged });
  if (!safety.ok) return NextResponse.json({ error: safety.error }, { status: 422 });
  const [{ data: project }, nodeResult] = await Promise.all([
    supabase.from("sasi_projects").select("id").eq("id", projectId).eq("user_id", user.id).maybeSingle(),
    nodeId ? supabase.from("sasi_nodes").select("id").eq("id", nodeId).eq("project_id", projectId).eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  if (!project || (nodeId && !nodeResult.data)) return NextResponse.json({ error: "PROJECT_NOT_FOUND" }, { status: 404 });
  const selection = selectSasiVideoProvider({ quality, duration, aspectRatio, preferredProvider });
  if (!selection) return NextResponse.json({ error: "NO_VERIFIED_PROVIDER_FOR_FORMAT" }, { status: 503 });
  const quote = productionQuote(routeForQuality(quality), duration);
  const expiresAt = Date.now() + 10 * 60_000;
  const token = signSasiTaskQuote({ userId: user.id, projectId, nodeId, promptHash: hashSasiPrompt(prompt), duration, quality, aspectRatio, provider: selection.provider, model: selection.model, amountFen: quote.amountFen, expiresAt });
  return NextResponse.json({ quote: { amountFen: quote.amountFen, amountRmb: (quote.amountFen / 100).toFixed(2), expiresAt: new Date(expiresAt).toISOString(), token } }, { headers: { "Cache-Control": "no-store" } });
}
