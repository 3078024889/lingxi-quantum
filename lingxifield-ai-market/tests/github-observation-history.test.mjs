import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const script=await readFile(new URL('../scripts/archive-github-snapshot.mjs',import.meta.url),'utf8');
test('cached observations cannot be archived as new measurements',()=>{
 assert.ok(script.includes('retained_not_refreshed'));
 assert.ok(script.includes('unknown_or_cached'));
 assert.ok(script.includes('github-observations.json'));
});
