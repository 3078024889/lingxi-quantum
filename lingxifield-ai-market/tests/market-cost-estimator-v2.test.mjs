import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {estimateApiBatchCost,estimateApiUsageCost} from '../lib/market-cost-math.ts';
import {VIDEO_RATES,API_RATES,estimateKnownVideoRate} from '../lib/market-rate-catalog.ts';
const findVideo=id=>VIDEO_RATES.find(x=>x.id===id);
const findApi=id=>API_RATES.find(x=>x.id===id);
test('MiniMax H3 priced 768p and 2K source rows, 4–15 seconds only',()=>{
 for(const [quality,amount] of [['768p',0.08],['2K',0.13]]){
  const row=findVideo('minimax-h3-api-'+quality);
  assert.equal(row?.perSecond,amount);
  assert.equal(row?.currency,'USD');
  assert.equal(row?.region,'API');
  assert.equal(row?.checkedAt,'2026-11-04');
  assert.match(row?.source||'',/^https:\/\/platform\.minimax\.io\//);
  assert.equal(estimateKnownVideoRate(row,3,1),null);
  assert.equal(estimateKnownVideoRate(row,16,1),null);
 }
});
test('H3 billable total has distinct output, input-video and over-five image fees',()=>{
 const r=findVideo('minimax-h3-api-768p');
 const e=estimateKnownVideoRate(r,5,2,3,7);
 assert.equal(e.kind,'money');
 assert.equal(e.outputSeconds,10);
 assert.equal(e.billableSeconds,16);
 assert.ok(Math.abs(e.inputMediaCost-0.48)<1e-9);
 assert.ok(Math.abs(e.inputImageCost-0.16)<1e-9);
 assert.ok(Math.abs(e.amount-1.44)<1e-9);
 assert.ok(Math.abs(estimateKnownVideoRate(r,5,2,0,5).amount-0.8)<1e-9);
 assert.equal(estimateKnownVideoRate(r,5,2,16),null);
 assert.equal(estimateKnownVideoRate(r,5,2,0,-1),null);
});
test('Original 32 products and unpublished B006 have separate identities',()=>{
 const curated=readFileSync(new URL('../lib/market-api-service-catalog.ts',import.meta.url),'utf8');
 assert.match(curated,/const ALL=\[/);
 assert.equal([...curated.matchAll(/'(?:[a-z][a-z0-9-]+)'/g)].length>32,true);
 const intake=JSON.parse(readFileSync(new URL('../data/company-intake/batch-006.json',import.meta.url),'utf8'));
 assert.equal(intake.visibleToPublic,false);
 assert.equal(intake.products.length,10);
 assert.ok(intake.products.every(p=>p.publishApproved===false&&p.reviewed===false));
});
test('Mistral, Cohere and MiniMax text prices use verified exact model IDs',()=>{
 for(const [id,inRate,outRate] of [
  ['mistral-small4-api',0.15,0.6],
  ['cohere-command-a-api',2.5,10],
  ['minimax-m27-api',0.3,1.2]
 ]){
  const row=findApi(id);
  assert.equal(row?.inPerMillion,inRate);
  assert.equal(row?.outPerMillion,outRate);
  assert.equal(row?.checkedAt,'2026-11-04');
  assert.match(row?.source||'',/^https:\/\//);
 }
 assert.ok(Math.abs(estimateApiUsageCost(2000,500,0.15,0.6)-0.0006)<1e-12);
 assert.ok(Math.abs(estimateApiBatchCost(2000,500,100,0.15,0.6)-0.06)<1e-12);
 assert.equal(estimateApiBatchCost(2000,500,0,0.15,0.6),null);
 assert.equal(estimateApiBatchCost(2000,500,1.2,0.15,0.6),null);
 assert.equal(estimateApiBatchCost(-1,500,10,0.15,0.6),null);
 assert.equal(estimateApiBatchCost(2000,500,2,NaN,0.6),null);
 assert.equal(estimateApiBatchCost(2000,500,2,Infinity,0.6),null);
});
test('Calculator does not prefill unknown provider prices, and long table is optional',()=>{
 const ui=readFileSync(new URL('../app/market-cost-estimator.tsx',import.meta.url),'utf8');
 assert.match(ui,/estimateApiBatchCost\(/);
 assert.match(ui,/estimateKnownVideoRate\(rate,sec,count,inSeconds,images\)/);
 assert.match(ui,/availableApiProviders/);
 assert.match(ui,/<details className="lxApiDirectory">/);
 assert.match(ui,/tx\.calls/);
 assert.match(ui,/tx\.images/);
 assert.match(ui,/tx\.minute/);
 for(const l of ['zh','en','ja','ko','fr','de','es','pt','ar'])assert.match(ui,new RegExp('\\b'+l+':\\{calls:'));
});
