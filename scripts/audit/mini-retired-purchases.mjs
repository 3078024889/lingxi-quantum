import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const oldRoute={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/api/wechat/mini/pay/create/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{
 exports:oldRoute,require(name){assert.equal(name,'next/server');return{NextResponse:{json:(body,init)=>({body,...init})}}}
});
for(let i=0;i<3;i++){const result=await oldRoute.POST();assert.equal(result.status,410);assert.equal(result.body.code,'MINI_PRODUCT_RETIRED')}
assert.equal(fs.existsSync('lib/mini/catalog.ts'),false);
assert.doesNotMatch(fs.readFileSync('app/api/wechat/mini/pay/notify/route.ts','utf8'),/miniSkuForProduct|fulfillPaidOrder/);
const languages=['zh-CN','en','ja','ko','fr','de','es','pt','ar'];let page;const urls=[];
vm.runInNewContext(fs.readFileSync('miniapp/pages/profile/index.js','utf8'),{
 Page(value){page=value},wx:{navigateTo({url}){urls.push(url)}},require(){return{SUPPORTED:languages.map(id=>({id})),copyFor(){return{}},getLanguage(){return'zh-CN'}}}
});
page.setData=next=>{page.data={...page.data,...next}};
for(const lang of languages){page.refreshLanguage(lang);assert.ok(page.data.ui.recharge);assert.ok(page.data.ui.rechargeNote.includes('10'));page.openBalance();assert.equal(urls.at(-1),'/pages/balance/index')}
const view=fs.readFileSync('miniapp/pages/profile/index.wxml','utf8');assert.match(view,/bindtap="openBalance"/);assert.match(view,/ui.recharge/);
console.log('PASS: retired purchase code removed; legacy requests cannot create orders; native recharge entry works in 9 languages.');
