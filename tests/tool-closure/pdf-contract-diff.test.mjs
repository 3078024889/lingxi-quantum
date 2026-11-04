import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import vm from "node:vm";
const source=fs.readFileSync("lib/tools/pdf-contract-diff.ts","utf8");
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const module={exports:{}};
vm.runInNewContext(compiled,{module,exports:module.exports,Set,Error,RegExp,Math,JSON,Array,String},{timeout:2000});
const {comparePdfTextLayers}=module.exports;
test("reported amounts, dates, clauses are explicitly grouped and anchored to pages",()=>{
 const a=["Amount USD 1,200.00 Due 2026-11-03 Clause 2: Delivery by road"];
 const b=["Amount USD 2,500.00 Due 2026-12-15 Clause 2: Delivery by air"];
 const md=comparePdfTextLayers(a,b);
 assert.match(md,/Amounts \/ 金额/);assert.match(md,/USD 1,200.00/);assert.match(md,/USD 2,500.00/);
 assert.match(md,/Dates \/ 日期/);assert.match(md,/2026-11-03/);assert.match(md,/2026-12-15/);
 assert.match(md,/Clauses \/ 条款/);assert.match(md,/Delivery by road/);assert.match(md,/Delivery by air/);
 assert.match(md,/Page-by-page comparison/);assert.match(md,/Page 1/);
});
test("an all-image scan is never misrepresented as matching PDFs",()=>{
 assert.throws(()=>comparePdfTextLayers([""],[""]),/PDF_COMPARE_OCR_REQUIRED/);
 assert.throws(()=>comparePdfTextLayers(["Actual text"],[""]),/PDF_COMPARE_OCR_REQUIRED/);
});
test("text-layer equality explicitly warns it does not imply identical visual rendering",()=>{
 const s=comparePdfTextLayers(["Hello same"],["Hello same"]);
 assert.match(s,/No text-layer differences detected/);assert.match(s,/does not prove the PDFs look identical/);
});

test("untrusted PDF contents stay inert in downloaded Markdown",()=>{
 const md=comparePdfTextLayers(
  ["Clause 2: <img src=x onerror=alert(1)>\n### Forged approval\n![remote](https://example.invalid/pixel)"],
  ["Clause 2: Normal delivery"]
 );
 assert.match(md,/&lt;img src=x onerror=alert\(1\)&gt;/);
 assert.match(md,/\n    ### Forged approval/);
 assert.match(md,/\n    !\[remote\]\(https:\/\/example\.invalid\/pixel\)/);
 assert.doesNotMatch(md,/\n### Forged approval/);
});
test("long match lists disclose omitted entries rather than implying exhaustive reporting",()=>{
 const original=Array.from({length:40},(_,i)=>"USD "+(i+100)+".00").join(" ");
 const changed=Array.from({length:40},(_,i)=>"USD "+(i+200)+".00").join(" ");
 const md=comparePdfTextLayers([original],[changed]);
 assert.match(md,/additional matches omitted/);
});
