import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const adapter=readFileSync("lib/ai-discovery/catalog-preview.ts","utf8");
test("provider access requires a server-side API key",()=>{
 assert.match(adapter,/process\.env\.OPENROUTER_API_KEY/);
 assert.match(adapter,/if\(!apiKey\)return/);
 assert.match(adapter,/Authorization:"Bearer "\+apiKey/);
 assert.doesNotMatch(adapter,/NEXT_PUBLIC_OPENROUTER/);
});
