import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");
test("no fabricated market observations are shipped",()=>assert.deepEqual(JSON.parse(read("lib/ai-discovery/reviewed-evidence.json")),[]));
test("ranking excludes unapproved data and keeps measurements comparable",()=>{const s=read("lib/ai-discovery/ranking.ts");for(const x of ["sourceChecked","reviewer","status","periodStart","periodEnd","geography","unit","metricKey"])assert.ok(s.includes(x),x);});
test("review import never grants approval itself",()=>{const s=read("scripts/ai-discovery/review-evidence.mjs");assert.match(s,/Human review incomplete/);assert.match(s,/Refusing to overwrite/);assert.doesNotMatch(s,/status:\s*["']approved["']/);});
