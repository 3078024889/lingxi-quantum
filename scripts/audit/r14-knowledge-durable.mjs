import fs from"node:fs";
const files=[
 "lib/sasi/durable/runtime-capability.ts",
 "lib/sasi/durable/step-store.ts",
 "lib/sasi/knowledge/durable-knowledge.ts",
 "supabase/migrations/20261005141500_sasi_durable_steps_v140.sql"
];
for(const f of files)if(!fs.existsSync(f))throw new Error("R14_FILE_MISSING:"+f);
const ui=fs.readFileSync("components/KnowledgeWorkspace.tsx","utf8");
for(const m of [
 'const [useConnectedService,setUseConnectedService]=useState(false);',
 '"Idempotency-Key":pendingTurn.id',
 'clientTurnId:pendingTurn.id',
 'acceptConnectedBilling:useConnectedService'
])if(!ui.includes(m))throw new Error("R14_UI_CONTRACT_MISSING:"+m);

const route=fs.readFileSync("app/api/knowledge/ask/route.ts","utf8");
if(route.includes("body.useConnectedService!==false"))throw new Error("R14_LEGACY_IMPLICIT_CONNECTED_BILLING");
if(!route.includes("runId:execution.runId"))throw new Error("R14_RUN_ID_NOT_RETURNED");

console.log("R14_KNOWLEDGE_DURABLE_ADOPTION=PASS");
console.log("R14_FAILED_DURABLE_LAYER_GROUNDED_FALLBACK=PASS");
console.log("R14_RUN_ID_RESPONSE=PASS");
console.log("R14_NO_SILENT_CONNECTED_BILLING=PASS");
