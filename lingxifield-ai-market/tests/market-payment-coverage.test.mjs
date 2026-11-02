import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../lib/market-researched-facts.ts',import.meta.url),'utf8');
const declaration=source.indexOf('export const RESEARCHED_FACTS');
const start=source.indexOf('={',declaration)+1;
const end=source.indexOf('};\nexport const MARKET_RESEARCH_CHECKED_AT',start)+1;
assert.ok(start>0&&end>start,'the curated facts table must have an explicit boundary');
const facts=JSON.parse(source.slice(start,end+1));

test('all 32 published products have explicit payment or no-payment answers with official evidence',()=>{
 assert.equal(Object.keys(facts).length,32);
 for(const [id,fact] of Object.entries(facts)){
  assert.ok(Array.isArray(fact.payments)&&fact.payments.length>0,id+' must have an explicit payment answer');
  assert.match(fact.paymentSource,/^https:\/\//,id+' must link to an official payment or product source');
  assert.ok(fact.payments.every(value=>typeof value==='string'&&value.trim().length>0),id+' payment answers must be readable');
  assert.ok(!fact.payments.some(value=>/待核验|待补充|TBD|placeholder/i.test(value)),id+' must not publish placeholders');
 }
});
