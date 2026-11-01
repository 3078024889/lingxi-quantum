import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PRODUCT_TASK_PHRASES,TASK_INTENTS,matchingEditorialProductIds} from '../lib/market-user-task-queries.mjs';
import {COMPANY_EVIDENCE_IDS} from '../lib/market-company-evidence.ts';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('all 32 currently published products have distinct practical task searches',()=>{
 assert.equal(Object.keys(PRODUCT_TASK_PHRASES).length,32);
 assert.deepEqual(Object.keys(PRODUCT_TASK_PHRASES).sort(),[...COMPANY_EVIDENCE_IDS].sort());
 const seen=new Set();
 for(const [id,queries] of Object.entries(PRODUCT_TASK_PHRASES)){
  assert.ok(queries.length>=3,id);
  for(const q of queries){
   assert.ok(q.length>=5&&q.length<=120,id+' '+q);
   assert.ok(!seen.has(q),id+' duplicate '+q);seen.add(q);
   assert.deepEqual(matchingEditorialProductIds(q),[id],q);
  }
 }
});
test('natural-language questions suggest relevant documented capabilities, never synthetic popularity',()=>{
 const examples=[
  ['哪个AI可以图生视频','runway'],
  ['如何离线运行本地大模型','ollama'],
  ['有没有录音转文字的AI工具','whisper'],
  ['我想不用写代码做网站','lovable'],
  ['怎么做AI视频配音','elevenlabs'],
  ['可以AI写歌的软件','suno'],
  ['Google搜索资料找出处','perplexity'],
  ['如何做自动化工作流','n8n']
 ];
 for(const [query,id] of examples){
  const ids=matchingEditorialProductIds(query);
  assert.ok(ids?.includes(id),query+' => '+JSON.stringify(ids));
 }
 for(const group of TASK_INTENTS){
  assert.ok(group.ids.length>=1,group.id);
  for(const id of group.ids)assert.ok(COMPANY_EVIDENCE_IDS.includes(id),group.id+' unknown product: '+id);
 }
});
test('task search is subject to country, payment, product filters and paging',()=>{
 const s=read('lib/platform-repository.ts');
 assert.match(s,/const inScope=editorialIds\?new Set/);
 assert.match(s,/matchesMarketFilter\(p,filter,region\)/);
 assert.match(s,/matchesMarketPayment\(p,payment,region\)/);
 assert.match(s,/index\.search\(\{\.\.\.base,q:inScope\?'':base\.q,matcher,sorter\}\)/);
 assert.ok(!/visitorCount|clickThroughRate|popularityScore/i.test(read('lib/market-user-task-queries.mjs')));
});
test('consumer-facing home does not show source-ingestion operations or empty SEO evidence counters',()=>{
 const home=read('app/market-workbench.tsx');
 const board=read('app/seo-geo-board.tsx');
 assert.ok(!home.includes('<MarketEvidenceStatus'));
 assert.ok(!home.includes('<MarketCoverageStrip'));
 assert.ok(!board.includes('seoGeoEvidenceCount'));
 assert.ok(!board.includes('coverage.measuredProducts'));
 assert.ok(board.includes('SEO')&&board.includes('GEO'));
});
