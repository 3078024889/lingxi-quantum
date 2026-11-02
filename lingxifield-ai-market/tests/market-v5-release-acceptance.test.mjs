import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditCuratedUseAcceptance,evaluatePublicationGates} from '../lib/market-launch-gates.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const items=JSON.parse(read('data/acceptance/curated-32-use.json')).items;
const products=[...read('lib/market-api-service-catalog.ts').match(/const ALL=\[([^\]]+)\] as const;/)[1].matchAll(/'([^']+)'/g)].map(x=>x[1]);
test('exact 32 human-use checklist stays unpassed until real task evidence is attached',()=>{
 const r=auditCuratedUseAcceptance(items,products);
 assert.equal(products.length,32);assert.equal(r.expected,32);assert.equal(r.covered,32);
 assert.equal(r.verifiedRealUse,0);assert.equal(r.pendingIds.length,32);assert.deepEqual(r.invalidIds,[]);
 assert.equal(r.allVerified,false);
});
test('a real-use HEAD or a fake passed flag cannot make a paid platform releasable',()=>{
 const fake={...items[0],status:'passed',testedAt:'2026-11-02T00:00:00Z',evidence:['https://official.example.org'],cases:[]};
 const check=auditCuratedUseAcceptance([fake,...items.slice(1)],products);
 assert.deepEqual(check.invalidIds,[items[0].id]);assert.equal(check.allVerified,false);
 const release=evaluatePublicationGates({inventory:{curated:32},uses:check,seo:{verifiedObservations:0,verifiedOwnership:false},
  merchant:{verifiedSettlement:false,refundAndRevocation:false},mobile:{nineLocalesRealBrowser:false},realSite:{verifiedPublicProduction:false}});
 assert.equal(release.goLive,false);assert.equal(release.canPublishNext10,false);assert.ok(release.blocking.length>=5);
});
test('candidate 10 staging exists but never appears in published catalog until acceptance',()=>{
 const intake=JSON.parse(read('data/company-intake/batch-001.json'));
 assert.equal(intake.products.length,10);assert.equal(intake.intakePaused,true);
 assert.equal(intake.visibleToPublic,false);assert.ok(intake.products.every(x=>x.publishApproved===false));
 const src=read('lib/platform-repository.ts');assert.ok(!src.includes('company-intake/batch'));
});
test('readiness API and command line are transparent, independently typed and not a payment switch',()=>{
 const api=read('app/api/v1/launch-readiness/route.ts'),script=read('scripts/validate-32-launch.mjs');
 assert.match(api,/marketLaunchEvidence\(\)/);assert.match(api,/no-store/);
 assert.match(script,/--strict/);assert.match(script,/UNAPPROVED_NEXT_BATCH_LEAK/);
 assert.doesNotMatch(api,/AI_MARKET_BILLING_ENABLED|AI_MARKET_INDEX_READY/);
});
