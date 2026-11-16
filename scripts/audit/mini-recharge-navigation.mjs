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
assert.equal(paths[1], '/pages/web/index?path=%2Fai-wallet%3Fcurrency%3DUSD');
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
