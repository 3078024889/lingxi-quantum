import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const r2=read("lib/sasi-marketplace/r2.ts");
const checkout=read("lib/sasi-marketplace/checkout.ts");
const upload=read("app/api/sasi/marketplace/upload-ticket/route.ts");
const submit=read("app/api/sasi/marketplace/submit/route.ts");
const product=read("app/api/sasi/marketplace/product/route.ts");
const admin=read("app/api/admin/pay/readiness/route.ts");
const payout=read("app/api/sasi/marketplace/payouts/route.ts");
assert.match(r2,/marketplaceR2Ready/);
assert.match(r2,/marketplaceUploadReady/);
assert.match(r2,/SASI_MARKET_UPLOADS_ENABLED==="true"/);
assert.match(r2,/GITHUB_MARKET_SCAN_DISPATCH_TOKEN/);
assert.match(upload,/marketplaceUploadReady/);
assert.match(submit,/marketplaceUploadReady/);
assert.match(checkout,/SASI_MARKETPLACE_COMMERCE_READY==="true"/);
assert.match(checkout,/marketplaceR2Ready\(\)/);
assert.match(product,/marketplaceCommerceReady/);
assert.match(product,/searchParams\.get\("currency"\)==="USD"/);
assert.match(admin,/scanDispatchConfigured/);
assert.match(admin,/uploadsEnabled/);
assert.match(admin,/uploadsReady/);
assert.match(admin,/salesEnabled/);
assert.match(admin,/salesReady/);
assert.match(admin,/payoutsEnabled/);
assert.match(payout,/SASI_MARKET_PAYOUTS_ENABLED!=="true"/);
console.log("CN3194_MARKETPLACE_PRIVATE_R2_UPLOAD_SCAN_SALES_AND_PAYOUT_GATES_ENFORCED_PASS");

const firstPartyPackage=read("app/api/sasi/software/admin/package/route.ts");
const firstPartyCatalog=read("lib/sasi-software/catalog.ts");
const firstPartyAdmin=read("components/SasiSoftwarePackageAdmin.tsx");
assert.match(firstPartyPackage,/ONE_9_5_SOURCE_REQUIRED/);
assert.match(firstPartyPackage,/ONE_WHITEPAPER_PDF_REQUIRED/);
assert.match(firstPartyPackage,/INSTALL_COMPILE_F7_AND_LICENSE_GUIDE_REQUIRED/);
assert.doesNotMatch(firstPartyPackage,/\\.ex5|MATCHING_EX5_REQUIRED|EX5_SOURCE_BASENAME_MISMATCH|demoAccessFiles|DEMO_ACCESS/);
assert.match(firstPartyCatalog,/MQ5 源码包/);
assert.doesNotMatch(firstPartyCatalog,/demo access|模拟账户/);
assert.match(firstPartyAdmin,/禁止 EX5 编译文件/);
console.log("CN3194_FIRST_PARTY_SOFTWARE_SOURCE_ONLY_PACKAGE_PASS");


const releaseTemplate=read("scripts/ops/ecs-cn3194-unified-standalone-upgrade-20261110.template.sh");
const productionStart=releaseTemplate.indexOf("# Preserve merchant and wallet flags from the existing live EnvironmentFiles.");
const productionEnd=releaseTemplate.indexOf('> "$PROD_FLAGS"',productionStart);
assert(productionStart>=0&&productionEnd>productionStart,"production flag block must be present");
const productionFlags=releaseTemplate.slice(productionStart,productionEnd);
for(const key of ["ALIPAY_ENABLED","PAYPAL_ENABLED","WECHAT_ENABLED","SASI_RMB_BALANCE_V1_ENABLED","USD_BALANCE_TOPUP_ENABLED","SASI_MARKET_SALES_ENABLED","SASI_MARKET_UPLOADS_ENABLED","SASI_MARKET_DELIVERY_ENABLED","SASI_MARKETPLACE_COMMERCE_READY"]){
 assert(!productionFlags.includes(key+"="),key+" must inherit the existing production EnvironmentFiles");
}
assert.match(productionFlags,/'SASI_MARKET_PAYOUTS_ENABLED=false'/,"seller payouts remain fail-closed until the transfer worker is verified");
assert.match(productionFlags,/'SOFTWARE_COMMERCE_READY=false'/,"first-party software remains unavailable until its package passes verification");
console.log("CN3194_PRODUCTION_PAYMENT_WALLET_MARKETPLACE_FLAGS_PRESERVED_PAYOUTS_FAIL_CLOSED_PASS");
