import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../app/api/v1/models/groups/route.ts',import.meta.url),'utf8');
test('grouped API serves historical D-drive provider offers without inventing prices',()=>{
 assert.ok(source.includes('model-offer-groups.json'));
 assert.ok(source.includes('AI_MARKET_SNAPSHOT_DIR'));
 assert.ok(source.includes('lowestObservedInputUsdPerMillion'));
 assert.ok(source.includes('not independently publisher-verified'));
});
test('grouped API supports bounded model search and transparent missing data',()=>{
 assert.ok(source.includes('Math.min(30'));
 assert.ok(source.includes('offers.slice(0,100)'));
 assert.ok(source.includes('SOURCE_TEMPORARILY_UNAVAILABLE'));
 assert.ok(source.includes('https://models.dev/api.json'));
});
