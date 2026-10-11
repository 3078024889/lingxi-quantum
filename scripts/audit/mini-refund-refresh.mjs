import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
const callbacks = {}, cleanups = []; let tick, progress = 0, reads = 0;
const document = { visibilityState: 'visible', addEventListener: (name, cb) => callbacks[name] = cb, removeEventListener() {} };
const exports = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/money/use-money-auto-refresh.ts','utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText, {
 exports, require: () => ({useRef: value => ({current:value}),useEffect: fn => cleanups.push(fn())}),
 document, navigator:{onLine:true}, window:{addEventListener:(name,cb)=>callbacks[name]=cb,removeEventListener(){}},
 setInterval:(cb,ms)=>{assert.equal(ms,30000);tick=cb;return 1}, clearInterval:()=>{tick=undefined},
 fetch:async()=>{progress++;return{}},console,
});
exports.useMoneyAutoRefresh(()=>{reads++}, false);
tick(); await new Promise(resolve=>setTimeout(resolve,0)); assert.equal(progress,1);assert.equal(reads,1);
document.visibilityState='hidden';tick();await new Promise(resolve=>setTimeout(resolve,0));assert.equal(reads,1);
document.visibilityState='visible';callbacks.visibilitychange();await new Promise(resolve=>setTimeout(resolve,0));assert.equal(reads,2);
cleanups.forEach(fn=>fn());assert.equal(tick,undefined);
const retry = fs.readFileSync('lib/mini/virtual-refund.ts','utf8');
assert.match(retry,/eq\("user_id", userId\)/);assert.match(retry,/query = query.in\("out_trade_no", ids\)/);
const route=fs.readFileSync('app/api/wechat/mini/refunds/progress/route.ts','utf8');
assert.match(route,/session.accountConnected/);assert.match(route,/retryVirtualRefunds\(5, session.userId\)/);
console.log('PASS: external refunds refresh without a website withdrawal; hidden pages pause, return resumes, cleanup stops timer; native reconciliation scoped to connected account.');
