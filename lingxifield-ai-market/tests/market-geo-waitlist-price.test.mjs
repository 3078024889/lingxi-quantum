import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('GEO waitlist never displays a charge before monitoring is available',async()=>{
 const workbench=await readFile(new URL('../app/market-workbench.tsx',import.meta.url),'utf8');
 const dictionary=await readFile(new URL('../lib/v2.ts',import.meta.url),'utf8');
 assert.ok(workbench.includes("plan.id==='geo'?tr.planUnavailable"));
 assert.ok(dictionary.includes("planUnavailable:'暂未开放'"));
 assert.ok(dictionary.includes("planUnavailable:'Not available yet'"));
 assert.ok(dictionary.includes("planUnavailable:'غير متاح بعد'"));
});
