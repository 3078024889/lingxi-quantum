import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditOfficialObservations} from '../lib/market-official-observations.mjs';
import {materializeCandidateCatalog} from '../lib/market-candidate-review-build.mjs';
import {regionEvidenceLevel} from '../lib/market-evidence-readiness.mjs';
import {buildOfficialGapQueue} from '../lib/market-official-gap-queue.mjs';
const load=name=>JSON.parse(readFileSync(new URL('../data/company-intake/'+name,import.meta.url),'utf8'));
const batches=['001','002','003'],cohorts=batches.map(id=>load('batch-'+id+'.json'));
const observations=batches.map(id=>load('batch-'+id+'-official-observations.json'));
const all=observations.flatMap(o=>o.products);
const record=id=>all.find(r=>r.id===id);
const checked={
 krea:['https://www.krea.ai/terms','restrictions_only','出口'],
 descript:['https://www.descript.com/terms','restrictions_only','禁运'],
 recraft:['https://www.recraft.ai/legal/terms','other_observation_not_country_proof','14天'],
 consensus:['https://consensus.app/home/terms-of-service/','other_observation_not_country_proof','地理区域'],
 'fal-ai':['https://fal.ai/legal/terms-of-service','restrictions_only','第21节'],
 'together-ai':['https://www.together.ai/terms-of-service','restrictions_only','出口'],
 'fireworks-ai':['https://fireworks.ai/terms-of-service','restrictions_only','第17节'],
 groqcloud:['https://console.groq.com/docs/legal/services-agreement','restrictions_only','Groq LLC']
};
test('eight new first-party geography observations retain their restrictive or feature-only scope',()=>{
 for(const [id,[source,level,term]] of Object.entries(checked)){
  const p=record(id),f=p?.facts?.regions;
  assert.ok(p,id);
  assert.equal(f.status,'observed',id);
  assert.equal(f.source,source,id);
  assert.equal(f.checkedAt,'2026-11-03',id);
  assert.equal(regionEvidenceLevel(f),level,id);
  assert.ok(f.text.includes(term),id+':'+term);
  assert.match(f.text,/不是|不能|并未|没有|不能据此|不能由此/,id);
  const hostname=new URL(f.source).hostname;
  assert.ok(p.officialHosts.some(h=>hostname===h||hostname.endsWith('.'+h)),id+':cross-origin');
 }
});
test('Groq legal contracting party is location-sensitive and no brand entity is inferred for all countries',()=>{
 const p=record('groqcloud');
 assert.equal(p.facts.company.status,'observed');
 assert.equal(p.facts.company.source,'https://console.groq.com/docs/legal/services-agreement');
 for(const term of ['Groq UK Limited','Groq Limited','Groq LLC','Groq Public Sector, LLC'])
  assert.ok(p.facts.company.text.includes(term),term);
 const catalog=materializeCandidateCatalog(cohorts,observations);
 const groq=catalog.products.find(p=>p.id==='groqcloud');
 assert.equal(groq.legalEntity,null);
 assert.equal(groq.facts.company.source,p.facts.company.source);
});
test('EU/EEA/UK Recraft consumer right does not imply country availability or unconditional refund',()=>{
 const r=record('recraft').facts.regions;
 assert.match(r.text,/欧盟、欧洲经济区和英国/);
 assert.match(r.text,/14天/);
 assert.match(r.text,/积分/);
 assert.equal(regionEvidenceLevel(r),'other_observation_not_country_proof');
});
test('all 30 candidate products remain held; full-region payment and end-to-end proofs still absent',()=>{
 const c=materializeCandidateCatalog(cohorts,observations);
 assert.equal(c.candidateProducts,30);
 assert.equal(c.factCells,210);
 assert.deepEqual(c.totals,{observed:202,missing:8,conflict:0});
 assert.deepEqual(c.geography,{
   missing:7,restrictions_only:15,provider_specific_restrictions:3,
   broad_market_statement:1,other_observation_not_country_proof:4,country_by_country_verified:0
 });
 assert.ok(c.products.every(p=>p.publishApproved===false&&p.visibleToPublic===false&&p.seoIndex===false));
 const queue=buildOfficialGapQueue(observations,'2026-11-03');
 assert.equal(queue.missingFields,8);
 assert.equal(queue.perField.regions,7);
 assert.equal(queue.perField.payment,1);
 assert.ok(queue.items.some(x=>x.id==='tabnine'&&x.field==='payment'));
 assert.equal(queue.notPublished,true);
});
test('new evidence passes first-party host/date/scope validator without publishing',()=>{
 observations.forEach((obs,i)=>{
  const r=auditOfficialObservations(obs,cohorts[i],{today:'2026-11-03'});
  assert.deepEqual(r.issues,[]);
  assert.equal(r.readyForEditorialReview,true);
  assert.equal(r.readyForPublication,false);
 });
 const groq=structuredClone(observations[2]);
 groq.products.find(p=>p.id==='groqcloud').facts.company.source='https://phishing.test/terms';
 const issue=auditOfficialObservations(groq,cohorts[2],{today:'2026-11-03'}).issues;
 assert.ok(issue.some(x=>x.id==='groqcloud'&&x.code==='BAD_SOURCE_OR_SCOPE'));
});
