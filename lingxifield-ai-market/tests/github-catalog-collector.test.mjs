import test from 'node:test';import assert from 'node:assert/strict';import{readFile}from'node:fs/promises';
const src=await readFile(new URL('../scripts/collect-github-catalog.mjs',import.meta.url),'utf8');
test('collector only reads catalog and writes separate report snapshots',()=>{
 assert.match(src,/data\/catalog\.json/);assert.match(src,/reports','github-snapshot/);
 assert.doesNotMatch(src,/writeFile\([^\n]*catalog\.json/);
 assert.doesNotMatch(src,/supabase|service_role|payment/);
});
test('no site traffic or GEO is misrepresented from GitHub stars',()=>{
 assert.match(src,/metricScope:'github_repository_only'/);
 assert.match(src,/NOT site visits, app downloads, SEO\/GEO/);
 assert.match(src,/createHash\('sha256'\)/);
});
test('external requests are bounded and failures are retained',()=>{
 assert.match(src,/Math\.min\(20/);assert.match(src,/AbortSignal\.timeout\(12000\)/);
 assert.match(src,/response\.status===429\|\|response\.status===403&&remaining===/);
 assert.match(src,/REPOSITORY_IDENTITY_MISMATCH/);
});
