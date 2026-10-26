import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const history=JSON.parse(readFileSync("lib/ai-discovery/github-history.json","utf8"));
test("at least two genuine timestamped observations per tracked repository",()=>{const groups=Map.groupBy(history,r=>r.repository);assert.equal(groups.size,4);for(const records of groups.values()){assert.equal(records.length,2);assert.notEqual(records[0].observedAt,records[1].observedAt);assert.ok(Date.parse(records[1].observedAt)>Date.parse(records[0].observedAt));}});
test("trend calculation does not fabricate daily rate",()=>{const code=readFileSync("lib/ai-discovery/github-trends.ts","utf8");assert.match(code,/elapsedHours<=0/);assert.match(code,/last\.stars-first\.stars/);assert.doesNotMatch(code,/dailyGrowth|perDay/);});
test("open-source page discloses actual measurement window",()=>{const code=readFileSync("app/ai/open-source/page.tsx","utf8");assert.match(code,/Observed changes between snapshots/);assert.match(code,/elapsedHours/);});
