import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const preview=readFileSync("app/ai/model-preview/page.tsx","utf8");
test("model preview is noindex and disabled by default",()=>{
 assert.match(preview,/robots:\{index:false,follow:false\}/);
 assert.match(preview,/AI_MARKET_PREVIEW_ENABLED==="true"/);
 assert.match(preview,/Preview disabled until review/);
});
test("model preview does not imply vendor pricing verification",()=>{
 assert.match(preview,/not an independently verified provider quote/);
 assert.match(preview,/No fallback prices will be invented/);
 assert.match(preview,/licensing and commercial redistribution require review/);
});
