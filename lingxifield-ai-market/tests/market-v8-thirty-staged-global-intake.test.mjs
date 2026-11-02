import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditGlobalIntake} from '../lib/market-global-intake.mjs';
const load=p=>JSON.parse(readFileSync(new URL('../data/company-intake/'+p,import.meta.url),'utf8'));
const cohorts=[1,2,3].map(i=>load('batch-00'+i+'.json'));
const observations=[1,2,3].map(i=>load('batch-00'+i+'-official-observations.json'));
const ids=[...readFileSync(new URL('../lib/market-api-service-catalog.ts',import.meta.url),'utf8')
 .match(/const ALL=\[([^\]]+)\] as const;/)[1].matchAll(/'([^']+)'/g)].map(x=>x[1]);
test('stage 20 new from 2 batches, preserve earlier 10, and publish none of all 30',()=>{
 const r=auditGlobalIntake(cohorts,observations,ids);
 assert.deepEqual(r.issues,[]);
 assert.equal(r.publishedProducts,32);
 assert.equal(r.stagedProducts,30);assert.equal(r.stagedBatches,3);
 assert.equal(r.readyForPublicRelease,false);assert.equal(r.publishEligible,0);
 assert.equal(r.reviews.reduce((n,v)=>n+v.products,0),30);
 assert.equal(r.officialPageObservations+r.missing+r.conflicts,210);
 assert.ok(r.officialPageObservations>=80);
});
test('double-listing Windsurf and Devin Desktop as separate products is blocked',()=>{
 const bad=structuredClone(cohorts),extra=bad[2].products[0];
 extra.aliases=['windsurf'];
 const r=auditGlobalIntake(bad,observations,ids);
 assert.ok(r.issues.some(x=>x.code==='BRAND_ALIAS_COLLISION'||x.code==='REDUNDANT_BRAND_ALIAS'));
});
test('no duplicate entries with published 32 or another batch; no forged official discovery dates',()=>{
 const bad=structuredClone(cohorts);bad[2].products[0].id=ids[0];
 assert.equal(auditGlobalIntake(bad,observations,ids).allBatchesSafe,false);
 const d=structuredClone(cohorts);d[1].products[0].discoveredAt='2099-01-01';
 assert.ok(auditGlobalIntake(d,observations,ids).issues.some(x=>x.code==='INVALID_DISCOVERY_PROVENANCE'));
});
test('corporate group is not inferred from product name; GitHub and Microsoft, Tabnine Tricentis are distinct branded products',()=>{
 const p=cohorts.flatMap(x=>x.products);
 const by=id=>p.find(x=>x.id===id);
 assert.equal(by('github-copilot').publisherGroupId,by('microsoft-copilot').publisherGroupId);
 assert.equal(by('tabnine').publisherGroupId,'tricentis');
 assert.equal(by('devin-desktop').aliases[0],'windsurf');
 assert.equal(new Set(p.map(x=>x.id)).size,30);
 assert.ok(p.every(x=>x.publishApproved===false&&x.reviewed===false));
});
test('unapproved cohorts never participate in publicly indexed product search or ranking',()=>{
 const source=readFileSync(new URL('../lib/platform-repository.ts',import.meta.url),'utf8');
 for(const batch of ['batch-001.json','batch-002.json','batch-003.json'])assert.ok(!source.includes(batch),batch);
 const api=readFileSync(new URL('../app/api/v1/search/route.ts',import.meta.url),'utf8');
 assert.ok(!api.includes('batch-002'));assert.ok(!api.includes('batch-003'));
});
