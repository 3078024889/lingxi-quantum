import { NextResponse } from "next/server";
import { budgetAssessment, providerForQuality, type SasiQuality } from "@/lib/sasi/catalog";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 }); }
  const kind = body.kind === "code" ? "code" : body.kind === "drama" ? "drama" : null;
  const brief = typeof body.brief === "string" ? body.brief.trim() : "";
  if (!kind || brief.length < (kind === "code" ? 12 : 20) || brief.length > 100_000) return NextResponse.json({ error: "INVALID_BRIEF" }, { status: 400 });
  if (kind === "code") {
    return NextResponse.json({ kind, status: "prepared", stages: ["planner", "architect", "coder", "tester", "security-review", "deployment"], requiresConfirmationBeforeExternalWrite: true });
  }
  const seconds = Math.max(5, Math.min(600, Math.round(Number(body.seconds) || 30)));
  const quality: SasiQuality = body.quality === "cinema" || body.quality === "balanced" ? body.quality : "fast";
  const budget = Math.max(0, Number(body.budget) || 0);
  const providerId = providerForQuality(quality);
  const quote = budgetAssessment(providerId, seconds, budget);
  const explicitEpisodes = Number.isInteger(body.episodes) && Number(body.episodes) > 0 ? Math.min(200, Number(body.episodes)) : null;
  const suggestedEpisodes = explicitEpisodes ?? (seconds <= 90 ? 1 : Math.max(2, Math.ceil(seconds / 90)));
  return NextResponse.json({
    kind,
    status: "prepared",
    recommendation: { episodes: suggestedEpisodes, secondsPerEpisode: Math.ceil(seconds / suggestedEpisodes), totalSeconds: seconds, inferred: explicitEpisodes === null },
    quote,
    generationBlocked: !quote.canConfirm,
    stages: ["project-understanding", "structure", "characters", "identity-boards", "scenes", "storyboard", "voice", "shot-generation", "timeline", "export"],
    editableWorkflow: true,
    requiresFinalCostConfirmation: true,
  });
}
