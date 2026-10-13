const fs=require('fs'),ts=require('typescript'),vm=require('vm'),assert=require('node:assert/strict');
function load(file,imports={},globals={}){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:m,exports:m.exports,require:n=>imports[n],...globals});return m.exports}
const {linkedImageDimensions}=load('lib/tools/shared/image-presets.ts');
for(const ratio of [1,4/3,3/4,16/9,9/16,4/5,21/9])for(const axis of ['width','height'])for(const input of [1,356,16384,20000]){const d=linkedImageDimensions(axis,input,ratio);assert(d.width>=1&&d.width<=16384&&d.height>=1&&d.height<=16384);assert(Math.abs(d.width-d.height*ratio)<=Math.max(1,ratio),'linked dimensions retain the ratio within one pixel')}
let decoded=0,closed=0,draws=[];
const bitmap={width:20,height:10,close(){closed++}};
const ctx={fillRect(){},clearRect(){},drawImage(...args){draws.push(args)}};
const resize=load('lib/tools/shared/image-resize-pro.ts',{'./image-smart-crop':{}},{createImageBitmap:async()=>{decoded++;return bitmap},document:{createElement:()=>({getContext:()=>ctx,toBlob:cb=>cb({size:1})})}});
(async()=>{
 for(const dimensions of [{width:16384,height:16384},{width:0,height:1},{width:NaN,height:20},{width:10.5,height:20}])await assert.rejects(resize.resizeImagePro({}, {...dimensions,fit:'stretch'}),/IMAGE_DIMENSIONS_/);
 assert.equal(decoded,0,'invalid and oversized targets rejected before decode/allocation');
 await resize.resizeImagePro({}, {width:100,height:100,fit:'stretch',allowUpscale:false});
 assert.deepEqual(draws.at(-1).slice(5),[40,45,20,10],'no enlargement mode keeps original-sized pixels centered');
 draws=[];await resize.resizeImagePro({}, {width:100,height:100,fit:'stretch',allowUpscale:true});assert.deepEqual(draws.at(-1).slice(5),[0,0,100,100]);assert.equal(closed,2);
 console.log('PASS: linked dimensions bounded without ratio drift; invalid/oversized targets rejected before decode; no-upscale stretch respects source sizes; opt-in enlargement and bitmap cleanup retained. Browser tests validate actual pixels.');
})().catch(e=>{console.error(e);process.exitCode=1});
