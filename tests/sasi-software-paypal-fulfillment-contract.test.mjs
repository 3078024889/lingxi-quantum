import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");

const paypal=read("lib/paypal.ts");
assert.match(paypal,/export function paypalConfigured\(\)/);
assert.match(paypal,/export function paypalEnabled\(\)/);
assert.match(paypal,/PAYPAL_ENABLED\?\.trim\(\)\.toLowerCase\(\)==="true"/);
assert.match(paypal,/PAYPAL_ENV\?\.trim\(\)\.toLowerCase\(\)==="live"/);

const checkout=read("app/api/pay/create/route.ts");
for(const token of [
 "resolveMarketplaceProduct","softwareCheckoutReady","toolPassCommerceReady",
 "getUsdBalanceProduct","currency:\"USD\"","provider:\"paypal\"",
 "amount_usd:product.amountUsd","SELF_PURCHASE_NOT_ALLOWED",
 "SOFTWARE_NOT_READY_FOR_SALE","TOOLPASS_COMMERCE_NOT_READY"
])assert.ok(checkout.includes(token),"PayPal checkout missing "+token);
assert.match(checkout,/\[\"toolpass\",\"software\",\"market\"\]/);
assert.match(checkout,/referenceId:order\.id/);

const marketplace=read("lib/sasi-marketplace/checkout.ts");
assert.match(marketplace,/wechatPayEnabled\(\)\|\|alipayEnabled\(\)\|\|paypalEnabled\(\)/);
const catalog=read("app/api/sasi/software/catalog/route.ts");
assert.match(catalog,/const wx=wechatPayEnabled\(\),ali=alipayEnabled\(\),paypal=paypalEnabled\(\)/);
assert.match(catalog,/payment:\{wechat:wx,alipay:ali,paypal\}/);

const webhook=read("app/api/pay/paypal/webhook/route.ts");
assert.match(webhook,/verifyPaypalWebhook/);
assert.match(webhook,/verifyPaypalCompletedOrder/);
assert.match(webhook,/CHECKOUT\.ORDER\.APPROVED/);
assert.match(webhook,/capturePaypalOrder\(providerId,Number\(order\.amount_usd\),order\.id\)/);
assert.match(webhook,/PAYMENT\.CAPTURE\.PENDING/);
assert.match(webhook,/PAYMENT\.CAPTURE\.DENIED/);
assert.match(webhook,/fulfillPaidOrder\(order\.id,true\)/);
const fulfillment=read("lib/fulfill-order.ts");
assert.match(fulfillment,/sasi_grant_software_delivery/);
assert.match(fulfillment,/sasi_market_record_verified_sale/);

const readiness=read("lib/sasi-software/readiness.ts");
assert.match(readiness,/admin\.storage\.from\(data\.bucket\)\.list/);
assert.match(readiness,/data\.sale_ready/);
const hardening=read("supabase/migrations/20261110120000_harden_sasi_software_fulfillment_search_path.sql");
assert.match(hardening,/sasi_grant_software_delivery\(uuid\) SET search_path TO ''/);
assert.match(hardening,/sasi_claim_software_download\(uuid,uuid\) SET search_path TO ''/);
const migration=read("supabase/migrations/20261110100000_sasi_software_private_fulfillment.sql");
for(const token of [
 "sasi-software-delivery","public=false","sasi_software_packages",
 "sasi_software_entitlements","ENABLE ROW LEVEL SECURITY",
 "REVOKE ALL ON public.sasi_software_packages FROM PUBLIC,anon,authenticated",
 "sasi_grant_software_delivery","o.provider='paypal'",
 "o.currency IS DISTINCT FROM 'USD'","o.amount_usd",
 "sasi_claim_software_download","ENTITLEMENT_IDEMPOTENCY_CONFLICT",
 "FILE_NOT_UPLOADED"
])assert.ok(migration.includes(token),"Software fulfillment migration missing "+token);
assert.match(migration,/GRANT EXECUTE ON FUNCTION public\.sasi_grant_software_delivery\(uuid\) TO service_role/);
assert.match(migration,/GRANT EXECUTE ON FUNCTION public\.sasi_claim_software_download\(uuid,uuid\) TO service_role/);
console.log("SASI_SOFTWARE_PAYPAL_PRIVATE_FULFILLMENT_CONTRACT_PASS");

assert.match(paypal,/paypalCrc32\(Buffer\.from\(rawBody,"utf8"\)\)/);
assert.match(paypal,/transmissionId\}\|\$\{transmissionTime\}\|\$\{webhookId\}\|\$\{crc\}/);
assert.match(paypal,/api\.paypal\.com/);
assert.match(paypal,/PAYPAL_CERT_URL_REJECTED/);
const verifyStart=paypal.indexOf("export async function verifyPaypalWebhook");
const verifyEnd=paypal.indexOf("export async function createPaypalRefund",verifyStart);
const verifier=paypal.slice(verifyStart,verifyEnd);
assert.doesNotMatch(verifier,/JSON\.parse\(rawBody\)/);
assert.doesNotMatch(verifier,/verify-webhook-signature/);
