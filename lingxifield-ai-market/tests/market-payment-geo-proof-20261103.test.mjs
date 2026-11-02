import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const raw=read('lib/market-researched-facts.ts');
const begin=raw.indexOf('={',raw.indexOf('RESEARCHED_FACTS:'))+1;
const end=raw.indexOf('};\nexport const MARKET_RESEARCH_CHECKED_AT',begin)+1;
if(begin<1||end<1)throw Error('FACTS_SOURCE_LAYOUT_CHANGED');
const facts=JSON.parse(raw.slice(begin,end));

test('Stripe primary-source Lovable story explicitly documents nine enabled payment methods',()=>{
 const p=facts.lovable;
 const expected=['Credit / debit card','Apple Pay','Google Pay','Cash App Pay','WeChat Pay','Alipay','iDEAL','Amazon Pay','Link'];
 assert.equal(p.payments.length,expected.length);
 for(const method of expected)assert.ok(p.payments.some(m=>m.startsWith(method)),method);
 assert.equal(p.paymentSource,'https://stripe.com/customers/lovable');
 assert.match(p.region,/动态显示/);
 assert.match(p.region,/不能保证每个国家每种钱包都可用/);
 assert.doesNotMatch(p.payments.join(' '),/PayPal|Venmo|Klarna/i);
});

test('documented regional wallet names keep restrictions on English and all nine locale labels',()=>{
 const src=read('lib/market-localized-payment.ts');
 const localeNames=['zh','en','ja','ko','fr','de','es','pt','ar'];
 for(const language of localeNames)assert.match(src,new RegExp('\\b'+language+':'));
 assert.match(src,/REGIONAL_CHECKOUT_SUFFIX/);
 assert.match(src,/localizedPaymentName\(base,language\)/);
 assert.match(src,/地区结账条件适用/);
 assert.match(src,/Stripe 快捷结账，适用地区/);
 assert.match(src,/where available at checkout/);
});

test('source review dates are product-specific rather than stamped as 2026-10-31',()=>{
 assert.match(raw,/lovable:'2026-11-03',replit:'2026-11-02',midjourney:'2026-11-02'/);
 const repository=read('lib/platform-repository.ts');
 const payments=read('lib/market-payment-facts.ts');
 const detail=read('app/[lang]/platform/[id]/page.tsx');
 assert.match(repository,/checkedAt:marketProductReviewedAt\(e\.id\)/);
 assert.match(payments,/research\?\.paymentSource\?marketProductReviewedAt\(id\):null/);
 assert.match(detail,/date=marketProductReviewedAt\(id\)/);
 assert.doesNotMatch(repository,/checkedAt:'2026-10-31'\}\)\)/);
});

test('official supported countries present five visible entries and accessible collapsed remainder',()=>{
 const code=read('lib/region-presentation.ts');
 const page=read('app/market-global-access.tsx');
 assert.match(code,/top:sorted\.slice\(0,5\),other:sorted\.slice\(5\)/);
 assert.match(page,/<details className="globalSupportedCountries">/);
 assert.match(page,/<summary>\{countryList\.words\.more\} \(\{countryList\.other\.length\}\)<\/summary>/);
 assert.doesNotMatch(page,/<div className="globalSupportedCountries"><strong>/);
});
