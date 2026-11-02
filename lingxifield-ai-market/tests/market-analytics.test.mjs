import test from 'node:test';
import assert from 'node:assert/strict';
import {coverageReport,comparableRanking,platformTimeline} from '../lib/market-analytics.mjs';
function rec(id,platformId,value,changes={}){return {id,platformId,metric:'monthly_visits',value,unit:'visits',region:'global',provider:'example-source',sourceUrl:'https://example.com/source',collectedAt:'2026-10-29T00:00:00Z',periodStart:'2026-09-01',periodEnd:'2026-09-30',methodology:'same research method',evidenceKind:'third_party',status:'verified',...changes}}
const a=rec('a','a',100),b=rec('b','b',200),c=rec('c','c',1000,{provider:'unrelated-provider'});
test('empty coverage reports absence explicitly',()=>{assert.equal(coverageReport({}).dataStatus,'no_verified_market_data');assert.equal(coverageReport({}).verifiedRecords,0)});
test('verified coverage counts distinct platforms',()=>{let x=coverageReport({evidence:[a,b,rec('d','a',300)]});assert.equal(x.byMetric.monthly_visits.coveredPlatforms,2)});
test('different sources do not silently mix in one ranking',()=>{const x=comparableRanking([a,b,c]);assert.equal(x.total,2);assert.equal(x.excludedVerifiedRecords,1);assert.deepEqual(x.items.map(r=>r.platformId),['b','a'])});
test('period differences are separate cohorts',()=>{const x=comparableRanking([a,b,rec('d','d',5000,{periodStart:'2026-08-01',periodEnd:'2026-08-31'})]);assert.equal(x.total,2)});
test('pending and disputed values excluded',()=>{assert.equal(comparableRanking([rec('d','d',500,{status:'pending'})]).total,0)});
test('same platform retains newest verified observation',()=>{const x=comparableRanking([a,rec('new','a',900,{collectedAt:'2026-10-30T00:00:00Z'})]);assert.equal(x.items[0].value,900)});
test('no fabricated rankings with no data',()=>{assert.equal(comparableRanking([]).status,'no_verified_comparable_records')});
test('invalid metric rejected',()=>assert.throws(()=>comparableRanking([],{metric:'fake'}),/INVALID_METRIC/));
test('timeline limits entries and only verified values',()=>{const x=platformTimeline([a,b,rec('d','a',500,{status:'pending'})],{platformId:'a',metric:'monthly_visits'});assert.equal(x.total,1)});
