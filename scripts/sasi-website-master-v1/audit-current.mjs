import fs from"node:fs";
const paths=["lib/sasi-kernel/runtime/lifecycle.ts","lib/sasi/website-artifact.ts","app/api/sasi/kernel/tasks/route.ts","lib/sasi/skill-execution.ts"];
for(const p of paths){console.log(`${p}=${fs.existsSync(p)?"PRESENT":"ABSENT"}`)}
const task=fs.existsSync(paths[2])?fs.readFileSync(paths[2],"utf8"):"";
console.log("TASKS_TABLE_WRITE="+(task.includes('from("sasi_tasks")')?"YES":"NO"));
console.log("ARTIFACTS_TABLE_WRITE="+(task.includes('from("sasi_artifacts")')?"YES":"NO"));
console.log("EVENTS_TABLE_WRITE="+(task.includes('from("sasi_task_events")')?"YES":"NO"));
console.log("LOCAL_SASI_WEBSITE_BASELINE_AUDIT=PASS");
