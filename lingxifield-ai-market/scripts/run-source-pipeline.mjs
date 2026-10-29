// Offline-safe source orchestrator. Executed manually or by an explicitly configured scheduler.
// Never performs database writes or production deployment; each adapter owns its source validation.
import {spawnSync} from 'node:child_process';
import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dir=resolve(process.env.AI_MARKET_SNAPSHOT_DIR||resolve(root,'reports','source-pipeline'));
await mkdir(dir,{recursive:true});
const tasks=[
 {id:'modelsdev',script:'collect-modelsdev-bulk.mjs',ttlHours:24},
 {id:'github',script:'collect-github-catalog.mjs',ttlHours:6},
 {id:'openrouter',script:'collect-openrouter-bulk.mjs',ttlHours:24,requiresEnv:'OPENROUTER_API_KEY'}
];
const stateFile=resolve(dir,'pipeline-state.json');
let state={};try{state=JSON.parse(await readFile(stateFile,'utf8'))}catch{}
const force=process.argv.includes('--force'),now=Date.now(),results=[];
for(const t of tasks){
 if(t.requiresEnv&&!process.env[t.requiresEnv]){results.push({source:t.id,outcome:'skipped_no_credentials'});continue;}
 const previous=state[t.id];
 if(!force&&previous?.ok&&Number.isFinite(Date.parse(previous.at))&&now-Date.parse(previous.at)<t.ttlHours*3600000){
  results.push({source:t.id,outcome:'skipped_fresh',lastSuccessAt:previous.at});continue;
 }
 const started=Date.now();
 const run=spawnSync(process.execPath,[resolve(root,'scripts',t.script)],{cwd:root,env:{...process.env,AI_MARKET_SNAPSHOT_DIR:dir},encoding:'utf8',timeout:90000,maxBuffer:1024*1024});
 const ok=run.status===0&&!run.error;
 results.push({source:t.id,outcome:ok?'collected':'failed',code:run.status,durationMs:Date.now()-started,error:run.error?.code||null,
  output:(run.stdout||'').slice(-800),stderr:(run.stderr||'').slice(-400)});
 if(ok)state[t.id]={ok:true,at:new Date().toISOString()};
}
// Build a local query index even when the bulk source is still within its refresh window.
const indexPath=resolve(dir,'models-index.json');
let indexExists=false;try{await readFile(indexPath);indexExists=true}catch{}
if(!indexExists||results.some(x=>x.source==='modelsdev'&&x.outcome==='collected')){
 const run=spawnSync(process.execPath,[resolve(root,'scripts','build-model-index.mjs')],{cwd:root,env:{...process.env,AI_MARKET_SNAPSHOT_DIR:dir},encoding:'utf8',timeout:90000,maxBuffer:1024*1024});
 results.push({source:'models_index',outcome:run.status===0?'indexed':'failed',code:run.status,output:(run.stdout||'').slice(-800),stderr:(run.stderr||'').slice(-400)});
}
// Compare only after a genuinely new models.dev collection and a preserved previous snapshot.
if(results.some(x=>x.source==='modelsdev'&&x.outcome==='collected')){
 let previousExists=false;const previousPath=resolve(dir,'modelsdev-previous.json');
 try{await readFile(previousPath);previousExists=true;}catch{}
 if(previousExists){const run=spawnSync(process.execPath,[resolve(root,'scripts','compare-model-prices.mjs')],
 {cwd:root,env:{...process.env,AI_MARKET_SNAPSHOT_DIR:dir,AI_MARKET_PREVIOUS_MODELS_FILE:previousPath},encoding:'utf8',timeout:90000,maxBuffer:1024*1024});
 results.push({source:'model_price_changes',outcome:run.status===0?'compared':'failed',code:run.status,output:(run.stdout||'').slice(-400),stderr:(run.stderr||'').slice(-400)});}
}
// Rebuild reproducible curated view when a fresh models index is available.
try{await readFile(resolve(dir,'models-index.json'));
 const run=spawnSync(process.execPath,[resolve(root,'scripts','curate-model-index.mjs')],{cwd:root,env:{...process.env,AI_MARKET_SNAPSHOT_DIR:dir},encoding:'utf8',timeout:90000,maxBuffer:1024*1024});
 results.push({source:'models_curation',outcome:run.status===0?'curated':'failed',code:run.status,output:(run.stdout||'').slice(-500)});
}catch{}
const report={runAt:new Date().toISOString(),results,note:'Independent adapters. A failed source never causes another source to be falsely marked complete.'};
const writeJson=async(p,value)=>{const tmp=p+'.tmp';await writeFile(tmp,JSON.stringify(value,null,2)+'\n');await rename(tmp,p)};
await writeJson(stateFile,state);await writeJson(resolve(dir,'pipeline-last-run.json'),report);
console.log(JSON.stringify(report,null,2));
if(results.some(x=>x.outcome==='failed'))process.exitCode=2;
