import fs from "node:fs";
const read=(p)=>fs.readFileSync(p,"utf8");
const assert=(ok,label)=>{if(!ok)throw new Error(`FAIL ${label}`);console.log(`PASS ${label}`)};

const registry=read("lib/tools/registry.ts");
assert(registry.match(/slug: "compress-pdf"[\s\S]{0,400}?status: "live"/),"compress-pdf live");
assert(registry.includes('slug: "pptx-to-txt"'),"pptx-to-txt registered");

const wb=read("components/tools/ToolWorkbench.tsx");
assert(wb.includes('tool.slug === "compress-pdf"'),"compress-pdf runtime");
assert(wb.includes('tool.slug === "pptx-to-txt"'),"pptx runtime");
assert(wb.includes("setPdfCompression"),"compression preset UI");
assert(wb.includes("moveFile"),"file reorder UI");
assert(wb.includes("清空"),"batch clear UI");

const drop=read("components/tools/FileDropzone.tsx");
assert(drop.includes("dedupeFiles"),"dropzone dedupe");
assert(drop.includes("重复文件已自动忽略"),"dedupe feedback");

const result=read("components/tools/ResultPanel.tsx");
assert(result.includes("filesToZip"),"ZIP all results");
assert(result.includes("下载全部 ZIP"),"ZIP CTA");

const pptx=read("lib/tools/shared/pptx-text.ts");
assert(pptx.includes("pptxToText"),"PPTX local parser");

const pdf=read("lib/tools/shared/pdf-rebuild-compress.ts");
assert(pdf.includes("rebuildCompressedPdf"),"PDF rebuild compressor");
assert(pdf.includes('small: { scale: 1.05, quality: 0.58 }'),"compression presets");

console.log("V14.10.54 ACCEPTANCE=PASS");
