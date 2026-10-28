import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {stripTypeScriptTypes} from "node:module";
const source=readFileSync("lib/ai-discovery/model-cost.ts","utf8");
const js=stripTypeScriptTypes(source);
const {parseWorkload,estimateRoutingCost,compareModels,formatRoutingCost}=await import("data:text/javascript;base64,"+Buffer.from(js).toString("base64"));
const base={id:"vendor/a",promptUsdPerMillion:2,completionUsdPerMillion:10};
test("same workload cost is computed from input and output tokens",()=>{
 assert.equal(estimateRoutingCost(base,{inputTokens:1000,outputTokens:500,requests:100}),0.7);
 assert.equal(formatRoutingCost(0.7),"$0.70");
});
test("missing rate remains unknown and zero rate is allowed",()=>{
 assert.equal(estimateRoutingCost({...base,completionUsdPerMillion:null},{inputTokens:1000,outputTokens:500,requests:100}),null);
 assert.equal(estimateRoutingCost({...base,promptUsdPerMillion:0,completionUsdPerMillion:0},{inputTokens:1000,outputTokens:500,requests:100}),0);
});
test("rejects unsafe workload inputs and excludes unknown model IDs",()=>{
 assert.deepEqual(parseWorkload({input:"-1",output:"999999999999",requests:"oops"}),{inputTokens:1000,outputTokens:500,requests:100});
 assert.equal(compareModels([base],["missing","vendor/a","vendor/a"],{inputTokens:1,outputTokens:1,requests:1}).length,1);
});
