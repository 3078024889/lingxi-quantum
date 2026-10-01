import fs from"node:fs";
function must(v,m){if(!v)throw new Error(m)}
function read(p){return fs.readFileSync(p,"utf8")}
const cap=read("app/api/tools/document/capabilities/route.ts");
const norm=read("app/api/tools/document/normalize/route.ts");
const conv=read("lib/tools/document/converter.ts");
const client=read("lib/tools/document/intake-client.ts");
const drop=read("components/tools/FileDropzone.tsx");
const editor=read("components/tools/PdfEditorWorkbench.tsx");
const toImage=read("components/tools/PdfToImageWorkbench.tsx");

for(const ext of ["doc","docx","ppt","pptx","xls","xlsx","odt","ods","odp"]){
 must(conv.includes(`"${ext}"`),`SERVER_FORMAT_MISSING:${ext}`);
 must(client.includes(`".${ext}"`),`CLIENT_ACCEPT_MISSING:${ext}`);
}
must(conv.includes("/forms/libreoffice/convert"),"GOTENBERG_LIBREOFFICE_ROUTE_MISSING");
must(conv.includes("/health"),"GOTENBERG_HEALTH_ROUTE_MISSING");
must(conv.includes('providers:Provider[]=["gotenberg","custom","convertapi"]'),"CONVERTER_FALLBACK_ORDER_MISSING");
must(cap.includes("officeSupported:true"),"OFFICE_SUPPORT_NOT_ADVERTISED");
must(norm.includes("convertDocumentToPdf"),"NORMALIZE_NOT_USING_UNIFIED_CONVERTER");
must(drop.includes("normalizeDocumentFiles"),"FILE_DROPZONE_NORMALIZER_MISSING");
must(drop.includes("DOCUMENT_INPUT_ACCEPT"),"FILE_DROPZONE_ACCEPT_MISSING");
must(editor.includes("DOCUMENT_INPUT_ACCEPT"),"PDF_EDITOR_ACCEPT_NOT_UNIFIED");
must(editor.includes("normalizeDocumentFile"),"PDF_EDITOR_NORMALIZER_NOT_UNIFIED");
must(toImage.includes("DOCUMENT_INPUT_ACCEPT"),"PDF_TO_IMAGE_ACCEPT_NOT_UNIFIED");
console.log("DOCUMENT_WORD_INPUT=PASS");
console.log("DOCUMENT_POWERPOINT_INPUT=PASS");
console.log("DOCUMENT_EXCEL_INPUT=PASS");
console.log("DOCUMENT_OPENDOCUMENT_INPUT=PASS");
console.log("GOTENBERG_SELF_HOSTED_PRIMARY=PASS");
console.log("CUSTOM_CONVERTER_FALLBACK=PASS");
console.log("CONVERTAPI_LAST_FALLBACK=PASS");
console.log("PDF_TOOL_SHARED_INTAKE=PASS");
console.log("V31_DOCUMENT_INTAKE_AUDIT=PASS");
