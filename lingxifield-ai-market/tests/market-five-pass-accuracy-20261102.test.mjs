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

test('third/fifth-pass: Stripe provider support is not falsely asserted as Lovable merchant acceptance',()=>{
 const p=facts.lovable;
 assert.deepEqual(p.payments,['Link（Stripe Checkout；Stripe 官方 Lovable 案例确认使用）']);
 assert.equal(p.paymentSource,'https://stripe.com/customers/lovable');
 assert.doesNotMatch(p.payments.join(' '),/Alipay|WeChat|Apple Pay|Google Pay|iDEAL|Cash App|Amazon Pay/i);
 assert.match(p.region,/未提供逐国注册、付款渠道白名单/);
 assert.match(p.region,/不将 Stripe 全平台支持的钱包视为 Lovable 已开通/);
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
