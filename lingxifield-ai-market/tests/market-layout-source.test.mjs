import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const page=await readFile(new URL('../app/market-workbench.tsx',import.meta.url),'utf8');
test('public repo feed defaults collapsed so primary rankings remain visible',()=>{
 assert.match(page,/<details className="panel"/);
 assert.match(page,/<summary[^>]*>查看官方开源项目动态/);
 assert.match(page,/<PublicRepoSignals\/>/);
 assert.doesNotMatch(page,/<details[^>]*open(?:=|\s|>)/);
});
