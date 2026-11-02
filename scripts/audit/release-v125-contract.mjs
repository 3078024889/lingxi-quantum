#!/usr/bin/env node
// Release evidence contract, not a claim that CI or production succeeded.
import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const assert=(ok,reason)=>{if(!ok)throw new Error("RELEASE_V125_GATE:"+reason)};
const suites=[
 "tool-real-operations-v118","tool-image-file-e2e-v118","tool-office-roundtrip-v118",
 "tool-pdf-qr-e2e-v119","image-before-after-v120","pdf-page-organizer-v121",
 "pdf-precision-split-v122","pdf-editor-visual-quality-v116",
 "pdf-editor-save-reopen-v123","pdf-editor-text-find-v124",
 "tool-cross-workflow-v125","unverified-developer-real-v126","unverified-pdf-real-v126","unverified-images-real-v126","unverified-pdf-advanced-v126","unverified-longtail-documents-v126"
];
const wf=read(".github/workflows/tool-delivery-quota.yml");
const prod=read(".github/workflows/production-gate.yml");
assert(/pull_request:/.test(wf),"MISSING_PR_DELIVERY_GATE");
for(const suite of suites){
 const file="tests/final-closure/"+suite+".spec.ts";
 const src=read(file);
 assert(src.includes('test(')||src.includes('test("')||src.includes("test.describe("),"TEST_FILE_HAS_NO_TEST:"+suite);
 assert(wf.includes(suite),"TEST_NOT_IN_DELIVERY_WORKFLOW:"+suite);
}
assert(prod.includes("--project=desktop-chromium")&&prod.includes("--project=mobile-chromium"),"MISSING_FULL_DESKTOP_MOBILE_GATE");
assert(prod.includes("pnpm build"),"MISSING_PRODUCTION_BUILD_GATE");
const catalog=read("lib/seo/global-seo.ts");
const slugs=[...new Set([...catalog.matchAll(/[{]slug:"([^"]+)"/g)].map(m=>m[1]))];
assert(slugs.length>=100,"PUBLIC_TOOL_CATALOG_INCOMPLETE");
for(const slug of ["png-to-jpg","image-to-pdf","pdf-to-jpg","merge-pdf","split-pdf","pdf-editor","qr-code-reader"]){
 assert(slugs.includes(slug),"MISSING_PUBLIC_TOOL:"+slug);
}
const workbench=read("components/tools/ToolWorkbench.tsx");
assert(workbench.includes("ImageBeforeAfter")&&workbench.includes("PdfPageOrganizerWorkbench"),"SHARED_WORKBENCH_LOST_FEATURE");
assert(workbench.includes("pdfSplitCopy")&&workbench.includes("splitPdfFile(file,opts.pdfSplit)"),"PRECISION_SPLIT_LOST");
assert(workbench.includes('preserveSameNamedFiles={tool.slug === "file-compare"}'),"FILE_COMPARE_SAME_NAME_FIX_LOST");
assert(workbench.includes("const normalized = input.trim()"),"TIMESTAMP_EMPTY_INPUT_FIX_LOST");
const editor=read("components/tools/PdfEditorWorkbench.tsx");
assert(editor.includes("PdfTextFind")&&editor.includes("PaidExportButton"),"EDITOR_SEARCH_OR_PAYMENT_GATE_MISSING");
const paid=read("components/tools/PaidExportButton.tsx");
assert(paid.includes("requireCompletedDelivery")&&paid.includes("/api/tools/export/consume"),"PAID_EXPORT_PROOF_MISSING");
const arranger=read("components/tools/PdfPageOrganizerWorkbench.tsx");
assert(arranger.includes("copyPages")&&arranger.includes("ResultPanel"),"PAGE_ORGANIZER_EXPORT_MISSING");
const imagePdf=read("components/tools/ImageToPdfWorkbench.tsx");
assert(imagePdf.includes('pageSize==="fit"?{w:base.w+2*m,h:base.h+2*m}:base'),"FIT_MARGIN_FIX_MISSING");
assert(imagePdf.includes("setResult([])"),"STALE_IMAGE_PDF_RESULT_GUARD_MISSING");
const dict=read("lib/tools/pdf-split-copy.ts"),find=read("components/tools/PdfTextFind.tsx");
for(const key of ["zh","en","ja","ko","fr","de","es","pt","ar"]){
 assert(new RegExp("(^|\\n)\\s*"+key+":\\{").test(dict),"MISSING_SPLIT_LOCALE:"+key);
 assert(new RegExp("(^|\\n)\\s*"+key+":\\{").test(find),"MISSING_PDF_FIND_LOCALE:"+key);
}
const manifest={
 schema:"lingxifield-release-v125-contract/1",
 capturedAt:new Date().toISOString(),
 gitSha:process.env.GITHUB_SHA||"local-not-verified",
 publicCatalogTools:slugs.length,
 requiredRealBrowserSuites:suites,
 suiteCount:suites.length,
 codeContracts:"PASS",
 browserResults:"NOT_ASSERTED_BY_STATIC_CONTRACT",
 productionGate:"NOT_ASSERTED_BY_STATIC_CONTRACT",
 paymentGatewayLive:"NOT_ASSERTED",
 mainMerged:"NOT_ASSERTED",
 vercelProductionSha:"NOT_ASSERTED",
 knownLimitations:[
  "PDF visual overlays do not securely remove the original text.",
  "The complete tool catalog is not proven end to end by the listed suites.",
  "Vercel deployment, payment, SASI and vendor-claim backend require separate live acceptance."
 ]
};
const out=path.join(root,"test-results","release-v125-contract.json");
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,JSON.stringify(manifest,null,2)+"\n");
console.log("RELEASE_V125_STATIC_CONTRACT=PASS");
console.log("RELEASE_V125_CATALOG_TOOLS="+manifest.publicCatalogTools);
console.log("RELEASE_V125_BROWSER_SUITES_REGISTERED="+manifest.suiteCount);
console.log("RELEASE_V125_CI_AND_PRODUCTION_NOT_YET_PROVEN");
console.log("RELEASE_V125_MANIFEST="+out);
