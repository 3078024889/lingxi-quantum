// Read-only operator report. Deliberately never prints credentials or service URLs.
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
require('@next/env').loadEnvConfig(process.cwd());
function load(file){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:m.exports,require:n=>n==='server-only'?{}:require(n),process,URL,Date});return m.exports;}
const profiles=load('lib/sasi/seedance-byok.ts').seedanceProfiles();
let rates=[];try{const parsed=JSON.parse(process.env.SASI_VIDEO_RATES_JSON||'[]');if(Array.isArray(parsed))rates=parsed}catch{}
const reviewedRates=rates.filter(r=>r&&Number.isSafeInteger(r.supplierFenPerSecond)&&r.supplierFenPerSecond>0&&Number.isSafeInteger(r.retailFenPerSecond)&&r.retailFenPerSecond>r.supplierFenPerSecond&&Date.parse(r.validUntil)>Date.now());
const report={scope:'local-configuration-only',checkedAt:new Date().toISOString(),
 byokVideo:{enabled:process.env.SASI_BYOK_VIDEO_ENABLED==='true',validProfiles:profiles.length,configurationReady:process.env.SASI_BYOK_VIDEO_ENABLED==='true'&&profiles.length>0},
 managedVideo:{configuredRates:rates.length,unexpiredPositiveSpreadRates:reviewedRates.length},
 text:{profileConfigured:!!process.env.SASI_BYOK_TEXT_PROFILE},
 compute:{addressConfigured:!!process.env.SASI_NATIVE_COMPUTE_URL},
 verification:{ownerConnection:'not-tested',modelPermission:'not-tested',generation:'not-tested',payment:'not-tested',productionEnvironment:'not-tested'},
 pricing:reviewedRates.map(r=>({quality:r.quality,supplierFenPerSecond:r.supplierFenPerSecond,retailFenPerSecond:r.retailFenPerSecond,spreadFenPerSecond:r.retailFenPerSecond-r.supplierFenPerSecond,note:'Spread excludes retries, payment fees, storage and operating costs.'}))};
console.log(JSON.stringify(report,null,2));
if(!report.byokVideo.configurationReady&&!reviewedRates.length)process.exitCode=2;
