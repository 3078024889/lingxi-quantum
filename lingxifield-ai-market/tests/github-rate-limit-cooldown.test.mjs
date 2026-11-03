import test from 'node:test';import assert from 'node:assert/strict';import{readFile}from'node:fs/promises';
const s=await readFile(new URL('../scripts/collect-github-catalog.mjs',import.meta.url),'utf8');
test('rate limit cooldown is read and prevents premature direct API calls',()=>{
 assert.match(s,/github-rate-limit\.json/);
 assert.match(s,/cooldown\.resetEpoch\*1000>Date\.now\(\)/);
 assert.match(s,/if\(skipDirect\)/);
});
test('cooldown persists only rate limit timing without secrets',()=>{
 assert.match(s,/if\(rateLimit\?\.resetEpoch&&!rateLimit\.cached\)/);
 assert.match(s,/recordedAt:collectedAt/);
 assert.doesNotMatch(s,/Authorization:|GITHUB_TOKEN/);
});
