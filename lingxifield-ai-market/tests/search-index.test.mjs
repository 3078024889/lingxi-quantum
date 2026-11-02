import test from 'node:test';import assert from 'node:assert/strict';
import {createSearchIndex} from '../lib/search-index.mjs';
const row=(id,category='视频')=>({id,name:`Tool ${id}`,company:'Example',category,description:'视频生成',capabilities:['文字转视频']});
test('bounded, stable pagination without duplicate items',()=>{const index=createSearchIndex(Array.from({length:103},(_,i)=>row(String(i))));const first=index.search({limit:50}),second=index.search({limit:50,cursor:first.nextCursor});assert.equal(first.items.length,50);assert.equal(new Set([...first.items,...second.items].map(x=>x.id)).size,100);assert.equal(index.search({limit:1e9}).items.length,50);});
test('Chinese capability and category intersect; unknown does not match all',()=>{const index=createSearchIndex([row('a'),row('b','编程')]);assert.equal(index.search({q:'文字转视频',category:'视频'}).total,1);assert.equal(index.search({q:'unmatched'}).total,0);});
test('lookup preserves identity and rejects duplicate IDs',()=>{assert.throws(()=>createSearchIndex([row('a'),row('a')]));assert.equal(createSearchIndex([row('a')]).get('a').id,'a');});
