import fs from"node:fs";
const required=[
"lib/sasi-kernel/graph/capability-graph.ts","lib/sasi-kernel/graph/task-plan.ts",
"lib/sasi/website-engine/site-spec.ts","lib/sasi/website-engine/publish-gate.ts"
];
for(const f of required)if(!fs.existsSync(f))throw new Error("V1_BASE_MISSING:"+f);
const optional=["lib/sasi-kernel/runtime/executor.ts","lib/sasi-kernel/runtime/plan.ts","app/api/sasi/kernel/tasks/route.ts"];
for(const f of optional)console.log(`${f}=${fs.existsSync(f)?"PRESENT":"ABSENT"}`);
if(fs.existsSync(optional[0])){const x=fs.readFileSync(optional[0],"utf8");console.log("EXISTING_NODE_DB_EXECUTOR="+(x.includes('sasi_task_nodes')&&x.includes('sasi_task_events')?"YES":"NO"))}
console.log("SASI_RUNTIME_LOCAL_BASELINE_AUDIT=PASS");
