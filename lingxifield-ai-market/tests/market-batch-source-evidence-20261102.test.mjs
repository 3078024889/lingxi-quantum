import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {materializeCandidateCatalog} from '../lib/market-candidate-review-build.mjs';
import {auditOfficialObservations} from '../lib/market-official-observations.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../data/company-intake/'+name,import.meta.url),'utf8'));
const ids=['001','002','003'];
const cohorts=ids.map(n=>read('batch-'+n+'.json'));
const packs=ids.map(n=>read('batch-'+n+'-official-observations.json'));
const updated=[
 ['microsoft-copilot','payment','support.microsoft.com'],
 ['microsoft-copilot','commercial','www.microsoft.com'],
 ['freepik-ai','payment','www.freepik.com'],
 ['together-ai','commercial','www.together.ai'],
 ['groqcloud','commercial','console.groq.com'],
 ['fireworks-ai','company','fireworks.ai'],
 ['fireworks-ai','payment','fireworks.ai'],
 ['fireworks-ai','commercial','fireworks.ai'],
 ['fireworks-ai','free','fireworks.ai']
];
test('nine newly sourced factual fields remain dated, scoped and strictly pinned to official origin',()=>{
 const rows=packs.flatMap(p=>p.products);
 for(const [id,key,host] of updated){
  const p=rows.find(x=>x.id===id);
  assert.ok(p,id);
  const f=p.facts[key];
  assert.equal(f.status,'observed',id+':'+key);
  assert.equal(new URL(f.source).hostname,host,id+':'+key);
  assert.equal(f.checkedAt,'2026-11-02',id+':'+key);
  assert.ok(f.scope?.length>12&&f.text?.length>70,id+':'+key);
 }
});
test('Microsoft and Magnific payments are NOT marketed as universal Freepik/Copilot checkout',()=>{
 const rows=packs.flatMap(p=>p.products),f=id=>rows.find(x=>x.id===id).facts.payment;
 assert.match(f('microsoft-copilot').text,/地区和账户/);
 assert.match(f('freepik-ai').text,/Magnific/);
 assert.match(f('freepik-ai').text,/不推断 Freepik/);
 assert.match(f('fireworks-ai').text,/Stripe/);
 assert.match(f('fireworks-ai').text,/未确认 PayPal/);
});
test('Fireworks free trial is one-time marketing claim rather than verified entitlement or unlimited service',()=>{
 const p=packs[2].products.find(x=>x.id==='fireworks-ai');
 assert.match(p.facts.free.text,/USD 1/);
 assert.match(p.facts.free.text,/一次性/);
 assert.match(p.facts.free.text,/实时账户页面/);
 assert.ok(p.facts.free.additionalEvidence.length>0);
 assert.match(p.facts.commercial.text,/第三方模型/);
 assert.match(p.facts.company.text,/Fireworks.ai, Inc/);
});
test('public catalog still 32 products; 30 held candidate rows, 28 deduplicated vendors',()=>{
 const r=materializeCandidateCatalog(cohorts,packs);
 assert.deepEqual(r.totals,{observed:181,missing:29,conflict:0});
 assert.equal(r.candidateProducts,30);
 assert.equal(r.publisherGroups,28);
 assert.equal(r.products.find(p=>p.id==='fireworks-ai').legalEntity,'Fireworks.ai, Inc.');
 assert.ok(r.products.every(p=>p.visibleToPublic===false&&p.publishApproved===false&&p.seoIndex===false));
 for(let i=0;i<3;i++){
  const a=auditOfficialObservations(packs[i],cohorts[i],{today:'2026-11-02'});
  assert.equal(a.issues.length,0,JSON.stringify(a.issues));
  assert.equal(a.readyForPublication,false);
 }
});
