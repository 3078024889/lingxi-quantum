const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),assert=require('node:assert/strict');
const path='lib/tools/media/video-translate-client.ts',source=fs.readFileSync(path,'utf8');
const file=ts.createSourceFile(path,source,ts.ScriptTarget.ES2022,true,ts.ScriptKind.TS);
const names=['requireTimedTranscript','subtitleTime','toSrtTimed','toVttTimed'];
const functions=file.statements.filter(x=>ts.isFunctionDeclaration(x)&&names.includes(x.name?.text));
assert.equal(functions.length,4,'all real subtitle functions must be present');
const text=functions.map(x=>x.getText(file)).join('\n');
const code=ts.transpileModule(text,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const moduleExports={};
vm.runInNewContext(code,{exports:moduleExports,Number,Math,String,Array,Error});
const input=[{start:1.2,end:3.45,text:'Hello, world. This has an ordinary comma, and fake time 00:00:01,222.'}];
const srt=moduleExports.toSrtTimed(input),vtt=moduleExports.toVttTimed(input);
assert(srt.includes('00:00:01,200 --> 00:00:03,450'));
assert(vtt.includes('00:00:01.200 --> 00:00:03.450'));
assert(vtt.includes('Hello, world. This has an ordinary comma, and fake time 00:00:01,222.'));
assert(vtt.startsWith('WEBVTT\n\n'));
for(const bad of [[],[{start:0,end:0,text:'un-timed'}],[{start:0,end:Infinity,text:'bad'}],[{start:-1,end:3,text:'bad'}],[{start:2,end:1,text:'bad'}],[{start:1,end:2,text:'  '}]]){
 assert.throws(()=>moduleExports.toSrtTimed(bad),/TRANSCRIPT_TIMESTAMPS_/);
 assert.throws(()=>moduleExports.toVttTimed(bad),/TRANSCRIPT_TIMESTAMPS_/);
}
const translate=fs.readFileSync('components/tools/VideoTranslateWorkbench.tsx','utf8');
assert(translate.includes('requireTimedTranscript(local.segments.map('));
assert(!translate.includes('original=[{start:0,end:duration,text'));
const dubbing=fs.readFileSync('components/tools/VideoDubbingWorkbench.tsx','utf8');
assert(!dubbing.includes('srt.replace(text,translated)'));
assert(!dubbing.includes('new Date(Math.max(1000,duration*1000))'));
assert(dubbing.includes('translatedSegments.length'));
assert(dubbing.includes('toSrt(translatedSegments)'));
console.log('VIDEO_SUBTITLES_V148=PASS: verified genuine timestamps only, literal comma-safe VTT, per-cue translation and no fabricated full-video cues; no provider or payment mocking.');
