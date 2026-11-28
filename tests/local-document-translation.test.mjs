import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';

function load(file,globals={}){
 const exports={};
 const code=ts.transpileModule(readFileSync(new URL('../'+file,import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
 runInNewContext(code,{exports,AbortController,Blob,Float32Array,DataView,ArrayBuffer,Error,Map,RegExp,setTimeout,clearTimeout,...globals,
  require:name=>{throw Error('Unexpected dependency: '+name)},fetch:()=>{throw Error('Document data must never be uploaded')}});
 return exports;
}
test('local translation preserves every Unicode character when splitting long inputs',()=>{
 const {splitTranslationText}=load('lib/tools/autonomous/translation-local.ts');
 const input='第一段。\n第二段🙂'.repeat(90),chunks=splitTranslationText(input);
 assert.equal(chunks.join(''),input);
 assert(chunks.every(chunk=>Array.from(chunk).length<=180));
 assert.throws(()=>splitTranslationText(input,0),/LIMIT_INVALID/);
});

test('cancellation releases a stalled download without waiting for the browser promise',async()=>{
 const controller=new AbortController();let nativeSignal;
 const {createLocalTranslator}=load('lib/tools/autonomous/translation-local.ts',{
  Translator:{availability:async()=> 'downloadable',create:async options=>{nativeSignal=options.signal;return new Promise(()=>{})}},
 });
 const pending=createLocalTranslator('zh','en','测试',{signal:controller.signal});
 await new Promise(resolve=>setTimeout(resolve,0));
 controller.abort();
 await assert.rejects(pending,{name:'AbortError'});
 assert.equal(nativeSignal.aborted,true);
});

test('a stalled operation times out and completed native clauses remain separate',async()=>{
 const calls=[];
 const {awaitLocalOperation,translateTextLocal}=load('lib/tools/autonomous/translation-local.ts',{
  Translator:{availability:async()=> 'available',create:async()=>({translate:async text=>{calls.push(text);return '['+text+']'}})},
 });
 await assert.rejects(awaitLocalOperation(new Promise(()=>{}),undefined,5),/LOCAL_TRANSLATION_TIMEOUT/);
 const input='第一句。第二句；第三句。';
 const result=await translateTextLocal(input,'zh','en');
 assert.equal(calls.join(''),input);
 assert.equal(calls.length,3);
 for(const call of calls)assert(result.includes('['+call+']'));
});
test('language download is supported, translation stays on device, cancellation is honored',async()=>{
 let destroyed=false;const requests=[];
 const {createLocalTranslator,translateTextLocal}=load('lib/tools/autonomous/translation-local.ts',{
  Translator:{availability:async()=> 'downloadable',create:async options=>{
   requests.push(options);return{translate:async text=>'译文：'+text,destroy(){destroyed=true}};
  }},
 });
 assert.equal(await translateTextLocal('Example','en','zh'),'译文：Example');
 assert.equal(destroyed,true);assert.equal(requests[0].sourceLanguage,'en');
 const controller=new AbortController();controller.abort();
 await assert.rejects(createLocalTranslator('zh','en','测试',{signal:controller.signal}),{name:'AbortError'});
});
test('automatic script detection does not guess English for ambiguous Latin languages',async()=>{
 const {createLocalTranslator}=load('lib/tools/autonomous/translation-local.ts');
 await assert.rejects(createLocalTranslator('auto','zh','Bonjour tout le monde'),/SOURCE_LANGUAGE_REQUIRED/);
});

test('Chinese auto detection never waits for a downloadable browser language detector',async()=>{
 let detectorCalls=0;
 const {translateTextLocal}=load('lib/tools/autonomous/translation-local.ts',{
  LanguageDetector:{availability:async()=> 'downloadable',create:()=>{detectorCalls++;throw Error('Unexpected detector download')}},
  Translator:{availability:async()=> 'available',create:async()=>({translate:async()=> 'Hello, world.'})},
 });
 assert.equal(await translateTextLocal('你好，世界。','auto','en'),'Hello, world.');
 assert.equal(detectorCalls,0);
});
test('custom terms are literal, longest matches win, and translated text is retained',async()=>{
 const {translateWithGlossary}=load('lib/tools/autonomous/translation-local.ts');
 const result=await translateWithGlossary({translate:async text=>'['+text+']'},'Use C++ and C.',[
  {source:'C',target:'short'},{source:'C++',target:'cplusplus'},
 ]);
 assert(result.includes('cplusplus'));assert(result.includes('short'));assert(result.includes('[Use '));
 assert(!result.includes('C++'));
});

test('explicit currencies and amounts never enter a model that may substitute dollars',async()=>{
 const {translateWithGlossary}=load('lib/tools/autonomous/translation-local.ts');
 const inputs=[];
 const result=await translateWithGlossary({translate:async text=>{inputs.push(text);return text}},'金额10元，费用1,234.50美元，另付20欧元。',[]);
 assert(result.includes('10 CNY'));
 assert(result.includes('1,234.50 USD'));
 assert(result.includes('20 EUR'));
 assert(!inputs.some(text=>/10元|1,234.50美元|20欧元/.test(text)));
});
