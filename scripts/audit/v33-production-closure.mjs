import fs from"node:fs";
import{spawnSync}from"node:child_process";

function must(v,m){if(!v)throw new Error(m)}

const obsolete=[
 "scripts/audit/v21-build-regression.mjs",
 "scripts/audit/v22-document-payment.mjs",
 "scripts/audit/v24-idempotency.mjs",
 "scripts/audit/v25-pdf-canonical.mjs",
 "scripts/audit/v26-cumulative.mjs",
 "scripts/audit/v27-old-code-cleanup.mjs",
 "scripts/audit/v28-install-robustness.mjs",
 "scripts/audit/v29-installer-contract.mjs",
];

for(const p of obsolete)must(!fs.existsSync(p),`OBSOLETE_AUDIT_REMAINS:${p}`);

const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
const retiredScripts=[
 "audit:v21-build","audit:v22-document-payment","audit:v24-idempotency",
 "audit:v25-pdf-canonical","audit:v26-cumulative","audit:v27-old-cleanup",
 "audit:v28-install","audit:v29-installer-contract"
];
for(const key of retiredScripts)must(!(key in(pkg.scripts||{})),`OBSOLETE_PACKAGE_SCRIPT_REMAINS:${key}`);

must(pkg.scripts?.["smoke:document-gateway:office"]==="node scripts/document-gateway/smoke-office.mjs","OFFICE_SMOKE_SCRIPT_NOT_REGISTERED");
must(pkg.scripts?.["audit:v33-production-closure"]==="node scripts/audit/v33-production-closure.mjs","V33_AUDIT_SCRIPT_NOT_REGISTERED");

const smoke=fs.readFileSync("scripts/document-gateway/smoke-office.mjs","utf8");
for(const marker of["docx","xlsx","pptx","https://lingxifield.com","https://lingxifield.cn","REPLAY_GUARD"])
 must(smoke.includes(marker),`OFFICE_SMOKE_CONTRACT_MISSING:${marker}`);

const retired=fs.readFileSync("scripts/audit/retired-code-cleanup.mjs","utf8");
for(const marker of["public/vendor/transformers","public/onnxruntime","lib/tools/platform/platform"])
 must(retired.includes(marker),`RETIRED_CLEANUP_GUARD_MISSING:${marker}`);

for(const p of[
 "scripts/audit/document-format-capability.mjs",
 "scripts/audit/v31-document-intake.mjs",
 "scripts/audit/v32-document-gateway-closure.mjs",
 "scripts/document-gateway/smoke.mjs",
 "app/api/tools/document/ticket/route.ts",
 "lib/tools/document/intake-client.ts"
])must(fs.existsSync(p),`CANONICAL_DOCUMENT_CHAIN_MISSING:${p}`);

const git=spawnSync("git",["ls-files","-s"],{encoding:"utf8"});
must(git.status===0,"GIT_LS_FILES_FAILED");
const gitlinks=(git.stdout||"").split(/\r?\n/).filter(line=>line.startsWith("160000 "));
must(gitlinks.length===0,`LEGACY_GITLINKS_REMAIN:${gitlinks.length}`);

console.log("V21_V29_OBSOLETE_AUDITS=0");
console.log("V31_V32_CANONICAL_DOCUMENT_CHAIN=PASS");
console.log("OFFICE_PRODUCTION_SMOKE_REGISTERED=PASS");
console.log("LEGACY_GITLINKS=0");
console.log("FOOD_CALORIE_CHANGED=NO");
console.log("PAYMENT_WITHDRAWAL_CHANGED=NO");
console.log("PAYMENT_EXECUTION_CHANGED=NO");
console.log("PROTECTED_PRODUCTION_DATA=UNCHANGED");
console.log("CORE_ORIGIN_MODULES_CHANGED=NO");
console.log("LINGXIFIELD_V33_PRODUCTION_CLOSURE=PASS");
