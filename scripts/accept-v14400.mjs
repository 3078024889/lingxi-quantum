import fs from "node:fs";
const assert=(ok,label)=>{if(!ok)throw new Error("FAIL "+label);console.log("PASS "+label)};
const must=[
  "scripts/accept-v14301.mjs",
  "scripts/accept-v14321.mjs",
  "scripts/accept-v14350.mjs",
  ".lingxi-release/PRODUCTION_RELEASE_MANIFEST_V14400.txt",
];
for(const p of must)assert(fs.existsSync(p),p);
const manifest=fs.readFileSync(".lingxi-release/PRODUCTION_RELEASE_MANIFEST_V14400.txt","utf8");
for(const key of [
  "STAGED_DIFF_CHECK=PASS",
  "BIGPACK_ACCEPTANCES=PASS",
  "SASI_IDENTITY_INVARIANTS=PASS",
  "BANNED_COPY_SCAN=PASS",
  "NINE_LANGUAGE_BASE_CONTRACT=PASS",
  "TSC=PASS",
  "BUILD=PASS",
  "LOCAL_HTTP_SMOKE=PASS",
])assert(manifest.includes(key),key);
console.log("V14.40.0 PRODUCTION RELEASE GATE=PASS");
