#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),ts=require("typescript");
const paths=["lib/tools/media/compression-delivery.ts","components/tools/VideoToolkitWorkbench.tsx","lib/tools/media/video-labels.ts"];
for(const path of paths){
 const code=fs.readFileSync(path,"utf8");
 const out=ts.transpileModule(code,{fileName:path,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
 assert.equal(out.diagnostics?.filter(d=>d.category===ts.DiagnosticCategory.Error).length||0,0,"TS syntax: "+path);
}
const mod={exports:{}};
const raw=fs.readFileSync(paths[0],"utf8"),js=ts.transpileModule(raw,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
vm.runInNewContext(js,{module:mod,exports:mod.exports,RangeError,Number,Error});
const choose=mod.exports.chooseCompressionDelivery;
assert.equal(choose(1000,600,false),"smaller");
assert.equal(choose(1000,1000,false),"original");
assert.equal(choose(1000,1500,false),"original");
assert.equal(choose(1000,1500,true),"larger-transformed");
assert.equal(choose(1000,1000,true),"larger-transformed");
assert.throws(()=>choose(0,900,false),/INVALID_COMPRESSION_SIZE/);
assert.throws(()=>choose(1000,0,false),/INVALID_COMPRESSION_SIZE/);
assert.throws(()=>choose(Number.NaN,30,false),/INVALID_COMPRESSION_SIZE/);
const workbench=fs.readFileSync(paths[1],"utf8");
for(const marker of [
 "chooseCompressionDelivery(file.size,blob.size",
 'out.push({name:file.name,blob:file,mime:file.type||"application/octet-stream",size:file.size})',
 'if(!blob.size)throw new Error("EMPTY_VIDEO_OUTPUT")',
 "compressionNotices.original","compressionNotices.larger"
])assert(workbench.includes(marker),"missing media contract: "+marker);
const labels=fs.readFileSync(paths[2],"utf8");
for(const phrase of ["压缩后体积没有变小，已保留原文件","已按指定尺寸或帧率导出，但文件体积比原文件大"]){
 const from=labels.indexOf('"'+phrase+'": {'),to=labels.indexOf("\n  },",from);
 assert(from>=0&&to>from,"missing notice: "+phrase);
 const block=labels.slice(from,to);
 for(const lang of ["zh","en","ja","ko","fr","de","es","pt","ar"])assert(new RegExp("\\b"+lang+":").test(block),"missing "+lang+" notice");
}
console.log("VIDEO_COMPRESSION_INTEGRITY_GATE=PASS: smaller output, original fallback, transformed-size disclosure, zero-byte guard, nine locales");
