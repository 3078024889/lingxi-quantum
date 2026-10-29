import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
test("real source data is accessible from AI discovery",()=>{const p=readFileSync("app/ai/page.tsx","utf8");assert.match(p,/href="\/ai\/open-source"/);});
test("manual workflow includes all AI tests",()=>{const p=readFileSync(".github/workflows/ai-discovery-refresh.yml","utf8");assert.match(p,/node --test tests\/ai-\*\.test\.mjs/);assert.match(p,/audit-snapshots\.mjs/);assert.match(p,/contents: read/);});
