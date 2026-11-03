#!/usr/bin/env node
// A conservative evidence register: tests committed != tests passed != live production.
import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8");
const catalog=read("lib/seo/global-seo.ts");
const slugs=[...new Set([...catalog.matchAll(/[{]slug:"([^"]+)"/g)].map(m=>m[1]))].sort();
if(slugs.length<100)throw Error("PUBLIC_TOOL_CATALOG_INCOMPLETE");
const group=(names,testFile)=>names.map(slug=>[slug,"tests/final-closure/"+testFile+".spec.ts"]);
const current=new Map([
 ...group(["text-counter","remove-duplicate-lines","remove-empty-lines","url-encode-decode","base64-encode-decode","json-formatter","timestamp-converter","md5-sha256","file-type-detector","file-compare"],"tool-real-operations-v118"),
 ...group(["png-to-jpg","jpg-to-png","webp-to-jpg","compress-image-to-20kb","compress-image-to-50kb","compress-image-to-100kb","compress-image-to-200kb","compress-image-to-500kb"],"tool-image-file-e2e-v118"),
 ...group(["csv-to-xlsx","xlsx-to-csv"],"tool-office-roundtrip-v118"),
 ...group(["merge-pdf","qr-code-reader"],"tool-pdf-qr-e2e-v119"),
 ...group(["split-pdf"],"pdf-precision-split-v122"),
 ...group(["pdf-editor"],"pdf-editor-save-reopen-v123"),
 ...group(["image-to-pdf","pdf-to-jpg"],"tool-cross-workflow-v125"),
 ...group(["case-converter","csv-json","xml-formatter","jwt-decoder","url-parser","number-base-converter","text-diff","regex-tester","uuid-generator","cron-parser"],"unverified-developer-real-v126"),
 ...group(["pdf-to-text","pdf-to-markdown","pdf-page-numbers","pdf-watermark","pdf-crop","pdf-flatten","pdf-compare","pdf-search","pdf-inspect"],"unverified-pdf-real-v126"),
 ...group(["jfif-to-jpg","gif-to-jpg","bmp-to-png","avif-to-jpg","svg-to-png","batch-image","long-image","qr-safe-reader"],"unverified-images-real-v126"),
 ...group(["pdf-metadata-editor","pdf-page-size","pdf-grayscale","pdf-header-footer","pdf-bates-numbering","pdf-pages-per-sheet","pdf-remove-metadata","pdf-overlay"],"unverified-pdf-advanced-v126"),
 ...group(["ics-to-csv","vcf-to-csv","odt-to-txt","epub-to-txt","pptx-to-txt","docx-to-txt"],"unverified-longtail-documents-v126"),
 ...group(["compress-image","resize-image","pdf-compress","pdf-halve-pages","pdf-rasterize","pdf-remove-annotations"],"remaining-local-tool-real-v127"),
 ...group(["pdf-pages","pdf-merge-split","subtitle-tools","pdf-viewer-preferences","pdf-web-optimize","document-copy-layout","pdf-bookmarks"],"remaining-pdf-subtitle-local-v129"),
 ...group(["pdf-protect","pdf-unlock","pdf-permissions","pdf-attachments"],"remaining-pdf-security-attachments-v129"),
 ...group(["ico-to-png"],"remaining-ico-real-v129"),
 ...group(["pdf-to-xlsx"],"remaining-pdf-table-real-v129"),
 ...group(["privacy-cleaner"],"remaining-privacy-cleaner-real-v129"),
 ...group(["qr-code-generator"],"qr-cron-output-v86"),
 ...group(["screenshot-redact"],"screenshot-redaction-v89"),
 ...group(["pdf-redact"],"pdf-redaction-output-v89"),
 ...group(["temp-mail","video-watermark-remover","image-translator"],"tool-user-journeys-v1"),
 ...group(["audio-cleanup","pdf-to-word"],"paid-local-output-v89"),
 ...group(["subtitle-translate"],"subtitle-translation-v95")
]);
for(const [slug,file] of current){
 if(!slugs.includes(slug))throw Error("SCENARIO_NOT_PUBLIC_TOOL:"+slug);
 if(!read(file).includes(slug))throw Error("SCENARIO_EVIDENCE_FILE_MISSING_NAME:"+slug+":"+file);
}
// Only names still in the actual 124-slug public catalog count.
const historical=new Map([
 ["remove-exif","Historical real-file sample: 2026-11-01"],
 ["rotate-video","Historical real-file sample: 2026-11-01"]
]);
const rows=[["slug","evidence_status","committed_test_or_historical_sample","unproven_scope"]];
for(const slug of slugs){
 const test=current.get(slug),old=historical.get(slug);
 const status=test?"AUTOMATED_REAL_OPERATION_SCENARIO_REGISTERED":old?"HISTORICAL_SAMPLE_ONLY":"FULL_E2E_NOT_PROVEN";
 const missing=test?"Current CI run result, physical devices, production URL, every control, permissions/payments":
  old?"Current per-control browser checks, mobile, production, export/permissions":
  "Actual input, all controls, correct output bytes, mobile, production and authorization";
 rows.push([slug,status,test||old||"",missing]);
}
const out=path.join(root,"test-results","tool-real-operation-coverage-v125.csv");
fs.mkdirSync(path.dirname(out),{recursive:true});
const quote=s=>'"'+String(s).replace(/"/g,'""')+'"';
fs.writeFileSync(out,rows.map(row=>row.map(quote).join(",")).join("\n")+"\n");
const counts={catalog:slugs.length,automatedScenarioRegistered:current.size,historicalOnly:slugs.filter(s=>!current.has(s)&&historical.has(s)).length,notFullyProven:slugs.filter(s=>!current.has(s)&&!historical.has(s)).length};
console.log("TOOL_CATALOG_TOTAL="+counts.catalog);
console.log("AUTOMATED_SCENARIO_REGISTERED_NOT_YET_PASSED="+counts.automatedScenarioRegistered);
console.log("HISTORICAL_ONLY="+counts.historicalOnly);
console.log("NO_FULL_E2E_EVIDENCE="+counts.notFullyProven);
console.log("V125_COVERAGE_CSV="+out);
console.log("CI_SUCCESS_AND_PRODUCTION_TEST_REQUIRED_SEPARATELY");
