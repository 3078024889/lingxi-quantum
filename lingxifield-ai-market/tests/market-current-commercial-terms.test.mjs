import test from 'node:test';
import assert from 'node:assert/strict';
import {RESEARCHED_FACTS} from '../lib/market-researched-facts.ts';
import {COMPANY_EVIDENCE_IDS} from '../lib/market-company-evidence.ts';
import {SUNO_PLANS,sunoSubscription,sunoFree} from '../lib/market-suno-pricing.ts';

test('existing 32 product entries have source-backed publisher plan and commercial-use guidance',()=>{
 assert.equal(Object.keys(RESEARCHED_FACTS).length,32);
 const ids=new Set(COMPANY_EVIDENCE_IDS);
 for(const [id,f] of Object.entries(RESEARCHED_FACTS)){
  assert.ok(ids.has(id),id);
  for(const field of ['price','free','region','models','commercial']){
   assert.ok(typeof f[field]==='string'&&f[field].length>=8,id+' '+field);
   const link=f[field+'Source'];
   assert.ok(typeof link==='string'&&/^https:\/\/[^/]+/.test(link),id+' '+field+'Source');
  }
 }
});
test('Suno commercial rights reflect September 2026 terms, including download and remix rules',()=>{
 const s=RESEARCHED_FACTS.suno;
 assert.match(s.commercial,/Free.*non-commercial/);
 assert.match(s.commercial,/eligible.*download/i);
 assert.match(s.commercial,/retroactive rights/i);
 assert.match(s.commercial,/download/i);
 assert.match(s.commercial,/Remix/);
 assert.equal(s.commercialSource,'https://suno.com/terms');
});
test('Midjourney, Runway, Ollama distinguish commercial products from third-party rights',()=>{
 const facts=RESEARCHED_FACTS;
 assert.match(facts.midjourney.commercial,/100 万美元.*Pro.*Mega/);
 assert.match(facts.runway.commercial,/广告.*变现视频/);
 assert.match(facts.ollama.commercial,/MIT/);
 assert.match(facts.ollama.commercial,/模型权重/);
});
test('ChatGPT and Claude separate consumer from API business terms',()=>{
 const facts=RESEARCHED_FACTS;
 assert.match(facts.chatgpt.commercial,/个人服务与 API\/企业合同分别/);
 assert.match(facts.claude.commercial,/消费者条款.*商业条款/);
});
test('all nine locales show Suno annual prices, allowance and monthly download limits',()=>{
 assert.deepEqual(SUNO_PLANS.plans.map(p=>p.annualTotalUsd),[96,288]);
 assert.deepEqual(SUNO_PLANS.plans.map(p=>p.monthlyDownloads),[20,60]);
 for(const l of ['zh','en','ja','ko','fr','de','es','pt','ar']){
  const s=sunoSubscription(l),f=sunoFree(l);
  for(const v of ['$96','$288','2500','10000','20','60'])assert.ok(s.includes(v),l+' '+v);
  assert.ok(f.includes('50'),l+' free credits');
 }
 const price=RESEARCHED_FACTS.suno.price;
 assert.match(price,/Pro.*20.*Premier.*60/);
});
