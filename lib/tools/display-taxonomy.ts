export type ToolDisplayCategory=
 |"all"|"pdf"|"image"|"media"|"subtitle"|"table"|"privacy"|"recognition"|"text"|"file"|"other";

export const TOOL_DISPLAY_CATEGORIES:ToolDisplayCategory[]=[
 "all","pdf","image","media","subtitle","table","privacy","recognition","text","file","other"
];

const PRIVACY=new Set([
 "temp-mail","burn-after-read","privacy-cleaner","screenshot-redact","remove-exif",
 "pdf-redact","pdf-protect","pdf-unlock","pdf-permissions","pdf-remove-metadata"
]);
const RECOGNITION=new Set([
 "ocr","pdf-ocr","handwriting-ocr","food-calorie","qr-safe-reader","qr-code-reader","qr-code-generator"
]);
const SUBTITLE=new Set([
 "subtitle-tools","subtitle-translate","audio-transcription","video-transcription","video-dubbing","video-translate"
]);
const TABLE=new Set([
 "xlsx-to-csv","csv-to-xlsx","csv-json","ics-to-csv","vcf-to-csv","json-formatter"
]);
const MEDIA=new Set([
 "video-toolkit","video-watermark-remover","reverse-video","loop-video","stop-motion-video","audio-cleanup"
]);
const TEXT=new Set([
 "text-counter","remove-duplicate-lines","remove-empty-lines","url-encode-decode","base64-encode-decode",
 "timestamp-converter","uuid-generator","regex-tester","text-diff","xml-formatter","jwt-decoder",
 "url-parser","case-converter","number-base-converter","cron-parser"
]);
const FILES=new Set([
 "file-type-detector","md5-sha256","file-compare","docx-to-txt","pptx-to-txt","epub-to-txt","odt-to-txt"
]);
const PDF_EXACT=new Set([
 "merge-pdf","split-pdf","compress-pdf","image-to-pdf","image-to-pdf-pro","e-sign-pdf",
 "document-copy-layout","batch-pdf"
]);

export function toolDisplayCategory(slug:string):Exclude<ToolDisplayCategory,"all">{
 if(PRIVACY.has(slug))return"privacy";
 if(RECOGNITION.has(slug))return"recognition";
 if(SUBTITLE.has(slug))return"subtitle";
 if(TABLE.has(slug))return"table";
 if(MEDIA.has(slug))return"media";
 if(TEXT.has(slug))return"text";
 if(FILES.has(slug))return"file";
 if(PDF_EXACT.has(slug)||slug.startsWith("pdf-"))return"pdf";
 if(
  slug.startsWith("image-")||slug.startsWith("batch-image")||slug.startsWith("compress-image")||
  slug==="resize-image"||slug==="long-image"||slug==="id-photo-ai"||
  /^(png|jpg|webp|heic|avif|jfif|bmp|ico|gif|svg)-/.test(slug)
 )return"image";
 return"other";
}

export function toolDisplayKind(category:Exclude<ToolDisplayCategory,"all">){
 if(category==="pdf"||category==="file")return"document" as const;
 if(category==="image")return"image" as const;
 if(category==="media")return"video" as const;
 if(category==="subtitle")return"audio" as const;
 if(category==="privacy")return"privacy" as const;
 if(category==="recognition")return"ai" as const;
 return"utility" as const;
}
