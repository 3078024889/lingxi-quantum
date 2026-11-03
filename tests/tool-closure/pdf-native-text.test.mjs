import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {createRequire} from "node:module";
const base=createRequire(import.meta.url);
const ts=base("typescript"),pdfLib=base("pdf-lib");
const cache=new Map();
function loadTs(file){
 const key=path.resolve(file);if(cache.has(key))return cache.get(key).exports;
 const code=ts.transpileModule(fs.readFileSync(key,"utf8"),{fileName:key,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const module={exports:{}};cache.set(key,module);
 const req=name=>name==="pdf-lib"?pdfLib:name.startsWith(".")?loadTs(path.resolve(path.dirname(key),name+".ts")):base(name);
 vm.runInNewContext(code,{exports:module.exports,module,require:req,Uint8Array,TextEncoder,TextDecoder,Buffer,console,Error,Set,Map,Math,Number,Array,Object,JSON},{filename:key,timeout:5000});
 return module.exports;
}
const engine=loadTs("lib/tools/pdf-native/native-text-edit.ts");
const {PDFDocument,StandardFonts,rgb}=pdfLib;
async function sample(text="SECRET_ABC_123"){
 const pdf=await PDFDocument.create(),p=pdf.addPage([612,792]);
 const font=await pdf.embedFont(StandardFonts.Helvetica);
 p.drawText(text,{x:72,y:680,font,size:18,color:rgb(0,0,0)});
 return new Uint8Array(await pdf.save());
}
test("Folio native run parser finds exactly one editable baseline",async()=>{
 const bytes=await sample();
 const target=await engine.findNativePdfTextTarget(bytes,0,{x:72,y:680});
 assert.ok(target,"finds a native PDF run");
 assert.equal(target.x,72);assert.equal(target.y,680);
});
test("native rewrite removes the actual show-text operator while keeping pages",async()=>{
 const bytes=await sample();
 const target=await engine.findNativePdfTextTarget(bytes,0,{x:72,y:680});
 assert.ok(target);
 const result=await engine.removeNativePdfTextRuns(bytes,[{pageIndex:0,target}]);
 const before=await pdfLib.PDFDocument.load(bytes),after=await pdfLib.PDFDocument.load(result);
 assert.equal(before.getPageCount(),1);assert.equal(after.getPageCount(),1);
 const {locatePageRuns}=loadTs("lib/tools/pdf-native/mutate.ts");
 const beforeRuns=await locatePageRuns(bytes,0),afterRuns=await locatePageRuns(result,0);
 assert.ok(beforeRuns.length>0);assert.equal(afterRuns.length,0);
});
test("nonexistent target fails closed rather than drawing white overlay",async()=>{
 const bytes=await sample();
 await assert.rejects(engine.removeNativePdfTextRuns(bytes,[{pageIndex:0,target:{x:400,y:400,op:"Tj"}}]),/PDF_NATIVE_TEXT_UNSUPPORTED/);
});
test("signed bytes cannot enter native mutation",async()=>{
 const bytes=new Uint8Array(Buffer.concat([Buffer.from(await sample()),Buffer.from("/ByteRange [0 10 20 30]")]));
 assert.equal(engine.hasPdfSignature(bytes),true);
 assert.equal(await engine.findNativePdfTextTarget(bytes,0,{x:72,y:680}),null);
 await assert.rejects(engine.removeNativePdfTextRuns(bytes,[{pageIndex:0,target:{x:72,y:680,op:"Tj"}}]),/PDF_SIGNED/);
});
test("duplicate edits are rejected without silently stripping another text run",async()=>{
 const bytes=await sample();
 const target=await engine.findNativePdfTextTarget(bytes,0,{x:72,y:680});
 assert.ok(target);
 await assert.rejects(engine.removeNativePdfTextRuns(bytes,[{pageIndex:0,target},{pageIndex:0,target}]));
});

test("original text selection and mutation fail closed on cropped PDF pages",async()=>{
 const original=await sample(),target=await engine.findNativePdfTextTarget(original,0,{x:72,y:680});
 assert.ok(target);
 const pdf=await PDFDocument.load(original);
 pdf.getPage(0).setCropBox(12,20,250,380);
 const cropped=new Uint8Array(await pdf.save());
 assert.equal(await engine.findNativePdfTextTarget(cropped,0,{x:72,y:680}),null);
 await assert.rejects(engine.removeNativePdfTextRuns(cropped,[{pageIndex:0,target}]),/PDF_NATIVE_TEXT_PAGE_UNSUPPORTED/);
});
