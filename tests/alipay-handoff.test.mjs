import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import ts from 'typescript';
const exports={};
vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../lib/alipay-handoff.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,
 {exports,Buffer,Date,process:{env:{ALIPAY_PRIVATE_KEY:'test-only-payment-signing-key'}},require:n=>{assert.equal(n,'node:crypto');return crypto}});
const id='132adfee-0d89-4c66-a072-e022766095a2',now=1800000000000;
test('payment link stays short and expires after thirty minutes',()=>{
 const ticket=exports.createAlipayHandoff(id,now);
 assert.equal(exports.readAlipayHandoff(ticket,now),id);
 assert(('https://lingxifield.cn/pay/alipay/'+ticket).length<110);
 assert.equal(exports.readAlipayHandoff(ticket,now+1800000),null);
 assert.equal(exports.readAlipayHandoff(ticket,now-1000),null);
});
test('changing the order or signature invalidates the capability',()=>{
 const ticket=exports.createAlipayHandoff(id,now);
 assert.equal(exports.readAlipayHandoff('0'+ticket.slice(1),now),null);
 assert.equal(exports.readAlipayHandoff(ticket.slice(0,-2)+'aa',now),null);
 for(const input of ['','../orders','x'.repeat(2000)])assert.equal(exports.readAlipayHandoff(input,now),null);
});
