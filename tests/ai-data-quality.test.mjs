import test from "node:test";
import assert from "node:assert/strict";
import {validateSnapshot,detectAnomalies} from "../lib/ai-discovery/data-quality.mjs";
const make=(x={})=>({repository:"example/repo",sourceUrl:"https://api.github.com/repos/example/repo",stars:1000,forks:200,archived:false,observedAt:"2026-10-26T00:00:00Z",reviewStatus:"raw_api_observation",...x});
test("valid snapshot accepted",()=>assert.equal(validateSnapshot([make()]).length,1));
test("duplicate source rejected",()=>assert.throws(()=>validateSnapshot([make(),make()]),/Duplicate/));
test("source mismatch rejected",()=>assert.throws(()=>validateSnapshot([make({sourceUrl:"https://evil.test/repo"})]),/Untrusted/));
test("unsafe count rejected",()=>assert.throws(()=>validateSnapshot([make({stars:NaN})]),/Invalid counts/));
test("archive state change requires review",()=>assert.equal(detectAnomalies([make()],[make({archived:true,observedAt:"2026-10-26T01:00:00Z"})]).length,1));
test("large sudden drop requires review",()=>assert.ok(detectAnomalies([make()],[make({stars:400,observedAt:"2026-10-26T01:00:00Z"})]).some(x=>x.reason.includes("Stars"))));
test("repository removal requires review",()=>{
 const removed=make({repository:"other/project",sourceUrl:"https://api.github.com/repos/other/project"});
 const warnings=detectAnomalies([make(),removed],[make({observedAt:"2026-10-27T00:00:00Z"})]);
 assert.deepEqual(warnings,[{repository:"other/project",reason:"Repository missing from new snapshot"}]);
});
test("repository name matching is case insensitive when checking removals",()=>{
 const next=make({repository:"Example/Repo",sourceUrl:"https://api.github.com/repos/Example/Repo",observedAt:"2026-10-27T00:00:00Z"});
 assert.deepEqual(detectAnomalies([make()],[next]),[]);
});
