const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {createRequire}=require('node:module');
const profile=require('../miniapp/utils/app-profile');
const appConfig=JSON.parse(fs.readFileSync('miniapp/app.json','utf8'));
assert.equal(appConfig.pages[0],'pages/web/index','Main app must open the official website homepage directly');
assert(!appConfig.pages.includes('pages/portal/index'),'Retired portal must not be registered');
assert(!appConfig.pages.includes('pages/balance/index'),'Retired balance page must not be registered');
assert(!appConfig.pages.includes('pages/recharge/index'),'Retired recharge page must not be registered');
assert(appConfig.pages.includes('pages/cny-wallet/index'),'Native CNY wallet must be registered');
assert(!fs.existsSync('miniapp/pages/balance'),'Legacy balance source must be removed');
assert(!fs.existsSync('miniapp/pages/recharge'),'Legacy recharge source must be removed');
assert(!fs.existsSync('miniapp/pages/portal'),'Legacy portal source must be removed');
assert(!fs.existsSync('miniapp/utils/topup-expiry.js'),'Legacy top-up expiry helper must be removed');
assert(!fs.existsSync('miniapp/utils/virtual-payment-errors.js'),'Legacy virtual top-up error helper must be removed');
assert(!fs.existsSync('app/api/wechat/mini/balance-pay'),'Legacy wallet top-up API must be removed');
const pageSource=fs.readFileSync('miniapp/pages/cny-wallet/index.js','utf8');
assert.match(pageSource,/wx\.requestPayment/,'CNY balance top-up must use standard Mini Program merchant JSAPI');
assert.doesNotMatch(pageSource,/wx\.requestVirtualPayment/,'CNY balance top-up must not use virtual-goods payment');
function makeWx(){
 const calls={to:[],redirects:[],shareMenu:[]};
 return {calls,getStorageSync:()=>'',showShareMenu:value=>calls.shareMenu.push(value||{}),
  navigateTo:value=>calls.to.push(value),redirectTo:value=>calls.redirects.push(value),
  showModal:()=>{},showToast:()=>{},};
}
function loadPage(file,wx){
 let definition;const filename=path.resolve(file);
 vm.runInNewContext(fs.readFileSync(filename,'utf8'),{Page:value=>definition=value,wx,console,require:createRequire(filename)},{filename,timeout:1500});
 definition.setData=value=>Object.assign(definition.data,value);return definition;
}
const wx=makeWx();global.wx=wx;
const main=loadPage('miniapp/pages/web/index.js',wx);main.onLoad({});
assert.equal(main.data.path,'/');
assert.equal(main.data.src,'https://lingxifield.cn/?mini=1&ads=0&currency=CNY');
assert(wx.calls.shareMenu.length>0);
assert.equal(main.onShareAppMessage({webViewUrl:'https://lingxifield.cn/tools/pdf-editor?mini=1&ads=0&currency=CNY&invoice=private'}).path,'/pages/web/index?path=%2Ftools%2Fpdf-editor');
assert.equal(JSON.parse(fs.readFileSync('miniapp/pages/web/index.json','utf8')).enableShareAppMessage,true);
assert.equal(typeof main.onShareTimeline,'function');
assert.equal(main.onShareTimeline({webViewUrl:'https://lingxifield.cn/siai?mini=1&ads=0&currency=CNY'}).query,'path=%2Fsiai');
const appSource=fs.readFileSync('miniapp/app.js','utf8');
let app,loginCalls=0;
vm.runInNewContext(appSource,{App:p=>app=p,require:n=>n.includes('app-profile')?{sessionMode:'website'}:n.includes('i18n')?{getLanguage:()=> 'zh'}:{API_BASE:'https://lingxifield.cn',login:()=>{loginCalls++;return Promise.resolve()}},wx:{getUpdateManager:()=>({onUpdateReady(){}})},console});
app.onLaunch();assert.equal(loginCalls,0,'Mini Program account identity must not be exchanged with another AppID');
console.log('PASS: one native CNY JSAPI wallet, official website USD wallet, direct homepage entry, secure sharing, no retired recharge modules.');
