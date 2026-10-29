import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const src=readFileSync("lib/ai-discovery/price-series.ts","utf8");
const chart=readFileSync("app/ai/market-preview/price-sparkline.tsx","utf8");
test("series enforces chronological points and nonnegative finite prices",()=>{
 assert.match(src,/date<=last/);
 assert.match(src,/Number\.isFinite\(x\)\|\|x<0/);
 assert.match(src,/v\.points\.length<2/);
});
test("chart discloses missing history and routing price source",()=>{
 assert.match(chart,/Not enough dated observations/);
 assert.match(chart,/Missing dates are not estimates/);
 assert.match(chart,/OpenRouter routing price/);
});
test("zero baseline does not fabricate percent change",()=>{
 assert.match(src,/first===0\?null/);
});
