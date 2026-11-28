import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash,webcrypto} from 'node:crypto';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
function load(file){const exports={};new Function('exports','crypto',ts.transpileModule(readFileSync(new URL('../'+file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(exports,webcrypto);return exports}
test('file checksums match an independent implementation and remain visible in the result UI',async()=>{
 const {md5Hex,sha256Hex}=load('lib/tools/shared/hash.ts');
 const {resultDetailLabel}=load('lib/tools/result-details.ts');
 for(const input of [Buffer.alloc(0),Buffer.from('abc'),Buffer.from('灵犀场\n文件校验 2026'),Buffer.from(Array.from({length:1025},(_,i)=>i%256))]){
  const data=input.buffer.slice(input.byteOffset,input.byteOffset+input.byteLength);
  assert.equal(await md5Hex(data),createHash('md5').update(input).digest('hex'));
  assert.equal(await sha256Hex(data),createHash('sha256').update(input).digest('hex'));
 }
 for(const key of ['file','size','MD5','SHA256','fileA','fileB','sizeA','sizeB','sameSize','identical','sha256A','sha256B']){
  assert.ok(resultDetailLabel(key,'zh'),key);assert.ok(resultDetailLabel(key,'en'),key);
 }
 assert.equal(resultDetailLabel('internalWorkerModelId','zh'),null);
});
