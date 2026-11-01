import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('consumer SEO/GEO board hides empty counters and only renders reviewed comparisons',async()=>{
 const board=await readFile(new URL('../app/seo-geo-board.tsx',import.meta.url),'utf8');
 const evidence=await readFile(new URL('../lib/seo-geo-observations.ts',import.meta.url),'utf8');
 assert.ok(!board.includes('seoGeoEvidenceCount'));
 assert.ok(!board.includes('coverage.measuredProducts'));
 assert.ok(board.includes('missing.length>0'));
 assert.ok(board.includes('coverage.gscObservations>0'));
 assert.ok(board.includes('coverage.independentSerpObservations>0'));
 assert.ok(board.includes('coverage.geoObservations>0'));
 assert.ok(board.includes('seoGeoEmptyStatus'));
 for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar'])assert.ok(board.includes(' '+lang+':{ownedTitle:'),lang);
 assert.ok(board.includes('groupedSeoGeo()'));
 assert.ok(evidence.includes('observations as unknown[]).filter(validObservation)'));
 assert.ok(evidence.includes('o.reviewed!==true'));
 assert.ok(evidence.includes("status:seoGeoObservations.length?'partial_evidence':'awaiting_independent_measurements'"));
 assert.ok(evidence.includes('gscImpressions'));
 assert.ok(evidence.includes('gscAveragePosition'));
 assert.ok(evidence.includes('gscCtr'));
 assert.ok(board.includes('coverage.gscObservations>0'));
 assert.ok(board.includes('Our Google Search performance'));
 assert.ok(board.includes('本站 Google 搜索表现'));
});
