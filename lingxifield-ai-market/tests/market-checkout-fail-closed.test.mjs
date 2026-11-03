import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');

test('public checkout remains fail-closed until signed merchant, ledger and fulfilment gates pass',()=>{
 const route=read('app/api/v1/billing/checkout/route.ts');
 const readiness=read('lib/market-billing-readiness.mjs');
 assert.ok(route.includes("export const runtime='nodejs'"));
 assert.ok(route.includes("MARKET_CHECKOUT_NOT_LIVE"));
 assert.ok(route.includes("},{status:503,headers}"));
 assert.ok(route.includes("request.headers.get('origin')!==here.origin"));
 assert.ok(readiness.includes('const checkoutImplemented=false'));
 assert.ok(readiness.includes('integrationEnabled&&orderLedgerReady&&vendorAuthReady&&fulfillmentReady&&credentialsConfigured&&providerEnabled&&checkoutImplemented'));
 assert.ok(!route.includes('request.json()'));
 assert.ok(!route.includes('grantEntitlement'));
 assert.ok(!route.includes('markOrderPaid'));
});

test('public provider readiness never returns credential values',()=>{
 const route=read('app/api/v1/billing/providers/route.ts');
 const readiness=read('lib/market-billing-readiness.mjs');
 assert.ok(route.includes('paymentDeploymentReadiness()'));
 assert.ok(readiness.includes('credentialsConfigured'));
 assert.ok(!readiness.includes('clientSecret:'));
 assert.ok(!readiness.includes('privateKey:'));
 assert.ok(readiness.includes('reason:!credentialsConfigured'));
 assert.ok(!route.includes('PAYPAL_CLIENT_SECRET'));
 assert.ok(!route.includes('ALIPAY_PRIVATE_KEY'));
 assert.ok(!route.includes('WECHAT_API_V3_KEY'));
});
