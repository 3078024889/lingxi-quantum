import test from 'node:test';
import assert from 'node:assert/strict';
import {currencyFromCountry} from '../lib/region-billing.mjs';
test('region-derived display currency is deterministic',()=>{
 assert.equal(currencyFromCountry('CN'),'CNY');
 for(const place of ['SG','US','GB',undefined,'XX'])assert.equal(currencyFromCountry(place),'USD');
 assert.equal(currencyFromCountry(' cn '),'CNY');
});

test('all market routes use server regional quote and never expose a manual billing currency selector',async()=>{
 const {readFile}=await import('node:fs/promises');
 const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
 for(const path of ['app/page.tsx','app/[lang]/ai/page.tsx','app/platform/[id]/page.tsx']){
  const source=await read(path);
  assert.ok(source.includes('currencyFromCountry('),path);
  assert.ok(source.includes('initialCurrency='),path);
 }
 const client=await read('app/market-workbench.tsx');
 assert.ok(!client.includes('aria-label="Billing currency"'));
 assert.ok(client.includes('currency=initialCurrency'));
});
