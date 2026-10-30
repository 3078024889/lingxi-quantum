// One-command, existing-products-only release gate. No bulk discovery or production changes.
// node scripts/run-existing-market-total.mjs [--build]
import {spawnSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {mkdir,writeFile} from 'node:fs/promises';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const tasks=[
 {id:'full_identity_and_evidence_gate',command:process.execPath,args:['scripts/run-existing-products-full-gate.mjs']},
 {id:'all_product_review_queue',command:process.execPath,args:['scripts/build-existing-product-review-queue.mjs']},
 {id:'catalog',command:process.execPath,args:['scripts/validate-catalog-v25.mjs']},
 {id:'source_evidence',command:process.execPath,args:['scripts/validate-evidence.mjs']},
 {id:'contract_tests',command:process.execPath,args:['--test','tests/*.test.mjs']},
 {id:'typescript',command:process.execPath,args:['node_modules/typescript/bin/tsc','--noEmit']}
];
if(process.argv.includes('--build'))tasks.push({id:'next_build',command:process.execPath,args:['node_modules/next/dist/bin/next','build']});
const outcomes=[];
for(const t of tasks){
 const p=spawnSync(t.command,t.args,{cwd:root,encoding:'utf8',timeout:240000,maxBuffer:3*1024*1024,shell:false});
 const success=p.status===0&&!p.error;
 outcomes.push({id:t.id,status:success?'PASS':'FAIL',exitCode:p.status,error:p.error?.message||null,
 stdout:(p.stdout||'').slice(-25000),stderr:(p.stderr||'').slice(-25000)});
 console.log(t.id+': '+(success?'PASS':'FAIL'));
 if(!success){console.error('=== '+t.id+' FAILURE STDOUT ===\\n'+(p.stdout||'').slice(-12000));console.error('=== '+t.id+' FAILURE STDERR ===\\n'+(p.stderr||'').slice(-12000));}
}
const passed=outcomes.every(x=>x.status==='PASS');
const output=resolve(process.env.AI_MARKET_REVIEW_DIR||resolve(root,'reports/existing-product-gate'));
await mkdir(output,{recursive:true});
await writeFile(resolve(output,'total-gate-results.json'),JSON.stringify({
 schema:'lingxifield_market_total_gate_v1',createdAt:new Date().toISOString(),passed,outcomes,
 productionPromoted:false,liveBrowserVerified:false,revenueVerified:false,
 note:'A passing local build is not proof of public live UI, complete price coverage, GEO ranking or production correctness.'
},null,2)+'\n');
console.log('TOTAL_GATE='+ (passed?'PASS':'FAIL')+' REPORT='+resolve(output,'total-gate-results.json'));
if(!passed)process.exitCode=1;
