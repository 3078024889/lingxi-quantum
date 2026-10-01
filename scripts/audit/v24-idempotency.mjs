import fs from"node:fs";
function must(v,m){if(!v)throw new Error(m)}
function count(s,needle){return s.split(needle).length-1}

const pdf=fs.readFileSync("components/tools/PdfEditorWorkbench.tsx","utf8");
const draftDecl='[draftId,setDraftId]=useState("")';
const officeDecl='[officeReady,setOfficeReady]=useState(false)';
const formatsDecl='[officeFormats,setOfficeFormats]=useState<string[]>(["pdf"])';
must(count(pdf,draftDecl)===1,`PDF_DRAFT_ID_DECLARATION_COUNT:${count(pdf,draftDecl)}`);
must(count(pdf,officeDecl)===1,`PDF_OFFICE_READY_DECLARATION_COUNT:${count(pdf,officeDecl)}`);
must(count(pdf,formatsDecl)===1,`PDF_OFFICE_FORMATS_DECLARATION_COUNT:${count(pdf,formatsDecl)}`);
must(count(pdf,'paid-task-draft";')===1,`PDF_PAID_TASK_IMPORT_COUNT:${count(pdf,'paid-task-draft";')}`);

const consume=fs.readFileSync("app/api/tools/export/consume/route.ts","utf8");
must(count(consume,'const {data:q}=await admin.from("tool_payment_quotes")')===1,
 `EXPORT_QUOTE_QUERY_COUNT:${count(consume,'const {data:q}=await admin.from("tool_payment_quotes")')}`);
must(count(consume,'TASK_DRAFT_MISMATCH')===1,`TASK_DRAFT_MISMATCH_COUNT:${count(consume,'TASK_DRAFT_MISMATCH')}`);
must(count(consume,'const {quoteId,draftId}=await req.json()')===1,
 `EXPORT_DRAFT_BODY_BINDING_COUNT:${count(consume,'const {quoteId,draftId}=await req.json()')}`);

const cap=fs.readFileSync("tests/final-closure/capability-genome.spec.ts","utf8");
const reg=fs.readFileSync("tests/final-closure/tool-registry.spec.ts","utf8");
must(!cap.includes("toHaveLength(64)"),"CAPABILITY_TEST_HARDCODED_64_RETURNED");
must(!reg.includes("toHaveLength(64)"),"REGISTRY_TEST_HARDCODED_64_RETURNED");

console.log("PDF_EDITOR_DUPLICATE_STATE_DECLARATIONS=0");
console.log("EXPORT_CONSUME_DUPLICATE_QUOTE_QUERY=0");
console.log("V22_HARDCODED_64_TESTS=0");
console.log("V24_PATCH_IDEMPOTENCY_AUDIT=PASS");
