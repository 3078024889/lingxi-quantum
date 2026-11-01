import test from 'node:test';
import assert from 'node:assert/strict';
import {safeGscQuery} from '../lib/gsc-query-safety.mjs';

test('safe Search Console query is normalized and retained',()=>{
 assert.equal(safeGscQuery('  best   AI video generator  '),'best AI video generator');
 assert.equal(safeGscQuery('ChatGPT pricing Singapore'),'ChatGPT pricing Singapore');
 assert.equal(safeGscQuery('PDF compressor online'),'PDF compressor online');
});

test('potentially identifying or secret-bearing search queries are rejected',()=>{
 for(const value of [
  'person@example.com AI tool',
  'call +1 (415) 555-0123',
  'https://example.com private login',
  'www.example.com',
  'my api-key sk-abcdefghijklmnopqr',
  'customer id 123456789012',
  'x'.repeat(121),
  '   '
 ])assert.equal(safeGscQuery(value),null,String(value));
});

test('GSC collector never publishes its machine-collected rows as human-reviewed',async()=>{
 const {readFile} = await import('node:fs/promises');
 const script=await readFile(new URL('../scripts/sync-gsc-analytics.mjs',import.meta.url),'utf8');
 assert.match(script,/safeGscQuery\(query\)/);
 assert.match(script,/reviewed:false/);
 assert.doesNotMatch(script,/reviewed:true/);
 assert.doesNotMatch(script,/reviewedAt:new Date\(\)\.toISOString\(\)/);
});
