import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('reviewed facts are not permanently hidden by initial snapshot cutoff',async()=>{
 const src=await read('lib/reviewed-product-facts.ts');
 assert.match(src,/export function latestFacts\(slug:string,asOf=new Date\(\)\.toISOString\(\)\.slice\(0,10\)\)/);
 assert.match(src,/s\.observedAt<=asOf/);
 assert.match(src,/Object\.assign\(facts,snapshot\.facts\)/);
});
test('product records use reviewed restrictions and never reuse demo scores, finance or traffic',async()=>{
 const src=await read('lib/platform-repository.ts');
 assert.match(src,/restrictions:\[facts\?\.region\?\.text/);
 assert.match(src,/facts\?\.failure\?\.text/);
 assert.match(src,/score:null,trend:null,seo:'待核验',geo:'待核验'/);
 assert.match(src,/year:'待核验',location:'待核验',funding:'待核验',listing:'待核验'/);
});
