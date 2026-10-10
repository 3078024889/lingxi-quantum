import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const exports={};let native=true,fail=false;const paths=[];
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/mini/payment-client.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{
 exports,window:{location:{search:''},wx:{miniProgram:{getEnv:cb=>cb({miniprogram:native}),navigateTo:options=>{paths.push(options.url);fail?options.fail():options.success();}}}},navigator:{userAgent:'MicroMessenger iPhone'},URLSearchParams,setTimeout,clearTimeout,
});
assert.equal(await exports.detectMiniPaymentContext(),true,'iOS async bridge environment without query marker');
assert.equal(await exports.openMiniRecharge(),true);assert.equal(paths[0],'/pages/balance/index');
fail=true;assert.equal(await exports.openMiniRecharge(),false,'Missing old-version page is visible to caller');
native=false;assert.equal(await exports.detectMiniPaymentContext(),false,'Ordinary WeChat web checkout remains separate');
console.log('PASS: iOS asynchronous mini environment, native recharge destination, old-version navigation error and ordinary web detection.');
