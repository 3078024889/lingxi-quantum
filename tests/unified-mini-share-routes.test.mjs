import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

// Load the actual TS share helper without a browser or WeChat account.
// No private credentials are passed through the share URL.
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

test('mini web share preserves public ranking and tools across both official domains',()=>{
 const {publicMiniSharePath}=runtimeMiniShare();
 for(const domain of ['https://lingxifield.com','https://lingxifield.cn']){
  assert.equal(publicMiniSharePath(domain+'/siai?utm_source=wechat'),'/siai');
  assert.equal(publicMiniSharePath(domain+'/tools/pdf-editor?account=private'),'/tools/pdf-editor');
  assert.equal(publicMiniSharePath(domain+'/sasi?mode=drama&task=private'),'/sasi?mode=drama');
  assert.equal(publicMiniSharePath(domain+'/sasi?mode=unknown'),'/sasi');
 }
});
test('mini share rejects outside hosts, secret/private pages and unsafe input',()=>{
 const {publicMiniSharePath}=runtimeMiniShare();
 for(const path of ['https://attacker.example/siai','//attacker.example/siai','https://lingxifield.com.evil/siai',
  'https://lingxifield.cn/account','https://lingxifield.cn/account/orders','https://lingxifield.com/ai-wallet',
  '/api/wechat/mini/account-link/x','/not-a-public-route'])
  assert.equal(publicMiniSharePath(path),'/');
});
test('mini share page and share menu show the one canonical local cover on forwards',()=>{
 const js=read('miniapp/pages/share/index.js'),page=read('miniapp/pages/share/index.wxml');
 const share=read('miniapp/utils/share.js'),web=read('miniapp/pages/web/index.js');
 assert.match(share,/const SHARE_IMAGE = "\/assets\/share-lingxifield-20261105\.jpg"/);
 assert.match(js,/shareImage:SHARE_IMAGE/);
 assert.match(page,/src="{{shareImage}}"/);
 assert.match(js,/onShareAppMessage\(\).*imageUrl:SHARE_IMAGE/);
 assert.match(js,/onShareTimeline\(\).*imageUrl:SHARE_IMAGE/);
 assert.match(web,/onShareAppMessage\(\).*appMessage/);
 assert.match(web,/onShareTimeline\(\).*timeline/);
 const client=read('lib/mini/share-client.ts');
 assert(!client.includes('20260928'));
});
test('mini native share URL does not carry account IDs or private invoice query parameters',()=>{
 const {publicMiniSharePath}=runtimeMiniShare();
 const native=require('../miniapp/utils/share.js');
 assert.equal(native.publicWebPath('/siai?user=private&token=secret'),'/siai');
 assert.equal(native.publicWebPath('/tools/pdf-editor?invoice=123'),'/tools/pdf-editor');
 assert.equal(publicMiniSharePath('https://lingxifield.cn/siai?token=secret&session=private'),'/siai');
});
