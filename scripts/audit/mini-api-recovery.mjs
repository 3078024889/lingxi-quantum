import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const calls=[];const storage=new Map();
const wx={
 getStorageSync:key=>storage.get(key),
 setStorageSync:(key,value)=>storage.set(key,value),
 login:options=>options.success({code:'fresh-login-code'}),
 request(options){calls.push(options.url);options.success({statusCode:200,data:{token:'session-token',expiresAt:new Date(Date.now()+3600000).toISOString()}})}
};
const module={exports:{}};
vm.runInNewContext(fs.readFileSync('miniapp/utils/api.js','utf8'),{module,wx,Date,Promise,setTimeout:callback=>callback()});
const api=module.exports;
assert.equal(await api.login(),'session-token');
assert.deepEqual(calls,['https://lingxifield.cn/api/wechat/mini/login']);
assert.ok(!calls.some(url=>url.includes('/balance-pay/')),'Login must not depend on the retired native top-up availability endpoint');
assert.match(api.connectionMessage({statusCode:403}),/小程序服务/);
assert.match(api.connectionMessage({statusCode:503}),/小程序服务/);
assert.throws(()=>api.request('/api/pay/create',{method:'POST'}),/Invalid Mini Program API path/);
console.log('PASS: Mini Program login no longer calls native wallet top-up APIs; authenticated API boundary remains enforced.');
