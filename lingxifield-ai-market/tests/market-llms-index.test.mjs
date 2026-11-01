import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('machine-readable directory exposes only curated products and evidence rules',async()=>{
 const route=await readFile(new URL('../app/llms.txt/route.ts',import.meta.url),'utf8');
 assert.match(route,/searchPlatforms\(\{limit:32\}\)/);
 assert.match(route,/coverageForSeoGeo\(\)/);
 assert.match(route,/marketLocales/);
 assert.match(route,/Directory order is not a global popularity ranking/);
 assert.match(route,/Missing facts are omitted rather than estimated or fabricated/);
 assert.match(route,/Sponsored placements/);
 assert.match(route,/reviewed observations only/);
 assert.match(route,/Cache-Control/);
 assert.doesNotMatch(route,/B001|future vendor candidates|intakePaused/);
});
