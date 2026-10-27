import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const rankings=readFileSync("app/ai/rankings/page.tsx","utf8");
const detail=readFileSync("app/ai/[slug]/page.tsx","utf8");
const checklist=readFileSync("app/ai/buyer-checklist.tsx","utf8");
test("rankings no longer render duplicate directory cards",()=>{
 assert.match(rankings,/<MarketTerminal searchParams=\{searchParams\}\/>/);
 assert.ok(!rankings.includes("Browse the directory"));
});
test("platform detail shows beginner billing and access checklist",()=>{
 assert.match(detail,/import BuyerChecklist/);
 assert.match(detail,/<BuyerChecklist\/>/);
 for(const term of ["Regional access","Payment requirements","Free allowance","Failed generations","Export and sharing","Real task cost","Not independently verified"])
  assert.ok(checklist.includes(term),term);
});
