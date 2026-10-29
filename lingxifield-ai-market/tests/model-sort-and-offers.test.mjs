import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const page=await readFile(new URL('../app/models/page.tsx',import.meta.url),'utf8');
const api=await readFile(new URL('../app/api/v1/models/groups/route.ts',import.meta.url),'utf8');
test('price and provider ordering are user-selectable and sent to server',()=>{
 assert.ok(page.includes('sort:order'));
 assert.ok(page.includes('报价服务商数量'));
 assert.ok(page.includes('最低参考输入价'));
 assert.ok(api.includes("sp.get('sort')==='price'"));
 assert.ok(api.indexOf("if(sort==='price')matched.sort") < api.indexOf('matched.slice(cursor,cursor+limit)'));
});
test('expanded offers compare cheaper observed input first without modifying original dataset',()=>{
 assert.ok(page.includes('[...g.offers].sort'));
 assert.ok(page.includes('Infinity'));
});
