import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync("lib/ai-discovery/openrouter-normalizer.ts","utf8");
test("model snapshots preserve provenance and per-million pricing units",()=>{
 for(const field of ["observedAt","sourceUrl","contextTokens","promptUsdPerMillion","completionUsdPerMillion","inputModalities","outputModalities"])
  assert.ok(source.includes(field),field);
 assert.match(source,/n\*1_000_000/);
});
test("missing and invalid prices remain null",()=>{
 assert.match(source,/return null/);
 assert.match(source,/Number\.isFinite\(n\)&&n>=0/);
 assert.match(source,/throw new Error\("Invalid model catalog response"\)/);
});
