const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const code=ts.transpileModule(fs.readFileSync(process.argv[2]||'lib/tools/shared/image-canvas.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function fixture(mode='success'){
 const urls=new Set(),timers=new Set(),canvases=[],state={bitmapClosed:0,nativeCalls:0};
 class Canvas{constructor(){this.width=0;this.height=0;canvases.push(this)}getContext(){return mode==='no-context'?null:{fillRect(){},drawImage(){if(mode==='draw-failure')throw Error('DRAW_FAILED')}}}}
 class Image{constructor(){this.naturalWidth=mode==='oversize'?100000:64;this.naturalHeight=mode==='oversize'?100000:32}set src(v){if(!v)return;if(mode==='timeout')return;queueMicrotask(()=>mode==='invalid'?this.onerror?.():this.onload?.())}}
 const exports={};vm.runInNewContext(code,{exports,require:()=>({replaceExt(){}}),Image,document:{createElement:()=>new Canvas()},URL:{createObjectURL(){urls.add('blob:audit');return'blob:audit'},revokeObjectURL(u){urls.delete(u)}},setTimeout(fn){timers.add(1);if(mode==='timeout')queueMicrotask(fn);return 1},clearTimeout(id){timers.delete(id)},createImageBitmap:async input=>{state.nativeCalls++;if(!(input instanceof Canvas)&&input.type==='image/svg+xml')throw Error('NATIVE_SVG_UNSUPPORTED');if(mode==='bitmap-failure')throw Error('BITMAP_FAILED');return{width:input.width||64,height:input.height||32,close(){state.bitmapClosed++}}}});
 return {api:exports,urls,timers,canvases,state};
}
(async()=>{
 const svg={type:'image/svg+xml',name:'qrcode.svg'},png={type:'image/png',name:'image.png'};
 const success=fixture(),bitmap=await success.api.loadImageBitmap(svg);assert.equal(bitmap.width,64);assert.equal(success.state.nativeCalls,2);assert.equal(success.urls.size,0);assert.equal(success.timers.size,0);assert(success.canvases.every(c=>c.width===0&&c.height===0));
 for(const mode of ['invalid','timeout','oversize','no-context','draw-failure','bitmap-failure']){const f=fixture(mode);await assert.rejects(f.api.loadImageBitmap(svg));assert.equal(f.urls.size,0,mode+' URLs');assert.equal(f.timers.size,0,mode+' timers');assert(f.canvases.every(c=>c.width===0&&c.height===0),mode+' canvas released')}
 const raster=fixture();await raster.api.loadImageBitmap(png);assert.equal(raster.state.nativeCalls,1);assert.equal(raster.urls.size,0);assert.equal(raster.canvases.length,0);
 const noContext=fixture('no-context');await assert.rejects(noContext.api.drawFileToCanvas(png));assert.equal(noContext.state.bitmapClosed,1);
 const drawFailure=fixture('draw-failure');await assert.rejects(drawFailure.api.drawFileToCanvas(png));assert.equal(drawFailure.state.bitmapClosed,1);assert(drawFailure.canvases.every(c=>c.width===0&&c.height===0));
 console.log('PASS: actual SVG fallback preserves raster fast path; success, malformed, timeout, oversize, context, draw and bitmap failures release temporary URLs, timers and canvases. Draw failures close source bitmaps. Browser decoding is verified separately.');
})().catch(e=>{console.error(e);process.exitCode=1});
