import fs from"node:fs";
const base="lib/tools/engine/";
const req=[
"ocr-adaptive.ts","id-photo-geometry.ts","image-restoration.ts","asr-adaptive.ts",
"ffmpeg-validation.ts","subtitle-timeline.ts","pdf-preservation.ts","execution-fallback.ts"
];
for(const f of req)if(!fs.existsSync(base+f))throw new Error("ENGINE_MISSING:"+f);
const tests=[
 ["OCR",base+"ocr-adaptive.ts",["local-layout-model","adaptive-threshold"]],
 ["ID",base+"id-photo-geometry.ts",["SEGMENTATION_NOT_RUN","FACE_OFF_CENTER"]],
 ["RESTORE",base+"image-restoration.ts",["unsupported","local-model"]],
 ["ASR",base+"asr-adaptive.ts",["EMPTY_TRANSCRIPT","modelAvailable"]],
 ["FFMPEG",base+"ffmpeg-validation.ts",["DURATION_DRIFT","VIDEO_STREAM_MISSING"]],
 ["SUBTITLE",base+"subtitle-timeline.ts",["OVERLAP_OR_UNSORTED"]],
 ["PDF",base+"pdf-preservation.ts",["do-not-rasterize","KEEP_ORIGINAL"]],
 ["FALLBACK",base+"execution-fallback.ts",["shouldRetry","userFailure"]]
];
for(const [n,f,tokens] of tests){const s=fs.readFileSync(f,"utf8");for(const t of tokens)if(!s.includes(t))throw new Error(`${n}_TOKEN_MISSING:${t}`);console.log(`${n}_ENGINE_CONTRACT=PASS`)}
console.log("MEDIA_DOCUMENT_DEEP_ENGINE_STATIC_GATE=PASS");
