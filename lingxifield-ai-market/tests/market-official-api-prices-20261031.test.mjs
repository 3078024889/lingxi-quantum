import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const src=readFileSync(new URL('lib/market-rate-catalog.ts',root),'utf8');
const start='export const API_RATES:readonly ApiRate[]=[';
const a=src.indexOf(start),b=src.indexOf('] as ApiRate[];',a);
const rates=JSON.parse('['+src.slice(a+start.length,b)+']');
const byId=id=>rates.find(x=>x.id===id);
test('OpenAI gpt-6 family short-context Standard token rates are model-specific and sourced',()=>{
 for(const [id,inRate,outRate] of [['openai-gpt6-astra',10,50],['openai-gpt61-sol',2,10],['openai-gpt61-terra',1,5],['openai-gpt6-luna',0.1,0.5]]){
  const r=byId(id);assert.ok(r,id);assert.equal(r.inPerMillion,inRate);assert.equal(r.outPerMillion,outRate);assert.equal(r.currency,'USD');assert.equal(r.source,'https://developers.openai.com/api/docs/pricing');
 }
 assert.equal(rates.find(x=>x.platform==='chatgpt').id,'openai-gpt61-sol');
});
test('Claude Sonnet 5 rate did not increase September; newest Sonnet/Opus 5.5 prices are displayed',()=>{
 for(const [id,inRate,outRate] of [['verified-text-05',2,10],['verified-text-08',2,10],['claude-sonnet55',2,10],['claude-opus55',4,20],['claude-haiku55',.1,.5]]){
  const r=byId(id);assert.ok(r,id);assert.equal(r.inPerMillion,inRate);assert.equal(r.outPerMillion,outRate);assert.ok(r.source.startsWith('https://platform.claude.com/'));
 }
 assert.equal(rates.find(x=>x.platform==='claude').id,'claude-sonnet55');
 assert.ok(byId('verified-text-05').notes.includes('August 10'));
});
test('DeepSeek peak/off-peak pricing is in USD and never converted silently',()=>{
 for(const [id,input,output] of [['a0',.3,1.2],['a1',.15,.6],['a2',1.32,3.96],['a3',.66,1.98]]){
  const r=byId(id);assert.equal(r.currency,'USD');assert.equal(r.inPerMillion,input);assert.equal(r.outPerMillion,output);
  assert.match(r.source,/api-docs\.deepseek\.com/);
 }
});
