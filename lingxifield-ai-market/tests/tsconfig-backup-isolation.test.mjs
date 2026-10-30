import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('TypeScript excludes reports containing archived .ts sources',async()=>{
 const ts=JSON.parse(await readFile(new URL('../tsconfig.json',import.meta.url),'utf8'));
 assert.ok(ts.include.some(x=>x==='**/*.ts'||x==='**/*.tsx'));
 assert.ok(ts.exclude.includes('reports'));
 assert.ok(ts.exclude.includes('node_modules'));
});
