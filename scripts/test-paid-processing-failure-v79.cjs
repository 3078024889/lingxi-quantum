const fs=require('fs'),ts=require('typescript'),vm=require('vm'),assert=require('node:assert/strict');
const failure=()=>Promise.reject(Error('FIXTURE_PROCESSING_FAILURE'));
function processor(file,name='run'){
 const text=fs.readFileSync(file,'utf8'),ast=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);let fn;
 function visit(node){if(ts.isFunctionDeclaration(node)&&node.name?.text===name)fn=node;ts.forEachChild(node,visit)}visit(ast);assert(fn,file);
 const setters=[];const context={Error,Promise,AbortController,count:1,loading:false,controller:{current:null},uiLang:"en",ocrCopy:()=>({loading:"Loading"}),createOcrWorker:failure,files:[{name:'fixture.png'}],file:{name:'fixture.pdf'},mode:'english-handwriting',ocr:true,lang:'en',ocrLang:'eng',stop:{current:false},openPdf:failure,createFfmpegRuntime:failure,plainText:(_lang,key)=>key,t:(_zh,en)=>en,require:n=>{if(n==='tesseract.js')return {createWorker:failure};if(n==='@huggingface/transformers')return {env:{},pipeline:failure};throw Error('UNEXPECTED_IMPORT:'+n)}};
 for(const name of new Set(fn.getText(ast).match(/\bset[A-Z]\w*/g)||[]))context[name]=value=>setters.push({name,value});
 vm.createContext(context);vm.runInContext(ts.transpileModule(fn.getText(ast),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);
 return {run:context[name],setters,context};
}
(async()=>{
 for(const [file,name,args] of [
 ['components/tools/AudioCleanupWorkbench.tsx','run',[false]],
 ['components/tools/HandwritingOcrWorkbench.tsx','run',[]],
 ['components/tools/PdfOcrWorkbench.tsx','run',[undefined,true]],
 ['components/tools/PdfRedactWorkbench.tsx','exportRedacted',[]],
 ['components/tools/PdfToWordWorkbench.tsx','run',[]]
 ]){const test=processor(file,name);await assert.rejects(test.run(...args),/FIXTURE_PROCESSING_FAILURE/,file);assert(test.setters.some(x=>x.name==='setError'&&x.value),'processor must still show its error');}
 for(const [file,args] of [['components/tools/AudioCleanupWorkbench.tsx',[true]],['components/tools/PdfOcrWorkbench.tsx',[1,false]]])await processor(file).run(...args);
 const audio=processor('components/tools/AudioCleanupWorkbench.tsx'),paidFiles=[{name:'already-paid.mp3'}];let retained=paidFiles;
 Object.assign(audio.context,{Blob,Uint8Array,TextEncoder,previewUrl:'',preset:'voice',copyBytes:x=>x,fetchFile:async()=>new Uint8Array([1]),URL:{createObjectURL:()=> 'blob:preview',revokeObjectURL(){}},createFfmpegRuntime:async()=>({writeFile:async()=>{},exec:async()=>0,readFile:async()=>new Uint8Array(2048),terminate(){}}),setResults:value=>{retained=value}});
 await audio.run(true);assert.equal(retained,paidFiles,'free preview must retain the completed full export');
 await audio.run(false);assert.equal(retained.length,1);assert.equal(retained[0].name,'fixture-clean.mp3');
 const word=processor('components/tools/PdfToWordWorkbench.tsx'),canvas={width:200,height:300};let destroyed=0;
 Object.assign(word.context,{mode:'editable',pageText:async()=>'',openPdf:async()=>({numPages:1,getPage:async()=>({}),destroy:async()=>{destroyed++}}),renderPdfPage:async()=>({canvas}),canvasToBlob:async()=>({})});
 await assert.rejects(word.run(),/FIXTURE_PROCESSING_FAILURE/);assert.equal(destroyed,1);assert.equal(canvas.width,1);assert.equal(canvas.height,1);
 const cancelled=processor('components/tools/PdfOcrWorkbench.tsx');cancelled.context.createOcrWorker=async()=>({terminate:async()=>{}});cancelled.context.openPdf=async()=>({numPages:2,destroy(){}});cancelled.context.stop={get current(){return true},set current(_value){}};await assert.rejects(cancelled.run(undefined,true),/PROCESSING_CANCELLED/);
 const code=fs.readFileSync('lib/tools/commerce/delivery-proof.ts','utf8'),m={exports:{}};vm.runInNewContext(ts.transpileModule(code,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:m.exports});
 await assert.rejects(m.exports.requireCompletedDelivery(async()=>false),/DELIVERY_NOT_COMPLETE/);await assert.rejects(m.exports.requireCompletedDelivery(failure),/FIXTURE_PROCESSING_FAILURE/);await m.exports.requireCompletedDelivery(async()=>{});
 console.log('PASS: actual paid audio/handwriting/PDF OCR/redaction/Word failure callbacks reject; free previews keep their normal error UI; paid cancellation rejects; common action/export completion rejects explicit incomplete delivery. Engines mocked; no paid API calls. Image batch failure tested separately.');
})().catch(e=>{console.error(e);process.exitCode=1});
