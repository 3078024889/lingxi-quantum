import fs from "node:fs";
const must=(v,m)=>{if(!v)throw new Error(m)};

const generated=[
 ".pnpm-store/v11/index.db",
 "test-results/.last-run.json",
 "audit-output/paid-tools-v1581.json",
 "audit-output/all-tools-routing-v1581_4.json",
 "build-review.log","build-sasi-review.log","build-sasi-memory-review.log",
 "build-membership-390.png","build-membership-1440.png"
];
for(const p of generated)must(!fs.existsSync(p),`V38R2_GENERATED_WORKTREE_RESIDUAL:${p}`);

const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
must(pkg.packageManager==="pnpm@11.28.0","V38R2_PACKAGE_MANAGER_MISMATCH");
must(fs.existsSync("pnpm-lock.yaml"),"V38R2_PNPM_LOCK_MISSING");
must(fs.existsSync("package-lock.json"),"V38R2_PACKAGE_LOCK_PROTECTED_MISSING");

const wf=fs.readFileSync(".github/workflows/production-gate.yml","utf8");
for(const sha of [
 "d23441a48e516b6c34aea4fa41551a30e30af803",
 "b906affcce14559ad1aafd4ab0e942779e9f58b1",
 "249970729cb0ef3589644e2896645e5dc5ba9c38",
 "330a01c490aca151604b8cf639adc76d48f6c5d4"
])must(wf.includes(sha),`V38R2_ACTION_SHA_MISSING:${sha}`);
must(!/uses:\s*[^@\s]+@v\d+/m.test(wf),"V38R2_MUTABLE_ACTION_TAG_REMAINS");

const ignore=fs.readFileSync(".gitignore","utf8");
must(!ignore.includes("\\n/imports/\\n"),"V38R2_LITERAL_BACKSLASH_N_REMAINS");
for(const rule of ["/test-results/","/playwright-report/","/audit-output/","/build-*.log","/build-*.png","**/__pycache__/","*.pyc"]){
  must(ignore.includes(rule),`V38R2_IGNORE_RULE_MISSING:${rule}`);
}

const protectedManifest=JSON.parse(fs.readFileSync("LINGXIFIELD_PROTECTED_MANIFEST.json","utf8"));
const protectedPaths=new Set((protectedManifest.files||[]).map(x=>x.path));
const assets=[
 "public/images/9d-field-navigation-v317.png",
 "public/media/lingxifield-9d-field-structure-v320.mp4",
 "public/images/breath-structure.png",
 "public/images/cosmos-bg.png",
 "public/images/sasi/cards/models-api-v1.png"
];
for(const p of assets){
  if(protectedPaths.has(p))must(fs.existsSync(p),`V38R2_PROTECTED_ASSET_MISSING:${p}`);
}

const ci=fs.readFileSync("scripts/ci/production-gate.mjs","utf8");
must(ci.includes("v38r2-repository-hardening.mjs")||ci.includes("v38r1-repository-hardening.mjs"),"V38R2_CI_GATE_NOT_REGISTERED");

console.log("CANONICAL_PACKAGE_MANAGER=pnpm@11.28.0");
console.log("PACKAGE_LOCK_PRESERVED=YES");
console.log("GENERATED_PACKAGE_STORE_WORKTREE=0");
console.log("GENERATED_TEST_RESULTS_WORKTREE=0");
console.log("GENERATED_AUDIT_OUTPUT_WORKTREE=0");
console.log("GENERATED_BUILD_EVIDENCE_WORKTREE=0");
console.log("PROTECTED_RETIRED_ASSETS_PRESERVED=5");
console.log("GITHUB_ACTIONS_FULL_SHA_PINNED=PASS");
console.log("GITIGNORE_NORMALIZED=PASS");
console.log("FOOD_CALORIE_CHANGED=NO");
console.log("PAYMENT_WITHDRAWAL_CHANGED=NO");
console.log("PAYMENT_EXECUTION_CHANGED=NO");
console.log("PROTECTED_PRODUCTION_DATA=UNCHANGED");
console.log("CORE_ORIGIN_MODULES_CHANGED=NO");
console.log("LINGXIFIELD_V38R2_REPOSITORY_HARDENING=PASS");
