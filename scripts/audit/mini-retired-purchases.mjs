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
const app=JSON.parse(fs.readFileSync('miniapp/app.json','utf8'));
assert.ok(app.pages.includes('pages/balance/index'),'Legacy balance deep links remain compatible');
assert.ok(!app.pages.includes('pages/recharge/index'));
assert.equal(fs.existsSync('miniapp/pages/recharge/index.js'),false);
assert.equal(fs.existsSync('miniapp/pages/balance/index.wxss'),false);
assert.equal(fs.existsSync('app/api/wechat/mini/balance-pay/create/route.ts'),false);
assert.equal(fs.existsSync('app/api/wechat/mini/balance-pay/availability/route.ts'),false);
const balance=fs.readFileSync('miniapp/pages/balance/index.js','utf8');
assert.match(balance,/pages\/web\/index\?path=/);assert.match(balance,/encodeURIComponent\\(path\\)/);assert.match(balance,/\"\\/ai-wallet\"/);
assert.doesNotMatch(balance,/requestVirtualPayment|balance-pay/);
assert.match(fs.readFileSync('miniapp/pages/pay/index.js','utf8'),/pages\/web\/index\?path=%2Fai-wallet/);
assert.match(fs.readFileSync('miniapp/pages/mail-home/index.js','utf8'),/pages\/web\/index\?path=%2Fai-wallet/);
assert.match(fs.readFileSync('lib/mini/virtual-fulfillment.ts','utf8'),/virtualTopupGoods/,'historical paid top-up orders still reconcile');
console.log('PASS: retired purchase route remains 410; native wallet recharge removed; old balance deep link redirects to website; historical settlement retained.');
