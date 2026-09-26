export const PUBLIC_PAID_TOOL_IDS = [
  "audio-transcription",
  "batch-image-watermark-remover",
  "burn-after-read-file",
  "cross-page-stamp",
  "e-sign-pdf",
  "food-calorie",
  "id-photo-ai",
  "image-watermark-remover",
  "pdf-editor",
  "subtitle-translate",
  "temp-mail-batch",
  "video-dubbing",
  "video-transcription",
  "video-watermark-remover",

  "sasi-deep-reason",
  "sasi-image-generate",
  "sasi-video-generate",
] as const;

export type PublicPaidToolId = (typeof PUBLIC_PAID_TOOL_IDS)[number];
const SET:ReadonlySet<string>=new Set(PUBLIC_PAID_TOOL_IDS);
export function isPublicPaidToolId(value:string):value is PublicPaidToolId{return SET.has(value)}
