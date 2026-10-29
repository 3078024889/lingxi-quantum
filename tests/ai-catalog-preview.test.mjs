import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const adapter=readFileSync("lib/ai-discovery/catalog-preview.ts","utf8");
test("provider adapter fails closed on invalid upstream responses",()=>{
 assert.match(adapter,/response\.ok/);
 assert.match(adapter,/normalizeOpenRouterCatalog/);
 assert.match(adapter,/Provider unavailable or malformed response/);
 assert.match(adapter,/models\.length===0/);
});
test("provider adapter bounds requests and response size",()=>{
 assert.match(adapter,/AbortSignal\.timeout\(8000\)/);
 assert.match(adapter,/3_000_000/);
 assert.match(adapter,/cache:"no-store"/);
});
