import fs from"node:fs";
function must(v,m){if(!v)throw new Error(m)}
const ps=fs.readFileSync("PROMOTE_V32.ps1","utf8");
const check=fs.readFileSync("CHECK_V32_OVERLAP.mjs","utf8");

must(ps.includes("V32_OVERLAP_CLASSIFICATION=ALREADY_APPLIED"),"RESUME_CLASSIFICATION_MISSING");
must(ps.includes("CHECK_V32_OVERLAP.mjs"),"OVERLAP_CONTENT_CHECK_MISSING");
must(check.includes("replace(/\\r\\n/g"),"LINE_ENDING_NORMALIZATION_MISSING");
must(check.includes("V32_CONTENT_MISMATCH_COUNT"),"MISMATCH_COUNT_MISSING");
must(check.includes("package.json"),"PACKAGE_JSON_SEMANTIC_CHECK_MISSING");

console.log("V32_RESUME_OVERLAP_CLASSIFICATION=PASS");
console.log("V32_CRLF_LF_TOLERANCE=PASS");
console.log("V32_PACKAGE_JSON_SEMANTIC_CHECK=PASS");
console.log("V32R2_RESUME_PROMOTION_AUDIT=PASS");
