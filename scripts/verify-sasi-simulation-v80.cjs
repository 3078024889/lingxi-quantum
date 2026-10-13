const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const dir=path.resolve('_local/handoff/simulated-video-v80');fs.mkdirSync(dir,{recursive:true});
const checks=[
 ['plan-and-quote','scripts/test-series-contract-v78.cjs',[]],
 ['video-submit-poll-delivery','scripts/test-sasi-seedance-byok.cjs',[]],
 ['persisted-media-gate','scripts/test-generated-media-archive.cjs',[]],
 ['provider-retirement-and-owner-boundary','scripts/test-retirement-byok.mjs',[]],
 ['actual-episode-composition','scripts/test-background-episode-v78.cjs',['--emit-simulation']],
 ['model-configuration-boundary','scripts/test-model-routing-v78.cjs',[]],
 ['website-and-skill-boundary','scripts/test-sasi-delivery-boundaries.cjs',[]],
];
const results=[];
for(const [name,file,args] of checks){const started=Date.now(),r=spawnSync(process.execPath,[file,...args],{encoding:'utf8',windowsHide:true,timeout:180000,maxBuffer:4*1024*1024});fs.writeFileSync(path.join(dir,name+'.log'),(r.stdout||'')+(r.stderr||''));results.push({name,status:r.status===0?'PASS':'FAIL',elapsedMs:Date.now()-started,exitCode:r.status});if(r.status!==0)break;}
const report={at:new Date().toISOString(),mode:'SIMULATED_PROVIDER',paidProviderRequests:0,productionWrites:0,aiGeneratedVideo:false,actualMp4Composition:true,seriesContractEpisodes:50,seriesContractSeconds:3000,actualFixtureSeconds:8,fixtures:['SIMULATED-provider-episode-8s.mp4'],checks:results,pass:results.length===checks.length&&results.every(x=>x.status==='PASS'),limits:['The 50-episode specification and quotes are synthetic contract checks, not 50 generated episodes.','Real provider entitlement, quality, cost and latency remain unverified.','Database and storage adapters in this simulation are isolated; native PostgreSQL concurrency results are recorded separately in V79.']};
fs.writeFileSync(path.join(dir,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(!report.pass)process.exitCode=1;
