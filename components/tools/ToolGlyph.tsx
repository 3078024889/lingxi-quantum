"use client";

type Kind="image"|"document"|"video"|"audio"|"privacy"|"utility"|"ai"|"qr";

const BY_SLUG:Record<string,string>={
  "batch-image":"🖼️","avif-to-jpg":"🌈","heic-local":"📱","heic-to-jpg":"📱","svg-to-png":"🎨","long-image":"🧩",
  "png-to-jpg":"🌄","jpg-to-png":"🖼️","webp-to-jpg":"🌈","compress-image":"🗜️","resize-image":"📐","remove-exif":"🧹",
  "merge-pdf":"📚","split-pdf":"✂️","compress-pdf":"📦","image-to-pdf":"🧾","image-to-pdf-pro":"🧾","pdf-to-jpg":"🖼️",
  "pdf-merge-split":"📚","pdf-compress":"📦","pdf-pages":"📑","pdf-editor":"✏️","e-sign-pdf":"✍️","document-copy-layout":"🪪","pdf-redact":"🔒","pdf-ocr":"📄",
  "video-toolkit":"🎞️","video-transcription":"🎬","audio-transcription":"🎙️","video-dubbing":"🎧","video-watermark-remover":"🎥",
  "subtitle-tools":"💬","subtitle-translate":"🌐",
  "privacy-cleaner":"🛡️","screenshot-redact":"🫥","qr-safe-reader":"🔎","temp-mail":"📬","burn-after-read":"🔥",
  "image-watermark-remover":"🖼️","batch-image-watermark-remover":"🧽","id-photo-ai":"🪪","food-calorie":"🥗","ocr":"🔤",
  "xlsx-to-csv":"📊","csv-to-xlsx":"📈","json-formatter":"🧩","text-counter":"🔢","remove-duplicate-lines":"🧹","remove-empty-lines":"✂️",
  "url-encode-decode":"🔗","base64-encode-decode":"🔐","file-type-detector":"🧭","md5-sha256":"#️⃣","file-compare":"⚖️",
  "docx-to-txt":"📝","pptx-to-txt":"📽️","timestamp-converter":"⏱️","qr-code-generator":"🔳","qr-code-reader":"📷"
};

const BY_KIND:Record<Kind,string>={
  image:"🖼️",document:"📄",video:"🎬",audio:"🎧",privacy:"🛡️",utility:"🧰",ai:"✨",qr:"🔳"
};

export default function ToolGlyph({kind,slug=""}:{kind:Kind;slug?:string}){
  const glyph=BY_SLUG[slug]||BY_KIND[kind]||"✨";
  return <span className="lx-tool-emoji" aria-hidden="true">{glyph}</span>;
}
