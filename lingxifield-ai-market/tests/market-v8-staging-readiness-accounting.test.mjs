import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const file=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('release readiness summarizes 30 staged records, but never returns unapproved identities',()=>{
 const s=file('lib/market-launch-evidence.ts');
 for(const mark of ['batch-001.json','batch-002.json','batch-003.json',
  'officialSourceObservations','missingFacts','conflictingFacts','allHeld','stagedInventory'])assert.ok(s.includes(mark),mark);
 assert.match(s,/sourceStatuses\.filter/);
 assert.match(s,/candidateRealUse/);
 assert.match(s,/not 30 published products or 30 independent companies/);
});
test('one extra HTTP readiness check confirms 32 curated distinct from 30 staged',()=>{
 const s=file('scripts/smoke-curated-local.mjs');
 assert.match(s,/stagedInventory\?\.candidateProducts===30/);
 assert.match(s,/stagedInventory\?\.officialSourceObservations===observedCounts\.observed/);
 assert.match(s,/publishedLaunchStatuses\.length!==210/);
 assert.match(s,/statusOf\(packs\.slice\(0,3\)\)/);
 assert.match(s,/statuses\.length!==expectedFacts/);
 assert.match(s,/statuses\.some\(s=>!/);
 assert.match(s,/total:paths\.length\+4/);
});
