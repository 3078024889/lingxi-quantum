const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
let calls=[],reply='ok',destroyed=0;
const cache=new Map(),context={AbortSignal,AbortController,console,fetch:async(url,options)=>{
 assert.equal(url,'/api/tools/document-translate');const body=JSON.parse(options.body);calls.push(body);
 return{ok:reply!=='auth'&&reply!=='offline',status:reply==='auth'?401:reply==='offline'?503:200,json:async()=>({segments:reply==='partial'?[]:body.segments.map(s=>({id:s.id,text:'译文 '+s.text}))})};
},Translator:{create:async()=>({translate:async text=>'译文 '+text,destroy:()=>destroyed++})}};
function load(file){if(cache.has(file))return cache.get(file);const exports={};cache.set(file,exports);const requireLocal=n=>load(n.startsWith('@/')?n.slice(2)+'.ts':require('node:path').join(require('node:path').dirname(file),n)+'.ts');vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{...context,exports,require:requireLocal});return exports}
(async()=>{
 const parser=load('lib/tools/shared/subtitle-document.ts'),online=load('lib/tools/autonomous/subtitle-online.ts'),local=load('lib/tools/autonomous/subtitle-local.ts');
 const source='WEBVTT\n\nNOTE keep original metadata\n\ncue-A\n00:00:01.000 --> 00:00:02.000 align:start\n<b>Hello</b>\n\ncue-B\n00:03.000 --> 00:04.000\nWorld\n';
 const out=await online.translateSubtitleOnline(source,'zh','en');assert(out.startsWith('WEBVTT\n\nNOTE keep original metadata'));assert(out.includes('cue-A\n00:00:01.000 --> 00:00:02.000 align:start\n译文 <b>Hello</b>'));assert.equal(calls.length,1);assert.equal(calls[0].segments.length,2);assert(!JSON.stringify(calls[0]).includes('NOTE keep'));
 const native=await local.translateSubtitleLocal(source,'zh','en');assert.equal(native,out);assert.equal(destroyed,1);
 assert.throws(()=>parser.subtitleBlocks('not a subtitle'),/FORMAT_INVALID/);assert.throws(()=>parser.subtitleBlocks('1\n00:00:01,000 --> 00:00:02,000\n'),/FORMAT_INVALID/);
 const blocks=parser.subtitleBlocks('1\n00:00:01,000 --> 00:00:02,000\n<b>Hello</b>');assert.throws(()=>parser.rebuildSubtitles(blocks,new Map([[0,'missing tags']])),/MARKUP_CHANGED/);assert.throws(()=>parser.rebuildSubtitles(blocks,new Map()),/INCOMPLETE/);
 calls=[];const many=Array.from({length:31},(_,i)=>`${i+1}\n00:00:01,000 --> 00:00:02,000\nhello ${i}`).join('\n\n');await online.translateSubtitleOnline(many,'zh','en');assert.equal(calls.length,2);assert.equal(calls[0].segments.length,30);assert.equal(calls[1].segments.length,1);
 reply='partial';await assert.rejects(online.translateSubtitleOnline(source,'zh','en'),/INCOMPLETE/);
 reply='auth';await assert.rejects(online.translateSubtitleOnline(source,'zh','en'),/AUTH_REQUIRED/);
 reply='offline';await assert.rejects(online.translateSubtitleOnline(source,'zh','en'),/UNAVAILABLE/);
 const abort=new AbortController();abort.abort();await assert.rejects(local.translateSubtitleLocal(source,'zh','en',abort.signal));assert.equal(destroyed,1);
 console.log('SUBTITLE_TRANSLATION=PASS: actual local/online functions, WebVTT metadata and cue identifiers, exact timing/settings, inline markup, batching, incomplete output/auth/outage, cancellation and native resource cleanup. Provider responses isolated; no financial writes.');
})().catch(e=>{console.error(e);process.exitCode=1});
