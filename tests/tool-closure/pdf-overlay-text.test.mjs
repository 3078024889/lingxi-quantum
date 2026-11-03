import test from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
const ts=createRequire(import.meta.url)("typescript");
const source=readFileSync("lib/tools/pdf-overlay-text.ts","utf8");
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
function fakeCanvas(){
 let width=0,height=0,paint=null;
 const ctx={font:"10px sans-serif",fillStyle:"",textBaseline:"",measureText(text){return {width:200}},fillText(text,x,y){paint={font:this.font,text,x,y}}};
 const canvas={
   getContext(type){return type==="2d"?ctx:null},
   get width(){return width},set width(value){width=value;ctx.font="10px sans-serif"},
   get height(){return height},set height(value){height=value;ctx.font="10px sans-serif"},
   toBlob(fn){fn(new Blob([new Uint8Array([137,80,78,71])],{type:"image/png"}))}
 };
 return {canvas,painted:()=>paint};
}
const module={exports:{}};const f=fakeCanvas();
runInNewContext(code,{module,exports:module.exports,document:{createElement:()=>f.canvas},Blob,Uint8Array,Promise});
const {renderPdfTextImage}=module.exports;
test("canvas resize does not silently reset overlay font to 10px",async()=>{
 const data=await renderPdfTextImage("Hello, 你好",56);
 const paint=f.painted();
 assert.ok(paint.font.startsWith("56px "),paint.font);
 assert.equal(paint.text,"Hello, 你好");
 assert.equal(f.canvas.width,220);
 assert.equal(f.canvas.height,96);
 assert.equal(data.byteLength,4);
});
test("text size is clamped to safe range",async()=>{
 await renderPdfTextImage("x",Number.POSITIVE_INFINITY);
 assert.ok(f.painted().font.startsWith("28px "));
 await renderPdfTextImage("x",-3);
 assert.ok(f.painted().font.startsWith("6px "));
});
