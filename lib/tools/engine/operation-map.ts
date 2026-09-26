export type CapabilityOperation={engineId:string;capability:string;operation:string};

const MAP:CapabilityOperation[]=[
 {engineId:"qpdf",capability:"pdf-check",operation:"check"},
 {engineId:"qpdf",capability:"structure-optimize",operation:"optimize"},
 {engineId:"qpdf",capability:"linearize",operation:"linearize"},
 {engineId:"pdfcpu",capability:"pdf-validate",operation:"validate"},
 {engineId:"pdfcpu",capability:"optimize",operation:"optimize"},
 {engineId:"pdfcpu",capability:"merge",operation:"merge"},
 {engineId:"pdfcpu",capability:"split",operation:"split"},
 {engineId:"ffmpeg",capability:"extract-audio",operation:"extractAudio"},
 {engineId:"ffmpeg",capability:"transcode",operation:"transcode"},
 {engineId:"ffmpeg",capability:"compress",operation:"transcode"},
 {engineId:"ffmpeg",capability:"trim",operation:"transcode"},
 {engineId:"ffmpeg",capability:"mux",operation:"transcode"},
 {engineId:"whispercpp",capability:"speech-to-text",operation:"transcribe"},
 {engineId:"faster-whisper",capability:"speech-to-text",operation:"transcribe"},
 {engineId:"paddleocr",capability:"ocr",operation:"recognize"},
 {engineId:"argos",capability:"offline-translation",operation:"translate"},
 {engineId:"opencv",capability:"inpaint",operation:"inpaint"},
 {engineId:"exiftool",capability:"metadata-inspect",operation:"inspect"},
 {engineId:"exiftool",capability:"metadata-remove",operation:"removeAll"},
 {engineId:"gotenberg",capability:"url-to-pdf",operation:"urlToPdf"},
 {engineId:"gotenberg",capability:"html-to-pdf",operation:"htmlToPdf"},
 {engineId:"opencc",capability:"simplified-traditional-normalize",operation:"convertText"},
 {engineId:"sharp-libvips",capability:"metadata",operation:"metadata"},
 {engineId:"sharp-libvips",capability:"image-convert",operation:"convert"},
 {engineId:"sharp-libvips",capability:"image-encode",operation:"convert"},
 {engineId:"sharp-libvips",capability:"resize",operation:"resize"},
 {engineId:"sharp-libvips",capability:"compress",operation:"compress"},
 {engineId:"sharp-libvips",capability:"metadata-strip",operation:"stripMetadata"},
 {engineId:"mammoth",capability:"docx-to-text",operation:"toText"},
 {engineId:"mammoth",capability:"docx-to-html",operation:"toHtml"},
 {engineId:"exceljs",capability:"xlsx-read",operation:"xlsxToCsv"},
 {engineId:"exceljs",capability:"csv",operation:"xlsxToCsv"},
 {engineId:"exceljs",capability:"xlsx-write",operation:"csvToXlsx"},
 {engineId:"readability",capability:"article-extract",operation:"extract"},
 {engineId:"dompurify",capability:"sanitize-html",operation:"sanitize"},
 {engineId:"turndown",capability:"html-to-markdown",operation:"markdown"},
];

export function operationFor(engineId:string,capability:string){
 return MAP.find(x=>x.engineId===engineId&&x.capability===capability)?.operation;
}
export function operationCoverage(){return [...MAP]}
