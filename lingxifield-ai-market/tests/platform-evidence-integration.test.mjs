import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('original detail shows provenance without replacing the original visual layout',async()=>{
 const page=await read('app/market-workbench.tsx');
 assert.ok(page.includes('<PlatformEvidence website={target.website}/>'));
 assert.ok(page.includes('detailGrid'));
 assert.ok(page.includes('团队与融资'));
 assert.ok(page.includes('免费认领 / 补充资料'));
});
test('product evidence endpoint uses exact hostname matching and the local unified catalog',async()=>{
 const api=await read('app/api/v1/products/evidence/route.ts');
 assert.ok(api.includes('products-unified.json'));
 assert.ok(api.includes('exact_normalized_hostname_only'));
 assert.ok(api.includes('verified:false'));
 assert.ok(api.includes('matches:[]'));
});
test('detail evidence never substitutes price or issuer verification',async()=>{
 const cmp=await read('app/platform-evidence.tsx');
 assert.ok(cmp.includes('不代表厂商身份或收费已核验'));
 assert.ok(cmp.includes('价格、免费额度及地区使用条件仍须单独核验'));
});
