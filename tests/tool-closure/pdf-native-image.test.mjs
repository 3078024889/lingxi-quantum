import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import {createRequire} from "node:module";
const require=createRequire(import.meta.url),ts=require("typescript"),pdfLib=require("pdf-lib"),sharp=require("sharp");
const cache=new Map();
function load(file){
 const k=path.resolve(file);if(cache.has(k))return cache.get(k).exports;
 const code=ts.transpileModule(fs.readFileSync(k,"utf8"),{fileName:k,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const mod={exports:{}};cache.set(k,mod);
 const local=name=>name==="pdf-lib"?pdfLib:name.startsWith(".")?load(path.resolve(path.dirname(k),name+".ts")):require(name);
 vm.runInNewContext(code,{module:mod,exports:mod.exports,require:local,TextDecoder,TextEncoder,Uint8Array,Buffer,Math,Set,Map,Error,Number,JSON},{filename:k,timeout:5000});
 return mod.exports;
}
const engine=load("lib/tools/pdf-native/native-image-edit.ts"),{PDFDocument}=pdfLib;
async function sample(){
 const doc=await PDFDocument.create();
 const png=await sharp({create:{width:8,height:4,channels:4,background:{r:220,g:10,b:10,alpha:1}}}).png().toBuffer();
 const im=await doc.embedPng(png);
 doc.addPage([400,500]).drawImage(im,{x:100,y:150,width:80,height:40});
 doc.addPage([400,500]).drawImage(im,{x:60,y:75,width:80,height:40});
 return new Uint8Array(await doc.save());
}
test("original PDF image is located in normalized page coordinates",async()=>{
 const file=await sample();const regions=await engine.locateEditableNativeImages(file,0);
 assert.equal(regions.length,1);
 assert.equal(regions[0].x,25);assert.equal(regions[0].y,62);assert.equal(regions[0].w,20);
});
test("native image move preserves a real PDF object and other pages",async()=>{
 const bytes=await sample(), [region]=await engine.locateEditableNativeImages(bytes,0);
 const out=await engine.applyNativeImageChanges(bytes,[{pageIndex:0,target:region.target,action:{kind:"move",rect:{x:150,y:250,width:120,height:50}}}]);
 const {locatePageImages}=load("lib/tools/pdf-native/image-mutate.ts");
 const [edited]=await locatePageImages(out,0),[other]=await locatePageImages(out,1);
 assert.equal(edited.rect.x,150);assert.equal(edited.rect.y,250);assert.equal(edited.rect.width,120);
 assert.equal(other.rect.x,60);assert.equal(other.rect.y,75);
});
test("original image delete removes only selected page draw operator",async()=>{
 const bytes=await sample(),[region]=await engine.locateEditableNativeImages(bytes,0);
 const out=await engine.applyNativeImageChanges(bytes,[{pageIndex:0,target:region.target,action:{kind:"delete"}}]);
 const {locatePageImages}=load("lib/tools/pdf-native/image-mutate.ts");
 assert.equal((await locatePageImages(out,0)).length,0);
 assert.equal((await locatePageImages(out,1)).length,1);
});
test("image replacement changes one page without replacing shared XObject on another",async()=>{
 const bytes=await sample(),[region]=await engine.locateEditableNativeImages(bytes,0);
 const png=await sharp({create:{width:4,height:4,channels:4,background:{r:0,g:255,b:0,alpha:1}}}).png().toBuffer();
 const dataUrl="data:image/png;base64,"+png.toString("base64");
 const out=await engine.applyNativeImageChanges(bytes,[{pageIndex:0,target:region.target,action:{kind:"replace",dataUrl,mime:"image/png"}}]);
 const {locatePageImages}=load("lib/tools/pdf-native/image-mutate.ts");
 const [edited]=await locatePageImages(out,0),[other]=await locatePageImages(out,1);
 const [beforeOther]=await locatePageImages(bytes,1);
 assert.notEqual(edited.name,region.target.name);
 // PDF-lib may assign different resource aliases on each page even for one shared XObject.
 // Compare the untouched page to its own original instead of assuming aliases coincide.
 assert.equal(other.name,beforeOther.name);
 assert.equal(other.rect.x,beforeOther.rect.x);assert.equal(other.rect.y,beforeOther.rect.y);
 assert.equal(other.naturalWidth,beforeOther.naturalWidth);
 assert.equal(edited.naturalWidth,4);assert.equal(other.naturalWidth,8);
});
test("suspicious signatures and duplicate original image targets fail closed",async()=>{
 const bytes=await sample(),[region]=await engine.locateEditableNativeImages(bytes,0);
 const signed=new Uint8Array(Buffer.concat([Buffer.from(bytes),Buffer.from("/ByteRange [0 10 20 30]")]));
 assert.equal((await engine.locateEditableNativeImages(signed,0)).length,0);
 await assert.rejects(engine.applyNativeImageChanges(signed,[{pageIndex:0,target:region.target,action:{kind:"delete"}}]),/PDF_SIGNED/);
 await assert.rejects(engine.applyNativeImageChanges(bytes,[
 {pageIndex:0,target:region.target,action:{kind:"delete"}},
 {pageIndex:0,target:region.target,action:{kind:"delete"}}
 ]));
});

test("image resize and replace work as one source-operator transaction",async()=>{
 const bytes=await sample(),[region]=await engine.locateEditableNativeImages(bytes,0);
 const original=region.target,rect={...original.rect,width:125,height:75};
 const png=await sharp({create:{width:12,height:10,channels:4,background:{r:0,g:180,b:255,alpha:1}}}).png().toBuffer();
 const out=await engine.applyNativeImageChanges(bytes,[
  {pageIndex:0,target:original,action:{kind:"move",rect}},
  {pageIndex:0,target:{...original,rect},action:{kind:"replace",mime:"image/png",dataUrl:"data:image/png;base64,"+png.toString("base64")}}
 ]);
 const {locatePageImages}=load("lib/tools/pdf-native/image-mutate.ts");
 const [edited]=await locatePageImages(out,0),[other]=await locatePageImages(out,1);
 assert.equal(edited.naturalWidth,12);
 assert.equal(other.naturalWidth,8);
 assert.ok(edited.rect.width>0);
});

test("cropped PDF pages refuse native-image hit targets instead of editing wrong coordinates",async()=>{
 const bytes=await sample(),doc=await PDFDocument.load(bytes);
 doc.getPage(0).setCropBox(12,20,250,280);
 const cropped=new Uint8Array(await doc.save());
 assert.equal((await engine.locateEditableNativeImages(cropped,0)).length,0);
 assert.equal((await engine.locateEditableNativeImages(cropped,1)).length,1);
});
