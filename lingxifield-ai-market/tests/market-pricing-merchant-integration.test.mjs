import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditPriceDetail} from '../lib/market-source-coverage.mjs';
import {paymentDeploymentReadiness,mainSiteBillingCompatibility} from '../lib/market-billing-readiness.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('currency amounts do not make self-hosted software or no-quote into false paid products',()=>{
 const rows=[{id:'kling',facts:{price:'Video API $500 for 3250 Units',priceSource:'https://kling.ai/dev/pricing'}},
 {id:'qwen',facts:{price:'输入 ¥1.2/百万 Token',priceSource:'https://help.aliyun.com/zh/model-studio/model-pricing'}},
 {id:'local',facts:{price:'开源本地软件免费',priceSource:'https://github.com/org/repo'}},
 {id:'missing',facts:{price:'实时结账金额',priceSource:'https://example.com/plan'}}];
 const report=auditPriceDetail(rows);
 assert.equal(report.total,4);
 assert.equal(report.explicitCurrencyAmountProducts,2);
 assert.deepEqual(report.withoutFixedCurrencyQuote,['local','missing']);
 assert.deepEqual(report.freeSelfHostedIds,['local']);
});

test('five primary-source catalog updates distinguish API, credit, monthly membership and iOS prices',()=>{
 const raw=read('lib/market-researched-facts.ts');
 const token='export const RESEARCHED_FACTS:Readonly<Record<string,MarketResearchFact>>=';
 const start=raw.indexOf(token)+token.length;
 const end=raw.lastIndexOf(';',raw.indexOf('export const MARKET_RESEARCH_CHECKED_AT',start));
 const facts=JSON.parse(raw.slice(start,end));
 for(const [id,domain,priceToken] of [
  ['dify','dify.ai/pricing','Professional $59'],
  ['llamaindex','llamaindex.ai/pricing','Starter $50'],
  ['kling','kling.ai/dev/pricing','Kling 4.0'],
  ['qwen','help.aliyun.com/zh/model-studio','Token ¥1.2'],
  ['doubao','apps.apple.com/cn/app','月付 ¥68'],
 ]){ assert.ok(facts[id].priceSource.includes(domain),id+' source');assert.ok(facts[id].price.includes(priceToken),id+' price');}
});

test('merchant reuse stays closed until paid marketplace SKU and atomic entitlement exist',()=>{
 const r=mainSiteBillingCompatibility({AI_MARKET_MAIN_SITE_ORIGIN:'https://lingxifield.com'});
 assert.equal(r.origin,'https://lingxifield.com');
 assert.equal(r.ready,false);
 assert.equal(r.sellerMarketplaceSkuImplemented,false);
 for(const value of ['http://lingxifield.com','https://lingxifield.com.evil.net','https://example.com']){
  assert.equal(mainSiteBillingCompatibility({AI_MARKET_MAIN_SITE_ORIGIN:value}).origin,null);
 }
 assert.equal(paymentDeploymentReadiness({AI_MARKET_BILLING_ENABLED:'1',AI_MARKET_ORDER_LEDGER_READY:'1',AI_MARKET_VENDOR_AUTH_READY:'1',AI_MARKET_FULFILLMENT_READY:'1'}).some(x=>x.checkoutAvailable),false);
 assert.ok(read('app/api/v1/billing/providers/route.ts').includes('mainSiteBillingCompatibility()'));
 assert.ok(read('app/api/v1/data-readiness/route.ts').includes('priceCoverage'));
});
