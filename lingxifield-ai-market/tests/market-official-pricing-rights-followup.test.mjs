import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditOfficialObservations} from '../lib/market-official-observations.mjs';
import {buildEvidenceReadiness} from '../lib/market-evidence-readiness.mjs';
const load=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const b1=load('data/company-intake/batch-001.json');
const b2=load('data/company-intake/batch-002.json');
const b3=load('data/company-intake/batch-003.json');
const o1=load('data/company-intake/batch-001-official-observations.json');
const o2=load('data/company-intake/batch-002-official-observations.json');
const o3=load('data/company-intake/batch-003-official-observations.json');
const get=(pack,id)=>pack.products.find(p=>p.id===id);
test('Cursor current 2026 subscription cannot be conflated with retired subscription billing',()=>{
 const row=get(o1,'cursor');
 assert.equal(row.reviewStatus,'unapproved');
 assert.equal(row.facts.price.status,'observed');
 assert.match(row.facts.price.text,/Plus \$8\/月/);
 assert.match(row.facts.price.text,/旧 Cursor Pro \$20\/月/);
 assert.match(row.facts.price.text,/Premium 起第三方模型按 API 另计费/);
 assert.equal(row.facts.price.source,'https://cursor.com/pricing');
 assert.equal(row.facts.price.additionalEvidence[0].source,'https://prod.cursor.com/docs/models-and-pricing');
 assert.equal(row.facts.commercial.source,'https://cursor.com/en-US/terms-of-service');
 assert.match(row.facts.commercial.text,/第三方/);
 assert.equal(row.facts.commercial.status,'observed');
});
test('Pika new Free has zero recurring credits and current multimodal models; old Pika remains historical',()=>{
 const row=get(o1,'pika');
 assert.equal(row.facts.free.status,'observed');
 assert.match(row.facts.free.text,/0 积分/);
 assert.match(row.facts.free.text,/购买积分/);
 assert.match(row.facts.free.text,/不能用于新版/);
 assert.equal(row.facts.free.source,'https://pika.art/pricing');
 assert.ok(row.facts.free.additionalEvidence.some(x=>x.source==='https://old.pika.art/pricing'));
 assert.equal(row.facts.models.status,'observed');
 assert.equal(row.facts.models.source,'https://pika.art/faq');
 assert.match(row.facts.models.text,/Seedance 2\.5/);
 assert.match(row.facts.models.text,/API Club/);
});
test('Copilot payment and commercial licensing carefully scope account type and third-party IP',()=>{
 const row=get(o2,'github-copilot');
 assert.equal(row.reviewStatus,'unapproved');
 assert.equal(row.facts.payment.status,'observed');
 assert.equal(row.facts.payment.source,'https://docs.github.com/en/billing/reference/supported-payment-methods');
 assert.match(row.facts.payment.text,/PayPal/);
 assert.match(row.facts.payment.text,/账户/);
 assert.match(row.facts.payment.text,/不能宣称/);
 assert.equal(row.facts.commercial.status,'observed');
 assert.equal(row.facts.commercial.source,'https://github.com/features/copilot/');
 assert.match(row.facts.commercial.text,/第三方/);
 assert.match(row.facts.commercial.text,/许可证/);
});
test('three held batches remain safe and full 7-field observation counts reconcile',()=>{
 const reports=[[b1,o1],[b2,o2],[b3,o3]].map(([b,o])=>auditOfficialObservations(o,b,{today:'2026-11-03'}));
 for(const r of reports){
  assert.equal(r.issues.length,0,JSON.stringify(r.issues));
  assert.equal(r.readyForPublication,false);
 }
 const source=read('lib/market-api-service-catalog.ts');
 const ids=[...source.match(/const ALL=\[([^\]]+)\] as const;/)[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);
 const f=read('lib/market-researched-facts.ts');
 const start=f.indexOf('={',f.indexOf('RESEARCHED_FACTS:'))+1;
 const end=f.indexOf('};\nexport const MARKET_RESEARCH_CHECKED_AT',start)+1;
 const facts=JSON.parse(f.slice(start,end));
 const r=buildEvidenceReadiness({curatedIds:ids,curatedFacts:facts,cohorts:[b1,b2,b3],observations:[o1,o2,o3],asOf:'2026-11-03'});
 assert.deepEqual([r.candidateIntake.observed,r.candidateIntake.missing,r.candidateIntake.conflict],[202,8,0]);
 assert.equal(r.candidateIntake.products,30);
 assert.deepEqual(r.candidateIntake.regionalEvidence,{
  missing:7,broad_market_statement:1,provider_specific_restrictions:3,
  restrictions_only:15,other_observation_not_country_proof:4
 });
 assert.equal(r.candidateIntake.publishReady,0);
 assert.equal(r.safety.structurallyValid,true,JSON.stringify(r.safety.structuralIssues));
});
