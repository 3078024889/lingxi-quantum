const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const code=ts.transpileModule(fs.readFileSync('lib/tools/media/metadata.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
async function check(initial,final,kind='video',failure=false){
 let revoked=0,removed=0,seek=0,selected='',media;
 const exports={};
 class URLs{static createObjectURL(){return 'blob:fixture'}static revokeObjectURL(){revoked++}}
 const document={createElement(k){selected=k;media={duration:initial,load(){},removeAttribute(){removed++},set src(value){queueMicrotask(()=>failure?this.onerror?.():this.onloadedmetadata?.())},set currentTime(value){seek++;if(final!==undefined){this.duration=final;queueMicrotask(()=>this.ondurationchange?.())}}};return media}};
 vm.runInNewContext(code,{exports,document,URL:URLs,setTimeout:fn=>setTimeout(fn,25),clearTimeout,Number,Error});
 const promise=exports.readMediaDuration(new Blob(['fixture'],{type:kind==='audio'?'audio/mpeg':'video/webm'}));
 if(failure||!Number.isFinite(final??initial))await assert.rejects(promise,/MEDIA_METADATA/);
 else assert.equal(await promise,final??initial);
 assert.equal(selected,kind);assert.equal(revoked,1);assert.equal(removed,1);
 assert.equal(media.onloadedmetadata,null);assert.equal(media.ondurationchange,null);assert.equal(media.onerror,null);
 return seek;
}
(async()=>{
 assert.equal(await check(12),0);assert.equal(await check(60,undefined,'audio'),0);
 assert.equal(await check(Infinity,12),1);assert.equal(await check(Infinity,125,'audio'),1);
 await check(Infinity,undefined);await check(NaN,undefined);await check(12,undefined,'video',true);
 console.log('MEDIA_METADATA_LIFECYCLE=PASS: finite, unknown WebM duration discovery, timeout, error and URL/event cleanup');
})().catch(e=>{console.error(e);process.exitCode=1});
