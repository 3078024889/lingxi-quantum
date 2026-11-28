import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';

function subtitleEngine(){
 const calls=[],cache=new Map();let destroyed=false;
 const root=path.resolve('lib/tools/autonomous/subtitle-local.ts');
 function load(file){
  if(cache.has(file))return cache.get(file);
  const exports={};cache.set(file,exports);
  const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  runInNewContext(code,{exports,AbortController,Blob,setTimeout,clearTimeout,
   fetch:()=>{throw Error('Subtitle text must not leave the device')},
   Translator:{availability:async()=> 'available',create:async()=>({translate:async text=>{calls.push(text);return 'English '+text},destroy:()=>{destroyed=true}})},
   require:name=>{if(!name.startsWith('.'))throw Error('Unexpected dependency');return load(path.resolve(path.dirname(file),name+'.ts'))},
  });return exports;
 }
 return {translate:load(root).translateSubtitleLocal,calls,destroyed:()=>destroyed};
}

test('subtitle translation preserves cue IDs, timestamps and monetary units without uploading text',async()=>{
 const engine=subtitleEngine();
 const input='1\n00:00:01,000 --> 00:00:02,500\n金额10元。\n\n2\n00:00:03,000 --> 00:00:04,000\n你好。\n';
 const result=await engine.translate(input,'en','zh');
 assert(result.includes('1\n00:00:01,000 --> 00:00:02,500\n'));
 assert(result.includes('2\n00:00:03,000 --> 00:00:04,000\n'));
 assert(result.includes('10 CNY'));
 assert(!engine.calls.some(value=>value.includes('-->')||value.includes('10元')));
 assert(engine.destroyed());
});

test('WebVTT notes stay unchanged and cancellation never returns a partial subtitle file',async()=>{
 const engine=subtitleEngine();
 const input='WEBVTT\n\nNOTE Keep this metadata\n\n00:00:01.000 --> 00:00:02.000\n你好。';
 const result=await engine.translate(input,'en','auto');
 assert(result.startsWith('WEBVTT\n\nNOTE Keep this metadata\n\n'));
 assert(!engine.calls.some(text=>/NOTE|WEBVTT/.test(text)));
 const controller=new AbortController();controller.abort();
 await assert.rejects(engine.translate(input,'en','zh',controller.signal),{name:'AbortError'});
});
