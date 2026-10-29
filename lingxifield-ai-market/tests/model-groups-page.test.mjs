import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const page=await readFile(new URL('../app/models/page.tsx',import.meta.url),'utf8');
test('model page reads grouped offers instead of repeating every provider row',()=>{
 assert.match(page,/api\/v1\/models\/groups/);
 assert.match(page,/g\.offers\]\s*\.sort/);
 assert.match(page,/比较服务商/);
 assert.match(page,/aria-expanded/);
});
test('model page preserves provenance and does not claim verified prices',()=>{
 assert.match(page,/models\.dev/);
 assert.match(page,/尚未经各厂商独立核验/);
 assert.match(page,/USD \/ 百万 tokens/);
});
