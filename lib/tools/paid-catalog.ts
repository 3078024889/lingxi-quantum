export const PUBLIC_PAID_TOOL_IDS = [
  "audio-transcription",
  "batch-image-watermark-remover",
  "burn-after-read-file",
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
] as const;

export type PublicPaidToolId = (typeof PUBLIC_PAID_TOOL_IDS)[number];

const PUBLIC_PAID_TOOL_ID_SET: ReadonlySet<string> = new Set(PUBLIC_PAID_TOOL_IDS);

export function isPublicPaidToolId(value: string): value is PublicPaidToolId {
  return PUBLIC_PAID_TOOL_ID_SET.has(value);
}
