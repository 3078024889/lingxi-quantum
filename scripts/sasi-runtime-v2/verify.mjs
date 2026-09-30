import fs from"node:fs";
const checks={
 ORCHESTRATOR:["lib/sasi-kernel/graph/runtime-orchestrator.ts",["Promise.all","node.retry","DEPENDENCY_FAILED","task.succeeded"]],
 PERSISTENCE:["lib/sasi-kernel/graph/persistence-adapter.ts",["depends_on","max_retries","event_index"]],
 INVARIANTS:["lib/sasi-kernel/graph/runtime-invariants.ts",["SUCCESS_WITH_UNFINISHED_NODE","PROGRESS_NOT_MONOTONIC"]],
 WEBSITE_ADAPTER:["lib/sasi/website-engine/graph-adapter.ts",["website.site-spec","website.package"]],
 WEBSITE_VALIDATION:["lib/sasi/website-engine/validation-suite.ts",["validateInternalLinks","publishGate"]]
};
for(const[n,[f,tokens]]of Object.entries(checks)){if(!fs.existsSync(f))throw new Error(n+"_MISSING");const x=fs.readFileSync(f,"utf8");for(const t of tokens)if(!x.includes(t))throw new Error(`${n}_TOKEN_MISSING:${t}`);console.log(`${n}=PASS`)}
console.log("SASI_RUNTIME_INTEGRATION_STATIC_GATE=PASS");
