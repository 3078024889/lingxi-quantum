import fs from"node:fs";
function must(v,m){if(!v)throw new Error(m)}
function count(s,needle){return s.split(needle).length-1}

const p="components/tools/PdfEditorWorkbench.tsx";
const s=fs.readFileSync(p,"utf8");

must(count(s,'[draftId,setDraftId]=useState("")')===1,
 `PDF_DRAFT_STATE_DECL:${count(s,'[draftId,setDraftId]=useState("")')}`);
must(count(s,'[officeReady,setOfficeReady]=useState(false)')===1,
 `PDF_OFFICE_STATE_DECL:${count(s,'[officeReady,setOfficeReady]=useState(false)')}`);
must(count(s,'[officeFormats,setOfficeFormats]=useState<string[]>(["pdf"])')===1,
 `PDF_FORMAT_STATE_DECL:${count(s,'[officeFormats,setOfficeFormats]=useState<string[]>(["pdf"])')}`);

const draftCreateMatches=[
 ...s.matchAll(/const\s+id\s*=\s*newPaidTaskDraftId\(\);\s*setDraftId\(id\);/g)
];
must(draftCreateMatches.length>=1,"PDF_DRAFT_CREATE_MISSING");

// No adjacent/repeated draft creation block may exist.
must(!/const\s+id\s*=\s*newPaidTaskDraftId\(\);\s*setDraftId\(id\);\s*const\s+id\s*=\s*newPaidTaskDraftId\(\);/s.test(s),
 "PDF_ADJACENT_DRAFT_CREATE_DUPLICATE");

// No duplicate let/const declarations in the exact same compressed statement region introduced by our patches.
must(!/const\s+id\s*=\s*newPaidTaskDraftId\(\);[\s\S]{0,80}const\s+id\s*=\s*newPaidTaskDraftId\(\);/s.test(s),
 "PDF_NEARBY_DRAFT_ID_REDECLARATION");

// Historical injected hooks should each exist once.
must(count(s,"PDF_EDITOR_DRAFT_V22")===1,`PDF_EDITOR_DRAFT_HOOK_COUNT:${count(s,"PDF_EDITOR_DRAFT_V22")}`);
must(count(s,'"/api/tools/document/capabilities"')===1,
 `PDF_DOCUMENT_CAPABILITY_FETCH_COUNT:${count(s,'"/api/tools/document/capabilities"')}`);

const consume=fs.readFileSync("app/api/tools/export/consume/route.ts","utf8");
must(count(consume,'const {data:q}=await admin.from("tool_payment_quotes")')===1,
 "EXPORT_CONSUME_QUOTE_QUERY_NOT_UNIQUE");
must(count(consume,"TASK_DRAFT_MISMATCH")===1,
 "EXPORT_CONSUME_DRAFT_GUARD_NOT_UNIQUE");

console.log(`PDF_DRAFT_CREATE_BLOCKS=${draftCreateMatches.length}`);
console.log("PDF_ADJACENT_DRAFT_CREATE_DUPLICATES=0");
console.log("PDF_DRAFT_STATE_DECLARATIONS=1");
console.log("PDF_OFFICE_CAPABILITY_FETCHES=1");
console.log("EXPORT_CONSUME_QUOTE_QUERY=1");
console.log("V25_PDF_CANONICAL_AUDIT=PASS");
