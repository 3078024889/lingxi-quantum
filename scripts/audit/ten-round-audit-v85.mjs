import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const directory='_local/handoff/ten-round-audit-v85';fs.mkdirSync(directory,{recursive:true});
const rounds=[
 ['01','inventory-and-editing',['scripts/audit/tool-function-inventory-v83.cjs','scripts/audit/numeric-input-editability-v78.mjs','scripts/test-id-generator-v83.cjs']],
 ['02','text-and-structured-data',['scripts/test-developer-data.cjs','scripts/test-json-source-format-v80.cjs','scripts/test-xml-bounds-v79.cjs','scripts/test-regex-worker-v79.cjs']],
 ['03','images-and-output-files',['scripts/test-resize-boundaries-v79.cjs','scripts/test-watermark-resource-v79.cjs','scripts/test-batch-zip-v83.cjs']],
 ['04','office-and-epub',['scripts/test-archive-bounds-v84.cjs','scripts/test-office-semantics-v85.cjs','scripts/test-document-converter-limits.cjs']],
 ['05','media-and-network',['scripts/test-media-import-security.cjs','scripts/test-public-media-range.cjs','scripts/test-media-completion.cjs','scripts/test-generated-media-archive.cjs']],
 ['06','privacy-and-sandbox',['scripts/test-burn-token-boundaries.cjs','scripts/test-burn-file-completion.cjs','scripts/test-burn-file-preparation.cjs','scripts/test-engine-path-security.cjs']],
 ['07','sasi-streaming-and-routing',['scripts/test-sasi-response-transport.cjs','scripts/test-sasi-provider-stream.cjs','scripts/test-model-routing-v78.cjs','scripts/test-sasi-delivery-boundaries.cjs']],
 ['08','recoverable-creative-tasks',['scripts/test-series-contract-v78.cjs','scripts/test-background-episode-v78.cjs','scripts/test-video-reference-claim.cjs','scripts/test-video-delivery.cjs']],
 ['09','commerce-and-mini-programs',['scripts/test-temp-mail-safety-v81.cjs','scripts/test-money-lifecycle.cjs','scripts/test-money-auto-refresh.cjs','scripts/test-refund-provider-signatures.cjs','scripts/test-mini-sharing-v78.cjs','scripts/test-mini-profiles-v80.cjs']],
 ['10','license-and-release-contract',['scripts/local-engine/verify-license-registry.mjs','scripts/test-dependency-compat-v85.cjs','scripts/audit-security.mjs','scripts/ci/test-repository-hardening.mjs','scripts/ci/playwright-contract.mjs']],
];
const report={at:new Date().toISOString(),rounds:[],limitations:'These are ten distinct topic review/verification rounds; browser output and production deployment are verified separately. Provider/payment adapters remain isolated; no real supplier purchase or production-user writes.'};
for(const [id,topic,files] of rounds){
 const round={id,topic,checks:[],pass:true};
 for(const file of files){if(!fs.existsSync(file))throw Error('Missing audit check '+file);const start=Date.now();const result=spawnSync(process.execPath,[file],{encoding:'utf8',windowsHide:true,timeout:300000,maxBuffer:8*1024*1024});const log=path.join(directory,id+'-'+path.basename(file)+'.log');fs.writeFileSync(log,(result.stdout||'')+(result.stderr||'')+(result.error?'\n'+result.error.message:''));const pass=result.status===0&&!result.error;round.checks.push({file,pass,exitCode:result.status,elapsedMs:Date.now()-start,log});round.pass&&=pass;console.log(`${id} ${topic} ${pass?'PASS':'FAIL'} ${file}`)}
 report.rounds.push(round);fs.writeFileSync(path.join(directory,'report.json'),JSON.stringify(report,null,2));
}
report.pass=report.rounds.every(round=>round.pass);fs.writeFileSync(path.join(directory,'report.json'),JSON.stringify(report,null,2));console.log('TEN_ROUND_AUDIT='+ (report.pass?'PASS':'FAIL'));if(!report.pass)process.exitCode=1;
