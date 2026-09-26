import type {ToolEngineGraph,ToolStage} from "./types";
const req=(capability:string,primary:string[],fallback:string[]=[],checks:string[]=[],optional=false)=>({capability,primary,fallback,checks,optional});
const s=(id:string,label:string,requires:ReturnType<typeof req>[],checks:string[]=[],parallelSafe=false):ToolStage=>({id,label,requires,checks,parallelSafe});
const g=(toolId:string,stages:ToolStage[],resultChecks:string[]=[]):ToolEngineGraph=>({toolId,stages,resultChecks});

export const TOOL_GRAPHS:ToolEngineGraph[]=[
 g("food-calorie",[
  s("normalize","Normalize query",[req("simplified-traditional-normalize",["opencc"],[],[],true),req("chinese-tokenize",["jieba"],[],[],true)]),
  s("search","Search nutrition DB",[req("food-search",["usda-fdc"])],["bounded-result-count","source-present"]),
  s("calculate","Calculate nutrients",[req("macros",["usda-fdc"]),req("micronutrients",["usda-fdc"],[],[],true)],["missing-is-null-not-zero","totals-reconcile"]),
 ],["source-present","no-fabricated-zero"]),
 g("food-photo-analysis",[
  s("vision","Meal image research",[req("meal-images",["nutrition5k"])]),
  s("map","Map candidates to food DB",[req("food-search",["usda-fdc"])])
 ],["estimated-values-labeled"]),
 g("ocr",[
  s("preprocess","Image cleanup",[req("threshold",["opencv"],["browser-canvas"],[],true)]),
  s("recognize","OCR",[req("ocr",["paddleocr"],["tesseractjs"],["nonempty-text-or-explicit-no-text"])])
 ],["result-editable"]),
 g("pdf-ocr",[
  s("parse","Read PDF",[req("pdf-render",["pdfjs"])]),
  s("recognize","OCR pages",[req("ocr",["paddleocr"],["tesseractjs"])]),
  s("rebuild","Rebuild searchable output",[req("pdf-build",["pdflib"],["pdfcpu"])]),
 ],["page-count-preserved","output-opens"]),
 g("pdf-compress",[
  s("inspect","Inspect PDF",[req("pdf-parse",["pdfjs"])]),
  s("optimize","Structure optimization",[req("structure-optimize",["qpdf"],["pdfcpu"],[],true)]),
  s("rebuild","Image-heavy fallback",[req("pdf-build",["pdflib"]),req("pdf-render",["pdfjs"])],[],true),
  s("validate","Validate output",[req("pdf-check",["qpdf"],["pdfcpu","pdfjs"])])
 ],["page-count-preserved","output-opens","size-reported"]),
 g("compress-pdf",[],[]),
 g("pdf-editor",[s("parse","Preview",[req("pdf-render",["pdfjs"])]),s("edit","Edit",[req("pdf-build",["pdflib"])]),s("validate","Validate",[req("pdf-parse",["pdfjs"],["pdfcpu"])])],["output-opens"]),
 g("pdf-redact",[s("render","Render",[req("pdf-render",["pdfjs"])]),s("redact","Permanent redact",[req("pdf-build",["pdflib"],["pdfcpu"])]),s("validate","Validate",[req("pdf-text",["pdfjs"])] )],["redacted-text-not-recoverable"]),
 g("merge-pdf",[s("merge","Merge",[req("merge",["pdflib"],["pdfcpu"])]),s("validate","Validate",[req("pdf-parse",["pdfjs"],["qpdf"])])],["page-count-sum"]),
 g("split-pdf",[s("split","Split",[req("split",["pdflib"],["pdfcpu"])]),s("validate","Validate",[req("pdf-parse",["pdfjs"])])],["all-pages-accounted-for"]),
 g("image-to-pdf",[s("encode","Prepare images",[req("image-encode",["browser-canvas"],["sharp-libvips"])]),s("build","Build PDF",[req("pdf-build",["pdflib"])] )],["image-count-preserved"]),
 g("pdf-to-jpg",[s("render","Render pages",[req("pdf-render",["pdfjs"])]),s("encode","Encode JPG",[req("image-encode",["browser-canvas"],["sharp-libvips"])])],["page-count-preserved"]),
 g("png-to-jpg",[s("convert","Convert",[req("image-encode",["browser-canvas"],["sharp-libvips"])])],["dimensions-preserved"]),
 g("jpg-to-png",[s("convert","Convert",[req("image-encode",["browser-canvas"],["sharp-libvips"])])],["dimensions-preserved"]),
 g("webp-to-jpg",[s("convert","Convert",[req("image-encode",["browser-canvas"],["sharp-libvips"])])],["dimensions-preserved"]),
 g("heic-to-jpg",[s("decode","Decode HEIC",[req("heic-decode",["heic2any"],["libheif"])]),s("encode","Encode JPG",[req("image-encode",["browser-canvas"],["sharp-libvips"])])],["orientation-correct"]),
 g("compress-image",[s("compress","Compress",[req("compress",["browser-canvas"],["sharp-libvips"])])],["target-reported"]),
 g("resize-image",[s("resize","Resize",[req("resize",["browser-canvas"],["sharp-libvips"])])],["dimensions-exact"]),
 g("privacy-cleaner",[s("inspect","Inspect metadata",[req("metadata-inspect",["exiftool"],[],[],true)]),s("clean","Remove metadata",[req("metadata-strip",["browser-canvas"],["sharp-libvips"]),req("metadata",["pdflib"],[],[],true)]),s("rescan","Verify",[req("metadata-inspect",["exiftool"],[],[],true)])],["privacy-metadata-removed"]),
 g("image-watermark-remover",[s("inpaint","Inpaint selected mask",[req("inpaint",["opencv"])]),s("validate","Validate",[req("image-decode",["browser-canvas"],["sharp-libvips"])])],["dimensions-preserved"]),
 g("batch-image-watermark-remover",[s("inpaint","Batch inpaint",[req("inpaint",["opencv"])],[],true)],["all-inputs-accounted-for"]),
 g("video-watermark-remover",[s("decode","Decode",[req("transcode",["ffmpeg"])]),s("track-inpaint","Track / inpaint",[req("tracking",["opencv"]),req("inpaint",["opencv"])]),s("encode","Encode",[req("transcode",["ffmpeg"])] )],["duration-within-tolerance","audio-preserved"]),
 g("id-photo-ai",[s("face","Detect face",[req("face-detect",["mediapipe"])]),s("segment","Segment portrait",[req("portrait-segmentation",["mediapipe"])]),s("compose","Compose size/background",[req("crop",["opencv"]),req("image-encode",["sharp-libvips"],["browser-canvas"])])],["requested-size-exact","face-position-valid"]),
 g("audio-transcription",[s("normalize","Normalize audio",[req("transcode",["ffmpeg"])]),s("asr","Transcribe",[req("speech-to-text",["whispercpp"],["faster-whisper"])])],["timestamps-monotonic","nonempty-or-silence"]),
 g("video-transcription",[s("extract","Extract audio",[req("extract-audio",["ffmpeg"])]),s("asr","Transcribe",[req("speech-to-text",["whispercpp"],["faster-whisper"])])],["timestamps-monotonic","nonempty-or-silence"]),
 g("subtitle-translate",[s("translate","Offline translate",[req("offline-translation",["argos"])])],["cue-count-preserved","timestamps-identical"]),
 g("video-dubbing",[s("extract","Extract speech",[req("extract-audio",["ffmpeg"])]),s("asr","Transcribe",[req("speech-to-text",["whispercpp"],["faster-whisper"])]),s("translate","Translate",[req("offline-translation",["argos"])]),s("tts","Synthesize target speech",[req("text-to-speech",["kokoro"])]),s("mux","Mix output",[req("mux",["ffmpeg"])])],["duration-within-tolerance","audio-track-present"]),
 g("qr-safe-reader",[s("decode","Decode QR",[req("qr-decode",["jsqr"])] )],["payload-visible-before-navigation"]),
 g("qr-code-reader",[s("decode","Decode QR",[req("qr-decode",["jsqr"])] )],["payload-present"]),
 g("qr-code-generator",[s("generate","Generate QR",[req("qr-generate",["qrcode"])] )],["image-generated"]),
 g("docx-to-txt",[s("parse","Parse DOCX",[req("docx-to-text",["mammoth"],[],[],true),req("text",["native-js"])] )],["nonempty-or-explicit-empty"]),
 g("xlsx-to-csv",[s("parse","Read workbook",[req("xlsx-read",["exceljs"],[],[],true),req("text",["native-js"])]),s("write","Write CSV",[req("csv",["exceljs"],[],[],true),req("text",["native-js"])])],["sheet-count-accounted-for"]),
 g("csv-to-xlsx",[s("parse","Parse delimited",[req("text",["native-js"])]),s("write","Write workbook",[req("xlsx-write",["exceljs"],[],[],true),req("text",["native-js"])])],["row-count-preserved"]),
 g("web-extract",[s("sanitize","Sanitize",[req("sanitize-html",["dompurify"])]),s("extract","Extract article",[req("article-extract",["readability"])] )],["canonical-document-valid"]),
 g("web-to-markdown",[s("sanitize","Sanitize",[req("sanitize-html",["dompurify"])]),s("extract","Extract",[req("article-extract",["readability"])]),s("markdown","Convert",[req("html-to-markdown",["turndown"])] )],["markdown-nonempty"]),
 g("web-to-pdf",[s("render","Render URL/HTML",[req("url-to-pdf",["gotenberg"])] )],["output-opens"]),

 g("compress-image-to-20kb",[s("compress","Compress to target",[req("compress",["browser-canvas"],["sharp-libvips"])])],["target-reported"]),
 g("compress-image-to-50kb",[s("compress","Compress to target",[req("compress",["browser-canvas"],["sharp-libvips"])])],["target-reported"]),
 g("compress-image-to-100kb",[s("compress","Compress to target",[req("compress",["browser-canvas"],["sharp-libvips"])])],["target-reported"]),
 g("compress-image-to-200kb",[s("compress","Compress to target",[req("compress",["browser-canvas"],["sharp-libvips"])])],["target-reported"]),
 g("compress-image-to-500kb",[s("compress","Compress to target",[req("compress",["browser-canvas"],["sharp-libvips"])])],["target-reported"]),
 g("remove-exif",[s("clean","Remove metadata",[req("metadata-strip",["browser-canvas"],["sharp-libvips"])]),s("verify","Verify metadata",[req("metadata-inspect",["exiftool"],[],[],true)])],["privacy-metadata-removed"]),
 g("avif-to-jpg",[s("convert","Convert AVIF",[req("image-encode",["browser-canvas"],["sharp-libvips"])])],["dimensions-preserved"]),
 g("heic-local",[s("decode","Decode HEIC",[req("heic-decode",["heic2any"],["libheif"])]),s("encode","Encode JPG",[req("image-encode",["browser-canvas"],["sharp-libvips"])])],["orientation-correct"]),
 g("svg-to-png",[s("render","Render SVG",[req("svg-render",["browser-canvas"])])],["dimensions-preserved"]),
 g("long-image",[s("stitch","Stitch images",[req("stitch",["browser-canvas"])] )],["all-inputs-accounted-for"]),
 g("batch-image",[s("batch","Batch image process",[req("image-encode",["browser-canvas"],["sharp-libvips"]),req("resize",["browser-canvas"],["sharp-libvips"],[],true),req("compress",["browser-canvas"],["sharp-libvips"],[],true)],[],true)],["all-inputs-accounted-for"]),
 g("image-to-pdf-pro",[s("encode","Prepare images",[req("image-encode",["browser-canvas"],["sharp-libvips"])]),s("build","Build PDF",[req("pdf-build",["pdflib"])])],["image-count-preserved","output-opens"]),
 g("pdf-merge-split",[s("parse","Read PDFs",[req("pdf-parse",["pdfjs"])]),s("compose","Merge or split",[req("merge",["pdflib"],["pdfcpu"]),req("split",["pdflib"],["pdfcpu"],[],true)]),s("validate","Validate",[req("pdf-parse",["pdfjs"],["qpdf"])])],["output-opens"]),
 g("pdf-pages",[s("parse","Read PDF",[req("pdf-render",["pdfjs"])]),s("arrange","Reorder pages",[req("page-manage",["pdflib"])]),s("validate","Validate",[req("pdf-parse",["pdfjs"])])],["all-pages-accounted-for","output-opens"]),
 g("e-sign-pdf",[s("preview","Preview PDF",[req("pdf-render",["pdfjs"])]),s("sign","Place signature or seal",[req("sign",["pdflib"]),req("stamp",["pdflib"],[],[],true)]),s("validate","Validate",[req("pdf-parse",["pdfjs"],["qpdf"])])],["page-count-preserved","output-opens"]),
 g("document-copy-layout",[s("detect","Detect document",[req("document-detect",["opencv"],["browser-canvas"],[],true)]),s("compose","Compose A4",[req("crop",["browser-canvas"],["opencv"]),req("pdf-build",["pdflib"])])],["output-opens"]),
 g("video-toolkit",[s("process","Process media",[req("transcode",["ffmpeg"])] )],["duration-within-tolerance"]),
 g("subtitle-tools",[s("parse","Parse subtitle",[req("subtitle-parse",["native-js"])]),s("transform","Shift/convert",[req("subtitle-shift",["native-js"])])],["timestamps-monotonic"]),
 g("screenshot-redact",[s("recognize","Find text",[req("ocr",["tesseractjs"],["paddleocr"],[],true)]),s("redact","Redact regions",[req("redact",["browser-canvas"],["opencv"])])],["dimensions-preserved"]),
 g("text-counter",[s("analyze","Count text",[req("text",["native-js"])])],["result-editable"]),
 g("remove-duplicate-lines",[s("dedupe","Remove duplicate lines",[req("dedupe-lines",["native-js"])])],["result-editable"]),
 g("remove-empty-lines",[s("clean","Remove empty lines",[req("remove-empty-lines",["native-js"])])],["result-editable"]),
 g("url-encode-decode",[s("convert","Encode or decode URL text",[req("url-codec",["native-js"])])],["result-editable"]),
 g("base64-encode-decode",[s("convert","Encode or decode Base64",[req("base64",["native-js"])])],["result-editable"]),
 g("file-type-detector",[s("detect","Detect file signature",[req("file-signature",["native-js"])])],["payload-present"]),
 g("md5-sha256",[s("hash","Hash file",[req("hash",["native-js"]),req("sha256",["webcrypto"],[],[],true)])],["payload-present"]),
 g("file-compare",[s("compare","Compare files",[req("file-compare",["native-js"]),req("sha256",["webcrypto"],[],[],true)])],["payload-present"]),
 g("pptx-to-txt",[s("parse","Read PPTX archive",[req("pptx-text",["jszip"],["native-js"])])],["nonempty-or-explicit-empty"]),
 g("json-formatter",[s("format","Format JSON",[req("json",["native-js"])])],["result-editable"]),
 g("timestamp-converter",[s("convert","Convert timestamps",[req("time",["native-js"])])],["result-editable"]),
];

// alias to share exact graph
const pdfCompress=TOOL_GRAPHS.find(x=>x.toolId==="pdf-compress");
const compressPdf=TOOL_GRAPHS.find(x=>x.toolId==="compress-pdf");if(pdfCompress&&compressPdf)compressPdf.stages=pdfCompress.stages;
export function graphForTool(toolId:string){return TOOL_GRAPHS.find(x=>x.toolId===toolId)}
