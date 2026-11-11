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
assert.match(marketplace,/process\.env\.SASI_MARKETPLACE_COMMERCE_READY==="true"/);
assert.match(marketplace,/marketplaceR2Ready\(\)/);
const catalog=read("app/api/sasi/software/catalog/route.ts");
assert.match(catalog,/const wechat=wechatPayEnabled\(\)/);
assert.match(catalog,/const alipay=alipayEnabled\(\)/);
assert.match(catalog,/const paypal=paypalPayEnabled\(\)/);
assert.match(catalog,/available:Boolean\(\(wechat\|\|alipay\|\|paypal\)&&await softwareCheckoutReady\(p\.id\)\)/);
assert.match(catalog,/payment:\{wechat,alipay,paypal\}/);

const webhook=read("app/api/pay/paypal/webhook/route.ts");
assert.match(webhook,/WEBHOOK_BODY_TOO_LARGE/);
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
assert.match(readiness,/data\?\.sale_ready/);
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


const fulfillmentSource=read("lib/fulfill-order.ts");
assert.match(fulfillmentSource,/toolquote:[\s\S]*?PROVIDER_PAYMENT_VERIFICATION_REQUIRED/);
assert.match(fulfillmentSource,/getUsdBalanceProduct\(productId\)[\s\S]*?PROVIDER_PAYMENT_VERIFICATION_REQUIRED/);
assert.match(fulfillmentSource,/if\(!verifiedPayment\)return\{ok:false,error:"PROVIDER_PAYMENT_VERIFICATION_REQUIRED"\};[\s\S]*?credit_sasi_topup/);
for(const path of [
 "app/api/pay/alipay/notify/route.ts",
 "app/api/pay/wechat/notify/route.ts",
 "app/api/pay/wechat/query/route.ts",
 "app/api/pay/paypal/return/route.ts",
 "app/api/pay/paypal/webhook/route.ts",
 "app/api/pay/webhook/route.ts",
 "lib/tools/payment-recovery.ts",
 "lib/mini/virtual-fulfillment.ts"
]){
 const source=read(path);
 assert.match(source,/fulfillPaidOrder\([^)]*,true\)/,"provider-verified fulfillment missing in "+path);
}
console.log("ALL_PROVIDER_PAYMENT_FULFILLMENT_REQUIRES_VERIFICATION_PASS");

const adminDiagnostics=read("app/api/admin/pay/readiness/route.ts");
assert.match(adminDiagnostics,/getPaypalAccessToken/);
assert.match(adminDiagnostics,/if\(!user\)/);
assert.match(adminDiagnostics,/if\(!isAdmin\(user\.email\)\)/);
assert.match(adminDiagnostics,/tokenTest:paypalTokenTest/);
assert.match(adminDiagnostics,/listPaypalWebhooks/);
assert.match(adminDiagnostics,/CHECKOUT\.ORDER\.APPROVED/);
assert.match(adminDiagnostics,/PAYMENT\.CAPTURE\.REFUNDED/);
assert.match(adminDiagnostics,/urlMatches/);
assert.match(adminDiagnostics,/USD_BALANCE_TOPUP_ENABLED/);
assert.match(adminDiagnostics,/SASI_REFUND_FLOW_TESTED/);
assert.match(adminDiagnostics,/wechatOauthConfigured/);
assert.match(adminDiagnostics,/wechatPayKeyMaterialReady/);
assert.match(adminDiagnostics,/alipayKeyMaterialReady/);
assert.match(adminDiagnostics,/toolPassBackendReady/);
assert.match(adminDiagnostics,/Cache-Control/);

const wechatPay=read("lib/wechatpay.ts");
assert.match(wechatPay,/wechatPayKeyMaterialReady/);
assert.match(wechatPay,/createPrivateKey\(normalizePemKey\(PRIVATE_KEY/);
assert.match(wechatPay,/createPublicKey\(normalizePemKey\(PLATFORM_PUBLIC_KEY/);
assert.match(wechatPay,/Buffer\.byteLength\(API_V3_KEY!,"utf8"\)===32/);
assert.match(wechatPay,/WECHAT_ENABLED\?\.trim\(\)\.toLowerCase\(\) === "true" && wechatPayKeyMaterialReady/);
const alipay=read("lib/alipay.ts");
assert.match(alipay,/alipayKeyMaterialReady/);
assert.match(alipay,/createPublicKey\(privateKey\)/);
assert.match(alipay,/Buffer\.from\(derived\)\.equals\(Buffer\.from\(configured\)\)/);

const wxOrderCreator=wechatPay.slice(wechatPay.indexOf("export async function createWechatNativeOrder"),wechatPay.indexOf("export function buildJsapiInvokeParams"));
assert.match(wxOrderCreator,/if \(!wechatPayEnabled\(\)\)/);
const wxJsapi=wechatPay.slice(wechatPay.indexOf("export async function createWechatJsapiOrder"),wechatPay.indexOf("export function buildJsapiInvokeParams"));
assert.match(wxJsapi,/if \(!wechatPayEnabled\(\)\)/);
const alipayCreator=alipay.slice(alipay.indexOf("export function createAlipayPaymentUrl"),alipay.indexOf("export function verifyAlipayNotification"));
assert.match(alipayCreator,/if \(!alipayEnabled\(\)\)/);
