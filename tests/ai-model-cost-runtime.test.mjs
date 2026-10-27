import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import ts from "typescript";
const source=readFileSync("lib/ai-discovery/model-cost.ts","utf8");
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const module={exports:{}};
new Function("module","exports",js)(module,module.exports);
const {parseWorkload,estimateRoutingCost,compareModels,formatRoutingCost}=module.exports;
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
