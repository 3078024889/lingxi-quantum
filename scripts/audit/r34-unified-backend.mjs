import fs from"node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const checks=[];
function need(name,pass){checks.push([name,Boolean(pass)])}
const catalog=read("lib/capabilities/unified-catalog.ts");
const api=read("app/api/sasi/capabilities/route.ts");
const outcome=read("lib/tasks/outcome-contract.ts");
const toolGate=read("lib/tools/engine/quality-gate.ts");
const sasiGate=read("lib/sasi/durable/outcome-verifier.ts");
const v57=read("scripts/audit/v57-task-workspace-truth.mjs");
need("R34_UNIFIED_TOOL_SKILL_CATALOG",catalog.includes("LINGXIFIELD_PUBLIC_TOOL_REGISTRY")&&catalog.includes("SASI_SKILLS")&&catalog.includes("findUnifiedCapabilities"));
need("R34_CAPABILITY_API",api.includes("findUnifiedCapabilities")&&api.includes("assertUnifiedCapabilityCatalog"));
need("R34_SHARED_OUTCOME_KERNEL",outcome.includes("verifyUnifiedOutcome")&&toolGate.includes("verifyUnifiedOutcome")&&sasiGate.includes("verifyUnifiedOutcome"));
need("R34_UNIFIED_EXECUTION_POLICY_AUDIT",v57.includes("chooseUnifiedExecution")&&v57.includes("unified-execution-policy.ts"));
let failed=false;for(const [name,pass]of checks){console.log(name+"="+(pass?"PASS":"FAIL"));if(!pass)failed=true}
if(failed)process.exit(1);
console.log("R34_UNIFIED_BACKEND=PASS");
