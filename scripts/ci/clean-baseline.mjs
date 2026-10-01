import fs from "node:fs";
import path from "node:path";

const forbiddenTracked=[
 "public/vendor/transformers",
 "public/onnxruntime",
 "lib/tools/platform/platform",
];

for(const p of forbiddenTracked){
 if(fs.existsSync(p))throw new Error(`RETIRED_PATH_PRESENT:${p}`);
}

const versionedAuditPatterns=[
 /^v2[1-9]-/,
 /^v30-/,
];
const auditDir="scripts/audit";
if(fs.existsSync(auditDir)){
 for(const name of fs.readdirSync(auditDir)){
  if(versionedAuditPatterns.some(r=>r.test(name))){
   console.warn(`HISTORICAL_AUDIT_PRESENT=${name}`);
  }
 }
}

const packageJson=JSON.parse(fs.readFileSync("package.json","utf8"));
const scripts=packageJson.scripts||{};
for(const required of [
 "build",
 "audit:capability-genome",
 "audit:tool-registry",
 "audit:media-production",
 "audit:global-commerce",
 "audit:all-paid-recovery",
]){
 if(!scripts[required])throw new Error(`PACKAGE_SCRIPT_MISSING:${required}`);
}

console.log("RETIRED_RUNTIME_PATHS=0");
console.log("CLEAN_BASELINE_REQUIRED_SCRIPTS=PASS");
console.log("LINGXIFIELD_CLEAN_BASELINE_AUDIT=PASS");
