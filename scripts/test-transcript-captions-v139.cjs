const fs=require("node:fs");
const ts=require("typescript");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const filename="lib/tools/autonomous/transcribe-local.ts";
const source=fs.readFileSync(filename,"utf8");
const ast=ts.createSourceFile(filename,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
const functions=new Map();
for(const stmt of ast.statements){
 if(ts.isFunctionDeclaration(stmt)&&stmt.name&&["timestamp","captionSegments","toSrt","toVtt"].includes(stmt.name.text))
  functions.set(stmt.name.text,stmt.getText(ast));
}
assert.equal(functions.size,4,"transcript formatter must include all four functions");
const compiled=ts.transpileModule([...functions.values()].join("\n"),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const ctx={exports:{},Error,Math,Number,String};
vm.runInNewContext(compiled,ctx);
const {toSrt,toVtt}=ctx.exports;
assert.equal(typeof toSrt,"function");assert.equal(typeof toVtt,"function");
const cues=[{start:1.125,end:3.5,text:"Hello, world. Keep 1,234 and 00:00:04,111."},{start:8.9,end:10.32,text:"Second cue, with punctuation!"}];
const srt=toSrt(cues),vtt=toVtt(cues);
assert.match(srt,/1\n00:00:01,125 --> 00:00:03,500\nHello, world/);
assert.match(srt,/2\n00:00:08,900 --> 00:00:10,320\nSecond cue/);
assert.match(vtt,/^WEBVTT\n\n00:00:01\.125 --> 00:00:03\.500\nHello, world/m);
assert(vtt.includes("Keep 1,234 and 00:00:04,111."),"caption prose must retain commas, including time-like prose");
assert(vtt.includes("Second cue, with punctuation!"));
assert(!vtt.includes("00:00:04.111."),"never rewrite dialogue punctuation as a timestamp");
assert.equal(toVtt([]),"WEBVTT\n\n");
const openEnded=toSrt([{start:3,end:0,text:"Partial"}]);
assert(openEnded.includes("00:00:03,000 --> 00:00:03,001"));
for(const invalid of [Number.NaN,Number.POSITIVE_INFINITY,-1]){
 assert.throws(()=>toSrt([{start:invalid,end:2,text:"x"}]),/TRANSCRIPT_TIME_INVALID/);
 assert.throws(()=>toVtt([{start:0,end:invalid,text:"x"}]),/TRANSCRIPT_TIME_INVALID/);
}
console.log("TRANSCRIPT_CAPTIONS_GATE=PASS: SRT/VTT exact timing, punctuation retention, empty and invalid times, open-ended cue duration");
