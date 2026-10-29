import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const history=JSON.parse(readFileSync("lib/ai-discovery/github-history.json","utf8"));
test("initial history is real source-linked data",()=>{assert.ok(history.length>=4);for(const r of history){assert.equal(r.sourceUrl,"https://api.github.com/repos/"+r.repository);assert.ok(Number.isSafeInteger(r.stars));assert.ok(Number.isSafeInteger(r.forks));}});
test("append script validates identity and conflicts",()=>{const s=readFileSync("scripts/ai-discovery/append-github-history.mjs","utf8");assert.match(s,/Conflicting observation/);assert.match(s,/renameSync\(temp,destination\)/);});
test("refresh workflow has no repository write or deployment",()=>{const s=readFileSync(".github/workflows/ai-discovery-refresh.yml","utf8");assert.match(s,/workflow_dispatch/);assert.match(s,/contents: read/);assert.doesNotMatch(s,/push:|schedule:|uses:.*deploy|contents: write/);});
