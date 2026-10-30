import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const script=fileURLToPath(new URL('../scripts/build-market-staging-bridge.mjs',import.meta.url));
test('staging import dedupes, diffs, preserves candidates, never promotes verified',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'lingxi-bridge-'));
 try{
  const input={schema:'lingxifield_product_candidates_v1',products:[
   {id:'catalog:a',name:'Tool A',url:'https://www.example.org/',evidence:{kind:'local_unverified_candidate',url:'https://example.org',observedAt:'2026-10-29'}},
   {id:'catalog:a2',name:'Tool A',url:'https://example.org/?utm_source=x',evidence:{kind:'local_unverified_candidate',url:'https://example.org'}},
   {id:'catalog:b',name:'Tool B',url:'https://example.org/other',evidence:{kind:'local_unverified_candidate',url:'https://example.org/other'}},
   {id:'hf:org/model',name:'Demo',url:'https://huggingface.co/spaces/org/demo',evidence:{kind:'huggingface_public_space',url:'https://huggingface.co/spaces/org/demo'}},
   {id:'bad',name:'Bad',url:'javascript:alert(1)',evidence:{kind:'unknown'}}
  ]};
  await writeFile(join(dir,'products-unified.json'),JSON.stringify(input));
  const run=()=>spawnSync(process.execPath,[script],{env:{...process.env,AI_MARKET_SNAPSHOT_DIR:dir},encoding:'utf8'});
  let r=run();assert.equal(r.status,0,r.stderr);
  let report=JSON.parse(await readFile(join(dir,'staging-bridge/change-report.json'),'utf8'));
  assert.equal(report.summary.retained,2);
  assert.equal(report.summary.rejected,2);
  assert.equal(report.summary.created,2);
  const lines=(await readFile(join(dir,'staging-bridge/candidates-staging.jsonl'),'utf8')).trim().split('\n').map(JSON.parse);
  assert.ok(lines.every(x=>x.verification_status==='candidate'&&x.price===null));
  r=run();assert.equal(r.status,0,r.stderr);
  report=JSON.parse(await readFile(join(dir,'staging-bridge/change-report.json'),'utf8'));
  assert.equal(report.summary.created,0);assert.equal(report.summary.unchanged,2);
  input.products=input.products.slice(0,2);
  await writeFile(join(dir,'products-unified.json'),JSON.stringify(input));
  r=run();assert.equal(r.status,0,r.stderr);
  report=JSON.parse(await readFile(join(dir,'staging-bridge/change-report.json'),'utf8'));
  assert.equal(report.summary.missingFromLatest,1);
  assert.equal(report.changes.removed.length,1);
 }finally{await rm(dir,{recursive:true,force:true})}
});
