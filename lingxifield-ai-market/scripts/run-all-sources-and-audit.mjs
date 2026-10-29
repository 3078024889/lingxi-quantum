// Single invocation for all authorized public-source adapters + post-collection audit.
// No deployment, no main merge, no database mutations.
import {spawnSync} from 'node:child_process';
import {readFile,mkdir,writeFile,rename} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dir=resolve(process.env.AI_MARKET_SNAPSHOT_DIR||resolve(root,'reports','source-pipeline'));
await mkdir(dir,{recursive:true});
const run=spawnSync(process.execPath,[resolve(root,'scripts/run-source-pipeline.mjs'),...process.argv.slice(2)],{
 cwd:root,env:{...process.env,AI_MARKET_SNAPSHOT_DIR:dir},encoding:'utf8',timeout:240000,maxBuffer:8*1024*1024
});
const names=[
 ['modelsdev','modelsdev-bulk.json','modelCount'],
 ['modelGroups','model-offer-groups.json','distinctModelIdentifiers'],
 ['hfModels','hf-models-catalog.json','modelCount'],
 ['hfSpaces','hf-spaces-catalog.json','count'],
 ['products','products-unified.json','total'],
 ['openrouter','openrouter-bulk.json','modelCount']
];
const coverage={};for(const [name,file,key] of names){
 try{const v=JSON.parse(await readFile(resolve(dir,file),'utf8'));coverage[name]={state:'present',count:Number.isFinite(v[key])?v[key]:null,sourceTimestamp:v.collectedAt||v.sourceCollectedAt||v.generatedAt||null};}
 catch{coverage[name]={state:'not_collected',count:null}}
}
let taskResults=[];try{const r=JSON.parse(await readFile(resolve(dir,'pipeline-last-run.json'),'utf8'));taskResults=r.results||[]}catch{}
const report={generatedAt:new Date().toISOString(),exitCode:run.status,error:run.error?.code||null,coverage,
 results:taskResults.map(x=>({source:x.source,outcome:x.outcome,code:x.code??null})),
 disclaimer:'HF numbers are HF-only; third party model pricing is not independently verified; commercial pricing, GEO and traffic are not completed.'};
const file=resolve(dir,'collection-coverage-audit.json');await writeFile(file+'.tmp',JSON.stringify(report,null,2)+'\n');await rename(file+'.tmp',file);
console.log(JSON.stringify({report:file,...report},null,2));
if(run.stderr)console.error(run.stderr.slice(-1200));
if(run.status!==0)process.exitCode=run.status||2;
