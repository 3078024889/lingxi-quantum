import fs from"node:fs";

const bad=[];
const s=fs.readFileSync("scripts/ci/supabase-migration-history-contract.mjs","utf8");

for(const x of[
 "SUPABASE_REMOTE_HISTORY_LOCAL_MISSING",
 "SUPABASE_REQUIRED_REMOTE_VERSION_NOT_UNIQUE",
 "SUPABASE_LOCAL_ONLY_DUPLICATE_TIMESTAMPS_DEFERRED",
 "R15R11_SUPABASE_REQUIRED_REMOTE_HISTORY_PARITY=PASS",
 "R15R11_SUPABASE_PREVIEW_BLOCKER_SCOPE=REMOTE_HISTORY_ONLY",
]){
 if(!s.includes(x))bad.push(`migration parity contract missing ${x}`);
}

if(s.includes("SUPABASE_DUPLICATE_MIGRATION_VERSIONS")){
 bad.push("obsolete all-local duplicate hard failure remains");
}

if(bad.length){
 console.error(bad.join("\n"));
 process.exit(1);
}

console.log("R15R11_PARITY_SCOPE_AUDIT=PASS");
console.log("R15R11_REMOTE_REQUIRED_HISTORY_HARD_FAIL=PASS");
console.log("R15R11_LOCAL_ONLY_DUPLICATE_DEBT_NONBLOCKING=PASS");
