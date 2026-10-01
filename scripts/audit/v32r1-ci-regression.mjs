import fs from"node:fs";
function must(v,m){if(!v)throw new Error(m)}
const doc=fs.readFileSync("scripts/audit/document-format-capability.mjs","utf8");
const wf=fs.readFileSync(".github/workflows/production-gate.yml","utf8");

must(doc.includes("DOCUMENT_SUPPORT_READINESS_SEPARATED=PASS"),"STALE_DOCUMENT_AUDIT_REMAINS");
must(!doc.includes('route.includes("DOCUMENT_CONVERSION_UNAVAILABLE")'),"OLD_NORMALIZE_LITERAL_ASSERTION_REMAINS");
must(wf.includes("fetch-depth: 1"),"CI_SHALLOW_CHECKOUT_MISSING");
must(wf.includes("persist-credentials: false"),"CI_PERSISTED_CREDENTIALS_STILL_ENABLED");
must(wf.includes("submodules: false"),"CI_SUBMODULE_POLICY_NOT_EXPLICIT");

console.log("CI_DOCUMENT_AUDIT_CURRENT_CONTRACT=PASS");
console.log("CI_SHALLOW_CHECKOUT=PASS");
console.log("CI_PERSIST_CREDENTIALS=NO");
console.log("CI_SUBMODULE_FETCH=NO");
console.log("V32R1_CI_REGRESSION_AUDIT=PASS");
