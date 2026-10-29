import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const page=readFileSync("app/ai/market-preview/page.tsx","utf8");
const logic=readFileSync("lib/ai-discovery/model-market-view.ts","utf8");
test("market preview is opt-in and excluded from indexing",()=>{
 assert.match(page,/AI_MARKET_PREVIEW_ENABLED==="true"/);
 assert.match(page,/index:false/);
 assert.match(page,/fetchCatalogPreview/);
});
test("model price sort excludes missing values from free tier",()=>{
 assert.match(logic,/Number.POSITIVE_INFINITY/);
 assert.match(logic,/value===null\?"Unknown"/);
});
test("model preview cites routing source and never calls prices vendor direct",()=>{
 assert.match(page,/not vendor-direct prices/);
 assert.match(page,/catalog.source/);
});
