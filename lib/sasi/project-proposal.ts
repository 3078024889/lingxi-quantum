import { SASI_MAX_UPLOAD_BYTES } from "@/lib/sasi/upload-policy";
import { budgetAssessment, routeForQuality, type SasiQuality } from "@/lib/sasi/catalog";

export type SasiProjectKind = "build" | "drama";
export type SasiProjectLanguage = "zh"|"en"|"ja"|"ko"|"fr"|"de"|"es"|"pt"|"ar";
export type SasiAttachmentDescriptor = {
  name: string;
  size: number;
  kind: "document" | "image" | "audio" | "video" | "code" | "other";
};

export const SASI_BUILD_STAGES = ["project-understanding", "product-plan", "architecture", "implementation", "verification", "security-review", "preview", "deployment"] as const;
export const SASI_DRAMA_STAGES = ["project-understanding", "story-structure", "characters", "identity-boards", "scene-bible", "storyboard", "voice", "shot-generation", "timeline", "master-export"] as const;

const LANGS = new Set<SasiProjectLanguage>(["zh","en","ja","ko","fr","de","es","pt","ar"]);
const FALLBACK_TITLE:Record<SasiProjectLanguage,{build:string;drama:string}>={
 zh:{build:"未命名产品项目",drama:"未命名影像作品"},
 en:{build:"Untitled website project",drama:"Untitled video project"},
 ja:{build:"無題のサイトプロジェクト",drama:"無題の映像プロジェクト"},
 ko:{build:"제목 없는 웹사이트 프로젝트",drama:"제목 없는 영상 프로젝트"},
 fr:{build:"Projet de site sans titre",drama:"Projet vidéo sans titre"},
 de:{build:"Unbenanntes Website-Projekt",drama:"Unbenanntes Video-Projekt"},
 es:{build:"Proyecto web sin título",drama:"Proyecto de vídeo sin título"},
 pt:{build:"Projeto de site sem título",drama:"Projeto de vídeo sem título"},
 ar:{build:"مشروع موقع بلا عنوان",drama:"مشروع فيديو بلا عنوان"}
};

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
    if (!name || !Number.isFinite(size) || size < 0 || size > SASI_MAX_UPLOAD_BYTES) return [];
    return [{ name, size, kind }];
  });
}

function titleFromBrief(brief: string, kind: SasiProjectKind, language:SasiProjectLanguage) {
  const firstLine = brief.split(/\r?\n/).find((line) => line.trim())?.trim() ?? "";
  const fallback = FALLBACK_TITLE[language][kind];
  return (firstLine || fallback).replace(/\s+/g, " ").slice(0, 72);
}

export function createProjectProposal(body: Record<string, unknown>) {
  const kind: SasiProjectKind | null = body.kind === "build" || body.kind === "code"
    ? "build"
    : body.kind === "drama" ? "drama" : null;
  const brief = typeof body.brief === "string" ? body.brief.trim() : "";
  const attachments = cleanAttachments(body.attachments);
  // Briefs in CJK languages are useful with fewer characters than English.
  const minimumLength = 2;
  if (!kind || (brief.length < minimumLength && attachments.length === 0) || brief.length > 100_000) {
    return { ok: false as const, error: "INVALID_PROJECT_BRIEF" };
  }

  const uiLanguage:SasiProjectLanguage = LANGS.has(body.language as SasiProjectLanguage) ? body.language as SasiProjectLanguage : "zh";
  // The production nine-language migration is applied. Explicit false remains
  // an operator escape hatch for installations on the older schema.
  const language:SasiProjectLanguage = process.env.SASI_PROJECT_9LANG_DB_ENABLED !== "false"
    ? uiLanguage
    : (uiLanguage === "zh" ? "zh" : "en");

  if (kind === "build") {
    return {
      ok: true as const,
      kind,
      title: titleFromBrief(brief, kind, uiLanguage),
      language,
      stages: [...SASI_BUILD_STAGES],
      input: { brief, attachments, uiLanguage, requiresExternalWriteAuthorization: true },
      proposal: { editableWorkflow: true, requiresProductionAuthorization: true },
    };
  }

  const requestedEpisodes = Number(body.episodes);
  const hasEpisodeSpec = body.secondsPerEpisode !== undefined;
  const explicitEpisodes = Number.isInteger(requestedEpisodes) && requestedEpisodes > 0 && requestedEpisodes <= 200 ? requestedEpisodes : null;
  const perEpisode = Number(body.secondsPerEpisode);
  if (hasEpisodeSpec && (!explicitEpisodes || !Number.isSafeInteger(perEpisode) || perEpisode < 5 || perEpisode > 600)) {
    return {ok:false as const,error:"INVALID_EPISODE_SPEC"};
  }
  const legacyTotal = Math.max(5, Math.min(600, Math.round(Number(body.seconds) || 30)));
  const suggestedEpisodes = explicitEpisodes ?? (legacyTotal <= 90 ? 1 : Math.max(2, Math.ceil(legacyTotal / 90)));
  const secondsPerEpisode = hasEpisodeSpec ? perEpisode : Math.ceil(legacyTotal / suggestedEpisodes);
  const seconds = hasEpisodeSpec ? suggestedEpisodes * secondsPerEpisode : legacyTotal;
  const quality: SasiQuality = body.quality === "cinema" || body.quality === "balanced" ? body.quality : "fast";
  const allocation = body.budgetFen === undefined ? Math.round(Number(body.budget || 0) * 100) : Number(body.budgetFen);
  if (!Number.isSafeInteger(allocation) || allocation < 0) return {ok:false as const,error:"INVALID_BUDGET"};
  const quote = {...budgetAssessment(routeForQuality(quality), seconds, allocation),duration:seconds};

  return {
    ok: true as const,
    kind,
    title: titleFromBrief(brief, kind, uiLanguage),
    language,
    stages: [...SASI_DRAMA_STAGES],
    input: { brief, attachments, uiLanguage, seconds, secondsPerEpisode, episodes:suggestedEpisodes, budgetFen:allocation, quality, requestedEpisodes: explicitEpisodes },
    proposal: {
      recommendation: { episodes: suggestedEpisodes, secondsPerEpisode, totalSeconds: seconds, inferred: explicitEpisodes === null },
      quote,
      generationBlocked: !quote.canConfirm,
      editableWorkflow: true,
      requiresProductionAuthorization: true,
    },
  };
}
