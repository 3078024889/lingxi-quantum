import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const src=readFileSync("lib/ai-discovery/model-price-history.ts","utf8");
test("price history excludes unavailable and unchanged values",()=>{
 assert.match(src,/if\(!old\)continue/);
 assert.match(src,/a===null\|\|b===null\|\|a===b/);
});
test("zero baseline is never represented as a percentage",()=>{
 assert.match(src,/a===0\?null/);
});
test("both input and output costs are compared",()=>{
 assert.match(src,/\["prompt","completion"\]/);
});
