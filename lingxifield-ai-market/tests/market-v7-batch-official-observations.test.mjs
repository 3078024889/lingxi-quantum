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
 assert.ok(r.conflict>=2);
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
test('conflicts remain explicit; old Pika free quota and legacy Cursor pricing never silently become approved',()=>{
 const p=pack.products.find(x=>x.id==='pika'),c=pack.products.find(x=>x.id==='cursor');
 assert.equal(p.facts.free.status,'conflict');assert.equal(c.facts.price.status,'conflict');
 assert.match(p.facts.free.conflictingSource,/pika\.art\/faq/);
 assert.match(c.facts.price.conflictingSource,/prod\.cursor\.com/);
 assert.match(p.facts.free.text,/150/);assert.match(p.facts.free.text,/0/);
 assert.match(c.facts.price.text,/Plus \$8/);assert.match(c.facts.price.text,/Pro \$20/);
});
test('candidate pack alone cannot change canonical public catalog',()=>{
 const s=readFileSync(new URL('../lib/platform-repository.ts',import.meta.url),'utf8');
 assert.doesNotMatch(s,/batch-001-official-observations/);
 assert.ok(batch.products.every(x=>x.reviewed===false&&x.publishApproved===false));
});
