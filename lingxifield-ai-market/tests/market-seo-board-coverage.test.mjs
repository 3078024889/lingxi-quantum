import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('SEO/GEO board renders counts from reviewed evidence, never invented rank totals',async()=>{
 const board=await readFile(new URL('../app/seo-geo-board.tsx',import.meta.url),'utf8');
 const evidence=await readFile(new URL('../lib/seo-geo-observations.ts',import.meta.url),'utf8');
 assert.ok(board.includes('coverage.seoObservations'));
 assert.ok(board.includes('coverage.geoObservations'));
 assert.ok(board.includes('coverage.measuredProducts'));
 assert.ok(evidence.includes('observations as unknown[]).filter(validObservation)'));
 assert.ok(evidence.includes('o.reviewed!==true'));
 assert.ok(evidence.includes("status:seoGeoObservations.length?'partial_evidence':'awaiting_independent_measurements'"));
 assert.ok(!board.includes('globalRank'));
 assert.ok(!board.includes('worldwideRank'));
});
