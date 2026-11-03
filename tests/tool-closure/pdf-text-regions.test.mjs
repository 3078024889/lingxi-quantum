import test from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
const ts=createRequire(import.meta.url)("typescript");
const code=ts.transpileModule(readFileSync("lib/tools/pdf-text-regions.ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const module={exports:{}};runInNewContext(code,{module,exports:module.exports});
const {pdfNativeTextRegions,pdfOcrTextRegions}=module.exports;
test("PDF.js text is mapped into responsive top-left percentages",()=>{
 const content={items:[{str:"Invoice $123",transform:[12,0,0,12,72,680],width:90,height:12}]};
 const v={width:612,height:792,transform:[1,0,0,-1,0,792]};
 const [r]=pdfNativeTextRegions(content,v);
 assert.equal(r.text,"Invoice $123");assert.ok(r.x>11&&r.x<13);assert.ok(r.y>12&&r.y<15);
 assert.ok(r.w>14&&r.w<16);assert.equal(r.source,"pdf");
});
test("vertical text, blank text and invalid geometry do not create hit targets",()=>{
 const v={width:200,height:300,transform:[1,0,0,-1,0,300]};
 assert.equal(pdfNativeTextRegions({items:[{str:" ",transform:[1,0,0,1,20,20],width:50,height:10},{str:"rotate",transform:[0,1,-1,0,20,20],width:50,height:10}]},v).length,0);
 assert.equal(pdfNativeTextRegions(null,v).length,0);
});
test("OCR line bbox is preserved even when only word boxes exist",()=>{
 const data=[{paragraphs:[{lines:[{words:[{text:"Hello",bbox:{x0:20,y0:30,x1:80,y1:60}},{text:"world",bbox:{x0:84,y0:30,x1:150,y1:60}}]}]}]}];
 const [r]=pdfOcrTextRegions(data,200,100);
 assert.equal(r.text,"Hello world");assert.equal(r.x,10);assert.equal(r.y,30);assert.equal(r.w,65);assert.equal(r.h,30);
});
test("oversized OCR boxes clip to the page and invalid words are discarded",()=>{
 const data=[{paragraphs:[{lines:[{text:"TEXT",bbox:{x0:-10,y0:-10,x1:2000,y1:3000}},{text:"bad",bbox:{x0:40,y0:30,x1:40,y1:30}}]}]}]}];
 const r=pdfOcrTextRegions(data,200,100);
 assert.equal(r.length,1);assert.equal(r[0].x,0);assert.equal(r[0].w,100);
});
