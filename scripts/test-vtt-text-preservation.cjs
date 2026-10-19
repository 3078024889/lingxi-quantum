const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm');
for(const [file,name] of [['lib/tools/autonomous/transcribe-local.ts','toVtt'],['lib/tools/media/video-translate-client.ts','toVttTimed']]){
 const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:()=>({}),console});
 const text='Hello, world\n123\n你好，世界\n00:00:01,000 --> 00:00:02,000';
 const out=exports[name]([{start:1.005,end:3661.025,text},{start:-1,end:.25,text:'456'}]);
 assert.equal(out,'WEBVTT\n\n00:00:01.005 --> 01:01:01.025\n'+text+'\n\n00:00:00.000 --> 00:00:00.250\n456',file);
 assert.equal(exports[name]([]),'WEBVTT\n\n');
}
console.log('VTT_TEXT_PRESERVATION=PASS: both real serializers retain commas, numeric lines, multilingual text and timestamp-like body text; timestamps round, clamp and format correctly.');
