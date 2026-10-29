import test from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('source list uses GitHub official API with bounded timeout and no speculative ranks',async()=>{
 const s=await read('app/api/market/public-repos/route.ts');
 assert.match(s,/api\.github\.com\/repos/);assert.match(s,/AbortSignal\.timeout\(7000\)/);
 assert.match(s,/Stars and forks do not represent users/);
 assert.doesNotMatch(s,/Math\.random/);
});
test('new public repository panel is wired into market UI',async()=>{
 const s=await read('app/market-workbench.tsx');
 assert.match(s,/import PublicRepoSignals from/);
 assert.match(s,/<PublicRepoSignals\/>/);
});
