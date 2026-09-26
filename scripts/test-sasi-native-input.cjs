const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const moduleObject={exports:{}};
const code=ts.transpileModule(fs.readFileSync('lib/sasi-kernel/compute/input.ts','utf8'),{
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}
}).outputText;
vm.runInNewContext(code,{exports:moduleObject.exports,module:moduleObject,Buffer,Request,console});
const {normalizeNativeInput,readBoundedJson}=moduleObject.exports;
(async()=>{
  assert.equal(normalizeNativeInput('reason',{prompt:' hello '}).prompt,'hello');
  assert.throws(()=>normalizeNativeInput('reason',{prompt:'x',images:['https://example.com/image.png']}));
  assert.throws(()=>normalizeNativeInput('video',{prompt:'x',durationSec:Infinity}));
  assert.throws(()=>normalizeNativeInput('video',{prompt:'x',durationSec:11}));
  assert.equal(normalizeNativeInput('video',{prompt:'x',durationSec:8}).durationSec,8);
  assert.equal((await readBoundedJson(new Request('http://localhost',{method:'POST',body:'{"prompt":"hello"}'}))).prompt,'hello');
  await assert.rejects(()=>readBoundedJson(new Request('http://localhost',{method:'POST',body:'[]'})));
  // A dishonest/missing Content-Length must not bypass the streaming limit.
  let cancelled=false;
  const stream=new ReadableStream({pull(c){c.enqueue(new Uint8Array(1024*1024));},cancel(){cancelled=true;}});
  await assert.rejects(()=>readBoundedJson(new Request('http://localhost',{method:'POST',body:stream,duplex:'half'})));
  assert.equal(cancelled,true);
  console.log('SASI_NATIVE_INPUT_TESTS=PASS (9 assertions; no model inference)');
})().catch(error=>{console.error(error);process.exitCode=1});
