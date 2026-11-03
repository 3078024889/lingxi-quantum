import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PRODUCT_TASK_PHRASES} from '../lib/market-user-task-queries.mjs';
const queue=JSON.parse(readFileSync(new URL('../data/company-intake/batch-001.json',import.meta.url),'utf8'));
export function validateCompanyBatch(data,known=Object.keys(PRODUCT_TASK_PHRASES)){
 assert.match(data.batch,/^B[0-9]{3}$/);
 assert.equal(data.visibleToPublic,false);
 assert.equal(data.intakePaused,true,'review-only batch must stay paused until explicit reauthorization');
 assert.equal(data.reviewState,'candidate');
 assert.equal(data.products.length,10);
 const previous=new Set(known),ids=new Set();
 for(const p of data.products){
  assert.match(p.id,/^[a-z][a-z0-9-]{1,60}$/);
  assert.ok(!previous.has(p.id)&&!ids.has(p.id),p.id+' is already listed');
  ids.add(p.id);
  assert.ok(p.name.length>2&&p.company.length>1&&p.category.length>1,p.id);
  for(const field of ['website','evidenceUrl']){
   assert.match(p[field],/^https:\/\/[^/\s]+(?:\/|$)/,p.id+' '+field);
   assert.doesNotMatch(p[field],/@|javascript:|\.example/,p.id);
  }
  assert.ok(Array.isArray(p.tasks)&&p.tasks.length>=2,p.id);
  assert.ok(Array.isArray(p.keywords)&&p.keywords.length>=2,p.id);
  assert.deepEqual(p.verifiedFacts,{},p.id+' has unreviewed facts');
  assert.equal(p.reviewed,false);
  assert.equal(p.publishApproved,false);
 }
 return ids.size;
}
test('new company intake accepts exactly 10 independently sourced candidates',()=>{
 assert.equal(validateCompanyBatch(queue),10);
});
test('no unreviewed intake product enters the published 32-product search index',()=>{
 const repository=readFileSync(new URL('../lib/platform-repository.ts',import.meta.url),'utf8');
 assert.ok(!repository.includes('company-intake'));
});
test('intake rejects duplicate brands, public candidates and fabricated reviewed facts',()=>{
 const copy=JSON.parse(JSON.stringify(queue));copy.products[0].id=copy.products[1].id;
 assert.throws(()=>validateCompanyBatch(copy),/already listed/);
 const published={...queue,visibleToPublic:true};
 assert.throws(()=>validateCompanyBatch(published));
});
