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
 {id:'github',script:'collect-github-catalog.mjs',ttlHours:6}
];
const stateFile=resolve(dir,'pipeline-state.json');
let state={};try{state=JSON.parse(await readFile(stateFile,'utf8'))}catch{}
const force=process.argv.includes('--force'),now=Date.now(),results=[];
for(const t of tasks){
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
const report={runAt:new Date().toISOString(),results,note:'Independent adapters. A failed source never causes another source to be falsely marked complete.'};
const writeJson=async(p,value)=>{const tmp=p+'.tmp';await writeFile(tmp,JSON.stringify(value,null,2)+'\n');await rename(tmp,p)};
await writeJson(stateFile,state);await writeJson(resolve(dir,'pipeline-last-run.json'),report);
console.log(JSON.stringify(report,null,2));
if(results.some(x=>x.outcome==='failed'))process.exitCode=2;
