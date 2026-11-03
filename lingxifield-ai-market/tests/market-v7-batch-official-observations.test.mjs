import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditOfficialObservations} from '../lib/market-official-observations.mjs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const pack=read('data/company-intake/batch-001-official-observations.json');
const batch=read('data/company-intake/batch-001.json');
test('ten candidates each have seven explicit sourced/missing observations; no publishing',()=>{
 const r=auditOfficialObservations(pack,batch);
 assert.deepEqual(r.issues,[]);assert.equal(r.products,10);
 assert.equal(r.observed+r.missing+r.conflict,70);
 assert.equal(r.readyForEditorialReview,true);
 assert.equal(r.readyForPublication,false);
 assert.equal(r.conflict,0); // verified current-vs-legacy source differences are resolved
});
test('changes to manufacturer source hosts cannot launder fake pricing',()=>{
 const v=structuredClone(pack);v.products[0].facts.price.source='https://cursor.com.attacker.invalid/price';
 assert.ok(auditOfficialObservations(v,batch).issues.some(x=>x.code==='BAD_SOURCE_OR_SCOPE'));
 const forged=structuredClone(pack);forged.products[0].officialHosts=['attacker.invalid'];
 forged.products[0].facts.price.source='https://attacker.invalid/special';
 assert.ok(auditOfficialObservations(forged,batch).issues.some(x=>x.code==='INVALID_PUBLISHER_HOST_PIN'));
});
test('future-dated claims and arbitrary products are rejected',()=>{
 const v=structuredClone(pack);v.products[1].facts.price.checkedAt='2027-01-01';
 assert.ok(auditOfficialObservations(v,batch).issues.some(x=>x.code==='BAD_SOURCE_OR_SCOPE'));
 const w=structuredClone(pack);w.products[0].id='unknown-company';
 assert.ok(auditOfficialObservations(w,batch).issues.some(x=>x.code==='UNKNOWN_OR_DUPLICATE_ID'));
});
test('Pika and Cursor current plans retain legacy evidence without implying approval',()=>{
 const p=pack.products.find(x=>x.id==='pika'),c=pack.products.find(x=>x.id==='cursor');
 assert.equal(p.facts.free.status,'observed');
 assert.equal(c.facts.price.status,'observed');
 assert.match(p.facts.free.text,/0 积分/);
 assert.ok(c.facts.price.text.includes('Plus $8'));
 assert.ok(c.facts.price.text.includes('Pro $20'));
 assert.ok(p.facts.free.additionalEvidence.some(x=>x.source==='https://old.pika.art/pricing'));
 assert.ok(c.facts.price.additionalEvidence.some(x=>x.source==='https://prod.cursor.com/docs/models-and-pricing'));
 assert.equal(pack.products.every(x=>x.reviewStatus==='unapproved'),true);
 assert.equal(batch.products.every(x=>x.reviewed===false&&x.publishApproved===false),true);
});
test('candidate pack alone cannot change canonical public catalog',()=>{
 const s=readFileSync(new URL('../lib/platform-repository.ts',import.meta.url),'utf8');
 assert.doesNotMatch(s,/batch-001-official-observations/);
 assert.ok(batch.products.every(x=>x.reviewed===false&&x.publishApproved===false));
});

test('Canva and Leonardo are two products but one ownership group, not two unrelated corporations',()=>{
 const relation=pack.publisherOwnership.find(x=>x.productId==='leonardo');
 assert.equal(relation.relatedCandidateProductId,'canva-magic-studio');
 assert.equal(relation.parentGroup,'Canva');
 assert.equal(relation.legalEntity,'Leonardo Interactive Pty Ltd');
 const r=auditOfficialObservations(pack,batch);assert.equal(r.ownershipRelations,2);
});
test('ownership relation cannot point to unknown parent or forged external evidence host',()=>{
 const forged=structuredClone(pack);
 forged.publisherOwnership[1].relatedCandidateProductId='fake-brand';
 assert.ok(auditOfficialObservations(forged,batch).issues.some(x=>x.code==='UNSUPPORTED_PARENT_OWNERSHIP_SOURCE'));
 const spoof=structuredClone(pack);
 spoof.publisherOwnership[0].evidenceUrl='https://fake-space-company.invalid/acquired';
 assert.ok(auditOfficialObservations(spoof,batch).issues.some(x=>x.code==='UNSUPPORTED_PARENT_OWNERSHIP_SOURCE'));
});
