import test from 'node:test';
import assert from 'node:assert/strict';
import {searchEntities} from './ai-market-search-core.mjs';
const x=[{id:'alpha',name:'Alpha AI',kind:'product',status:'verified'},{id:'beta',name:'Beta AI',kind:'product',status:'candidate'}];
test('search finds verified',()=>assert.equal(searchEntities(x,{q:'alpha'}).length,1));
test('candidate not public',()=>assert.equal(searchEntities(x,{q:'beta'}).length,0));
test('case insensitive',()=>assert.equal(searchEntities(x,{q:'ALPHA'}).length,1));
test('empty search returns verified only',()=>assert.deepEqual(searchEntities(x).map(x=>x.id),['alpha']));
