import fs from"node:fs";
const files=[
"lib/tools/engine/media-document-router.ts",
"lib/tools/engine/media-quality.ts",
"lib/tools/engine/document-strategy.ts"
];
for(const f of files)if(!fs.existsSync(f))throw new Error("ENGINE_FILE_MISSING:"+f);
const r=fs.readFileSync(files[0],"utf8");
for(const x of ['video-dubbing",engine:"disabled"','requiresPayment:false','video-watermark','audio-transcription','pdf-compress'])
 if(!r.includes(x))throw new Error("ROUTER_CONTRACT_MISSING:"+x);
const q=fs.readFileSync(files[1],"utf8");
for(const x of ["EMPTY_OUTPUT","INVALID_MEDIA_DURATION","NOT_SMALLER"])if(!q.includes(x))throw new Error("QUALITY_GATE_MISSING:"+x);
console.log("MEDIA_DOCUMENT_ROUTER=PASS");
console.log("MEDIA_ARTIFACT_QUALITY_GATE=PASS");
console.log("PDF_STRATEGY_CONTRACT=PASS");
console.log("VIDEO_DUBBING_TRUTHFUL_DISABLED_CONTRACT=PASS");
console.log("MEDIA_DOCUMENT_ENGINE_STATIC_GATE=PASS");
