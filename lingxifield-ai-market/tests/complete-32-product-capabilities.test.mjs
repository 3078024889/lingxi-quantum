import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('every one of 32 existing publisher products has one detailed capability profile',async()=>{
 const source=await read('lib/capability-profiles.ts');
 const index=await read('lib/data.ts');
 const catalog=JSON.parse(await read('data/catalog.json'));
 const base=[...index.matchAll(/(?:^|[,\n])\s*\{id:'([^']+)'/g)].map(x=>x[1]);
 const all=[...new Set([...base,...catalog.map(x=>x.id)])];
 const cards=[...source.matchAll(/^\s*(['"]?[a-z0-9-]+['"]?):profile\(/gm)].map(x=>x[1].replace(/['"]/g,''));
 assert.equal(all.length,32);
 assert.equal(cards.length,all.length);
 assert.equal(new Set(cards).size,cards.length);
 assert.deepEqual(all.filter(x=>!cards.includes(x)),[]);
 const queue=await read('scripts/build-capability-review-queue.mjs');
 assert.match(queue,/\[\'\"\]\?/);
 assert.ok(queue.includes('new Set'),'review script must account for every curated profile ID');
 for(const id of ['jimeng','kling','luma','qwen','grok','whisper','fasterwhisper','automatic1111','openai-python','anthropic-sdk-python'])
  assert.ok(cards.includes(id),id);
 assert.ok((source.match(/\bcap\('/g)||[]).length>=90,'Concrete individually sourced feature cards required');
 const hrefs=[...source.matchAll(/'https:\/\/([^'\s]+)'/g)].map(x=>'https://'+x[1]);
 assert.ok(hrefs.length>=70);
 assert.ok(hrefs.every(u=>new URL(u).protocol==='https:'));
});
test('moderation backend is explicitly separate from public anonymous feedback',async()=>{
 const sql=await read('../supabase/migrations/20261030195000_ai_market_feedback_moderation.sql');
 const publicHandler=await read('app/api/v1/feedback/route.ts');
 assert.match(sql,/from public,anon/);
 assert.match(sql,/v_uid:\=\(select auth\.uid\(\)\)/);
 assert.match(sql,/and status='pending'/);
 assert.match(publicHandler,/reviewRequired:true/);
 assert.doesNotMatch(publicHandler,/ai_market_moderate_feedback/);
});
