import test from 'node:test';
import assert from 'node:assert/strict';
import {currencyFromCountry} from '../lib/region-billing.mjs';
test('region-derived display currency is deterministic',()=>{
 assert.equal(currencyFromCountry('CN'),'CNY');
 for(const place of ['SG','US','GB',undefined,'XX'])assert.equal(currencyFromCountry(place),'USD');
 assert.equal(currencyFromCountry(' cn '),'CNY');
});
