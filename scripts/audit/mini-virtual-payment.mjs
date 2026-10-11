import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import crypto from 'node:crypto';
const env = {};
function load(file, dependencies = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  } }).outputText, { exports, process: { env }, Number, JSON, Buffer, Date,
    require(name) { if (name in dependencies) return dependencies[name]; throw new Error(`Unexpected ${name}`); } });
  return exports;
}
const pay = load('lib/mini/virtual-pay.ts', { '@/lib/mini/crypto': {
  decryptMiniSecret: () => 'session', hmacSha256Hex: (key, data) => crypto.createHmac('sha256', key).update(data).digest('hex'),
} });
env.WECHAT_MINI_VPAY_OFFER_ID = '1450617775';
env.WECHAT_MINI_VPAY_APP_KEY = 'test-key';
assert.equal(pay.miniVirtualPayConfigured(), false, 'Missing environment must fail closed');
env.WECHAT_MINI_VPAY_ENV = 'production';
const result = pay.buildMiniVirtualPayment({ skuId: 'lx_food_calorie', priceFen: 200, quantity: 3,
  outTradeNo: 'LXM123456789', orderId: 'order-id', encryptedSessionKey: 'cipher' });
assert.equal(result.mode, 'short_series_goods');
assert.equal(JSON.parse(result.signData).buyQuantity, 3);
assert.equal(JSON.parse(result.signData).goodsPrice, 200);
assert.equal(result.paySig, crypto.createHmac('sha256', 'test-key').update(`requestVirtualPayment&${result.signData}`).digest('hex'));
assert.equal(result.signature, crypto.createHmac('sha256', 'session').update(result.signData).digest('hex'));
for (const quantity of [0, -1, 1.1, 10001]) assert.throws(() => pay.buildMiniVirtualPayment({ skuId: 'lx_food_calorie', priceFen: 200, quantity, outTradeNo: 'LXM123456789', orderId: 'o', encryptedSessionKey: 'c' }));
const topups = load('lib/balance-topups.ts');
const goods = load('lib/mini/virtual-goods.ts', { '@/lib/mini/virtual-pay': pay, '@/lib/balance-topups': topups });
env.WECHAT_MINI_VPAY_TOOL_GOODS = JSON.stringify({ fractional: { skuId: 'lx_fractional', unitPriceFen: 50 } });
assert.equal(goods.virtualGoodsForQuote('fractional', 50), null, 'Sub-yuan transactions must not be offered across all platforms');
assert.equal(goods.virtualGoodsForQuote('fractional', 150).quantity, 3, 'Fractional units are allowed when the transaction meets the minimum');
assert.equal(goods.miniVirtualToolsEnabled(), false);
env.WECHAT_MINI_VPAY_TOOL_GOODS = JSON.stringify({ 'food-calorie': { skuId: 'lx_food_calorie', unitPriceFen: 200 } });
assert.equal(goods.virtualGoodsForQuote('food-calorie', 600).quantity, 3);
assert.equal(goods.virtualGoodsForQuote('food-calorie', 599), null, 'No price rounding or hidden discount');
assert.equal(goods.virtualGoodsForQuote('old-subscription', 99900), null);
env.WECHAT_MINI_VPAY_TOOL_GOODS = 'null';
assert.equal(goods.virtualGoodsForQuote('food-calorie', 200), null);
let page; const calls = [];
let paid = false;
vm.runInNewContext(fs.readFileSync('miniapp/pages/pay/index.js', 'utf8'), {
  Page(p) { page = p; }, wx: { requestVirtualPayment(p) { calls.push('virtual'); p.success({}); }, showToast() {} },
  require() { return { wxLogin: async () => ({ code: 'fresh-login-code' }), request: async (path, options) => {
    calls.push(path);
    if (path.endsWith('/create')) { assert.equal(options.data.code, 'fresh-login-code'); return { orderId: 'o', payment: result }; }
    if (path.includes('/status')) return { paid };
    throw new Error('Unexpected request');
  } }; },
});
const instance = { ...page, data: { ...page.data, quoteId: 'q', quote: { amount_rmb: 6 } }, setData(update) { Object.assign(this.data, update); } };
await instance.pay();
assert.match(instance.data.message, /正在确认/);
await instance.pay();
assert.equal(calls.filter(x => x === 'virtual').length, 1, 'Uncertain payment must not charge again');
assert.equal(calls.filter(x => x.endsWith('/create')).length, 1);
paid = true; await instance.pay(); assert.match(instance.data.message, /已确认/);
const fulfillment = load('lib/mini/virtual-fulfillment.ts', { 'next/server':{after(){}}, '@/lib/supabase/admin': {}, '@/lib/fulfill-order': {}, '@/lib/mini/xpay': {}, '@/lib/mini/virtual-goods': goods });
const snapshot = { env: 0, unitPriceFen: 200, quantity: 3 };
const remote = { order_id: 'n', status: 2, order_type: 0, env_type: 1, paid_fee: 600, order_fee: 600 };
assert.equal(fulfillment.virtualOrderPaid(remote, 'n', snapshot, 600), true);
for (const mutation of [{ status: 1 }, { status: 8 }, { paid_fee: 599 }, { order_id: 'other' }, { env_type: 2 }, { order_type: 1 }]) {
  assert.equal(fulfillment.virtualOrderPaid({ ...remote, ...mutation }, 'n', snapshot, 600), false);
}
console.log('PASS: virtual signatures, exact SKU prices, default-off gate, callback-loss recovery, no double charge, provider payment validation');
