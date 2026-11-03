import test from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
const ts=createRequire(import.meta.url)("typescript");
const code=ts.transpileModule(readFileSync("lib/tools/pdf-overlay-geometry.ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const module={exports:{}};runInNewContext(code,{module,exports:module.exports});
const {resizePdfOverlay,pdfEditorPreviewScale}=module.exports;
test("portrait-page image keeps correct pixel aspect ratio while resizing",()=>{
 const o=resizePdfOverlay({x:10,y:20,w:24,h:15,ratio:2},120,0,600,800);
 assert.ok(o.w>24);
 assert.ok(Math.abs(o.w/o.h*600/800-2)<.001);
});
test("image and signature resize stays inside PDF page",()=>{
 const o=resizePdfOverlay({x:85,y:90,w:10,h:6,ratio:1.5},200,300,600,800);
 assert.ok(o.w<=15&&o.h<=10&&o.w>0&&o.h>0);
});
test("text handles resize width and height independently",()=>{
 const o=resizePdfOverlay({x:5,y:5,w:20,h:10},60,80,600,800);
 assert.equal(o.w,30);assert.equal(o.h,20);
});
test("invalid pointer movement preserves prior dimensions",()=>{
 const o=resizePdfOverlay({x:10,y:10,w:12,h:8,ratio:2},NaN,20,600,800);
 assert.equal(o.w,12);assert.equal(o.h,8);
});
test("retina preview respects memory budget even for oversize documents",()=>{
 for(const [w,h] of [[612,792],[5000,7000],[20000,30000]]){
  const e=pdfEditorPreviewScale(w,h,3,"editor");
  const p=pdfEditorPreviewScale(w,h,2,"preview");
  assert.ok(e>0&&e<=2.9&&w*h*e*e<=4_000_005);
  assert.ok(p>0&&p<=2.6&&w*h*p*p<=2_100_005);
 }
 assert.ok(pdfEditorPreviewScale(612,792,2,"editor")>1.5);
});
