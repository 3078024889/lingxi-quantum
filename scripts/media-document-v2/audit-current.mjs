import fs from"node:fs";
const checks=[
 ["OCR","components/tools/OcrWorkbench.tsx"],
 ["ID_PHOTO","components/tools/IdPhotoAiWorkbench.tsx"],
 ["IMAGE_RESTORE","components/tools/ImageWatermarkWorkbench.tsx"],
 ["VIDEO_RESTORE","components/tools/VideoWatermarkWorkbench.tsx"],
 ["TRANSCRIPTION","components/tools/TranscriptionWorkbench.tsx"],
 ["PDF_COMPRESS","components/tools/PdfCompressWorkbench.tsx"],
 ["VIDEO_TOOLKIT","components/tools/VideoToolkitWorkbench.tsx"]
];
for(const [n,f] of checks){
 if(!fs.existsSync(f))throw new Error(`LOCAL_${n}_MISSING:${f}`);
 const s=fs.readFileSync(f,"utf8");
 console.log(`${n}_BYTES=${Buffer.byteLength(s)}`);
 console.log(`${n}_PAID_ACTION=${s.includes("PaidActionButton")?"YES":"NO"}`);
}
const vd="components/tools/VideoDubbingWorkbench.tsx";
if(fs.existsSync(vd)){
 const s=fs.readFileSync(vd,"utf8");
 const execution=/ffmpeg|tts|speechSynthesis|synthesize|audio.*mix/i.test(s);
 console.log(`VIDEO_DUBBING_EXECUTION_EVIDENCE=${execution?"PRESENT":"NOT_PROVEN"}`);
}else console.log("VIDEO_DUBBING_EXECUTION_EVIDENCE=NOT_PRESENT");
console.log("LOCAL_MEDIA_DOCUMENT_STATE_AUDIT=PASS");
