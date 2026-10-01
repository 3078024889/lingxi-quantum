import fs from "node:fs";
import path from "node:path";
import {spawnSync} from "node:child_process";

const root=process.cwd();

const commands=[
 ["node",["scripts/audit/audit-script-syntax.mjs"]],
 ["node",["scripts/audit/retired-code-cleanup.mjs"]],
 ["node",["scripts/audit/platform-stability.mjs"]],
 ["node",["scripts/audit/capability-genome.mjs"]],
 ["node",["scripts/audit/tool-registry.mjs"]],
 ["node",["scripts/audit/support-lifecycle.mjs"]],
 ["node",["scripts/audit/continuous-tools.mjs"]],
 ["node",["scripts/audit/media-production.mjs"]],
 ["node",["scripts/audit/global-commerce.mjs"]],
 ["node",["scripts/audit/document-format-capability.mjs"]],
 ["node",["scripts/audit/all-paid-task-recovery.mjs"]],
 ["node",["scripts/final-closure/audit.mjs"]],
 ["node",["scripts/final-closure/graduation.mjs"]],
];

for(const [cmd,args] of commands){
 const label=[cmd,...args].join(" ");
 console.log(`CI_GATE_RUN=${label}`);
 const r=spawnSync(cmd,args,{stdio:"inherit",cwd:root,shell:false});
 if(r.status!==0)throw new Error(`CI_GATE_FAILED:${label}`);
}

const required=[
 "app",
 "components",
 "lib",
 "tests/final-closure",
 "playwright.final.config.ts",
 "playwright.production.config.ts",
 "pnpm-lock.yaml",
];
for(const rel of required){
 if(!fs.existsSync(path.join(root,rel)))throw new Error(`CI_REQUIRED_PATH_MISSING:${rel}`);
}

console.log("LINGXIFIELD_CLEAN_SOURCE_GATE=PASS");
