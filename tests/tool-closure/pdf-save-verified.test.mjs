import test from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
const ts=createRequire(import.meta.url)("typescript");
const code=ts.transpileModule(readFileSync("lib/tools/pdf-save-verified.ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const module={exports:{}};runInNewContext(code,{module,exports:module.exports});
const {savePdfWithReopenCheck}=module.exports;
const pdf=(bytes)=>({calls:[],async save(opts){this.calls.push(opts);return bytes}});
test("verified PDF saves when the independent parser reopens exactly",async()=>{
 const doc=pdf(Uint8Array.from(Array.from({length:40},(_,i)=>i)));
 const out=await savePdfWithReopenCheck(doc,2,async()=>2);
 assert.equal(out.length,40);assert.equal(doc.calls.length,1);
 assert.equal(doc.calls[0].useObjectStreams,true);assert.equal(doc.calls[0].addDefaultPage,false);
});
test("falls back to no object streams on PDF.js reopen error",async()=>{
 const doc=pdf(Uint8Array.from(Array.from({length:40},(_,i)=>i)));let checks=0;
 await savePdfWithReopenCheck(doc,1,async()=>{if(++checks===1)throw Error("XREF_UNREADABLE");return 1});
 assert.equal(checks,2);assert.equal(doc.calls[1].useObjectStreams,false);
});
test("page-count mismatch fails closed even after a retry",async()=>{
 const doc=pdf(new Uint8Array(40));
 await assert.rejects(savePdfWithReopenCheck(doc,2,async()=>1),/PDF_PAGE_COUNT_MISMATCH/);
 assert.equal(doc.calls.length,2);
});
test("empty and invalid-page PDFs are never delivered",async()=>{
 const doc=pdf(new Uint8Array(0));
 await assert.rejects(savePdfWithReopenCheck(doc,1,async()=>1),/PDF_OUTPUT_REOPEN_FAILED/);
 assert.equal(doc.calls.length,2);
 await assert.rejects(savePdfWithReopenCheck(doc,0,async()=>1),/PDF_EXPECTED_PAGES_INVALID/);
});
