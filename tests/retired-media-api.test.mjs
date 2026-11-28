import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';

function compile(file){return ts.transpileModule(readFileSync(new URL('../'+file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText}

test('retired document and media endpoints never read a file or invoke a provider',async()=>{
 for(const endpoint of ['document-translate','media/translate','media/transcribe','media/tts','media/free-dubbing-preview']){
  const exports={};
  runInNewContext(compile(`app/api/tools/${endpoint}/route.ts`),{
   exports,fetch:()=>assert.fail('Paid or remote inference must not be invoked'),
   require:name=>{assert.equal(name,'next/server');return {NextResponse:{json:(body,options)=>({body,...options})}}},
  });
  const response=await exports.POST(new Proxy({},{get:()=>assert.fail('A retired endpoint must not read private input')}));
  assert.equal(response.status,410);
  assert.equal(response.body.error,'LOCAL_PROCESSING_REQUIRED');
 }
});

test('local voice export encodes valid PCM WAV samples and rejects unsupported languages',async()=>{
 const exports={};
 runInNewContext(compile('lib/tools/autonomous/speech-local.ts'),{exports,Blob,Float32Array,DataView,ArrayBuffer,Error,
  require:name=>{assert.equal(name,'./translation-local');return{}},fetch:()=>assert.fail('PCM encoding must not use a service'),
 });
 const blob=exports.pcmToWav(new Float32Array([-2,0,2]),16000),view=new DataView(await blob.arrayBuffer());
 assert.equal(blob.type,'audio/wav');assert.equal(view.byteLength,50);
 assert.equal(view.getUint32(24,true),16000);
 assert.equal(view.getInt16(44,true),-32768);assert.equal(view.getInt16(46,true),0);assert.equal(view.getInt16(48,true),32767);
 await assert.rejects(exports.synthesizeLocal('你好','zh'),/LANGUAGE_UNSUPPORTED/);
});
