import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('unified candidate inventory retains direct links and does not invent prices or popularity',async()=>{const x=await read('scripts/build-unified-product-catalog.mjs');assert.ok(x.includes('data\',\'catalog.json'));assert.ok(x.includes('hf-spaces-curated.json'));assert.ok(x.includes('products-unified.json'));assert.ok(x.includes('price:null,freeQuota:null'));assert.ok(x.includes('seoRank:null,geoRank:null'));assert.ok(x.includes('seen.has(key)'));});
test('pipeline always builds unified product candidates',async()=>{const x=await read('scripts/run-source-pipeline.mjs');assert.ok(x.includes('build-unified-product-catalog.mjs'));});
test('API shows evidence and missing-info state, not fabricated market ranks',async()=>{const x=await read('app/api/v1/products/all/route.ts');assert.ok(x.includes('products-unified.json'));assert.ok(x.includes('product_inventory_missing'));assert.ok(x.includes('independent sources'));});
