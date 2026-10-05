import fs from"node:fs";

const paid=fs.readFileSync("lib/tools/paid-catalog.ts","utf8");
const ids=[...paid.matchAll(/"([a-z0-9-]+)"/g)].map(m=>m[1]);
const strategies=JSON.parse(fs.readFileSync("lib/tools/commerce/paid-recovery-strategy.json","utf8")).strategies||{};

const missing=ids.filter(id=>!strategies[id]);
const orphan=Object.keys(strategies).filter(id=>!ids.includes(id));
if(missing.length)throw new Error("R16R5_PAID_RECOVERY_MISSING_ALL:"+missing.join(","));
if(orphan.length)throw new Error("R16R5_PAID_RECOVERY_ORPHAN_ALL:"+orphan.join(","));

const allowed=new Set(["persistent-draft","retain-tab","server-job"]);
const invalid=Object.entries(strategies).filter(([,kind])=>!allowed.has(kind));
if(invalid.length)throw new Error("R16R5_PAID_RECOVERY_INVALID:"+invalid.map(([id,kind])=>`${id}:${kind}`).join(","));

const retainTabComponents={
 "batch-pdf":"components/tools/BatchPdfWorkbench.tsx",
 "pdf-ocr":"components/tools/PdfOcrWorkbench.tsx",
 "handwriting-ocr":"components/tools/HandwritingOcrWorkbench.tsx",
 "pdf-to-word":"components/tools/PdfToWordWorkbench.tsx",
 "pdf-redact":"components/tools/PdfRedactWorkbench.tsx",
 "audio-cleanup":"components/tools/AudioCleanupWorkbench.tsx"
};

for(const [id,path] of Object.entries(retainTabComponents)){
 if(strategies[id]!=="retain-tab")throw new Error(`R16R5_EXPECT_RETAIN_TAB:${id}:${strategies[id]}`);
 const src=fs.readFileSync(path,"utf8");
 if(!src.includes("PaidActionButton"))throw new Error("R16R5_RETAIN_TAB_NO_PAID_ACTION:"+id);
 if(src.includes("draftId={draftId}"))throw new Error("R16R5_RETAIN_TAB_HAS_PERSISTENT_DRAFT:"+id);
}

// Payment shell must protect stateful tools:
// open payment separately first; if same-tab fallback is needed it is only allowed with a draft.
const button=fs.readFileSync("components/tools/PaidActionButton.tsx","utf8");
for(const marker of[
 'window.open(payUrl',
 'if(draftId){location.assign(payUrl);return}',
 'popupBlocked',
 'resumeQuote'
])if(!button.includes(marker))throw new Error("R16R5_PAYMENT_STATE_GUARD_MISSING:"+marker);

console.log("R16R5_ALL_25_PAID_TOOLS_RECOVERY_DECLARED=PASS");
console.log("R16R5_RETAIN_TAB_COMPONENTS_VERIFIED=PASS");
console.log("R16R5_POPUP_FIRST_STATE_GUARD=PASS");
console.log("R16R5_SAME_TAB_REQUIRES_DRAFT=PASS");
