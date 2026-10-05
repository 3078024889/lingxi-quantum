import fs from"node:fs";
function must(v,m){if(!v)throw new Error(m)}
const paid=fs.readFileSync("lib/tools/paid-catalog.ts","utf8");
const ids=[...paid.matchAll(/"([a-z0-9-]+)"/g)].map(m=>m[1]);
const strategy=JSON.parse(fs.readFileSync("lib/tools/commerce/paid-recovery-strategy.json","utf8")).strategies;

const missing=ids.filter(id=>!strategy[id]);
const orphan=Object.keys(strategy).filter(id=>!ids.includes(id));
if(missing.length)throw new Error("PAID_RECOVERY_STRATEGY_MISSING_ALL:"+missing.join(","));
if(orphan.length)throw new Error("PAID_RECOVERY_STRATEGY_ORPHAN_ALL:"+orphan.join(","));

const allowed=new Set(["persistent-draft","retain-tab","server-job"]);
const invalid=Object.entries(strategy).filter(([,kind])=>!allowed.has(kind));
if(invalid.length)throw new Error("INVALID_RECOVERY_STRATEGIES:"+invalid.map(([id,kind])=>`${id}:${kind}`).join(","));

const action=fs.readFileSync("components/tools/PaidActionButton.tsx","utf8");
must(action.includes('window.open(payUrl'),"PAID_ACTION_POPUP_FIRST_MISSING");
must(action.includes('if(draftId){location.assign(payUrl);return}'),"PAID_ACTION_DRAFT_FALLBACK_MISSING");
must(action.includes("popupBlocked"),"PAID_ACTION_STATE_LOSS_GUARD_MISSING");
must(action.includes("resumeQuote"),"PAID_ACTION_QUOTE_RESUME_MISSING");

const exp=fs.readFileSync("components/tools/PaidExportButton.tsx","utf8");
must(exp.includes('window.open(payUrl'),"PAID_EXPORT_POPUP_FIRST_MISSING");
must(exp.indexOf("await onUnlocked()")<exp.indexOf('fetch("/api/tools/export/consume"'),"PAID_EXPORT_CONSUMED_BEFORE_RESULT");

const draft=fs.readFileSync("lib/tools/workspace/paid-task-draft.ts","utf8");
must(draft.includes("files?:DraftFile[]"),"MULTI_FILE_DRAFT_MISSING");
must(draft.includes("7*24*60*60*1000"),"DRAFT_TTL_DRIFT");

const required=[
 ["components/tools/TranscriptionWorkbench.tsx","draftId={draftId}"],
 ["components/tools/SubtitleTranslateWorkbench.tsx","draftId={draftId}"],
 ["components/tools/ImageWatermarkWorkbench.tsx","draftId={draftId}"],
 ["components/tools/VideoDubbingWorkbench.tsx","draftId={draftId}"],
 ["components/tools/ImageTranslatorWorkbench.tsx","draftId={draftId}"],
 ["components/tools/IdPhotoAiWorkbench.tsx",'toolId="id-photo-ai"'],
 ["components/tools/PdfEditorWorkbench.tsx","draftId={draftId}"],
];
for(const[p,needle]of required)must(fs.readFileSync(p,"utf8").includes(needle),`PAID_DRAFT_BINDING_MISSING:${p}`);

console.log(`PUBLIC_PAID_TOOL_IDS=${ids.length}`);
console.log("ALL_PUBLIC_PAID_TOOLS_HAVE_RECOVERY_STRATEGY=PASS");
console.log("PAID_ACTION_POPUP_FIRST=PASS");
console.log("PAID_ACTION_NO_UNSAFE_SAME_TAB=PASS");
console.log("PAID_EXPORT_RESULT_BEFORE_CONSUME=PASS");
console.log("PAID_MULTI_FILE_DRAFTS=PASS");
console.log("ALL_PAID_TASK_RECOVERY_AUDIT=PASS");
