import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createSearchIndex} from '../lib/search-index.mjs';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');

test('full catalog filtering happens before paging; no false empty page or inflated totals',()=>{
 const input=Array.from({length:120},(_,i)=>({id:'tool-'+i,name:'Tool '+String(i).padStart(3,'0'),company:'Company',category:'Video',description:'Short films',capabilities:['Video'],eligible:i%7===0}));
 const index=createSearchIndex(input);
 const options={q:'',limit:10,matcher:r=>r.eligible,sorter:(a,b)=>b.id.localeCompare(a.id)};
 const first=index.search({...options,cursor:0});
 assert.equal(first.total,18);
 assert.equal(first.items.length,10);
 assert.equal(first.nextCursor,10);
 const second=index.search({...options,cursor:first.nextCursor});
 assert.equal(second.total,18);
 assert.equal(second.items.length,8);
 assert.equal(second.nextCursor,null);
 assert.deepEqual([...first.items,...second.items].map(x=>x.id),input.filter(x=>x.eligible).sort((a,b)=>b.id.localeCompare(a.id)).map(x=>x.id));
});
test('source-to-UI filters include full scope and apply to API, not only visible page',async()=>{
 const route=await read('app/api/v1/search/route.ts');
 const repo=await read('lib/platform-repository.ts');
 const page=await read('app/market-workbench.tsx');
 assert.match(route,/INVALID_MARKET_FILTER/);
 assert.match(route,/rawFilter=sp.get\('filter'\)/);
 assert.match(route,/searchPlatforms\(\{q,category:/);
 assert.match(repo,/matcher=needsFilter/);
 assert.match(repo,/sorter=sort!==/);
 assert.match(page,/filter:marketFilter,payment:paymentFilter,sort:marketSort,region/);
 assert.match(page,/const filtered=results/);
 assert.doesNotMatch(page,/filterAndSortMarket\(shortlist/);
});
