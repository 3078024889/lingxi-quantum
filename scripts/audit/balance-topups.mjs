import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function load(file, dependencies = {}) {
 const exports = {};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,
  {exports,process:{env:{}},require(name){if(name in dependencies)return dependencies[name];throw new Error(name)}});
 return exports;
}
const topups=load('lib/balance-topups.ts');
assert.deepEqual(Array.from(topups.BALANCE_TOPUP_AMOUNTS),[10,88,666,888]);
const deps={'@/lib/balance-topups':topups};
const cny=load('lib/plans.ts',deps),usd=load('lib/usd-products.ts',deps);
assert.deepEqual(cny.allProducts.map(x=>x.priceRmb).join(','),'10,88,666,888');
assert.deepEqual(usd.usdBalanceProducts.map(x=>x.amountUsd).join(','),'10,88,666,888');
for(const a of [10,88,666,888,123,10000]) {
 assert.equal(cny.getProduct(`sasi-balance-custom-${a}`).sasiAmountFen,a*100);
 assert.equal(usd.getUsdBalanceProduct(`sasi-usd-balance-custom-${a}`).amountUsd,a);
}
for(const invalid of ['0','9','10001','1.5','-10','NaN','010','10abc']) {
 assert.equal(topups.customTopupAmount(invalid),null);
 assert.equal(usd.getUsdBalanceProduct(`sasi-usd-balance-custom-${invalid}`),undefined);
}
assert.equal(cny.getProduct('sasi-balance-500').sasiAmountFen,50000);
assert.equal(usd.getUsdBalanceProduct('sasi-usd-balance-300').amountUsd,300);
const goods=load('lib/mini/virtual-goods.ts',{'@/lib/mini/virtual-pay':{miniVirtualPayConfigured:()=>true},...deps});
assert.equal(goods.miniVirtualTopupsEnabled(),false);
for(const a of [10,88,666,888])assert.equal(goods.virtualTopupGoods(`sasi-balance-${a}`).amountFen,a*100);
const custom=goods.virtualTopupGoods('sasi-balance-custom-123');
assert.equal(custom.unitPriceFen,100);assert.equal(custom.quantity,123);assert.equal(custom.amountFen,12300);
for(const id of ['sasi-balance-20','sasi-balance-custom-9','sasi-usd-balance-10','sasi-balance-custom-10001'])assert.equal(goods.virtualTopupGoods(id),null);
console.log('PASS: CNY/USD presets, custom bounds, historical fulfillment, virtual recharge amounts and closed gate');
