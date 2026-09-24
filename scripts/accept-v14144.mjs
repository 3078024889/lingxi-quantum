import fs from "node:fs";

const read=(p)=>fs.readFileSync(p,"utf8");
const assert=(ok,label)=>{
  if(!ok)throw new Error(`FAIL ${label}`);
  console.log(`PASS ${label}`);
};

const registry=read("lib/tools/registry.ts");
for(const slug of ["heic-to-jpg","qr-code-reader","merge-pdf","split-pdf","image-to-pdf","pdf-to-jpg"]){
  const hit=registry.match(new RegExp(`slug: "${slug}"[\\s\\S]{0,350}?status: "live"`));
  assert(Boolean(hit),`${slug} live`);
}
const hasV14154=fs.existsSync("scripts/accept-v14154.mjs");
if(hasV14154){
  assert(registry.match(/slug: "compress-pdf"[\s\S]{0,400}?status: "live"/),"PDF compression upgraded to live by V14.10.54");
}else{
  assert(registry.match(/slug: "compress-pdf"[\s\S]{0,250}?status: "planned"/),"PDF compression remains honest/planned");
}

const helper=read("lib/tools/shared/practical-doc-tools.ts");
for(const fn of ["heicToJpgFiles","readQrCode","mergePdfFiles","splitPdfFile","imagesToPdf","pdfToJpgFiles"]){
  assert(helper.includes(`function ${fn}`)||helper.includes(`function ${fn}`.replace("function ","async function ")),`${fn} implemented`);
}
assert(helper.includes('import("pdf-lib")'),"pdf-lib used locally");
assert(helper.includes('import("jspdf")'),"jsPDF used locally");
assert(helper.includes('import("heic2any")'),"heic2any used locally");
assert(helper.includes('import("jsqr")'),"jsQR used locally");
assert(helper.includes("renderPdfPage"),"pdfjs rendering reused");

const wb=read("components/tools/ToolWorkbench.tsx");
for(const slug of ["heic-to-jpg","qr-code-reader","merge-pdf","split-pdf","image-to-pdf","pdf-to-jpg"]){
  assert(wb.includes(`tool.slug === "${slug}"`),`${slug} runtime`);
}

console.log("V14.10.44 ACCEPTANCE=PASS");
