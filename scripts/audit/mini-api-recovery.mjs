import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
let calls = 0, responses = [], exported;
const wx = {request(options) { calls++; const next=responses.shift(); if(next.fail) options.fail(next.fail); else options.success(next); },
  getStorageSync(key) { return key==='lx_mini_token'?'test-token':new Date(Date.now()+3600000).toISOString(); }};
const module={exports:{}};
vm.runInNewContext(fs.readFileSync('miniapp/utils/api.js','utf8'),{module,wx,Date,Promise,setTimeout:callback=>callback()});
exported=module.exports;
responses=[{fail:{errMsg:'request:fail timeout'}},{statusCode:200,data:{enabled:true}}];
assert.equal((await exported.publicRequest('/api/wechat/mini/balance-pay/availability')).enabled,true);assert.equal(calls,2);
calls=0;responses=[{statusCode:200,data:'<html>challenge</html>'},{statusCode:200,data:{enabled:true}}];
await exported.publicRequest('/api/wechat/mini/balance-pay/availability');assert.equal(calls,2);
calls=0;responses=[{statusCode:403,data:{error:'forbidden'}}];
await assert.rejects(exported.publicRequest('/api/wechat/mini/balance-pay/availability'));assert.equal(calls,1);
calls=0;responses=[{fail:{errMsg:'timeout'}}];
await assert.rejects(exported.request('/api/wechat/mini/balance-pay/create',{method:'POST',data:{}}));assert.equal(calls,1,'Never repeat a payment POST on network failure');
console.log('PASS: bounded public GET recovery, HTML rejection, permission failure preserved, payment POST never automatically repeated');
