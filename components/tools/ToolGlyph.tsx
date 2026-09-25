"use client";
import LingxiMiniIcon,{type LingxiIconName} from "@/components/LingxiMiniIcon";

type Kind="image"|"document"|"video"|"audio"|"privacy"|"utility"|"ai"|"qr";

const SLUG:Record<string,LingxiIconName>={
  "batch-image":"image","avif-to-jpg":"image","heic-local":"image","heic-to-jpg":"image","svg-to-png":"image","long-image":"image",
  "png-to-jpg":"image","jpg-to-png":"image","webp-to-jpg":"image","compress-image":"image","resize-image":"image","remove-exif":"privacy",
  "merge-pdf":"pdf","split-pdf":"pdf","compress-pdf":"pdf","image-to-pdf":"pdf","image-to-pdf-pro":"pdf","pdf-to-jpg":"pdf",
  "pdf-merge-split":"pdf","pdf-compress":"pdf","pdf-pages":"document","pdf-editor":"pdf","e-sign-pdf":"document","document-copy-layout":"document","pdf-redact":"privacy","pdf-ocr":"ocr",
  "video-toolkit":"video","video-transcription":"video","audio-transcription":"audio","video-dubbing":"audio","video-watermark-remover":"video",
  "subtitle-tools":"subtitle","subtitle-translate":"subtitle",
  "privacy-cleaner":"privacy","screenshot-redact":"privacy","qr-safe-reader":"recognition","temp-mail":"mail","burn-after-read":"burn",
  "image-watermark-remover":"image","batch-image-watermark-remover":"image","id-photo-ai":"account","food-calorie":"food","ocr":"ocr",
  "xlsx-to-csv":"table","csv-to-xlsx":"table","json-formatter":"document","text-counter":"document","remove-duplicate-lines":"document","remove-empty-lines":"document",
  "url-encode-decode":"connections","base64-encode-decode":"privacy","file-type-detector":"recognition","md5-sha256":"document","file-compare":"document",
  "docx-to-txt":"document","pptx-to-txt":"document","timestamp-converter":"orders","qr-code-generator":"qr","qr-code-reader":"qr"
};
const KIND:Record<Kind,LingxiIconName>={
 image:"image",document:"document",video:"video",audio:"audio",privacy:"privacy",utility:"tools",ai:"sparkles",qr:"qr"
};
export default function ToolGlyph({kind,slug=""}:{kind:Kind;slug?:string}){
  return <LingxiMiniIcon name={SLUG[slug]||KIND[kind]||"tools"} size="card"/>;
}
