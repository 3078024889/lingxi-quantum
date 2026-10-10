import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
let definition,charges=0,creates=0,checks=0,logins=0,release;
const storage=new Map();
const wx={getStorageSync:k=>storage.get(k),setStorageSync:(k,v)=>storage.set(k,v),removeStorageSync:k=>storage.delete(k),requestVirtualPayment(options){charges++;options.success({});}};
const api={publicRequest:async()=>({enabled:false}),wxLogin:async()=>{logins++;return{code:'fresh-code'};},request:async(path,options)=>{
 if(path.endsWith('/create')){creates++;await new Promise(resolve=>{release=resolve;});assert.equal(options.data.productId,'sasi-balance-custom-123');return{orderId:'owned-order',payment:{mode:'short_series_goods'}};}
 checks++;return{paid:checks>1};
}};
vm.runInNewContext(fs.readFileSync('miniapp/pages/balance/index.js','utf8'),{Page:d=>definition=d,wx,require:()=>api,Date,Math,Promise});
const page={...definition,data:{...definition.data},setData(value){Object.assign(this.data,value)}};
await page.pay();assert.equal(charges+creates+logins,0);
page.data.enabled=true;page.data.selected='custom';page.data.custom='1.23';await page.pay();assert.equal(charges+creates+logins,0);
page.data.custom='123';const pending=page.pay();await new Promise(resolve=>setTimeout(resolve,0));await page.pay();assert.equal(creates,1);assert.match(storage.get('lx_mini_topup_pending').requestId,/^[0-9a-f]{32}$/);
release();await pending;assert.equal(charges,1);assert.equal(page.data.orderId,'owned-order');
await page.pay();assert.equal(charges,1);assert.equal(creates,1);assert.equal(checks,2);assert.equal(storage.has('lx_mini_topup_pending'),false);
console.log('PASS: closed recharge, custom validation, double click, durable request ID and provider polling without double charge');
