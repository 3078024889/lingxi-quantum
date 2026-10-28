import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {stripTypeScriptTypes} from "node:module";
const load=async path=>import("data:text/javascript;base64,"+Buffer.from(stripTypeScriptTypes(readFileSync(path,"utf8"))).toString("base64"));
const {aiTools}=await load("lib/ai-discovery/catalog.ts");
const {selectTerminalRows,selectedProductIds,compareProductHref}=await load("lib/ai-discovery/terminal-selection.ts");
test("filters combine and sorting never mutates the source catalog",()=>{
 const before=aiTools.map(t=>t.slug);
 const result=selectTerminalRows(aiTools,"video","Video","vendor");
 assert.ok(result.length>0);assert.ok(result.every(t=>t.category==="Video"));
 assert.deepEqual(aiTools.map(t=>t.slug),before);
 assert.equal(selectTerminalRows(aiTools,"no-such-product-978234","","name").length,0);
});
test("comparison accepts only known unique IDs and caps at five",()=>{
 const known=aiTools.map(t=>t.slug);
 assert.deepEqual(selectedProductIds([known[0],known[0],null,"bad",...known.slice(1,8)],known),known.slice(0,5));
 assert.deepEqual(selectedProductIds({products:known},known),[]);
 const url=new URL(compareProductHref(known.slice(0,5),known),"https://example.test");
 assert.equal(url.pathname,"/ai/compare");assert.equal(url.searchParams.get("products"),known.slice(0,5).join(","));
});
