import type { MetadataRoute } from "next";
import { liveTools } from "@/lib/tools/registry";

const SITE="https://lingxifield.com";

const CORE=[
 "",
 "/products",
 "/explore",
 "/tools",
 "/sasi",
 "/sasi/drama",
 "/sasi/pricing",
 "/ai-knowledge",
 "/ai-learning",
 "/ai-research",
 "/about",
 "/terms",
 "/privacy",
 "/refunds",
 "/legal/sasi",
];

const DEDICATED_TOOLS=[
 "/tools/temp-mail",
 "/tools/burn-after-read",
 "/tools/food-calorie",
 "/tools/id-photo-ai",
 "/tools/video-transcription",
 "/tools/audio-transcription",
 "/tools/subtitle-tools",
 "/tools/subtitle-translate",
 "/tools/video-toolkit",
 "/tools/video-dubbing",
 "/tools/video-watermark-remover",
 "/tools/ocr",
 "/tools/pdf-editor",
 "/tools/pdf-merge-split",
 "/tools/pdf-compress",
 "/tools/pdf-ocr",
 "/tools/pdf-pages",
 "/tools/pdf-redact",
 "/tools/pdf-to-jpg",
 "/tools/e-sign-pdf",
 "/tools/image-watermark-remover",
 "/tools/batch-image-watermark-remover",
 "/tools/image-to-pdf-pro",
 "/tools/heic-local",
 "/tools/avif-to-jpg",
 "/tools/jpg-to-png",
 "/tools/png-to-jpg",
 "/tools/webp-to-jpg",
 "/tools/svg-to-png",
 "/tools/qr-safe-reader",
 "/tools/privacy-cleaner",
 "/tools/screenshot-redact",
 "/tools/long-image",
 "/tools/document-copy-layout",
 "/tools/batch-image",
];

export default function sitemap():MetadataRoute.Sitemap{
 const generated=liveTools().map(tool=>`/tools/${tool.slug}`);
 const routes=Array.from(new Set([...CORE,...DEDICATED_TOOLS,...generated]));
 return routes.map(route=>({
  url:`${SITE}${route}`,
  changeFrequency:route===""?"daily":"weekly",
  priority:route===""?1:route.startsWith("/tools/")?0.85:0.75,
 }));
}
