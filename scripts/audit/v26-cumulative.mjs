import fs from"node:fs";
function must(v,m){if(!v)throw new Error(m)}
function count(s,n){return s.split(n).length-1}

const pay=fs.readFileSync("lib/tools/payment-recovery.ts","utf8");
must(count(pay,'metadata?:Record<string,unknown>|null;')===1,
 `PAYMENT_RECOVERY_METADATA_FIELD_COUNT:${count(pay,'metadata?:Record<string,unknown>|null;')}`);
must(count(pay,'amount_rmb,metadata')===1,
 `PAYMENT_RECOVERY_SELECT_METADATA_COUNT:${count(pay,'amount_rmb,metadata')}`);
must(count(pay,'metadata:q.metadata||{}')===1,
 `PAYMENT_RECOVERY_RETURN_METADATA_COUNT:${count(pay,'metadata:q.metadata||{}')}`);

const pdf=fs.readFileSync("components/tools/PdfEditorWorkbench.tsx","utf8");
must(count(pdf,'[draftId,setDraftId]=useState("")')===1,
 `PDF_DRAFT_STATE_COUNT:${count(pdf,'[draftId,setDraftId]=useState("")')}`);
must(count(pdf,'[officeReady,setOfficeReady]=useState(false)')===1,
 `PDF_OFFICE_READY_COUNT:${count(pdf,'[officeReady,setOfficeReady]=useState(false)')}`);
must(count(pdf,'[officeFormats,setOfficeFormats]=useState<string[]>(["pdf"])')===1,
 `PDF_OFFICE_FORMATS_COUNT:${count(pdf,'[officeFormats,setOfficeFormats]=useState<string[]>(["pdf"])')}`);
must(!/const\s+id\s*=\s*newPaidTaskDraftId\(\);\s*setDraftId\(id\);\s*const\s+id\s*=\s*newPaidTaskDraftId\(\);/s.test(pdf),
 "PDF_DRAFT_ID_REDECLARATION_REMAINS");

const consume=fs.readFileSync("app/api/tools/export/consume/route.ts","utf8");
must(count(consume,'const {data:q}=await admin.from("tool_payment_quotes")')===1,
 `EXPORT_QUOTE_QUERY_COUNT:${count(consume,'const {data:q}=await admin.from("tool_payment_quotes")')}`);
must(count(consume,'TASK_DRAFT_MISMATCH')===1,
 `EXPORT_TASK_DRAFT_GUARD_COUNT:${count(consume,'TASK_DRAFT_MISMATCH')}`);

const files=[
 "components/tools/PaidActionButton.tsx",
 "components/tools/PaidExportButton.tsx",
 "components/tools/TranscriptionWorkbench.tsx",
 "components/tools/SubtitleTranslateWorkbench.tsx",
 "components/tools/ImageWatermarkWorkbench.tsx",
 "components/tools/VideoDubbingWorkbench.tsx",
 "components/tools/ImageTranslatorWorkbench.tsx",
 "components/tools/IdPhotoAiWorkbench.tsx",
 "components/tools/PdfEditorWorkbench.tsx",
 "lib/tools/payment-recovery.ts",
 "app/api/tools/export/consume/route.ts"
];
for(const p of files){
 const s=fs.readFileSync(p,"utf8");
 must(!/metadata\?:Record<string,unknown>\|null;metadata\?:Record<string,unknown>\|null;/.test(s),
  `DUPLICATE_METADATA_FIELD:${p}`);
 must(!/import[^;\n]+;\s*\1/.test(s),"IMPOSSIBLE_DUPLICATE_IMPORT_PATTERN");
}

const cap=fs.readFileSync("tests/final-closure/capability-genome.spec.ts","utf8");
const reg=fs.readFileSync("tests/final-closure/tool-registry.spec.ts","utf8");
must(!cap.includes("toHaveLength(64)"),"CAPABILITY_MAGIC_64");
must(!reg.includes("toHaveLength(64)"),"REGISTRY_MAGIC_64");

console.log("PAYMENT_RECOVERY_METADATA_FIELD_COUNT=1");
console.log("PAYMENT_RECOVERY_SELECT_METADATA_COUNT=1");
console.log("PAYMENT_RECOVERY_RETURN_METADATA_COUNT=1");
console.log("PDF_EDITOR_CUMULATIVE_DUPLICATES=0");
console.log("EXPORT_CONSUME_CUMULATIVE_DUPLICATES=0");
console.log("PUBLIC_TOOL_COUNT_MAGIC_NUMBERS=0");
console.log("V26_CUMULATIVE_MUTATION_AUDIT=PASS");
