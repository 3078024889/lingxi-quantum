import test from 'node:test';import assert from 'node:assert/strict';
import{readFileSync}from'node:fs';
import {auditCandidateCohort} from '../lib/market-candidate-intake.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const batch=JSON.parse(read('data/company-intake/batch-001.json'));
const ids=[...read('lib/market-api-service-catalog.ts').match(/const ALL=\[([^\]]+)\] as const;/)[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);
test('next 10 candidate companies are staged, not published; visible SEO phrase corruption is eliminated',()=>{
 const audit=auditCandidateCohort(batch,ids);
 assert.equal(audit.count,10);assert.equal(audit.stagingSafe,true);
 assert.equal(audit.publishEligible,0);
 assert.equal(batch.products.every(p=>p.publishApproved===false),true);
 assert.ok(batch.products.every(p=>p.keywords.every(x=>!x.includes('AIAI'))));
});
test('an unverified company may never auto-publish or impersonate existing 32',()=>{
 const duplicate=structuredClone(batch);duplicate.products[0].id=ids[0];
 const a=auditCandidateCohort(duplicate,ids);
 assert.equal(a.stagingSafe,false);assert.equal(a.publishEligible,0);
 assert.ok(a.issues.some(i=>i.code==='DUPLICATE_OR_PUBLISHED'));
 const compromised=structuredClone(batch);compromised.visibleToPublic=true;compromised.products[0].publishApproved=true;
 assert.equal(auditCandidateCohort(compromised,ids).stagingSafe,false);
});
test('official facts must carry evidence URL and date, never infer unlisted financing or missing prices',()=>{
 const good=structuredClone(batch),p=good.products[0];
 for(const field of ['price','free','models','regions','commercial','payment','company'])
 p.verifiedFacts[field]={status:'not_applicable',source:'https://vendor.example.org/source',
  checkedAt:'2026-11-02',reason:'No applicable separately priced product'};
 p.reviewed=true;p.publishApproved=true;
 const a=auditCandidateCohort(good,ids);
 assert.equal(a.publishEligible,1);
 assert.equal(a.stagingSafe,false);
 p.verifiedFacts.price.source='javascript:alert(1)';
 assert.ok(auditCandidateCohort(good,ids).issues.some(x=>x.id===p.id&&x.code==='MISSING_VERIFIED_FIELDS'));
});
