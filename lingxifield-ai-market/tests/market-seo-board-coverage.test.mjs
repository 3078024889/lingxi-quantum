import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('consumer SEO/GEO board hides empty counters and only renders reviewed comparisons',async()=>{
 const board=await readFile(new URL('../app/seo-geo-board.tsx',import.meta.url),'utf8');
 const evidence=await readFile(new URL('../lib/seo-geo-observations.ts',import.meta.url),'utf8');
 assert.ok(!board.includes('seoGeoEvidenceCount'));
 assert.ok(!board.includes('coverage.measuredProducts'));
 assert.ok(board.includes('coverage.verifiedObservations===0'));
 assert.ok(board.includes('groupedSeoGeo()'));
 assert.ok(evidence.includes('observations as unknown[]).filter(validObservation)'));
 assert.ok(evidence.includes('o.reviewed!==true'));
 assert.ok(evidence.includes("status:seoGeoObservations.length?'partial_evidence':'awaiting_independent_measurements'"));
});
