import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>readFileSync(path,"utf8");
test("all AI discovery search and compare routes reject repeated query parameter arrays",()=>{
 const paths=["app/ai/page.tsx","app/[locale]/ai/page.tsx","app/ai/compare/page.tsx","app/[locale]/ai/compare/page.tsx"];
 for(const path of paths){const source=read(path);assert.match(source,/singleQueryValue/);assert.match(source,/string\|string\[\]/);assert.doesNotMatch(source,/toolBySlug\(p\.[ab]\|\|""\)/);}
});
test("singleQueryValue accepts only scalar strings and limits their length",()=>{
 const source=read("lib/ai-discovery/query.ts");
 assert.match(source,/typeof value==="string"/);
 assert.match(source,/value\.slice\(0,maxLength\)/);
 assert.match(source,/:""/);
});
