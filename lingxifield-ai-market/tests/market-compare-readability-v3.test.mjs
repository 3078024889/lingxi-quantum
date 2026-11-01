import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');

test('compare picks survive routes and can reload absent platform objects',async()=>{
 const page=await read('app/market-workbench.tsx');
 const api=await read('app/api/v1/platforms/[id]/route.ts');
 assert.ok(page.includes("sessionStorage.getItem('lingxifield_market_compare_v1')"));
 assert.ok(page.includes("sessionStorage.setItem('lingxifield_market_compare_v1'"));
 assert.ok(page.includes("fetch('/api/v1/platforms/'+encodeURIComponent(id)"));
 assert.ok(page.includes('compare.length>=2?<button className="compareDockStart"'));
 assert.ok(page.includes("setShowCompare(true)"));
 assert.ok(api.includes('findPlatform(id)'));
 assert.ok(api.includes('PLATFORM_NOT_FOUND'));
});

test('minimum readable text and comparison affordance are explicitly styled',async()=>{
 const css=await read('app/globals.css');
 assert.ok(css.includes('Accessibility convergence: minimum readable 14px'));
 assert.ok(css.includes('.app .matrixScroll .marketMatrixTable td'));
 assert.ok(css.includes('font-size:14px!important'));
 assert.ok(css.includes('.app .compareDockStart'));
 assert.ok(css.includes('.app .marketPlanCards'));
 assert.ok(css.includes('min-width:245px!important'));
});
