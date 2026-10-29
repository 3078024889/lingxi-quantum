import test from 'node:test';import assert from 'node:assert/strict';import {MARKET_UI_COPY} from './market-ui-copy.mjs';import {MARKET_LOCALES} from './i18n-market.mjs';
test('all nine languages contain identical complete UI keysets',()=>{
 const keys=Object.keys(MARKET_UI_COPY.zh).sort();
 assert.equal(MARKET_LOCALES.length,9);
 for(const l of MARKET_LOCALES){assert.deepEqual(Object.keys(MARKET_UI_COPY[l]).sort(),keys);for(const v of Object.values(MARKET_UI_COPY[l]))assert.ok(typeof v==='string'&&v.trim().length>0);}
});
test('non-Chinese UI does not fall back to Chinese copy',()=>{
 for(const l of MARKET_LOCALES.filter(x=>x!=='zh'))for(const k of ['headline','intro','unavailable','hubTitle','hubIntro','hubLoading','partial'])assert.notEqual(MARKET_UI_COPY[l][k],MARKET_UI_COPY.zh[k]);
});
