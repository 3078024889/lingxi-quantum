"use client";
import LingxiMiniIcon,{type LingxiIconName} from "@/components/LingxiMiniIcon";

type Kind="image"|"document"|"video"|"audio"|"privacy"|"utility"|"ai"|"qr";

const SLUG:Record<string,LingxiIconName>={
  "merge-pdf":"pdf","split-pdf":"pdf","compress-pdf":"compress","pdf-compress":"compress","pdf-editor":"pdf","pdf-pages":"pdf",
  "pdf-to-jpg":"pdf","image-to-pdf":"pdf","image-to-pdf-pro":"pdf","pdf-merge-split":"pdf","pdf-redact":"privacy","e-sign-pdf":"document","document-copy-layout":"document",
  "pdf-ocr":"ocr","ocr":"ocr","docx-to-txt":"document","pptx-to-txt":"document","json-formatter":"document","md5-sha256":"hash","text-counter":"text","remove-duplicate-lines":"text","remove-empty-lines":"text","file-compare":"compare","timestamp-converter":"text",
  "png-to-jpg":"image","jpg-to-png":"image","webp-to-jpg":"image","heic-to-jpg":"image","heic-local":"image","avif-to-jpg":"image","svg-to-png":"image","long-image":"image","compress-image":"compress","resize-image":"compress","remove-exif":"privacy",
  "image-watermark-remover":"image","batch-image-watermark-remover":"image","video-watermark-remover":"video","id-photo-ai":"idcard","food-calorie":"food",
  "video-toolkit":"video","video-transcription":"video","audio-transcription":"audio","video-dubbing":"audio","subtitle-tools":"subtitle","subtitle-translate":"translate",
  "xlsx-to-csv":"excel","csv-to-xlsx":"excel","tsv-to-xlsx":"excel","sheet-to-excel":"excel","web-extract":"web","url-encode-decode":"web","base64-encode-decode":"text","file-type-detector":"recognition",
  "qr-code-generator":"qr","qr-code-reader":"qr","qr-safe-reader":"qr",
  "privacy-cleaner":"privacy","screenshot-redact":"privacy","temp-mail":"mail","burn-after-read":"burn"
};

const KIND:Record<Kind,LingxiIconName>={
  image:"image",document:"document",video:"video",audio:"audio",privacy:"privacy",utility:"tools",ai:"sparkles",qr:"qr"
};

export default function ToolGlyph({kind,slug=""}:{kind:Kind;slug?:string}){
  return <LingxiMiniIcon name={SLUG[slug]||KIND[kind]||"tools"} size="card"/>;
}
