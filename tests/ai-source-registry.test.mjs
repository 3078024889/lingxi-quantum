import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const registry=readFileSync("lib/ai-discovery/source-registry.ts","utf8");
const page=readFileSync("app/ai/sources/page.tsx","utf8");
test("all registered market data providers have documented endpoints",()=>{
 for(const id of ["huggingface-benchmarks","github-repositories","openrouter-models"])
  assert.ok(registry.includes(id),id);
 assert.match(registry,/licenseReviewRequired:boolean/);
 assert.match(registry,/restrictions:string/);
});
test("public sources page does not claim ingestion or redistribution rights",()=>{
 assert.match(page,/not mean its data is already ingested/);
 assert.match(page,/licenseReviewRequired/);
 assert.match(page,/Official documentation/);
});
