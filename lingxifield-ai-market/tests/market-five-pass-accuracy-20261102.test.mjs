import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
const raw=read('lib/market-researched-facts.ts');
const a=raw.indexOf('={',raw.indexOf('RESEARCHED_FACTS:'))+1;
const b=raw.indexOf('};\nexport const MARKET_RESEARCH_CHECKED_AT',a)+1;
if(a<1||b<1)throw Error('CURATED_FACTS_SOURCE_LAYOUT_CHANGED');
const facts=JSON.parse(raw.slice(a,b));

test('first-pass: all 32 original offers retain six fields with first-party evidence sources',()=>{
 assert.equal(Object.keys(facts).length,32);
 for(const [id,p] of Object.entries(facts)){
  for(const field of ['price','free','models','region','commercial']){
   assert.ok(typeof p[field]==='string'&&p[field].trim().length>5,id+':'+field);
   assert.ok(/^https:\/\//.test(p[field+'Source']||''),id+':'+field+'Source');
  }
  assert.ok(Array.isArray(p.payments)&&p.payments.length>0,id+':payment rails');
  assert.ok(/^https:\/\//.test(p.paymentSource||''),id+':paymentSource');
 }
});

test('third-pass: current Replit monthly and annual prices have separate, sourced billing terms',()=>{
 const p=facts.replit;
 assert.match(p.price,/Core \$20\/月（月付）/);
 assert.match(p.price,/Core \$20\/月（月付），年付折合 \$18\/月/);
 assert.match(p.price,/Pro \$100\/月（月付），年付折合 \$90\/月/);
 assert.doesNotMatch(p.price,/\$25\/月|\$95\/月/);
 assert.match(p.price,/年度|全年结算|全年/);
 assert.equal(p.priceSource,'https://replit.com/pricing');
 assert.equal(p.freeSource,'https://replit.com/pricing');
 assert.doesNotMatch(p.free,/每天.*积分|每日 Agent 积分/);
});

test('second/third-pass: Lovable task-cost example has source, no fake USD per task',()=>{
 const p=facts.lovable;
 for(const n of ['0.50','0.90','1.20','1.70'])assert.ok(p.price.includes(n+' credits'),n);
 assert.match(p.price,/复杂度及套餐影响积分消耗/);
 assert.match(p.price,/不能直接换算为美元\/次/);
 assert.equal(p.priceSource,'https://lovable.dev/pricing');
});

test('third/fifth-pass: Stripe case explicitly documents Lovable-enabled wallets; checkout varies by country',()=>{
 const p=facts.lovable;
 assert.equal(p.paymentSource,'https://stripe.com/customers/lovable');
 assert.equal(p.payments.length,9);
 for(const method of ['Credit / debit card','Apple Pay','Google Pay','Cash App Pay','WeChat Pay','Alipay','iDEAL','Amazon Pay','Link']){
  assert.ok(p.payments.some(m=>m.includes(method)),'documented merchant method '+method);
 }
 assert.match(p.region,/官方案例明确列出已启用/);
 assert.match(p.region,/按所在国家、货币与账户等条件动态显示/);
 assert.match(p.region,/不能保证每个国家每种钱包都可用/);
 assert.match(p.region,/Stripe 自身覆盖的全部支付方式也不能直接视为 Lovable 已开通/);
});

test('fourth-pass: non-Chinese translations derive current prices, not stale locale placeholders',()=>{
 const c=read('lib/market-fact-locale.ts');
 assert.match(c,/LOVABLE_TASK_COSTS/);
 assert.match(c,/id==='replit'&&scope==='price'/);
 assert.match(c,/id==='lovable'&&scope==='price'/);
 assert.match(c,/id==='replit'&&scope==='price'[\s\S]*?values\[4\]/);
 assert.match(c,/"replit":\s*\{\s*"price":\s*\[\s*"USD",\s*18/);
 assert.match(c,/"n8n":\s*\{[\s\S]{0,140}?"free": "localUse"/);
 assert.match(c,/"openai-python":\s*\{[\s\S]{0,140}?"free": "sdk"/);
 assert.match(c,/"anthropic-sdk-python":\s*\{[\s\S]{0,140}?"free": "sdk"/);
});

test('second/fourth-pass: Midjourney V8.2 and separate niji trial replace generic placeholders',()=>{
 const p=facts.midjourney;
 assert.equal(p.freeSource,'https://docs.midjourney.com/hc/en-us/articles/27870399340173-Free-Trials');
 assert.match(p.free,/官网与 Discord 当前均不提供免费试用/);
 assert.match(p.free,/niji · journey/);
 assert.equal(p.modelsSource,'https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version');
 assert.match(p.models,/V8\.2/);
 assert.match(p.models,/2048px/);
 assert.match(p.models,/Edit Model/);
 const locale=read('lib/market-fact-locale.ts');
 assert.match(locale,/MIDJOURNEY_TRIAL_COPY/);
 assert.match(locale,/MIDJOURNEY_MODELS_COPY/);
 assert.match(locale,/id==='midjourney'&&scope==='free'/);
 assert.match(locale,/id==='midjourney'&&scope==='models'/);
});
