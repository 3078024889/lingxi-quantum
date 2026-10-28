import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const rankings=readFileSync("app/ai/rankings/page.tsx","utf8");
const detail=readFileSync("app/ai/[slug]/page.tsx","utf8");
const structured=readFileSync("app/ai/product-detail.tsx","utf8");
test("rankings no longer render duplicate directory cards",()=>{
 assert.match(rankings,/<MarketTerminal searchParams=\{searchParams\}\/>/);
 assert.ok(!rankings.includes("Browse the directory"));
});
test("product profiles share sourced conditions with expanded market rows",()=>{
 assert.match(detail,/<ProductDetail tool=\{t\}/);
 for(const field of ['"free"','"price"','"region"','"phone"','"card"','"watermark"','"commercial"','"failure"','"refund"'])assert.ok(structured.includes(field));
 assert.ok(structured.includes('暂无可展示的用户使用记录'));
});
