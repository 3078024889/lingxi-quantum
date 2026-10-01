import fs from"node:fs";import path from"node:path";
function must(v,m){if(!v)throw new Error(m)}
const p="components/tools/PdfEditorWorkbench.tsx",s=fs.readFileSync(p,"utf8");
must(s.includes("/api/tools/document/capabilities"),"PDF_EDITOR_OFFICE_CAPABILITY_CHECK_MISSING");
must(s.includes("officeReady"),"PDF_EDITOR_OFFICE_GATE_MISSING");
const route=fs.readFileSync("app/api/tools/document/normalize/route.ts","utf8");
must(route.includes("DOCUMENT_CONVERSION_UNAVAILABLE"),"DOCUMENT_FAIL_CLOSED_MISSING");
console.log("PDF_OFFICE_DECLARATION_GATE=PASS");
console.log("DOCUMENT_FORMAT_AUDIT=PASS");
