import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const src=readFileSync("lib/ai-discovery/market-discovery.ts","utf8");
const page=readFileSync("app/ai/market-preview/explore/page.tsx","utf8");
const selection=readFileSync("app/ai/market-preview/discovery-filters.tsx","utf8");
test("model discovery never treats unknown numeric values as threshold matches",()=>{
 assert.match(src,/m\.promptUsdPerMillion===null/);
 assert.match(src,/m\.contextTokens===null/);
});
test("preview is opt-in, unindexed and cites source",()=>{
 assert.match(page,/AI_MARKET_PREVIEW_ENABLED==="true"/);
 assert.match(page,/index:false/);
 assert.match(page,/catalog\.source/);
});
test("comparison selection limits to four and needs at least two",()=>{
 assert.match(selection,/old\.length<4/);
 assert.match(selection,/ids\.length>=2/);
 assert.match(src,/\.slice\(0,4\)/);
});
