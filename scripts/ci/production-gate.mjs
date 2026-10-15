import fs from "node:fs";
import path from "node:path";
import {spawnSync} from "node:child_process";

const root=process.cwd();

const commands=[
 ["node",["scripts/prepare-media-runtime.cjs"]],
 ["node",["scripts/test-ocr-runtime-v87.cjs"]],
 ["node",["scripts/audit/tool-locale-literals-v86.cjs"]],
 ["node",["scripts/test-calendar-contact-v86.cjs"]],
 ["node",["scripts/test-cron-parser-v86.cjs"]],
 ["node",["scripts/test-workspace-checkpoint-v86.cjs"]],
 ["node",["scripts/audit/numeric-input-editability-v78.mjs"]],
 ["node",["scripts/audit/preview-url-lifecycle-v79.mjs"]],
 ["node",["scripts/test-mini-sharing-v78.cjs"]],
 ["node",["scripts/test-mini-profiles-v80.cjs"]],
 ["node",["scripts/test-series-contract-v78.cjs"]],
 ["node",["scripts/test-background-episode-v78.cjs"]],
 ["node",["scripts/audit-security.mjs"]],
 ["node",["scripts/test-burn-token-boundaries.cjs"]],
 ["node",["scripts/test-burn-file-completion.cjs"]],
 ["node",["scripts/test-burn-file-preparation.cjs"]],
 ["node",["scripts/test-engine-path-security.cjs"]],
 ["node",["scripts/test-video-reference-claim.cjs"]],
 ["node",["scripts/test-video-delivery.cjs"]],
 ["node",["scripts/test-generated-media-archive.cjs"]],
 ["node",["scripts/test-public-media-range.cjs"]],
 ["node",["scripts/test-media-completion.cjs"]],
 ["node",["scripts/test-media-import-security.cjs"]],
 ["node",["scripts/test-developer-data.cjs"]],
 ["node",["scripts/test-regex-worker-v79.cjs"]],
 ["node",["scripts/test-xml-bounds-v79.cjs"]],
 ["node",["scripts/test-json-source-format-v80.cjs"]],
 ["node",["scripts/test-sasi-response-transport.cjs"]],
 ["node",["scripts/test-sasi-provider-stream.cjs"]],
 ["node",["scripts/test-provider-json-probe.cjs"]],
 ["node",["scripts/test-model-routing-v78.cjs"]],
 ["node",["scripts/test-resize-boundaries-v79.cjs"]],
 ["node",["scripts/test-watermark-resource-v79.cjs"]],
 ["node",["scripts/test-paid-processing-failure-v79.cjs"]],
 ["node",["scripts/test-sasi-delivery-boundaries.cjs"]],
 ["node",["scripts/test-document-converter-limits.cjs"]],
 ["node",["scripts/test-temp-mail-safety-v81.cjs"]],
 ["node",["scripts/test-id-generator-v83.cjs"]],
 ["node",["scripts/test-batch-zip-v83.cjs"]],
 ["node",["scripts/test-archive-bounds-v84.cjs"]],
 ["node",["scripts/test-office-semantics-v85.cjs"]],
 ["node",["scripts/test-dependency-compat-v85.cjs"]],
 ["node",["scripts/test-document-gateway-limits.mjs"]],
 ["node",["scripts/test-site-facts.cjs"]],
 ["node",["scripts/test-money-lifecycle.cjs"]],
 ["node",["scripts/test-money-operations.cjs"]],
 ["node",["scripts/test-admin-dashboard.cjs"]],
 ["node",["scripts/test-money-admin-feed.cjs"]],
 ["node",["scripts/test-money-auto-refresh.cjs"]],
 ["node",["scripts/test-money-progress-api.cjs"]],
 ["node",["scripts/test-withdrawal-recovery.cjs"]],
 ["node",["scripts/test-refund-provider-signatures.cjs"]],
 ["node",["scripts/ci/test-repository-hardening.mjs"]],
 ["node",["scripts/audit/v39-security-public-copy.mjs"]],
 ["node",["scripts/audit/v38r2-repository-hardening.mjs"]],
 ["node",["scripts/audit/audit-script-syntax.mjs"]],
 ["node",["scripts/audit/retired-code-cleanup.mjs"]],
 ["node",["scripts/audit/platform-stability.mjs"]],
 ["node",["scripts/audit/capability-genome.mjs"]],
 ["node",["scripts/audit/tool-registry.mjs"]],
 ["node",["scripts/audit/support-lifecycle.mjs"]],
 ["node",["scripts/audit/continuous-tools.mjs"]],
 ["node",["scripts/audit/media-production.mjs"]],
 ["node",["scripts/audit/global-commerce.mjs"]],
 ["node",["scripts/audit/document-format-capability.mjs"]],
 ["node",["scripts/audit/all-paid-task-recovery.mjs"]],
 ["node",["scripts/audit/v45-paid-flow.mjs"]],
 ["node",["scripts/audit/v45r4-compat.mjs"]],
 ["node",["scripts/audit/v46-paid-task-core.mjs"]],
 ["node",["scripts/audit/v83-sasi-durable-convergence.mjs"]],
 ["node",["scripts/ci/audit-manifest.mjs"]],
 ["node",["scripts/final-closure/audit.mjs"]],
 ["node",["scripts/final-closure/graduation.mjs"]],
];

for(const [cmd,args] of commands){
 const label=[cmd,...args].join(" ");
 console.log(`CI_GATE_RUN=${label}`);
 const r=spawnSync(cmd,args,{stdio:"inherit",cwd:root,shell:false});
 if(r.status!==0)throw new Error(`CI_GATE_FAILED:${label}`);
}

const required=[
 "app",
 "components",
 "lib",
 "tests/final-closure",
 "playwright.final.config.ts",
 "playwright.production.config.ts",
 "pnpm-lock.yaml",
];
for(const rel of required){
 if(!fs.existsSync(path.join(root,rel)))throw new Error(`CI_REQUIRED_PATH_MISSING:${rel}`);
}

console.log("LINGXIFIELD_CLEAN_SOURCE_GATE=PASS");
