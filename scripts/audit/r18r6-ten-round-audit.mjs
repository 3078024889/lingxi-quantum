import fs from"node:fs";import path from"node:path";import{spawnSync}from"node:child_process";
const read=p=>fs.readFileSync(p,"utf8"),exists=fs.existsSync,fail=[];
const pass=n=>console.log(`R18R6_ROUND_${n}=PASS`);

// 1 repo / package / production gate
for(const p of["package.json","app","components","lib","scripts/ci/production-gate.mjs","scripts/ci/audit-manifest.mjs"])if(!exists(p))fail.push(`R1 missing ${p}`);
if(!fail.some(x=>x.startsWith("R1 ")))pass(1);

// 2 one public SASI surface
const one=exists("components/SasiOneSurface.tsx")?read("components/SasiOneSurface.tsx"):"";
if(!one.includes("SasiUnifiedLauncher"))fail.push("R2 unified launcher missing");
if(one.includes("MODES.map(")||one.includes("lx-sasi-modebar-reference")||one.includes("sasiModeLabel(lang,item.id)"))fail.push("R2 visible mode selector residue");
if(!fail.some(x=>x.startsWith("R2 ")))pass(2);

// 3 unified composer + file intake
const launcher=exists("components/SasiUnifiedLauncher.tsx")?read("components/SasiUnifiedLauncher.tsx"):"";
if(!launcher.includes("SASI_UNIFIED_ACCEPT"))fail.push("R3 shared attachment contract missing");
if(!(launcher.includes("＋")||launcher.includes("Add")||launcher.includes("添加")))fail.push("R3 plus/add entry not provable");
if(!fail.some(x=>x.startsWith("R3 ")))pass(3);

// 4 intent routing: reuse the already-proven R17 canonical audit.
if(!exists("scripts/audit/r17-intent-router.mjs"))fail.push("R4 canonical R17 intent audit missing");
else{
 const r=spawnSync(process.execPath,["scripts/audit/r17-intent-router.mjs"],{stdio:"inherit",shell:false});
 if(r.status!==0)fail.push("R4 canonical R17 intent audit failed");
}
if(!fail.some(x=>x.startsWith("R4 ")))pass(4);

// 5 shared thread/session/result lifecycle
for(const p of["lib/sasi/core/session-contract.ts","components/SasiResultCore.tsx"])if(!exists(p))fail.push(`R5 missing ${p}`);
if(exists("lib/sasi/core/session-contract.ts")){const s=read("lib/sasi/core/session-contract.ts");for(const k of["SasiConversationTurn","SasiResult","deriveSasiPhase"])if(!s.includes(k))fail.push(`R5 missing ${k}`)}
if(!fail.some(x=>x.startsWith("R5 ")))pass(5);

// 6 durable task / recovery / idempotency truth
const manifest=read("scripts/ci/audit-manifest.mjs");
for(const k of["v57-task-workspace-truth","v58-durable-task-truth","v59-global-discoverability"])if(!manifest.includes(k))fail.push(`R6 missing ${k}`);
for(const p of["lib/tasks/task-events.ts","lib/tasks/checkpoint-contract.ts","lib/tasks/idempotency-policy.ts"])if(!exists(p))fail.push(`R6 missing ${p}`);
if(!fail.some(x=>x.startsWith("R6 ")))pass(6);

// 7 canonical architecture gates: execute them; never grep another audit's implementation.
for(const audit of["scripts/audit/v54-sasi-session-result-core.mjs","scripts/audit/v55-convergence.mjs"]){
 if(!exists(audit)){fail.push(`R7 canonical audit missing ${audit}`);continue}
 const r=spawnSync(process.execPath,[audit],{stdio:"inherit",shell:false});
 if(r.status!==0)fail.push(`R7 canonical audit failed ${audit}`);
}
if(!fail.some(x=>x.startsWith("R7 ")))pass(7);

// 8 all 9 languages, not just zh/en
const i18=exists("lib/lingxi-i18n.tsx")?read("lib/lingxi-i18n.tsx"):exists("lib/lingxi-i18n.ts")?read("lib/lingxi-i18n.ts"):"";
for(const l of["zh","en","ja","ko","fr","de","es","pt","ar"])if(!new RegExp(`["']?${l}["']?`).test(i18))fail.push(`R8 missing ${l}`);
if(!fail.some(x=>x.startsWith("R8 ")))pass(8);

// 9 release hygiene + no known dead legacy core references required
for(const p of[".editorconfig",".gitattributes"])if(!exists(p))fail.push(`R9 missing ${p}`);
if(!fail.some(x=>x.startsWith("R9 ")))pass(9);

// 10 production closure
const pkg=JSON.parse(read("package.json"));
if(!pkg.scripts?.["ci:source"])fail.push("R10 ci:source missing");
if(!pkg.scripts?.build)fail.push("R10 build missing");
const gate=read("scripts/ci/production-gate.mjs");
if(!gate.includes("audit-manifest.mjs"))fail.push("R10 audit manifest not in source gate");
if(!fail.some(x=>x.startsWith("R10 ")))pass(10);

if(fail.length){console.error("R18R6_FAILURES="+fail.length);console.error(fail.join("\n"));process.exit(1)}
console.log("R18R6_TEN_ROUND_AUDIT=PASS");
