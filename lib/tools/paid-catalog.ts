export const PUBLIC_PAID_TOOL_IDS = [
  "burn-after-read-file",
  "food-calorie",
  "subtitle-translate",
  "temp-mail-batch",
  "e-sign-pdf",
  "pdf-editor",
  "cross-page-stamp",
  "sasi-deep-reason",
  "sasi-image-generate",
  "sasi-video-generate",
] as const;
export type PublicPaidToolId=(typeof PUBLIC_PAID_TOOL_IDS)[number];
const SET:ReadonlySet<string>=new Set(PUBLIC_PAID_TOOL_IDS);
export function isPublicPaidToolId(value:string):value is PublicPaidToolId{return SET.has(value)}
