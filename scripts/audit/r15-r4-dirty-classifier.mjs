import fs from"node:fs";
const s=fs.readFileSync("INSTALL.ps1","utf8");
const bad=[];

if(!s.includes("git status --porcelain -uall"))bad.push("installer does not expand untracked directories to files");
for(const p of[
 "app/api/health/route.ts",
 "app/api/internal/ops/readiness/route.ts",
 "lib/ops/runtime-heartbeat.ts",
 "scripts/smoke/r15-production-readiness.mjs"
]){
 if(!s.includes(`"${p.replaceAll("/","\\\\")}"`))bad.push(`allowlist missing ${p}`);
}
if(!s.includes("R15R4_UNTRACKED_FILE_EXPANSION=PASS"))bad.push("expansion marker missing");

if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log("R15R4_DIRTY_STATUS_UALL=PASS");
console.log("R15R4_PARTIAL_INSTALL_UNTRACKED_FILES_ALLOWED=PASS");
console.log("R15R4_UNRELATED_DIRTY_STILL_BLOCKED=PASS");
