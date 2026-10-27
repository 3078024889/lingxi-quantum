import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const adapter=readFileSync("lib/ai-discovery/catalog-preview.ts","utf8");
test("public catalog works without a key and optional key stays server-side",()=>{
 assert.match(adapter,/process\.env\.OPENROUTER_API_KEY/);
 assert.match(adapter,/headers:apiKey\?/);
 assert.match(adapter,/Authorization:"Bearer "\+apiKey/);
 assert.match(adapter,/\{Accept:"application\/json"\}/);
 assert.doesNotMatch(adapter,/NEXT_PUBLIC_OPENROUTER/);
});
