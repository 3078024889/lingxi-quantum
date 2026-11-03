import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {COMPANY_EVIDENCE_IDS,companyPresentationFor} from '../lib/market-company-evidence.ts';
import {PUBLISHER_FOUNDERS} from '../lib/market-founder-evidence.ts';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('all 32 curated products show sourced people, not legal-person company names, in their compact ranking',()=>{
 assert.equal(COMPANY_EVIDENCE_IDS.length,32);
 assert.equal(Object.keys(PUBLISHER_FOUNDERS).length,28);
 for(const id of COMPANY_EVIDENCE_IDS){
  const p=companyPresentationFor(id,id),c=p.creator;
  assert.ok(c,id);assert.match(c.source,/^https:\/\//,id);
  assert.ok(c.en.trim()&&c.zh.trim(),id);
  assert.ok(['founder','project_creator','lead_author'].includes(c.role),id);
  assert.ok(!/LLC|Inc\.|Ltd\.|GmbH|PBC/.test(c.en),id);
 }
 assert.match(companyPresentationFor('chatgpt','ChatGPT').creator.zh,/奥特曼/);
 assert.match(companyPresentationFor('grok','Grok').creator.zh,/马斯克/);
 assert.equal(companyPresentationFor('grok','Grok').creator.en,'Elon Musk');
 assert.equal(companyPresentationFor('openai-python','SDK').creator.en,companyPresentationFor('chatgpt','ChatGPT').creator.en);
 assert.equal(companyPresentationFor('vllm','vLLM').creator.role,'lead_author');
 assert.equal(companyPresentationFor('automatic1111','WebUI').creator.role,'project_creator');
 const card=read('app/market-publisher-facts.tsx');
 assert.ok(card.includes('...(!compact&&company?'));
 assert.ok(card.includes('p.legalEntity||t.unverified'));
 assert.ok(card.includes("creator.role==='founder'"));
 for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar'])assert.match(card,new RegExp('\\\\b'+lang+':\\\\{'));
});
test('ranking opens above a default-collapsed, accessible verified cost calculator',()=>{
 const home=read('app/market-workbench.tsx'),css=read('app/globals.css');
 assert.match(home,/<details className="marketCostDisclosure"/);
 assert.doesNotMatch(home,/<details className="marketCostDisclosure" open/);
 assert.match(home,/<summary><span className="marketCostSummaryTitle">/);
 assert.match(home,/<MarketCostEstimator language=\{language\} currency=\{currency\}\/>/);
 assert.match(css,/\.marketCostDisclosure>summary/);
});
