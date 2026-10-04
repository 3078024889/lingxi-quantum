import fs from"node:fs";
import{spawnSync}from"node:child_process";

export const PRODUCTION_CRITICAL_AUDITS=[
 "scripts/audit/v54-sasi-session-result-core.mjs",
 "scripts/audit/v54-r5-server-boundary.mjs",
 "scripts/audit/v54-r7-server-boundary-graph.mjs",
 "scripts/audit/v55-convergence.mjs",
 "scripts/audit/v55-legacy-runtime.mjs",
 "scripts/audit/v56-tool-continuity.mjs",
 "scripts/audit/v57-task-workspace-truth.mjs",
 "scripts/audit/v58-durable-task-truth.mjs",
];

for(const audit of PRODUCTION_CRITICAL_AUDITS){
 if(!fs.existsSync(audit))throw new Error(`AUDIT_MANIFEST_MISSING:${audit}`);
 const r=spawnSync(process.execPath,[audit],{stdio:"inherit",shell:false});
 if(r.status!==0)throw new Error(`AUDIT_MANIFEST_FAILED:${audit}`);
}
console.log(`PRODUCTION_AUDIT_MANIFEST=PASS:${PRODUCTION_CRITICAL_AUDITS.length}`);
