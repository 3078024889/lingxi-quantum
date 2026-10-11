import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
let loginCalls=0;
const urls=[];
const store=new Map();
const wx={
 getStorageSync:k=>store.get(k),setStorageSync:(k,v)=>store.set(k,v),
 login(options){loginCalls++;queueMicrotask(()=>options.success({code:'fresh'}));},
 request(options){urls.push(options.url);queueMicrotask(()=>{
  if(options.url.startsWith('https://mini-api.') && options.method==='GET') return options.fail({errMsg:'request:fail timeout'});
  options.success({statusCode:200,data:options.url.endsWith('/login')?{token:'session',expiresAt:new Date(Date.now()+3600000).toISOString()}:{enabled:true}});
 });},
};
const module={exports:{}};
vm.runInNewContext(fs.readFileSync('miniapp/utils/api.js','utf8'),{module,wx,Date,Promise,setTimeout:fn=>fn()});
await Promise.all([module.exports.login(),module.exports.login(),module.exports.login()]);
assert.equal(loginCalls,1,'Concurrent startup/profile login must share one code exchange');
assert.equal(urls.filter(url=>url.endsWith('/login')).length,1);
assert.equal(urls.find(url=>url.endsWith('/login')),'https://lingxifield.cn/api/wechat/mini/login','Probe selects a reachable registered route before POST');
let page;
vm.runInNewContext(fs.readFileSync('miniapp/pages/web/index.js','utf8'),{Page:d=>page=d,wx:{getStorageSync:()=> 'CNY'},Set,encodeURIComponent,decodeURIComponent,require:()=>({enableShareMenu(){},publicWebPath:x=>x})});
const instance={...page,data:{...page.data},setData:d=>Object.assign(instance.data,d)};
instance.onLoad({path:encodeURIComponent('/account?miniLink=handoff')});
assert.match(instance.data.src,/^https:\/\/lingxifield\.cn\/account\?/);
assert.equal(instance.data.failed,false);
console.log('PASS: network route selection before login, single-flight identity, registered web-view domain');
