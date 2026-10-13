const fs=require('fs'),ts=require('typescript'),vm=require('vm'),assert=require('node:assert/strict'),{Worker:Thread}=require('node:worker_threads');
const source=fs.readFileSync('public/runtime/tools/regex-worker-v79.js','utf8');let terminated=0,started=0;
class BrowserWorker{constructor(url){assert.equal(url,'/runtime/tools/regex-worker-v79.js');started++;this.thread=new Thread("const {parentPort}=require('node:worker_threads');global.self={postMessage:x=>parentPort.postMessage(x)};parentPort.on('message',data=>self.onmessage({data}));\n"+source,{eval:true});this.thread.on('message',data=>this.onmessage?.({data}));this.thread.on('error',error=>this.onerror?.(error))}postMessage(data){this.thread.postMessage(data)}terminate(){terminated++;void this.thread.terminate()}}
const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/tools/shared/regex-worker-client.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:m.exports,Worker:BrowserWorker,Error,Array,setTimeout,clearTimeout});
(async()=>{
 const run=m.exports.runRegexSafely;let result=await run('/(你)/gu','你好，你');assert.equal(result.length,2);assert.equal(result[1].position,3);assert.equal(result[0].groups[0],'你');
 await assert.rejects(run('/[/g','text'),/REGEX_INVALID/);
 await assert.rejects(run('/(?:)/g','x'.repeat(11000)),/REGEX_RESULT_TOO_LARGE/);
 const before=started;await assert.rejects(run('/x/g','x'.repeat(500001)),/REGEX_INPUT_TOO_LARGE/);assert.equal(started,before);
 const began=Date.now();await assert.rejects(run('/(a+)+$/','a'.repeat(10000)+'!'),/REGEX_TIMEOUT/);assert(Date.now()-began<5000,'actual catastrophic regex is terminated promptly');
 const controller=new AbortController(),pending=run('/(a+)+$/','a'.repeat(10000)+'!',controller.signal);controller.abort();await assert.rejects(pending,/REGEX_CANCELLED/);
 result=await run('/ok/g','ok ok');assert.equal(result.length,2);assert.equal(terminated,started,'every worker released after success, failure, timeout or cancellation');
 console.log('PASS: actual Worker threads execute Unicode/capture matching; invalid syntax, result/input bounds, catastrophic backtracking timeout, cancellation, subsequent recovery and worker cleanup. No network/provider calls.');
})().catch(e=>{console.error(e);process.exitCode=1});
