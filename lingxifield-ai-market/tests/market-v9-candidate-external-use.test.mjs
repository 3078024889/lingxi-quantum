import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import{auditCandidateRealUseAcceptance}from '../lib/market-candidate-use-acceptance.mjs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const b=[1,2,3].map(i=>read('data/company-intake/batch-00'+i+'.json'));
const ids=b.flatMap(x=>x.products.map(p=>p.id));
const ledger=read('data/acceptance/candidate-30-real-use.json');
test('30 staged products are not misrepresented as real vendor workflow successes',()=>{
 const result=auditCandidateRealUseAcceptance(ledger,ids);
 assert.deepEqual(result.issues,[]);assert.equal(result.expected,30);
 assert.equal(result.verified,0);assert.equal(result.pending,30);
 assert.equal(result.allPassed,false);
});
test('no sign-in, generated output, exported file or paid transaction without evidence',()=>{
 for(const r of ledger.items){
  assert.equal(r.productionEligible,false);
  for(const key of ['signIn','runTask','inspectOutput','exportDownload','billingCheckout']){
   assert.equal(r.checks[key].status,'not_run');
   assert.equal(r.checks[key].outputEvidence,null);
  }
 }
 const bad=structuredClone(ledger);
 bad.items[0].checks.runTask.status='passed';
 assert.ok(auditCandidateRealUseAcceptance(bad,ids).issues.some(x=>x.code==='UNPROVEN_REAL_USE_CHECK'));
});

test('date defaults in cohort auditors track the current date without allowing future-dated documents',()=>{
 const root=readFileSync(new URL('../lib/market-global-intake.mjs',import.meta.url),'utf8');
 const official=readFileSync(new URL('../lib/market-official-observations.mjs',import.meta.url),'utf8');
 assert.match(root,/today=new Date\(\)\.toISOString\(\)\.slice\(0,10\)/);
 assert.match(official,/today=new Date\(\)\.toISOString\(\)\.slice\(0,10\)/);
});
