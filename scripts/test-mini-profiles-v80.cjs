const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {createRequire}=require('node:module');
const profile=require('../miniapp/utils/app-profile');
const appConfig=JSON.parse(fs.readFileSync('miniapp/app.json','utf8'));
assert.equal(appConfig.pages[0],'pages/web/index','Main app must open the website homepage directly');
assert(!appConfig.pages.includes('pages/portal/index'),'Legacy portal must not be registered');
assert(!appConfig.pages.includes('pages/balance/index'),'Legacy native wallet page must not be registered');
assert(!fs.existsSync('miniapp/pages/balance'),'Legacy native wallet page directory must be removed');
assert(!fs.existsSync('miniapp/pages/portal/index.js'),'Legacy portal source must be removed');

function makeWx(){
 const calls={to:[],redirects:[],shareMenu:[],modals:[],clipboard:[],miniApps:[]};
 return {calls,getStorageSync:()=>'',showShareMenu:value=>calls.shareMenu.push(value||{}),
  getMenuButtonBoundingClientRect:()=>({bottom:64}),
  navigateTo:value=>calls.to.push(value),redirectTo:value=>calls.redirects.push(value),
  navigateToMiniProgram:value=>calls.miniApps.push(value),
  showModal:value=>calls.modals.push(value),showToast:value=>calls.modals.push(value),
  setClipboardData:value=>{calls.clipboard.push(value);if(value&&value.success)value.success()},
  removeStorageSync:()=>{}};
}
function loadPage(file,wx){
 let definition;
 const filename=path.resolve(file);
 vm.runInNewContext(fs.readFileSync(filename,'utf8'),{Page:value=>definition=value,wx,console,require:createRequire(filename)},{filename,timeout:1500});
 definition.setData=value=>Object.assign(definition.data,value);
 return definition;
}
const mainWx=makeWx();
global.wx=mainWx;
const main=loadPage('miniapp/pages/web/index.js',mainWx);
main.onLoad({});
assert.equal(main.data.path,'/');
assert.equal(main.data.src,'https://lingxifield.cn/?mini=1&ads=0&currency=CNY');
assert(mainWx.calls.shareMenu.length>0);
assert.equal(main.onShareAppMessage({webViewUrl:'https://lingxifield.cn/tools/pdf-editor?mini=1&ads=0&currency=CNY&invoice=private'}).path,'/pages/web/index?path=%2Ftools%2Fpdf-editor');
assert.equal(JSON.parse(fs.readFileSync('miniapp/pages/web/index.json','utf8')).enableShareAppMessage,true);
assert.equal(JSON.parse(fs.readFileSync('miniapp/pages/web/index.json','utf8')).enableShareTimeline,true);
assert.equal(typeof main.onShareTimeline,'function');
assert.equal(main.onShareTimeline({webViewUrl:'https://lingxifield.cn/siai?mini=1&ads=0&currency=CNY'}).query,'path=%2Fsiai');

const mailWx=makeWx();
global.wx=mailWx;
const mail=loadPage('miniapp/pages/mail-home/index.js',mailWx);
mail.onLoad();
assert.equal(mail.data.topInset,76);
mail.start();
assert.equal(mailWx.calls.to.pop().url,'/pages/web/index?path=%2Ftools%2Ftemp-mail');
for(const tool of mail.data.tools){mail.open({currentTarget:{dataset:{path:tool.path}}});assert.equal(mailWx.calls.to.pop().url,'/pages/web/index?path='+encodeURIComponent(tool.path))}
mail.open({currentTarget:{dataset:{path:'https://evil.example'}}});
assert.equal(mailWx.calls.to.length,0);
mail.website();
assert.equal(mailWx.calls.to.pop().url,'/pages/web/index?path=%2F');
mail.copyWebsite();
assert.equal(mailWx.calls.clipboard.pop().data,profile.website);
mail.recharge();
assert.equal(mailWx.calls.to.pop().url,'/pages/web/index?path=%2Fai-wallet%3Fcurrency%3DCNY');
mail.orders();
assert.equal(mailWx.calls.to.pop().url,'/pages/orders/index');
mail.mainApp();
assert.equal(mailWx.calls.miniApps.pop().appId,profile.mainAppId);
assert.equal(mail.onShareAppMessage().path,'/pages/mail-home/index');
assert.equal(JSON.parse(fs.readFileSync('miniapp/pages/mail-home/index.json','utf8')).enableShareAppMessage,true);

const source=fs.readFileSync('miniapp/app.js','utf8');
let app,loginCalls=0;
vm.runInNewContext(source,{App:p=>app=p,require:n=>n.includes('app-profile')?{sessionMode:'website'}:n.includes('i18n')?{getLanguage:()=> 'zh'}:{API_BASE:'https://lingxifield.cn',login:()=>{loginCalls++;return Promise.resolve()}},wx:{getUpdateManager:()=>({onUpdateReady(){}})},console});
app.onLaunch();
assert.equal(loginCalls,0,'Secondary app must not exchange its code using the main AppID');

if(process.argv.includes('--check-builds')){
 for(const target of ['main','temp-mail']){
  const receipt=JSON.parse(fs.readFileSync('_local/handoff/mini-build-v80/'+target+'-latest.json','utf8'));
  const root=receipt.projectPath;
  const built=JSON.parse(fs.readFileSync(path.join(root,'app.json'),'utf8'));
  const expected=target==='main'?'pages/web/index':'pages/mail-home/index';
  assert.equal(built.pages[0],expected);
  if(target==='main')assert(!built.pages.includes('pages/portal/index'));
  assert(!fs.existsSync(path.join(root,'project.private.config.json')));
  function scan(dir){
   for(const item of fs.readdirSync(dir,{withFileTypes:true})){
    const file=path.join(dir,item.name);
    if(item.isDirectory())scan(file);
    else if(item.name.endsWith('.js')){
     for(const match of fs.readFileSync(file,'utf8').matchAll(/require\\(['"]([^'"]+)['"]\\)/g)){
      const module=path.resolve(path.dirname(file),match[1]);
      assert(fs.existsSync(module)||fs.existsSync(module+'.js')||fs.existsSync(module+'.json'),'Missing package dependency: '+path.relative(root,module));
     }
    }
   }
  }
  scan(root);
  if(target==='temp-mail'){
   assert(built.pages.includes('pages/orders/index'));
   assert(fs.readFileSync(path.join(root,'pages/orders/index.js'),'utf8').includes('/account/orders'));
   assert(!fs.existsSync(path.join(root,'utils/api.js')));
   assert(!fs.readFileSync(path.join(root,'app.js'),'utf8').includes('utils/api'));
   assert(!built.pages.includes('pages/balance/index'));
   assert(!fs.existsSync(path.join(root,'pages/balance')),'Secondary package must not recreate legacy balance page');
   assert(!fs.existsSync(path.join(root,'pages/recharge')),'Secondary package must not recreate native recharge pages');
  }
 }
}
console.log('PASS: main miniapp opens the website homepage directly; legacy portal removed; friend sharing follows the current web-view URL; timeline sharing uses the native share page; temp-mail app remains isolated.');
