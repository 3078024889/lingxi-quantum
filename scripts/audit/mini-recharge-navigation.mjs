import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const exports = {};
let native = true, fail = false;
const paths = [], websitePaths=[];
const bridge = {
  getEnv: callback => callback({ miniprogram: native }),
  navigateTo: options => { paths.push(options.url); fail ? options.fail() : options.success(); },
};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync('lib/mini/payment-client.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText,
  { exports, window: { location: { search: '', assign:path=>websitePaths.push(path) }, wx: { miniProgram: bridge } },
    navigator: { userAgent: 'MicroMessenger iPhone' }, URLSearchParams, setTimeout, clearTimeout }
);
assert.equal(await exports.detectMiniPaymentContext(), true);
assert.equal(await exports.openMiniWallet('CNY'), true);
assert.equal(websitePaths[0],'/ai-wallet?currency=CNY&mini=1#wallet-topup');
assert.equal(await exports.openMiniWallet('USD'), true);
assert.equal(websitePaths[1],'/ai-wallet?currency=USD&mini=1#wallet-topup');
assert.equal(await exports.openMiniWechatTopup('88'),true);
assert.equal(paths[0],'/pages/cny-wallet/index?amount=88');
assert.equal(await exports.openMiniWechatTopup('10000.01'),false);
assert.equal(paths.length,1);
fail=true;
assert.equal(await exports.openMiniWechatTopup('88'),false);
native = false; fail = false;
assert.equal(await exports.detectMiniPaymentContext(), false);
const client = fs.readFileSync('lib/mini/payment-client.ts', 'utf8');
assert.ok(!client.includes('openMiniRecharge') && !client.includes('pages/balance'));
console.log('PASS: CNY opens the native wallet page; USD opens the official website wallet; amount and currency routing are preserved');

let walletPage, clipboard;
vm.runInNewContext(fs.readFileSync('miniapp/pages/web/index.js', 'utf8'), {
  Page: page => { walletPage = page; },
  require: () => ({enableShareMenu() {}}),
  wx: {getStorageSync:()=> 'USD',setClipboardData({data}) { clipboard = data; }},
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
