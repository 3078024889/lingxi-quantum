import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const code=await readFile(new URL('../scripts/collect-github-catalog.mjs',import.meta.url),'utf8');
test('distinguish API rate limiting from access denial without exposing tokens',()=>{
 assert.match(code,/RATE_LIMIT/);assert.match(code,/ACCESS_DENIED_403/);
 assert.match(code,/x-ratelimit-remaining/);assert.match(code,/x-ratelimit-reset/);
});
test('existing sourced snapshot is retained when upstream fails',()=>{
 assert.match(code,/prior=JSON\.parse\(await readFile\(target/);
 assert.match(code,/retained_not_refreshed/);
 assert.match(code,/retained,rateLimit/);
 assert.doesNotMatch(code,/Math\.random/);
});
