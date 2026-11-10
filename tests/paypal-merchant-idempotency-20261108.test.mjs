import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const paypal=readFileSync("lib/paypal.ts","utf8");
const checkout=readFileSync("app/api/pay/create/route.ts","utf8");
const verify=readFileSync("app/api/pay/paypal/webhook/route.ts","utf8");
const fulfill=readFileSync("lib/fulfill-order.ts","utf8");

assert.match(paypal,/export async function createPaypalOrder[\s\S]*?"PayPal-Request-Id": params\.referenceId/);
assert.match(paypal,/export async function capturePaypalOrder[\s\S]*?"PayPal-Request-Id": `capture-\$\{orderId\}`/);
assert.match(paypal,/verifyMoney\(capture\.amount, expectedAmountUsd\)/);
assert.match(paypal,/verifyPaypalWebhook[\s\S]*?paypalCrc32\(Buffer.from\(rawBody/);
assert.match(paypal,/verifier.verify\(certificate,signature,"base64"\)/);
assert.doesNotMatch(paypal,/verify-webhook-signature/);
assert.match(checkout,/referenceId:order\.id/);
assert.match(verify,/if\(!\(await verifyPaypalWebhook\(req\.headers,raw\)\)\)/);
assert.match(verify,/await verifyPaypalCompletedOrder\(providerId,Number\(order\.amount_usd\),order\.id\)/);
assert.match(fulfill,/if\(!verifiedPayment\)return/);
console.log("PAYPAL_ORDER_CREATE_AND_CAPTURE_IDEMPOTENCY_SECURITY_CONTRACT_PASS");


const usdCheckout=readFileSync("app/checkout-usd/page.tsx","utf8");
const softwareCatalog=readFileSync("app/api/sasi/software/catalog/route.ts","utf8");
const marketProduct=readFileSync("app/api/sasi/marketplace/product/route.ts","utf8");
const softwareCard=readFileSync("components/SasiSoftwareMarket.tsx","utf8");
const marketDetail=readFileSync("components/SasiMarketplaceProductDetail.tsx","utf8");
assert.match(usdCheckout,/getProduct\(productId\)/);
assert.match(usdCheckout,/isMarketProductId\(productId\)/);
assert.match(usdCheckout,/availableUsd===true/);
assert.match(usdCheckout,/fetch\("\/api\/pay\/create"/);
assert.match(softwareCatalog,/availableUsd:Boolean\(packageReady&&paypal\)/);
assert.match(marketProduct,/availableUsd:marketplaceR2Ready\(\)&&paypalEnabled\(\)/);
assert.match(softwareCard,/checkout-usd\?productId=/);
assert.match(marketDetail,/checkout-usd\?productId=/);
assert.match(fulfill,/if\(!verifiedPayment\)return \{ok:false,error:"PROVIDER_PAYMENT_VERIFICATION_REQUIRED"\};[\s\S]*?sasi_grant_software_delivery/);
console.log("PAYPAL_SOFTWARE_AND_MARKETPLACE_USD_CHECKOUT_UI_CONTRACT_PASS");


const origin=readFileSync("lib/sasi/site-origin.ts","utf8");
assert.match(origin,/TRUSTED_HOSTS/);
assert.match(origin,/lingxifield\.cn/);
assert.match(origin,/lingxifield\.com/);
assert.match(checkout,/trustedSiteOrigin\(req\)/);
const toolPay=readFileSync("app/api/tools/pay/create/route.ts","utf8");
assert.match(toolPay,/paypalEnabled\(\)/);
assert.match(toolPay,/trustedSiteOrigin\(req\)/);
const returnRoute=readFileSync("app/api/pay/paypal/return/route.ts","utf8");
assert.match(returnRoute,/trustedSiteOrigin\(req\)/);

const wxCreate=readFileSync("app/api/pay/wechat/create/route.ts","utf8");
const aliCreate=readFileSync("app/api/pay/alipay/create/route.ts","utf8");
const aliReturn=readFileSync("app/api/pay/alipay/return/route.ts","utf8");
assert.match(wxCreate,/trustedSiteOrigin\(req\)/);
assert.match(aliCreate,/trustedSiteOrigin\(req\)/);
assert.match(aliReturn,/trustedSiteOrigin\(req\)/);
