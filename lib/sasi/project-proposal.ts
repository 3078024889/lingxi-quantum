import { budgetAssessment, routeForQuality, type SasiQuality } from "@/lib/sasi/catalog";

export type SasiProjectKind = "build" | "drama";
export type SasiAttachmentDescriptor = {
  name: string;
  size: number;
  kind: "document" | "image" | "audio" | "video" | "code" | "other";
};

export const SASI_BUILD_STAGES = ["project-understanding", "product-plan", "architecture", "implementation", "verification", "security-review", "preview", "deployment"] as const;
export const SASI_DRAMA_STAGES = ["project-understanding", "story-structure", "characters", "identity-boards", "scene-bible", "storyboard", "voice", "shot-generation", "timeline", "master-export"] as const;

function cleanAttachments(value: unknown): SasiAttachmentDescriptor[] {
  if (!Array.isArray(value)) return [];
  const allowedKinds = new Set<SasiAttachmentDescriptor["kind"]>(["document", "image", "audio", "video", "code", "other"]);
  return value.slice(0, 20).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const candidate = item as Record<string, unknown>;
    const name = typeof candidate.name === "string" ? candidate.name.trim().slice(0, 240) : "";
    const size = Math.round(Number(candidate.size));
    const kind = allowedKinds.has(candidate.kind as SasiAttachmentDescriptor["kind"])
      ? candidate.kind as SasiAttachmentDescriptor["kind"]
      : "other";
    if (!name || !Number.isFinite(size) || size < 0 || size > 100 * 1024 * 1024) return [];
    return [{ name, size, kind }];
  });
}

function titleFromBrief(brief: string, kind: SasiProjectKind) {
  const firstLine = brief.split(/\r?\n/).find((line) => line.trim())?.trim() ?? "";
  const fallback = kind === "drama" ? "未命名影像作品" : "未命名产品项目";
  return (firstLine || fallback).replace(/\s+/g, " ").slice(0, 72);
}

export function createProjectProposal(body: Record<string, unknown>) {
  const kind: SasiProjectKind | null = body.kind === "build" || body.kind === "code"
    ? "build"
    : body.kind === "drama" ? "drama" : null;
  const brief = typeof body.brief === "string" ? body.brief.trim() : "";
  const attachments = cleanAttachments(body.attachments);
  const minimumLength = kind === "build" ? 12 : 20;
  if (!kind || (brief.length < minimumLength && attachments.length === 0) || brief.length > 100_000) {
    return { ok: false as const, error: "INVALID_PROJECT_BRIEF" };
  }

  const language = body.language === "en" ? "en" : "zh";
  if (kind === "build") {
    return {
      ok: true as const,
      kind,
      title: titleFromBrief(brief, kind),
      language,
      stages: [...SASI_BUILD_STAGES],
      input: { brief, attachments, requiresExternalWriteAuthorization: true },
      proposal: { editableWorkflow: true, requiresProductionAuthorization: true },
    };
  }

  const seconds = Math.max(5, Math.min(600, Math.round(Number(body.seconds) || 30)));
  const quality: SasiQuality = body.quality === "cinema" || body.quality === "balanced" ? body.quality : "fast";
  const allocation = Math.max(0, Math.round(Number(body.budget) || 0));
  const quote = budgetAssessment(routeForQuality(quality), seconds, allocation);
  const requestedEpisodes = Number(body.episodes);
  const explicitEpisodes = Number.isInteger(requestedEpisodes) && requestedEpisodes > 0 ? Math.min(200, requestedEpisodes) : null;
  const suggestedEpisodes = explicitEpisodes ?? (seconds <= 90 ? 1 : Math.max(2, Math.ceil(seconds / 90)));

  return {
    ok: true as const,
    kind,
    title: titleFromBrief(brief, kind),
    language,
    stages: [...SASI_DRAMA_STAGES],
    input: { brief, attachments, seconds, quality, requestedEpisodes: explicitEpisodes },
    proposal: {
      recommendation: { episodes: suggestedEpisodes, secondsPerEpisode: Math.ceil(seconds / suggestedEpisodes), totalSeconds: seconds, inferred: explicitEpisodes === null },
      quote,
      generationBlocked: !quote.canConfirm,
      editableWorkflow: true,
      requiresProductionAuthorization: true,
    },
  };
}
