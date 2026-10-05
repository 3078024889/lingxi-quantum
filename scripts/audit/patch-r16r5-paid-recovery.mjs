import fs from"node:fs";

const paidPath="lib/tools/paid-catalog.ts";
const strategyPath="lib/tools/commerce/paid-recovery-strategy.json";

const paid=fs.readFileSync(paidPath,"utf8");
const ids=[...paid.matchAll(/"([a-z0-9-]+)"/g)].map(m=>m[1]);
const doc=JSON.parse(fs.readFileSync(strategyPath,"utf8"));
doc.strategies ||= {};

const additions={
 "batch-pdf":"retain-tab",
 "pdf-ocr":"retain-tab",
 "handwriting-ocr":"retain-tab",
 "pdf-to-word":"retain-tab",
 "pdf-redact":"retain-tab",
 "audio-cleanup":"retain-tab"
};

for(const [id,kind] of Object.entries(additions)){
 if(!ids.includes(id))throw new Error("R16R5_PAID_TOOL_NOT_PUBLIC:"+id);
 if(!doc.strategies[id]){
  doc.strategies[id]=kind;
  console.log(`R16R5_RECOVERY_STRATEGY_ADDED=${id}:${kind}`);
 }
}

const missing=ids.filter(id=>!doc.strategies[id]);
const orphan=Object.keys(doc.strategies).filter(id=>!ids.includes(id));
if(missing.length)throw new Error("R16R5_RECOVERY_STILL_MISSING:"+missing.join(","));
if(orphan.length)throw new Error("R16R5_RECOVERY_ORPHAN:"+orphan.join(","));

doc.version=Math.max(2,Number(doc.version||1));
doc.rule="Every public paid tool must declare a recovery strategy. retain-tab is allowed only for local/browser work that remains intact while payment opens in a separate window; stateful same-tab navigation still requires a persistent draft.";
doc.strategies=Object.fromEntries(Object.entries(doc.strategies).sort(([a],[b])=>a.localeCompare(b)));

fs.writeFileSync(strategyPath,JSON.stringify(doc,null,2)+"\n","utf8");

console.log("R16R5_PUBLIC_PAID_TOOL_COUNT="+ids.length);
console.log("R16R5_RECOVERY_STRATEGY_COUNT="+Object.keys(doc.strategies).length);
console.log("R16R5_PAID_RECOVERY_PARITY=PASS");
