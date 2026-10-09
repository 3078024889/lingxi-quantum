// Full-product outcome contracts for every publicly listed LINGXIFIELD tool.
// This is an audit plan, not a declaration that its requirements are implemented.
import fs from "node:fs/promises";

const seo=await fs.readFile("lib/seo/global-seo.ts","utf8");
const matrix=JSON.parse(await fs.readFile("lib/tools/platform/fixture-matrix.json","utf8"));
const slugs=[...seo.matchAll(/\{slug:"([^"]+)",zh:/g)].map(m=>m[1]);
if(slugs.length<100||new Set(slugs).size!==slugs.length)throw new Error("TOOL_CATALOG_CHANGED");
const blueprint={
 pdf:{
  goal:"Deliver a visually correct, valid PDF with no lost pages or unwanted marks",
  reference:["https://github.com/Hopding/pdf-lib","https://github.com/mozilla/pdf.js","https://github.com/ArtifexSoftware/ghostpdl"],
  output:["Check file opens in two independent PDF readers","Verify page count, size and text/images before and after","Confirm user-selected formatting is preserved","Check multiple pages, rotated pages and image scans","Test passwords, damaged input and recovery","Verify actual downloaded bytes"]
 },
 signing:{
  goal:"Produce an attractive transparent handwritten signature naturally embedded in the document",
  reference:["https://github.com/mozilla/pdf.js","https://github.com/Hopding/pdf-lib","https://github.com/szimek/signature_pad"],
  output:["Remove paper shadows without deleting light strokes","Offer manual cleanup, undo and transparent preview","Support drag/resize/rotate and multi-page signing","Export transparent PNG and a PDF that opens correctly","Distinguish visual signature from certificate-backed digital signing","Verify signature visible in downloaded PDF on desktop and mobile"]
 },
 image:{
  goal:"Deliver a clean, accurately converted or edited image",
  reference:["https://github.com/lovell/sharp","https://github.com/GoogleChromeLabs/squoosh","https://github.com/SDWebImage/libwebp"],
  output:["Inspect decoded pixels and actual format magic, not file extensions","Preserve aspect ratio, dimensions and optional transparency","Respect color profile/EXIF choice","Offer before/after previews and file-size comparison","Test compressed, high-resolution, alpha and corrupted inputs","Verify downloaded output reopens in a second decoder"]
 },
 remove:{
  goal:"Remove an unwanted region without leaving obvious holes or distorting useful content",
  reference:["https://github.com/opencv/opencv","https://github.com/Sanster/IOPaint"],
  output:["Allow brush-based precise selection and undo","Separate simple backgrounds from complex texture repairs","Preview zoomed edges and residual artifacts","Preserve original size and as much image detail as possible","Do not pretend crop/blur is true reconstruction","Test batch outputs against the original"]
 },
 video:{
  goal:"Export a playable video with requested changes, synchronized audio and stable quality",
  reference:["https://github.com/FFmpeg/FFmpeg","https://github.com/mediabunny/mediabunny"],
  output:["Verify duration, codec, resolution, sample aspect ratio","Check audio/video sync and timestamp continuity","Preview key moments and export a working video","Support cancellation and recoverable errors","Report unsupported device codecs honestly","Verify output with ffprobe or a second decoder"]
 },
 audio:{
  goal:"Deliver intelligible audio or text results with correct timing",
  reference:["https://github.com/FFmpeg/FFmpeg","https://github.com/ggerganov/whisper.cpp"],
  output:["Verify sample rate, channels and duration","Check transcription alignment and language detection","Review noise-reduction artifacts on real speech","Offer preview and text/time-coded downloads","Test silence, low volume and multilingual media","Make cost and model availability clear before processing"]
 },
 text:{
  goal:"Produce accurate, copyable, validated structured text",
  reference:["https://github.com/microsoft/monaco-editor","https://github.com/josdejong/jsoneditor"],
  output:["Test Unicode, emoji, CJK, RTL and multiline content","Preserve meaningful whitespace and line endings","Provide copy/download, undo and error-position feedback","Reject malformed input with actionable examples","Run deterministic examples with known expected output","Keep content local where possible"]
 },
 privacy:{
  goal:"Protect data through verifiable removal or appropriately scoped one-time access",
  reference:["https://github.com/mozilla/pdf.js","https://github.com/Hopding/pdf-lib"],
  output:["Make irreversible operations explicit","Verify redacted text is not recoverable in output","Audit metadata and attachments after cleaning","Test access expiration and single-use behavior","Explain privacy boundaries without unverified claims","Never log private content or secret tokens"]
 },
 nutrition:{
  goal:"Provide an end-to-end editable food and calorie journal with source transparency",
  reference:["https://fdc.nal.usda.gov/"],
  output:["Search and recognize foods, allow manual correction","Edit servings and units with nutritional totals updated","Show nutrient source/uncertainty","Keep usable history and trends","Recover unfinished analysis and clarify charges","Test known meals, empty inputs and regional food labels"]
 },
 other:{
  goal:"Complete the user's requested task with a clear and verifiable artifact",
  reference:["https://github.com/Hopding/pdf-lib","https://github.com/FFmpeg/FFmpeg"],
  output:["Confirm upload/input acceptance","Verify processing result against a reference sample","Provide accessible preview and correction actions","Download and reopen the actual artifact","Recover from errors and interruptions","Confirm no surprise charging"]
 }
};
function category(slug){
 if(slug==="e-sign-pdf"||slug==="pdf-editor")return "signing";
 if(/watermark-remover|redact/.test(slug))return "remove";
 if(/pdf|document|docx|pptx|epub|odt/.test(slug))return "pdf";
 if(/image|jpg|png|webp|heic|avif|bmp|jfif|ico|gif|svg|photo/.test(slug))return "image";
 if(/video|subtitle/.test(slug))return "video";
 if(/audio|transcription|dubbing/.test(slug))return "audio";
 if(/privacy|burn-after-read|temp-mail|exif/.test(slug))return "privacy";
 if(/food-calorie/.test(slug))return "nutrition";
 if(/text|json|csv|xlsx|xml|regex|url|base64|sha256|md5|uuid|cron|timestamp|jwt|number-base/.test(slug))return "text";
 return "other";
}
const fixtures=new Map();
for(const group of matrix.fixtureGroups)for(const slug of group.covers){const list=fixtures.get(slug)||[];list.push(group.file);fixtures.set(slug,list)}
const rows=slugs.map(slug=>{
 const group=category(slug),plan=blueprint[group],classifier=matrix.toolClassifications[slug];
 return {slug,group,goal:plan.goal,industryReferences:plan.reference,
  evidence: {fixtureFiles:fixtures.get(slug)||[],previousCoverage:classifier?.kind||"unclassified",realUserOutcome:"not individually verified"},
  requiredAcceptance:plan.output,
  releaseGate:["Outcome-based feature gap review","Real input processing","Actual downloaded artifact validation","Desktop and mobile inspection","Error/cancel/retry recovery","Privacy and billing honesty"],
  designGapStatus:"TO_AUDIT",implementationStatus:"NOT_ASSERTED",owner:"SASI/Tool quality"};
});
await fs.mkdir("audit-results",{recursive:true});
const payload={date:"2026-10-09",version:"R33",purpose:"Feature-completeness audit, not just successful HTTP responses",count:rows.length,toolOutcomes:rows};
await fs.writeFile("audit-results/R33_TOOL_OUTCOME_CONTRACTS.json",JSON.stringify(payload,null,2));
const summary=Object.groupBy(rows,r=>r.group);
await fs.writeFile("audit-results/R33_PRODUCT_AUDIT.md",
 "# LINGXIFIELD — 118 tool outcome and feature review\n\n"+
 "This file is a **release checklist**. It does NOT claim every feature is implemented.\n\n"+
 Object.entries(summary).map(([name,list])=>"## "+name+" ("+list.length+")\n\n"+
 list.map(x=>"- `"+x.slug+"`: "+x.goal+" — **TO AUDIT**; evidence: "+(x.evidence.fixtureFiles.join(", ")||"no file fixture")+".").join("\n")).join("\n\n")+"\n");
console.log(JSON.stringify({total:rows.length,byGroup:Object.fromEntries(Object.entries(summary).map(([k,v])=>[k,v.length])),missingClassifications:rows.filter(x=>x.evidence.previousCoverage==="unclassified").map(x=>x.slug)},null,2));
if(rows.length<100||rows.some(x=>x.evidence.previousCoverage==="unclassified"))process.exitCode=1;
