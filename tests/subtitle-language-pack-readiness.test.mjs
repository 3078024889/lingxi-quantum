import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import ts from "typescript";
function load(file,dependencies={},runtime={}){
 const exports={};
 vm.runInNewContext(ts.transpileModule(readFileSync(new URL("../"+file,import.meta.url),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,...runtime,require:name=>dependencies[name]});
 return exports;
}
const srt="1\n00:00:01,000 --> 00:00:03,000\nHello.";
test("missing language packs return immediately without starting a stalled browser download",async()=>{
 let creates=0;
 const subtitle=load("lib/tools/shared/subtitle-document.ts");
 for(const status of ["downloadable","downloading","unavailable"]){
  const local=load("lib/tools/autonomous/subtitle-local.ts",{"../shared/subtitle-document":subtitle},{Translator:{availability:async()=>status,create:async()=>{creates++;return new Promise(()=>{})}}});
  await assert.rejects(local.translateSubtitleLocal(srt,"es","en"),/LOCAL_LANGUAGE_PACK_NOT_READY/);
 }
 assert.equal(creates,0);
});
test("ready browser translation preserves cue timing and releases the translator",async()=>{
 let destroyed=false;
 const subtitle=load("lib/tools/shared/subtitle-document.ts");
 const local=load("lib/tools/autonomous/subtitle-local.ts",{"../shared/subtitle-document":subtitle},{Translator:{availability:async()=>"available",create:async()=>({translate:async()=>"Hola.",destroy:()=>{destroyed=true}})}});
 assert.equal(await local.translateSubtitleLocal(srt,"es","en"),"1\n00:00:01,000 --> 00:00:03,000\nHola.\n");
 assert.equal(destroyed,true);
});

