import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
import ts from "typescript";
const path=new URL("../lib/tools/commerce/tool-route-slug.ts",import.meta.url);
const js=ts.transpileModule(readFileSync(path,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const m={exports:{}};
runInNewContext(js,{exports:m.exports,module:m});
const {toolSlugFromPathname}=m.exports;
test("tool access starts on every supported public language URL",()=>{
 for(const loc of ["","en/","ja/","ko/","fr/","de/","es/","pt/","ar/"]){
  assert.equal(toolSlugFromPathname("/"+loc+"tools/pdf-editor"),"pdf-editor",loc);
  assert.equal(toolSlugFromPathname("/"+loc+"tools/url-to-video/"),"url-to-video",loc);
 }
});
test("untrusted or invalid route paths fail closed",()=>{
 for(const path of ["/tools","/en/tools","/xx/tools/pdf-editor","/hacker/tools/pdf-editor","/api/tools/pdf-editor","/tools/../../api","/tools/PDF-Editor"]){
  assert.equal(toolSlugFromPathname(path),null,path);
 }
});
test("public paths must resolve for both identical site domains",()=>{
 for(const domain of ["https://lingxifield.com","https://lingxifield.cn"]){
  const url=new URL("/es/tools/pdf-editor",domain);
  assert.equal(toolSlugFromPathname(url.pathname),"pdf-editor");
 }
});
