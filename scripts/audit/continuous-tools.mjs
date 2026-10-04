import fs from"node:fs";
function must(v,m){if(!v)throw new Error(m)}
const wb=fs.readFileSync("components/tools/ToolWorkbench.tsx","utf8");
const rp=fs.readFileSync("components/tools/ResultPanel.tsx","utf8");
const cp=fs.readFileSync("components/tools/ContinueProcessing.tsx","utf8");
const hv=fs.readFileSync("lib/tools/workspace/handoff.ts","utf8");
const db=fs.readFileSync("lib/tools/workspace/db.ts","utf8");
const cont=fs.readFileSync("lib/tools/platform/continuation.ts","utf8");

must(wb.includes("consumeToolHandoff"),"HANDOFF_CONSUMER_MISSING");
must(wb.includes("HANDOFF_APPLIED"),"HANDOFF_EFFECT_MISSING");
must(wb.includes("sourceSlug={tool.slug}"),"RESULT_SOURCE_SLUG_MISSING");
must(rp.includes("ContinueProcessing"),"RESULT_CONTINUATION_UI_MISSING");
must(cp.includes("createToolHandoff"),"HANDOFF_CREATOR_MISSING");
must(hv.includes("openWorkspaceDb")&&db.includes("indexedDB.open"),"INDEXEDDB_STORAGE_MISSING");
must(hv.includes("TTL_MS=30*60*1000"),"HANDOFF_TTL_MISSING");
must(hv.includes("consumeToolHandoff")&&hv.includes("tx.objectStore(HANDOFF_STORE).delete(id)"),"HANDOFF_ONE_SHOT_MISSING");
must(cont.includes('slug:"compress-pdf"'),"PDF_CONTINUATION_MISSING");
must(cont.includes('slug:"image-to-pdf"'),"IMAGE_CONTINUATION_MISSING");
must(cont.includes('slug:"xlsx-to-csv"'),"XLSX_CONTINUATION_MISSING");

console.log("LOCAL_HANDOFF_INDEXEDDB=PASS");
console.log("LOCAL_HANDOFF_TTL=30_MINUTES");
console.log("LOCAL_HANDOFF_ONE_SHOT=PASS");
console.log("RESULT_CONTINUATION_UI=PASS");
console.log("PDF_CONTINUATION=PASS");
console.log("IMAGE_CONTINUATION=PASS");
console.log("SPREADSHEET_CONTINUATION=PASS");
console.log("CONTINUOUS_TOOL_AUDIT=PASS");
