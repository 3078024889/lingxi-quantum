import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import ts from 'typescript';
const oldRoute={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/api/wechat/mini/pay/create/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:oldRoute,require(n){assert.equal(n,'next/server');return{NextResponse:{json:(body,init)=>({body,...init})}}}});
for(let i=0;i<3;i++){const r=await oldRoute.POST();assert.equal(r.status,410);assert.equal(r.body.code,'MINI_PRODUCT_RETIRED')}
assert.equal(fs.existsSync('lib/mini/catalog.ts'),false);assert.doesNotMatch(fs.readFileSync('app/api/wechat/mini/pay/notify/route.ts','utf8'),/miniSkuForProduct|fulfillPaidOrder/);
const app=JSON.parse(fs.readFileSync('miniapp/app.json','utf8'));assert.ok(!app.pages.includes('pages/balance/index'));assert.ok(!app.pages.includes('pages/recharge/index'));
for(const p of ['miniapp/pages/balance','miniapp/pages/recharge','miniapp/utils/topup-expiry.js','miniapp/utils/virtual-payment-errors.js','app/api/wechat/mini/balance-pay/create/route.ts','app/api/wechat/mini/balance-pay/availability/route.ts'])assert.equal(fs.existsSync(p),false,'legacy wallet module remains: '+p);
assert.match(fs.readFileSync('miniapp/pages/pay/index.js','utf8'),/tool-pay\\/create/);assert.match(fs.readFileSync('lib/mini/virtual-fulfillment.ts','utf8'),/virtualTopupGoods/);
console.log('PASS: retired purchase route stays closed; native wallet UI and creation APIs removed; tool virtual payment remains independent; historical top-up settlement retained');
