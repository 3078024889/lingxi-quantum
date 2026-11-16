import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const oldRoute = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/api/wechat/mini/pay/create/route.ts','utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS }
}).outputText, {
  exports: oldRoute,
  require(name) {
    assert.equal(name, 'next/server');
    return { NextResponse: { json: (body, init) => ({ body, status: init?.status || 200 }) } };
  }
});
for (let i=0;i<3;i++) {
  const result=await oldRoute.POST();
  assert.equal(result.status,410);
  assert.equal(result.body.code,'MINI_PRODUCT_RETIRED');
}
assert.equal(fs.existsSync('lib/mini/catalog.ts'),false);
assert.doesNotMatch(fs.readFileSync('app/api/wechat/mini/pay/notify/route.ts','utf8'),/miniSkuForProduct|fulfillPaidOrder/);
const app=JSON.parse(fs.readFileSync('miniapp/app.json','utf8'));
assert.ok(app.pages.includes('pages/cny-wallet/index'));
assert.ok(!app.pages.includes('pages/balance/index')&&!app.pages.includes('pages/recharge/index'));
for (const path of [
  'miniapp/pages/balance','miniapp/pages/recharge',
  'miniapp/utils/topup-expiry.js','miniapp/utils/virtual-payment-errors.js',
]) assert.equal(fs.existsSync(path),false,'retired mini wallet page/helper remains: '+path);
for (const path of [
  'app/api/wechat/mini/cny-topup/create/route.ts',
  'app/api/wechat/mini/cny-topup/availability/route.ts',
]) assert.equal(fs.existsSync(path),true,'new CNY top-up API missing: '+path);
assert.ok(fs.readFileSync('miniapp/pages/pay/index.js','utf8').includes('tool-pay/create'));
assert.ok(fs.readFileSync('miniapp/pages/pay/index.js','utf8').includes('/pages/cny-wallet/index'));
assert.match(fs.readFileSync('lib/mini/virtual-fulfillment.ts','utf8'),/virtualTopupGoods/);
assert.match(fs.readFileSync('lib/mini/virtual-refund.ts','utf8'),/virtualTopupGoods/);
console.log('PASS: retired purchase API remains closed; new CNY wallet is separate; old page/helpers are removed; tool payment and historical settlement/refunds remain');
