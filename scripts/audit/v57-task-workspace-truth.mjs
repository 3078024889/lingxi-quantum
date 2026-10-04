import fs from"node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const bad=[];
const req=(p,tests)=>{if(!fs.existsSync(p)){bad.push(`missing ${p}`);return""}const s=read(p);for(const [name,test]of tests)if(!test(s))bad.push(`${p}:${name}`);return s};

const gate=req("scripts/ci/production-gate.mjs",[["AUDIT_MANIFEST_REGISTERED",s=>s.includes("scripts/ci/audit-manifest.mjs")]]);
const manifest=req("scripts/ci/audit-manifest.mjs",[["V54_REGISTERED",s=>s.includes("v54-sasi-session-result-core.mjs")],["V55_REGISTERED",s=>s.includes("v55-convergence.mjs")],["V56_REGISTERED",s=>s.includes("v56-tool-continuity.mjs")],["V57_REGISTERED",s=>s.includes("v57-task-workspace-truth.mjs")]]);
req("scripts/audit/v56-tool-continuity.mjs",[["COPY_AGNOSTIC",s=>!s.includes("RECENT_TITLE")&&s.includes("V56_CAPABILITY_AUDIT_COPY_AGNOSTIC")],["CAPABILITY_RECENT_SURFACE",s=>s.includes("RecentToolActivity")&&s.includes("readRecentToolActivity")]]);
req("lib/tasks/task-contract.ts",[["SHARED_STATES",s=>s.includes("LINGXI_TASK_STATES")&&s.includes('"waiting"')&&s.includes('"expired"')],["ARTIFACT",s=>s.includes("LingxiArtifact")],["RECOVERY",s=>s.includes("LingxiRecoveryState")]]);
req("lib/sasi/core/execution-lifecycle.ts",[["USES_SHARED_TASK_CONTRACT",s=>s.includes("phaseFromLingxiTaskState")&&s.includes("LingxiTaskState")]]);
req("lib/sasi-kernel/runtime/lifecycle.ts",[["USES_SHARED_TASK_TYPE",s=>s.includes("LingxiTaskState")&&s.includes("Extract<")]]);
req("lib/tools/workspace/db.ts",[["SINGLE_DB_VERSION",s=>s.includes("WORKSPACE_DB_VERSION=2")],["HANDOFF_STORE",s=>s.includes('HANDOFF_STORE="handoffs"')],["RESULT_STORE",s=>s.includes('RESULT_STORE="results"')]]);
req("lib/tools/workspace/handoff.ts",[["SHARED_DB",s=>s.includes("openWorkspaceDb")&&!s.includes("indexedDB.open")],["ONE_SHOT",s=>s.includes("HANDOFF_STORE")&&s.includes("delete(id)")]]);
req("lib/tools/workspace/recoverable-results.ts",[["INDEXEDDB_RESULTS",s=>s.includes("RESULT_STORE")&&s.includes("saveRecoverableResult")&&s.includes("loadRecoverableResult")],["TTL",s=>s.includes("7*24*60*60*1000")],["CAPACITY_GUARD",s=>s.includes("navigator.storage")&&s.includes("MAX_RESULT_BYTES")]]);
req("lib/tools/workspace/recent-tools.ts",[["METADATA_INDEX",s=>s.includes("localStorage")&&s.includes("workspaceId")],["PERSIST_RESULT_ASYNC",s=>s.includes("saveRecoverableResult")],["NO_BLOB_SERIALIZATION",s=>!s.includes("JSON.stringify(files)")]]);
req("components/tools/RecentTools.tsx",[["RECOVERY_LOAD",s=>s.includes("loadRecoverableResult")],["CONTINUATION",s=>s.includes("continueTargets")&&s.includes("createToolHandoff")],["NINE_LANGUAGE_TIME",s=>s.includes("Intl.RelativeTimeFormat")]]);
req("lib/tasks/smart-execution.ts",[["LOCAL_FIRST_POLICY",s=>s.includes("browserEligible")&&s.includes('lanes.push("browser")')],["NO_DEPENDENCY",s=>!s.includes("from\"")&&!s.includes("from \"")]]);
req("lib/tools/engine/resource-governor.ts",[["SMART_POLICY_CONNECTED",s=>s.includes("rankExecutionLanes")]]);
if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log("V57_AUDIT_TRUTH=PASS");
console.log("V57_UNIFIED_TASK_CONTRACT=PASS");
console.log("V57_RECOVERABLE_WORKSPACE=PASS");
console.log("V57_SMART_EXECUTION_POLICY=PASS");
