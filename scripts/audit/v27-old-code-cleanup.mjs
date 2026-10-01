import fs from"node:fs";
import path from"node:path";

const forbidden=[
 "scripts/audit/platform-stability-v9.mjs",
 "scripts/audit/platform-stability-v10.mjs",
 "scripts/audit/platform-stability-v11.mjs",
 "scripts/audit/platform-stability-v12.mjs",
 "scripts/audit/platform-stability-v13.mjs",
 "tests/final-closure/platform-stability-v9.spec.ts",
 "tests/final-closure/platform-stability-v10.spec.ts",
 "tests/final-closure/platform-stability-v11.spec.ts",
 "tests/final-closure/platform-stability-v12.spec.ts",
 "tests/final-closure/platform-stability-v13.spec.ts",
 "public/vendor/transformers",
 "public/onnxruntime",
 "lib/tools/platform/platform"
];

const present=forbidden.filter(p=>fs.existsSync(p));
if(present.length){
 console.error("OLD_SUPERSEDED_RESIDUALS="+present.join(","));
 throw new Error(`OLD_SUPERSEDED_RESIDUALS:${present.length}`);
}
console.log("OLD_SUPERSEDED_RESIDUALS=0");
console.log("OLD_MEDIA_RUNTIME_RESIDUALS=0");
console.log("NESTED_PLATFORM_RESIDUALS=0");
console.log("V27_OLD_CODE_CLEANUP_AUDIT=PASS");
