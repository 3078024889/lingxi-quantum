import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {COMPANY_EVIDENCE,COMPANY_EVIDENCE_IDS,companyPresentationFor} from '../lib/market-company-evidence.ts';
const src=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('brand, corporation legal entity and parents are separately sourced',()=>{
 const known=new Map([
  ['chatgpt',['OpenAI OpCo, LLC','service_operator']],
  ['claude',['Anthropic, PBC','service_operator']],
  ['gemini',['Google LLC','service_operator']],
  ['qwen',['Alibaba Group Holding Limited','group_parent']],
  ['doubao',['ByteDance Ltd.','group_parent']],
  ['kling',['Kuaishou Technology','group_parent']],
  ['luma',['Luma AI, Inc.','service_operator']],
  ['elevenlabs',['Eleven Labs Inc.','service_operator']],
  ['suno',['Suno Inc.','service_operator']],
  ['replit',['Replit, Inc.','service_operator']],
  ['perplexity',['Perplexity AI, Inc.','service_operator']],
  ['n8n',['n8n GmbH','service_operator']],
  ['langchain',['LangChain Inc.','service_operator']],
  ['lovable',['Lovable Labs Incorporated','service_operator']],
  ['midjourney',['Midjourney, Inc.','service_operator']],
 ]);
 for(const [id,[legal,scope]] of known){
  const x=companyPresentationFor(id,id);
  assert.equal(x.legalEntity,legal,id);
  assert.equal(x.legalEntityScope,scope,id);
  assert.match(x.legalEntitySource,/^https:\/\//,id);
 }
 assert.equal(companyPresentationFor('chatgpt','ChatGPT').name,'OpenAI Group PBC');
 assert.notEqual(companyPresentationFor('chatgpt','ChatGPT').name,companyPresentationFor('chatgpt','ChatGPT').legalEntity);
 assert.equal(companyPresentationFor('kling','Kling').year,'2014-02-11');
 assert.match(COMPANY_EVIDENCE.kling.projectStarted.text,/2011/);
});
test('an IPO filing is not presented as completed stock-market listing',()=>{
 const x=companyPresentationFor('claude','Claude');
 assert.equal(x.listingState,'unconfirmed');
 assert.match(x.ipoFiling,/S-1/);
 assert.match(x.ipoFilingSource,/anthropic\.com/);
 const card=src('app/market-publisher-facts.tsx');
 assert.match(card,/p\.ipoFiling\?t\.ipoFiled/);
 assert.match(card,/已递交 IPO 申请，尚未上市/);
});
test('company identity four rows exist under publisher in all three public surfaces',()=>{
 const view=src('app/market-matrix-row.tsx');
 const detail=src('app/market-company-snapshot.tsx');
 const ssr=src('app/[lang]/platform/[id]/page.tsx');
 const directory=src('app/[lang]/companies/page.tsx');
 for(const p of [view,detail,ssr,directory])assert.match(p,/<MarketPublisherFacts/);
 assert.match(view,/<strong>\{p\.name\}<\/strong><MarketPublisherFacts/);
 const card=src('app/market-publisher-facts.tsx');
 for(const field of ['company','legal','listing','founded'])assert.ok(card.includes(field));
 for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar'])
  assert.match(card,new RegExp('\\b'+lang+':\\{'));
 assert.match(card,/showSources&&row\.source/);
 assert.match(src('app/globals.css'),/marketPublisherFactStackCompact/);
});
test('an unverified publisher cannot silently acquire legal identity from brand name',()=>{
 for(const id of COMPANY_EVIDENCE_IDS){
  const e=COMPANY_EVIDENCE[id],p=companyPresentationFor(id,id);
  if(p.kind!=='company')assert.equal(p.legalEntity,null);
  if(!e.legalEntity)assert.equal(p.legalEntity,null);
  if(e.legalEntity)assert.match(e.legalEntity.source,/^https:\/\//);
 }
 const card=src('app/market-publisher-facts.tsx');
 assert.match(card,/p\.legalEntity\|\|t\.unverified/);
 assert.match(card,/p\.kind==='company'/);
});
