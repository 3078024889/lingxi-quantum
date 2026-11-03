import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {capabilityProfile} from '../../lingxifield-ai-market/lib/capability-profiles.ts';
import {SIAI_RESULT_HEADLINES} from '../../lingxifield-ai-market/lib/market-result-headlines.ts';
import {SIAI_ANSWER_UI} from '../../lingxifield-ai-market/lib/market-answer-i18n.ts';

const read=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');
const ids=[...read('lingxifield-ai-market/lib/market-api-service-catalog.ts').match(/const ALL=\[([^\]]+)\] as const;/)[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);
const langs=['zh','en','ja','ko','fr','de','es','pt','ar'];

test('all 32 published platforms offer distinct conflict/question hooks and three sourced practical capabilities',()=>{
 assert.equal(ids.length,32);
 assert.equal(new Set(ids).size,32);
 assert.deepEqual(Object.keys(SIAI_RESULT_HEADLINES).sort(),ids.slice().sort(),'no unofficial product answer or missing public entry');
 for(const id of ids){
  const h=SIAI_RESULT_HEADLINES[id],p=capabilityProfile(id);
  assert.ok(h.length>24,id+' lacks readable task-first question');
  assert.ok(/[？?]/.test(h),id+' must lead with a real use-case question');
  assert.ok(p,id+' missing sourced capability profile');
  assert.ok(p.headline.length>=16,id+': headline');
  assert.ok(p.differentiator.length>=25,id+': differentiated purpose');
  assert.ok(p.audience.length>=6,id+': specific customer audience');
  assert.ok(p.capabilities.length>=3,id+' must give at least three concrete product capabilities');
  assert.equal(p.firstSteps.length,3,id+': three-step onboarding');
  for(const [i,cap] of p.capabilities.entries()){
   assert.ok(cap.name?.length>=3&&cap.outcome?.length>=15&&cap.example?.length>=15&&cap.boundary?.length>=15,id+': incomplete feature '+i);
   const url=new URL(cap.source);
   assert.equal(url.protocol,'https:',id+': non-https vendor proof');
   assert.ok(['github.com','openai.com','docs.n8n.io','runway.com','help.runwayml.com'].includes(url.hostname)||
      /(?:\.com|\.ai|\.io|\.dev|\.org)$/.test(url.hostname),id+': invalid domain '+url.hostname);
  }
 }
});

test('plain language labels, actions and three first steps remain available in all nine languages',()=>{
 assert.deepEqual(Object.keys(SIAI_ANSWER_UI).sort(),langs.slice().sort());
 for(const lang of langs){
  const words=SIAI_ANSWER_UI[lang];
  for(const key of ['eyebrow','answer','forWhom','standout','taskCards','sample','boundary','start','first','second','third','source','official','simple']){
   assert.ok(words[key]?.length>=3,lang+':'+key);
  }
  assert.ok(words.first.includes('{name}'),lang+' must use product name in first step');
  assert.doesNotMatch(words.eyebrow,/占位|待核验|待测试|工程/);
 }
});

test('home and detail expose direct source-backed product answers rather than unrendered capability metadata',()=>{
 const home=read('app/page.tsx'),detail=read('app/siai/[lang]/[id]/page.tsx'),client=read('components/SiaiRankingHome.tsx');
 assert.match(home,/productAnswerHeadline\(id\)/);
 assert.match(home,/capabilityProfile\(id\)\?\.differentiator/);
 assert.match(client,/siai-quick-answer/);
 assert.match(client,/capabilityProfile\(p\.id\)\?\.capabilities\.slice\(0,3\)/);
 assert.match(detail,/profile\.capabilities\.slice\(0,3\)/);
 assert.match(detail,/siai-capability-card/);
 assert.match(detail,/feature\.example/);
 assert.match(detail,/feature\.boundary/);
 assert.match(detail,/siai-start-steps/);
 assert.match(detail,/siai-direct-answers-grid/);
 assert.match(detail,/items\.slice\(5\)/);
 assert.match(detail,/facts\?\.priceSource/);
 assert.match(detail,/facts\?\.commercialSource/);
 assert.doesNotMatch(detail,/Link（Stripe\/\.test/,'Do not strip vendor-specific wallet regional eligibility');
});

test('no customer-visible legacy seed placeholders are allowed to shadow the 32 publisher facts',()=>{
 const seed=read('lingxifield-ai-market/lib/data.ts');
 assert.doesNotMatch(seed,/待核验|以官网为准|(?:seo|geo|visits|downloads):'—'/);
 const model=read('lingxifield-ai-market/lib/market-researched-facts.ts');
 const start=model.indexOf('={',model.indexOf('RESEARCHED_FACTS:'))+1;
 const end=model.indexOf('};\nexport const MARKET_RESEARCH_CHECKED_AT',start)+1;
 const fact=JSON.parse(model.slice(start,end));
 assert.equal(Object.keys(fact).length,32);
 for(const id of ids){
  const r=fact[id];assert.ok(r,id);
  for(const prop of ['price','priceSource','free','freeSource','region','regionSource','models','modelsSource','commercial','commercialSource','payments','paymentSource']){
   assert.ok(r[prop],id+': missing '+prop);
  }
  assert.ok(r.payments.length>0,id+': no verifiable payment description');
  for(const source of ['priceSource','freeSource','regionSource','modelsSource','commercialSource','paymentSource']){
   assert.equal(new URL(r[source]).protocol,'https:',id+': unverifiable '+source);
  }
 }
});

test('Q&A stays expanded and source-linked on mobile; company facts and answers have visible 14px+ contract',()=>{
 const css=read('app/siai-detail.css');
 assert.match(css,/\.siai-direct-answers-grid\{display:grid/);
 assert.match(css,/@media\(max-width:600px\)/);
 for(const m of css.matchAll(/font-size:(\d+)px/g))
  assert.ok(Number(m[1])>=14,'small detail text: '+m[0]);
 const source=read('app/siai/[lang]/[id]/page.tsx');
 assert.match(source,/rel="nofollow noopener noreferrer"/);
 assert.doesNotMatch(source,/<details(?:\s|>)/);
});


test('six publisher legal operators are shown as sourced entities, not guessed from company/product brands',()=>{
 const src=read('lingxifield-ai-market/lib/market-company-evidence.ts');
 const expected=[
  ['huggingface','Hugging Face, Inc.','https://huggingface.co/terms-of-service'],
  ['deepseek','杭州深度求索人工智能基础技术研究有限公司','https://cdn.deepseek.com/policies/zh-CN/deepseek-privacy-policy.html'],
  ['llamaindex','LlamaIndex, Inc.','https://www.llamaindex.ai/legal/terms-of-service'],
  ['dify','LangGenius, Inc.','https://www.dify.ai/legal/terms-of-service'],
  ['ollama','Ollama Inc.','https://ollama.com/terms'],
  ['xai','SpaceX Super Intelligence LLC','https://x.ai/legal/terms-of-service']
 ];
 for(const [id,entity,source] of expected){
  const exact="legalEntity:fact('"+entity+"','"+source+"','2026-11-03'),legalEntityScope:'service_operator'";
  assert.ok(src.includes(exact),id+' legal operator must be exactly cited to a publisher');
 }
 assert.ok(src.includes("xai:'xAI'"),'retain historic xAI brand, distinguish Grok consumer terms from brand founding year');
 assert.doesNotMatch(src,/SpaceX Super Intelligence LLC（/,'legal entity must contain company name only');
});
