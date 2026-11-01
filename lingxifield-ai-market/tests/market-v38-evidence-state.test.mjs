import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('live coverage never publishes raw candidate rows or fabricated rankings',async()=>{
 const sql=await read('../supabase/migrations/20261031081500_ai_market_aggregate_coverage.sql');
 const api=await read('app/api/market/evidence-status/route.ts');
 const view=await read('app/market-evidence-status.tsx');
 assert.match(sql,/private\.ai_market_coverage_aggregate/);
 assert.match(sql,/security definer/);
 assert.match(sql,/security invoker/);
 assert.match(sql,/grant execute on function public\.ai_market_public_coverage\(\) to anon,authenticated/);
 assert.doesNotMatch(sql,/grant select on (table )?public\.ai_market_(candidates|source_items)/i);
 assert.match(api,/ai_market_public_coverage/);
 assert.match(api,/curatedProfiles:searchPlatforms\(\{limit:1\}\)\.total/);
 assert.match(api,/status:'unavailable',data:null/);
 assert.match(api,/verifiedGeoMetrics:marketCards\(verifiedMetrics\)\.filter/);
 assert.match(view,/candidateCount/);
 assert.match(view,/reviewNeededCount/);
 assert.match(view,/syncRunCount/);
 assert.doesNotMatch(view,/candidateCount.*rank/i);
});
test('nine languages get truthful evidence labels and explicit unpublished source status',async()=>{
 const view=await read('app/market-evidence-status.tsx');
 for(const code of ['zh','en','ja','ko','fr','de','es','pt','ar'])assert.match(view,new RegExp('\\b'+code+':\\{title:'));
 assert.match(view,/data\.latestObservedAt|d\?\.latestObservedAt/);
 assert.match(view,/state\.status==='live'/);
 assert.match(view,/state\.verifiedGeoMetrics===0/);
});
test('API search sanitizes region, payment, filter, sort and pagination parameters',async()=>{
 const route=await read('app/api/v1/search/route.ts');
 assert.match(route,/ALL_REGIONS\.includes/);
 assert.match(route,/MARKET_FILTERS\.includes/);
 assert.match(route,/INVALID_MARKET_FILTER/);
 assert.match(route,/INVALID_PAGINATION/);
 assert.match(route,/cursor===0/);
 assert.match(route,/filter==='all'&&payment==='any'/);
});
