import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {matchGscProductPage} from '../scripts/parse-gsc-product-route.mjs';
const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
test('Google Search Console page must match exact owned marketplace host and known product',()=>{
 const ids=new Set(['langchain','chatgpt']);
 const origin='https://ai.lingxifield.com';
 assert.deepEqual(matchGscProductPage('https://ai.lingxifield.com/en/platform/langchain',ids,origin),{platformId:'langchain',language:'en'});
 assert.deepEqual(matchGscProductPage('https://ai.lingxifield.com/ar/platform/chatgpt',ids,origin),{platformId:'chatgpt',language:'ar'});
 for(const page of ['https://lingxifield.com/en/platform/langchain','https://market.lingxifield.cn/en/platform/langchain','https://other.example/en/platform/langchain','http://ai.lingxifield.com/en/platform/langchain','https://ai.lingxifield.com:8443/en/platform/langchain','https://ai.lingxifield.com/en/platform/unknown']){
  assert.equal(matchGscProductPage(page,ids,origin),null,page);
 }
});
test('GSC sync cannot run without owned domain and OAuth credentials; never populates fake rows',()=>{
 const env={...process.env,GSC_SERVICE_ACCOUNT_JSON:'',GSC_PROPERTY:'',AI_MARKET_CANONICAL_ORIGIN:''};
 const r=spawnSync(process.execPath,['scripts/sync-gsc-analytics.mjs'],{cwd:fileURLToPath(root),encoding:'utf8',env,timeout:10000});
 assert.equal(r.status,2);
 assert.match(r.stderr,/GSC_CONFIG_REQUIRED/);
 const src=read('scripts/sync-gsc-analytics.mjs');
 assert.ok(src.includes('GSC_PROPERTY_HOST_MISMATCH'));
 assert.ok(src.includes('matchGscProductPage(page,known,u.origin)'));
 assert.ok(src.includes('row.impressions||0'));
});
