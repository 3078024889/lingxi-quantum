import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const pauseModule = {};
const compile = source => ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  jsx: ts.JsxEmit.ReactJSX,
} }).outputText;
vm.runInNewContext(compile(fs.readFileSync('lib/mini/payment-availability.ts', 'utf8')), { exports: pauseModule });
for (const route of ['tool-pay', 'balance-pay']) {
  const exports = {};
  vm.runInNewContext(compile(fs.readFileSync(`app/api/wechat/mini/${route}/create/route.ts`, 'utf8')), {
    exports, require(name) {
      if (name === 'next/server') return { NextResponse: { json: (body, init) => ({ body, ...init }) } };
      if (name === '@/lib/mini/payment-availability') return pauseModule;
      if (name === '@/lib/mini/virtual-goods') return { miniVirtualToolsEnabled: () => false, miniVirtualTopupsEnabled: () => false };
      if (['crypto','@/lib/supabase/admin','@/lib/mini/session','@/lib/mini/virtual-pay','@/lib/mini/crypto','@/lib/mini/wechat','@/lib/tools/service-readiness','@/lib/rate-limit'].includes(name)) return {};
      throw new Error(`Payment route unexpectedly loads a dependency: ${name}`);
    },
  });
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await exports.POST({ json() { throw new Error('Should not parse or create an order'); } });
    assert.equal(response.status, 503);
    assert.equal(response.body.code, 'MINI_PAYMENT_REVIEW_REQUIRED');
  }
}

for (const page of ['pay', 'balance']) {
  let definition;
  const calls = [];
  const wx = new Proxy({}, { get: (_, method) => options => calls.push({ method, options }) });
  vm.runInNewContext(fs.readFileSync(`miniapp/pages/${page}/index.js`, 'utf8'), {
    Page: value => { definition = value; }, wx,
    require() { return { request() { throw new Error('No payment should be created without a quote'); } }; },
  });
  const instance = { ...definition, data: { ...definition.data }, setData(value) { Object.assign(this.data, value); } };
  await instance.pay(); await instance.pay();
  assert.equal(calls.length, 0, 'Repeated pay calls must not charge or log in');
  instance.openOrders();
  assert.equal(calls[0].options.url, '/pages/orders/index');
}

// Exercise the actual React payment click handlers in both currencies.
for (const component of ['PaidActionButton', 'PaidExportButton']) {
  for (const currency of ['CNY', 'USD']) {
    let stateIndex = 0;
    const messages = [];
    const quote = { id: 'existing-unpaid-quote', quantity: 1, currency, amount_rmb: 2, amount_usd: 1 };
    const jsx = (type, props) => ({ type, props });
    const exports = {};
    const react = {
      useEffect() {}, useRef: value => ({ current: value }),
      useState(value) { const index = stateIndex++; return [index === 0 ? quote : value, next => messages.push(next)]; },
    };
    vm.runInNewContext(compile(fs.readFileSync(`components/tools/${component}.tsx`, 'utf8')), {
      exports, window: { location: { search: '?mini=1' } }, location: { search: '?mini=1' },
      navigator: { userAgent: 'MicroMessenger' }, URLSearchParams,
      fetch() { throw new Error('Mini payment must not issue requests'); },
      require(name) {
        if (name === 'react') return react;
        if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
        if (name.includes('lingxi-i18n')) return { useLingxiLang: () => ({ lang: 'zh' }) };
        if (name.includes('CurrencyPreferenceProvider')) return { usePreferredCurrency: () => ({ currency }) };
        if (name.includes('quote-display')) return { quoteDisplay: () => ({ text: '2' }) };
        if (name.includes('delivery-copy')) return { deliveryText: (_, key) => key };
        if (name.includes('billing-copy')) return { foodBillingText: (_, key) => key };
        if (name.includes('plain-copy')) return { plainText: (_, key) => key, plainMessage: (_, key) => key };
        if (name.includes('payment-client')) return { isMiniProgramContext: () => true, miniVirtualPaymentAvailable: async () => false };
        throw new Error(`Unexpected component dependency: ${name}`);
      },
    });
    const tree = exports.default({ toolId: 'test-tool', quantity: 1, onPaid() {}, onUnlocked() {} });
    const buttons = [];
    function walk(node) {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) { node.forEach(walk); return; }
      if (node.type === 'button') buttons.push(node);
      walk(node.props?.children);
    }
    walk(tree);
    const paymentButton = buttons.find(button => button.props.onClick?.name === (component === 'PaidActionButton' ? 'pay' : 'start'));
    assert.ok(paymentButton, `${component}: payment handler not found`);
    await paymentButton.props.onClick();
    assert.ok(messages.some(message => typeof message === 'string' && message.includes('付费暂未开放')));
  }
}
for (const [context, environment, search, userAgent, expected] of [
  ['checking', undefined, '', 'Chrome', false],
  ['mini', 'miniprogram', '', 'MicroMessenger', true],
  ['mini', undefined, '?mini=1', 'MicroMessenger', true],
  ['web', undefined, '', 'MicroMessenger', false],
  ['web', undefined, '?mini=1', 'Chrome', false],
]) {
  const exports = {};
  const child = { checkout: true };
  const jsx = (type, props) => ({ type, props });
  vm.runInNewContext(compile(fs.readFileSync('components/MiniPaymentBoundary.tsx', 'utf8')), {
    exports, window: { __wxjs_environment: environment, location: { search } },
    navigator: { userAgent }, URLSearchParams,
    require(name) {
      if (name === 'react') return { useState: () => [context, () => {}], useEffect() {} };
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
      throw new Error(`Unexpected checkout boundary dependency: ${name}`);
    },
  });
  assert.equal(exports.isMiniPaymentContext(), expected);
  const output = exports.default({ children: child });
  assert.equal(output === child, context === 'web', 'Checkout must stay unmounted while checking or in mini mode');
}
console.log('PASS: blocked mini payment retries, CNY/USD fallback, checkout mounting, ordinary web access, and existing-order navigation');
