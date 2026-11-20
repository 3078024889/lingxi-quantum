import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const exports = {};
let native = true, fail = false;
const paths = [];
const bridge = {
  getEnv: callback => callback({ miniprogram: native }),
  navigateTo: options => { paths.push(options.url); fail ? options.fail() : options.success(); },
};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync('lib/mini/payment-client.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText,
  { exports, window: { location: { search: '' }, wx: { miniProgram: bridge } },
    navigator: { userAgent: 'MicroMessenger iPhone' }, URLSearchParams, setTimeout, clearTimeout }
);
assert.equal(await exports.detectMiniPaymentContext(), true);
assert.equal(await exports.openMiniWallet('CNY', '88'), true);
assert.equal(paths[0], '/pages/cny-wallet/index?amount=88');
assert.equal(await exports.openMiniWallet('USD'), true);
assert.equal(paths[1], '/pages/web/index?usdWallet=1');
assert.equal(await exports.openMiniWallet(), true);
assert.equal(paths[2], '/pages/cny-wallet/index');
assert.equal(await exports.openMiniWallet('CNY', '10000.01'), true);
assert.equal(paths[3], '/pages/cny-wallet/index');
fail = true;
assert.equal(await exports.openMiniWallet('USD'), false);
native = false; fail = false;
assert.equal(await exports.detectMiniPaymentContext(), false);
const client = fs.readFileSync('lib/mini/payment-client.ts', 'utf8');
assert.ok(!client.includes('openMiniRecharge') && !client.includes('pages/balance'));
console.log('PASS: CNY opens the native wallet page; USD opens the official website wallet; amount and currency routing are preserved');

let walletPage, clipboard;
vm.runInNewContext(fs.readFileSync('miniapp/pages/web/index.js', 'utf8'), {
  Page: page => { walletPage = page; },
  require: () => ({enableShareMenu() {}}),
  wx: {setClipboardData({data}) { clipboard = data; }},
});
walletPage.setData = update => Object.assign(walletPage.data, update);
walletPage.onLoad({usdWallet: '1'});
assert.equal(walletPage.data.usdWallet, true);
walletPage.openUsdWebsite();
assert.equal(walletPage.data.src, 'https://lingxifield.cn/ai-wallet?currency=USD&mini=1&ads=0#wallet-topup');
walletPage.handleError();
assert.equal(walletPage.data.src, '');
walletPage.copyUsdWebsite();
assert.equal(clipboard, 'https://lingxifield.com/ai-wallet?currency=USD#wallet-topup');
