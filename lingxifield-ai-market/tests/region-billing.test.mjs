import test from 'node:test';
import assert from 'node:assert/strict';
import {currencyFromCountry} from '../lib/region-billing.mjs';

test('geo location chooses a default, not a compulsory checkout currency',()=>{
 assert.equal(currencyFromCountry('CN'),'CNY');
 for(const place of ['SG','US','GB',undefined,'XX'])assert.equal(currencyFromCountry(place),'USD');
 assert.equal(currencyFromCountry(' cn '),'CNY');
});

test('all market routes retain country-derived initial currency and user can switch',async()=>{
 const {readFile}=await import('node:fs/promises');
 const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
 for(const path of ['app/page.tsx','app/[lang]/ai/page.tsx','app/platform/[id]/page.tsx']){
  const source=await read(path);
  assert.ok(source.includes('currencyFromCountry('),path);
  assert.ok(source.includes('initialCurrency='),path);
 }
 const client=await read('app/market-workbench.tsx');
 assert.match(client,/aria-label="Billing currency"/);
 assert.match(client,/setCurrency\(e\.target\.value as Currency\)/);
 assert.match(client,/currency==='CNY'\?'¥':'\$'/);
});

test('vendor price API is server quoted, 1:1 nominal and cannot enable checkout without settlement',async()=>{
 const {readFile}=await import('node:fs/promises');
 const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
 const catalog=await read('lib/v2.ts');
 const api=await read('app/api/v1/commercial-plans/route.ts');
 for(const [id,price] of [['listing',0],['sponsored',49],['category',149],['brand',299],['geo',29]]){
  assert.ok(catalog.includes(`id:'${id}',amount:${price},`),id);
 }
 assert.match(api,/nominalParity:true/);
 assert.match(api,/exchangeRateApplied:false/);
 assert.match(api,/paymentEnabled:false/);
 assert.match(api,/checkoutEnabled:false/);
 assert.match(api,/chosen!==null && chosen!=='CNY' && chosen!=='USD'/);
});
