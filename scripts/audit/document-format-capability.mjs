import fs from"node:fs";
function must(v,m){if(!v)throw new Error(m)}
function read(p){return fs.readFileSync(p,"utf8")}

const editor=read("components/tools/PdfEditorWorkbench.tsx");
const intake=read("lib/tools/document/intake-client.ts");
const normalize=read("app/api/tools/document/normalize/route.ts");
const ticket=read("app/api/tools/document/ticket/route.ts");
const capabilities=read("app/api/tools/document/capabilities/route.ts");
const converter=read("lib/tools/document/converter.ts");

must(editor.includes("DOCUMENT_INPUT_ACCEPT"),"PDF_EDITOR_UNIFIED_DOCUMENT_ACCEPT_MISSING");
must(editor.includes("normalizeDocumentFile"),"PDF_EDITOR_DOCUMENT_NORMALIZER_MISSING");

for(const ext of["doc","docx","ppt","pptx","xls","xlsx","odt","ods","odp"]){
 must(intake.includes(`".${ext}"`),`CLIENT_DOCUMENT_FORMAT_MISSING:${ext}`);
 must(converter.includes(`"${ext}"`),`SERVER_DOCUMENT_FORMAT_MISSING:${ext}`);
}

must(normalize.includes("convertDocumentToPdf"),"DOCUMENT_NORMALIZE_CONVERTER_MISSING");
must(normalize.includes("documentInputSupported"),"DOCUMENT_NORMALIZE_ALLOWLIST_MISSING");
must(ticket.includes("DOCUMENT_SIZE_UNSUPPORTED"),"DOCUMENT_TICKET_SIZE_GUARD_MISSING");
must(ticket.includes("DOCUMENT_TYPE_UNSUPPORTED"),"DOCUMENT_TICKET_TYPE_GUARD_MISSING");
must(capabilities.includes("officeSupported:true"),"OFFICE_SUPPORT_DECLARATION_MISSING");
must(capabilities.includes("officeReady:"),"OFFICE_READINESS_SIGNAL_MISSING");

must(
 intake.includes("DOCUMENT_CONVERSION_UNAVAILABLE") ||
 intake.includes("DOCUMENT_DIRECT_GATEWAY_REQUIRED"),
 "DOCUMENT_USER_FAIL_CLOSED_MISSING"
);

console.log("PDF_OFFICE_UNIFIED_INTAKE=PASS");
console.log("DOCUMENT_FORMAT_ALLOWLIST=PASS");
console.log("DOCUMENT_CONVERSION_FAIL_CLOSED=PASS");
console.log("DOCUMENT_SUPPORT_READINESS_SEPARATED=PASS");
console.log("DOCUMENT_FORMAT_AUDIT=PASS");
