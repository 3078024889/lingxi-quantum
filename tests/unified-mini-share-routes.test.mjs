import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

function runtimeMiniShare(){
 const text=read('lib/mini/share-client.ts');
 const js=ts.transpileModule(text,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const m={exports:{}};
 vm.runInNewContext(js,{
  module:m,exports:m.exports,URL,location:{href:'https://lingxifield.cn/siai'},
  require:()=>({detectMiniPaymentContext:async()=>false,miniPaymentBridge:async()=>null}),
  setTimeout,clearTimeout
 },{timeout:1000});
 return m.exports;
}

test('mini web share preserves only active public routes across both official domains',()=>{
 const {publicMiniSharePath}=runtimeMiniShare();
 for(const domain of ['https://lingxifield.com','https://lingxifield.cn']){
  assert.equal(publicMiniSharePath(domain+'/'),'/');
  assert.equal(publicMiniSharePath(domain+'/siai?utm_source=wechat'),'/siai');
  assert.equal(publicMiniSharePath(domain+'/sasi?mode=drama&task=private'),'/sasi');
  assert.equal(publicMiniSharePath(domain+'/tools/pdf-editor?account=private'),'/tools/pdf-editor');
 }
});
test('mini share rejects retired modules, outside hosts, private pages and unsafe input',()=>{
 const {publicMiniSharePath}=runtimeMiniShare();
 for(const path of ['https://attacker.example/siai','//attacker.example/siai','https://lingxifield.com.evil/siai',
  'https://lingxifield.cn/account','https://lingxifield.cn/account/orders','https://lingxifield.com/ai-wallet',
  'https://lingxifield.cn/ai-knowledge','https://lingxifield.cn/ai-learning','https://lingxifield.cn/ai-research',
  '/api/wechat/mini/account-link/x','/not-a-public-route'])
  assert.equal(publicMiniSharePath(path),'/');
});
test('native share uses the versioned mini-program card for friend and timeline forwards',()=>{
 const js=read('miniapp/pages/share/index.js'),page=read('miniapp/pages/share/index.wxml');
 const share=read('miniapp/utils/share.js'),web=read('miniapp/pages/web/index.js');
 assert.ok(share.includes('/assets/share-lingxifield-20261115.jpg'));
 assert.ok(js.includes('onShareAppMessage()') && js.includes('appMessage'));
 assert.ok(js.includes('onShareTimeline()') && js.includes('timeline'));
 assert.ok(web.includes('onShareAppMessage(options)') && web.includes('appMessage'));
 assert.ok(web.includes('options.webViewUrl'));
 assert.doesNotMatch(web,/onShareTimeline/);
 assert.match(page,/open-type="share"/);
 const native=require('../miniapp/utils/share.js');
 assert.equal(native.SHARE_IMAGE,'/assets/share-lingxifield-20261115.jpg');
 assert.equal(native.appMessage('title','/pages/web/index').imageUrl,native.SHARE_IMAGE);
 assert.equal(native.timeline('title','path=%2Fsiai').imageUrl,native.SHARE_IMAGE);
 const webConfig=JSON.parse(read('miniapp/pages/web/index.json'));
 const shareConfig=JSON.parse(read('miniapp/pages/share/index.json'));
 assert.equal(webConfig.enableShareAppMessage,true);
 assert.equal(webConfig.enableShareTimeline,undefined);
 assert.equal(shareConfig.enableShareAppMessage,true);
 assert.equal(shareConfig.enableShareTimeline,true);
 const client=read('lib/mini/share-client.ts');
 assert(!client.includes('20260928'));
});
test('native share links do not carry account IDs, private query parameters or retired modes',()=>{
 const native=require('../miniapp/utils/share.js');
 assert.equal(native.publicWebPath('/siai?user=private&token=secret'),'/siai');
 assert.equal(native.publicWebPath('/tools/pdf-editor?invoice=123'),'/tools/pdf-editor');
 assert.equal(native.publicWebPath('/sasi?mode=image&threadId=private'),'/sasi');
 assert.equal(native.publicWebPath('/ai-knowledge'),'/');
 const {publicMiniSharePath}=runtimeMiniShare();
 assert.equal(publicMiniSharePath('https://lingxifield.cn/siai?token=secret&session=private'),'/siai');
});
