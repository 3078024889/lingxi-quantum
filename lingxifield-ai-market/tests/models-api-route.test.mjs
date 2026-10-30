import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const api=await readFile(new URL('../app/api/v1/models/route.ts',import.meta.url),'utf8');
const page=await readFile(new URL('../app/models/page.tsx',import.meta.url),'utf8');
test('models API retains source, bounds pages and does not claim official verification',()=>{
 assert.ok(api.includes('https://models.dev/api.json'));
 assert.ok(api.includes('Math.min(50'));
 assert.ok(api.includes('third_party_aggregated_unverified_against_provider'));
 assert.ok(api.includes('SOURCE_UNAVAILABLE'));
});
test('models discovery page has search, paging, source disclosure',()=>{
 assert.ok(page.includes('搜索模型'));
 assert.ok(page.includes('下一页'));
 assert.ok(page.includes('models.dev'));
});
