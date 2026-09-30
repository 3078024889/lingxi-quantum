import fs from"node:fs";
const must=[
"components/tools/OcrWorkbench.tsx","components/tools/IdPhotoAiWorkbench.tsx",
"components/tools/ImageWatermarkWorkbench.tsx","components/tools/VideoWatermarkWorkbench.tsx",
"components/tools/TranscriptionWorkbench.tsx","components/tools/PdfCompressWorkbench.tsx",
"components/tools/VideoToolkitWorkbench.tsx"
];
for(const f of must)if(!fs.existsSync(f))throw new Error("REQUIRED_LOCAL_WORKBENCH_MISSING:"+f);
const free=["IdPhotoAiWorkbench.tsx","ImageWatermarkWorkbench.tsx","VideoWatermarkWorkbench.tsx","TranscriptionWorkbench.tsx"];
let paid=[];
for(const n of free){
 const f="components/tools/"+n,s=fs.readFileSync(f,"utf8");
 if(s.includes("PaidActionButton"))paid.push(f);
}
const videoDub=fs.existsSync("components/tools/VideoDubbingWorkbench.tsx")?fs.readFileSync("components/tools/VideoDubbingWorkbench.tsx","utf8"):"";
const ocr=fs.readFileSync("components/tools/OcrWorkbench.tsx","utf8");
const pdf=fs.readFileSync("components/tools/PdfCompressWorkbench.tsx","utf8");
const id=fs.readFileSync("components/tools/IdPhotoAiWorkbench.tsx","utf8");
console.log("MEDIA_REQUIRED_WORKBENCHES="+must.length);
console.log("FREE_LOCAL_PAID_UI_FINDINGS="+paid.length);
for(const x of paid)console.log("FREE_LOCAL_PAID_UI="+x);
console.log("OCR_TESSERACT_DIRECT="+(ocr.includes('tesseract.js')?"YES":"NO"));
console.log("PDF_RASTER_REBUILD="+(pdf.includes("renderPdfPage")&&pdf.includes("embedJpg")?"YES":"NO"));
console.log("ID_PHOTO_LOCAL_ENGINE="+(id.includes("localIdPhoto")?"YES":"NO"));
console.log("VIDEO_DUBBING_PRESENT="+(videoDub?"YES":"NO"));
