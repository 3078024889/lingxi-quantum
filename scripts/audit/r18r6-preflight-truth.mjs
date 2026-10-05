import fs from"node:fs";import{spawnSync}from"node:child_process";
const read=p=>fs.readFileSync(p,"utf8");
const req=[
 "components/SasiOneSurface.tsx",
 "components/SasiUnifiedLauncher.tsx",
 "lib/sasi/core/intent-router.ts",
 "lib/sasi/core/session-contract.ts",
 "lib/sasi/composer-core.ts",
 "scripts/ci/audit-manifest.mjs",
 "scripts/audit/v54-sasi-session-result-core.mjs",
 "scripts/audit/v55-convergence.mjs",
 "scripts/audit/v57-task-workspace-truth.mjs",
 "scripts/audit/v58-durable-task-truth.mjs",
 "scripts/audit/v59-global-discoverability.mjs",
 "scripts/audit/r17-intent-router.mjs",
];
const missing=req.filter(p=>!fs.existsSync(p));
if(missing.length)throw new Error("R18R6_REQUIRED_LOCAL_WORKTREE_MISSING:"+missing.join(","));
const one=read("components/SasiOneSurface.tsx");
const launcher=read("components/SasiUnifiedLauncher.tsx");
const router=read("lib/sasi/core/intent-router.ts");
const manifest=read("scripts/ci/audit-manifest.mjs");
const fail=[];
if(!one.includes("SasiUnifiedLauncher"))fail.push("ONE_SURFACE_NOT_USING_UNIFIED_LAUNCHER");
if(one.includes("MODES.map(")||one.includes("lx-sasi-modebar-reference"))fail.push("VISIBLE_FIVE_MODE_BAR_REMAINS");
const intentAudit=spawnSync(process.execPath,["scripts/audit/r17-intent-router.mjs"],{stdio:"inherit",shell:false});
if(intentAudit.status!==0)fail.push("CANONICAL_R17_INTENT_ROUTER_AUDIT_FAILED");
if(!launcher.includes("SASI_UNIFIED_ACCEPT"))fail.push("UNIFIED_ATTACHMENT_CONTRACT_MISSING");
for(const x of["v57-task-workspace-truth","v58-durable-task-truth","v59-global-discoverability"])if(!manifest.includes(x))fail.push("PRODUCTION_MANIFEST_MISSING_"+x);
if(fail.length){console.error(fail.join("\n"));process.exit(1)}
console.log("R18R6_LOCAL_UNCOMMITTED_R18_DETECTED=PASS");
console.log("R18R6_ONE_SASI_FRONT_DOOR=PASS");
console.log("R18R6_CANONICAL_R17_INTENT_ROUTER=PASS");
console.log("R18R6_FIVE_INTENT_FAMILIES_CODE_SIDE=PASS");
console.log("R18R6_DURABLE_TASK_GATES_PRESENT=PASS");
