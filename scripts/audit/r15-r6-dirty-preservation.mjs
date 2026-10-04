import fs from"node:fs";
const bad=[];
const install=fs.readFileSync("INSTALL.ps1","utf8");
const commit=fs.readFileSync("COMMIT_AFTER_PASS.ps1","utf8");
const owned=fs.readFileSync("OWNED_PATHS.txt","utf8").trim().split(/\r?\n/);

for(const x of[
 "R15R6_PREEXISTING_UNRELATED_DIRTY_PRESERVED",
 "R15R6_PREEXISTING_DIRTY_BACKUP=PASS",
 "R15R6_PREEXISTING_DIRTY_NOT_STAGED=PASS",
 "R15R6_DIRTY_POLICY=PASS"
])if(!install.includes(x))bad.push(`installer missing ${x}`);

if(commit.includes("git add -A"))bad.push("commit helper still uses git add -A");
if(!commit.includes("R15R6_ONLY_PACKAGE_OWNED_PATHS_STAGED=PASS"))bad.push("owned-only staging marker missing");
if(!owned.includes(".github/workflows/production-gate.yml"))bad.push("workflow absent from owned paths");
if(!owned.includes("tests/final-closure/tool-plain-language.spec.ts"))bad.push("playwright fix absent from owned paths");
if(!owned.includes("app/api/cron/withdrawal-reconcile/route.ts"))bad.push("money cron absent from owned paths");

if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log("R15R6_PREEXISTING_DIRTY_PRESERVATION_CONTRACT=PASS");
console.log("R15R6_OWNED_ONLY_GIT_STAGING=PASS");
console.log("R15R6_PARTIAL_INSTALL_RECOVERY_CONTRACT=PASS");
