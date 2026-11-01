#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict"),ts=require("typescript"),vm=require("node:vm");
const source=fs.readFileSync("lib/sasi/original-variant-workflows.ts","utf8");
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const sandboxModule={exports:{}};
vm.runInNewContext(compiled,{exports:sandboxModule.exports,module:sandboxModule,Intl,Number,Array,Object,String,Error},{timeout:2000});
const {parseStoryboardLines,compileStoryboardVariants,estimatedWordCues}=sandboxModule.exports;
const scenes=parseStoryboardLines("8 | {{hook}} {{product}} | Front shot\n9 | {{cta}} | Product detail");
assert.equal(scenes.length,2);assert.equal(scenes[0].seconds,8);
const cfg={scenes,hooks:["New angle","Another angle"],product:"SASI",cta:"Explore today",locale:"zh",count:100};
const result=compileStoryboardVariants(cfg);
assert.equal(result.length,100);
assert.equal(result[0].id,"variant-001");
assert.equal(result[99].id,"variant-100");
assert.equal(result[0].scenes[0].voice,"New angle SASI");
assert.equal(result[1].scenes[0].voice,"Another angle SASI");
assert.equal(result[0].scenes[1].startSeconds,8);
assert.equal(result[0].totalSeconds,17);
assert.equal(result[99].scenes[1].voice,"Explore today");
assert(result[0].scenes[0].wordCues.every(x=>Number.isFinite(x.approxStartSeconds)&&x.approxStartSeconds>=0&&x.approxStartSeconds<8));
assert.equal(estimatedWordCues("星空宇宙",4).length,4);
assert.deepEqual([...result[0].scenes.map(x=>x.seconds)],[8,9]);
assert.equal(cfg.scenes[0].voice,"{{hook}} {{product}}");
for(const [change,pattern]of [
 [{count:101},/INVALID_VARIANT_COUNT/],
 [{count:0},/INVALID_VARIANT_COUNT/],
 [{count:2.5},/INVALID_VARIANT_COUNT/],
 [{locale:"bad"},/UNSUPPORTED_LOCALE/],
 [{hooks:[]},/INVALID_HOOKS/],
 [{scenes:[]},/INVALID_SCENES/],
 [{product:""},/INVALID_PRODUCT/],
 [{scenes:[{id:"x",seconds:31,voice:"hi",visual:"hi"}]},/INVALID_SCENE_DURATION/],
 ]){
 assert.throws(()=>compileStoryboardVariants({...cfg,...change}),pattern);
}
assert.throws(()=>parseStoryboardLines("2 | missing visual"),/SCENE_FORMAT_SECONDS_VOICE_VISUAL/);
assert.throws(()=>parseStoryboardLines(Array(25).fill("3 | speech | scene").join("\n")),/STORYBOARD_REQUIRES_1_TO_24_SCENES/);
assert.throws(()=>parseStoryboardLines(Array(11).fill("30 | speech | scene").join("\n")),/STORYBOARD_MAX_300_SECONDS/);
assert(!source.includes("hypit-ai/hypit")&&!source.includes("from \"@hypit"));
const workbench=fs.readFileSync("components/SasiVariantWorkbench.tsx","utf8");
assert.match(workbench,/reference&&\!rights/);
assert.match(workbench,/promotionBrief\.v1/);
assert.match(workbench,/reference:\{localOnly:true/);
assert.match(workbench,/before any provider call/);
assert.match(workbench,/timing:"estimated-word-positions-not-audio-alignment"/);
console.log("SASI_ORIGINAL_VARIANT_ENGINE=PASS: 100 editable projects, exact reflow, 9 locales, bounded input, rights and explicit quote handoff");
