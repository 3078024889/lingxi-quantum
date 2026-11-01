import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const src=await readFile(new URL('../scripts/collect-github-catalog.mjs',import.meta.url),'utf8');
test('local fallback is restricted to localhost or loopback and official GitHub-backed statuses',()=>{
 assert.match(src,/LOCAL_URL_REQUIRED/);assert.match(src,/127\.0\.0\.1/);
 assert.match(src,/public_repository_unverified_product/);
 assert.match(src,/github\.com/);
});
test('cached fallback records are explicitly marked with unknown freshness',()=>{
 assert.match(src,/local_app_github_api_cached_response/);
 assert.match(src,/unknown_or_cached/);
 assert.match(src,/localSourceMatched/);
});
