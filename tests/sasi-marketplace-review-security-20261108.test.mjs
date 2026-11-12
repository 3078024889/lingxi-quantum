import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const file=(p)=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("market review page and API strictly require verified administrative session",()=>{
 const page=file("app/sasi/marketplace/admin/page.tsx");
 const api=file("app/api/sasi/marketplace/admin/review/route.ts");
 assert.match(page,/moneyAdministrator\(\)/);
 assert.match(page,/notFound\(\)/);
 assert.match(api,/async function reviewer\(\)/);
 assert.match(api,/await moneyAdministrator\(\)/);
 assert.match(api,/if\(!user\)return respond\(\{error:"NOT_FOUND"\},404\)/);
 assert.match(api,/isSameOriginMutation/);
 assert.match(api,/enforceAbuseGuard/);
 assert.match(api,/Cache-Control":"private, no-store/);
 assert.match(api,/sharp\(blob/);
 assert.match(api,/marketplaceObjectHead\(owned\)/);
 assert.match(api,/sasi_market_review_listing/);
 assert.match(api,/sasi_market_review_seller/);
 assert.match(api,/sasi_market_review_media/);
});
test("review is atomic, private and only permits published listing with verified scanner evidence",()=>{
 const migration=file("supabase/migrations/20261108193000_sasi_market_scanner_and_admin_review.sql");
 for (const token of [
 "sasi_market_scan_reports","sasi_market_review_events",
 "sasi_market_record_scan","sasi_market_review_seller","sasi_market_review_media","sasi_market_review_listing",
 "SECURITY DEFINER SET search_path=''","scan_status='clean'","status='approved'",
 "p_actor_id","FOR UPDATE","sha256=l.sha256",
 "status IN ('pending','awaiting_review')"
 ])assert.ok(migration.includes(token),"Missing security gate: "+token);
 assert.match(migration,/GRANT EXECUTE ON FUNCTION public\.sasi_market_review_listing\(uuid,uuid,text,text\) TO service_role/);
 assert.match(migration,/REVOKE ALL ON FUNCTION public\.sasi_market_review_listing\(uuid,uuid,text,text\) FROM PUBLIC,anon,authenticated/);
 assert.doesNotMatch(migration,/GRANT EXECUTE ON FUNCTION public\.sasi_market_review_listing[^;]* TO authenticated/);
});
test("private software scanner uses ClamAV, controlled unpacking and SHA256 attestation, not execution",()=>{
 const scan=file("scripts/marketplace/scan-private-zip.py");
 assert.match(scan,/MAX_ZIP = 30 \* 1024 \* 1024/);
 assert.match(scan,/ZIP_EXPANSION_LIMIT/);
 assert.match(scan,/ZIP_COMPRESSION_RATIO_EXCEEDED/);
 assert.match(scan,/ZIP_LINK_OR_SPECIAL_FILE/);
 assert.match(scan,/clamscan/);
 assert.match(scan,/hashlib\.sha256\(payload\)/);
 assert.match(scan,/sasi_market_record_scan/);
 assert.match(scan,/ContentDisposition='attachment/);
 assert.match(scan,/SASI_PRIVATE_APPROVED_OBJECT_READY_FOR_HUMAN_REVIEW/);
 const workflow=file(".github/workflows/sasi-marketplace-private-scan-20261108.yml");
 assert.match(workflow,/environment: sasi-market-scanner/);
 assert.match(workflow,/sudo freshclam/);
 assert.match(workflow,/python3 scripts\/marketplace\/scan-private-zip\.py/);
 assert.doesNotMatch(workflow,/cloudflare\/.*deploy|wrangler deploy/);
});
test("seller submission queues scanning fail-closed, with one main and four optional detail images",()=>{
 const submit=file("app/api/sasi/marketplace/submit/route.ts");
 const dispatch=file("lib/sasi-marketplace/dispatch-scan.ts");
 const media=file("lib/sasi-marketplace/r2.ts");
 const upload=file("app/api/sasi/marketplace/upload-ticket/route.ts");
 assert.match(submit,/status:"submitted",file_size_bytes:info.size,scan_status:"unscanned"/);
 assert.match(submit,/dispatchMarketplaceScan\(saved.id\)/);
 assert.match(submit,/published:false/);
 assert.match(dispatch,/repository_dispatch/);
 assert.match(dispatch,/if\(!token/);
 assert.match(media,/MARKET_MEDIA_COVER_LIMIT=1/);
 assert.match(media,/MARKET_MEDIA_DETAIL_LIMIT=4/);
 assert.match(media,/MARKET_MEDIA_IMAGE_LIMIT=MARKET_MEDIA_COVER_LIMIT\+MARKET_MEDIA_DETAIL_LIMIT/);
 assert.match(upload,/private|quarantine|signedMarketplaceUpload/);
});
test("digital delivery stays verified-payment buyer-only and time-limited",()=>{
 const delivery=file("app/api/sasi/marketplace/download/route.ts");
 const purchase=file("lib/fulfill-order.ts");
 assert.match(delivery,/\.eq\("buyer_id",user.id\)/);
 assert.match(delivery,/order\?\.status!=="paid"/);
 assert.match(delivery,/signedMarketplaceDownload\(listing.delivery_path,60\)/);
 assert.match(delivery,/sasi_market_claim_download/);
 assert.match(purchase,/if\(!verifiedPayment\)return \{ok:false,error:"PROVIDER_PAYMENT_VERIFICATION_REQUIRED"\}/);
 assert.match(purchase,/sasi_market_record_verified_sale/);
});

test("SASI storefront has one real featured source-license product and seller upload workbench",()=>{
 const page=file("app/sasi/page.tsx");
 const market=file("components/SasiOpenMarketplace.tsx");
 const catalog=file("lib/sasi-software/catalog.ts");
 const css=file("components/SasiOpenMarketplace.module.css");
 assert.match(page,/SasiOpenMarketplace/);
 assert.doesNotMatch(page,/SasiSoftwareMarket/);
 assert.match(market,/SASI_SOFTWARE_CATALOG\[0\]/);
 assert.match(market,/featured\.priceCny/);
 assert.match(market,/featuredReady/);
 assert.match(market,/source.*|sasi-seller-studio/);
 assert.match(catalog,/sasi-copernicus-si95-source/);
 assert.doesNotMatch(catalog,/sasi-copernicus-si95-mt5/);
 assert.match(css,/\.featuredCard/);
 assert.match(css,/\.main \.heroArtwork/);
 assert.match(css,/\.main \.browseHotspot/);
 assert.match(css,/\.main \.publishHotspot/);
 assert.doesNotMatch(css,/\.laptopScene/);
});

test("submitted listings cannot be modified during moderation and review rejects live upload signatures",()=>{
 const sql=file("supabase/migrations/20261108193000_sasi_market_scanner_and_admin_review.sql");
 assert.match(sql,/CREATE POLICY sasi_market_listings_draft_update/);
 assert.match(sql,/FOR UPDATE TO authenticated/);
 assert.match(sql,/USING\(seller_id=\(SELECT auth\.uid\(\)\) AND status='draft'\)/);
 assert.match(sql,/WITH CHECK\(seller_id=\(SELECT auth\.uid\(\)\) AND status='draft'/);
 const review=file("app/api/sasi/marketplace/admin/review/route.ts");
 assert.match(review,/IMAGE_UPLOAD_LINK_STILL_VALID/);
 assert.match(review,/uploadAge<330_000/);
 assert.match(review,/verified_size,declared_mime,status,created_at/);
});

test("seller uploads ZIP and photos before submitting, and delivery checks scanned artifact SHA",()=>{
 const market=file("components/SasiOpenMarketplace.tsx");
 assert.match(market,/const submitReview=async\(item:Listing\)/);
 assert.match(market,/onClick=\{\(\)=>void submitReview\(item\)\}/);
 assert.match(market,/提交商品审核/);
 const ticket=file("app/api/sasi/marketplace/upload-ticket/route.ts");
 assert.match(ticket,/marketplaceOwnedKey/);
 assert.match(ticket,/if\(!listing.quarantine_path\)/);
 const store=file("lib/sasi-marketplace/r2.ts");
 assert.match(store,/x-amz-meta-sha256/);
 const delivery=file("app/api/sasi/marketplace/download/route.ts");
 assert.match(delivery,/head.sha256!==listing.sha256/);
 const review=file("app/api/sasi/marketplace/admin/review/route.ts");
 assert.match(review,/head.sha256!==listing.sha256/);
});

test("marketplace gateway requires a dedicated merchant approval and supports CNY / PayPal USD",()=>{
 const resolver=file("lib/sasi-marketplace/checkout.ts");
 assert.match(resolver,/SASI_MARKETPLACE_COMMERCE_READY/);
 assert.match(resolver,/marketplaceCommerceReady\(\)/);
 const paypal=file("app/api/pay/create/route.ts");
 assert.match(paypal,/getUsdBalanceProduct\(requestedId\)/);
  assert.match(resolver,/marketProductUuid\(productId\)/);
  assert.match(resolver,/seller\?\.status!=="approved"/);
 assert.match(paypal,/resolveMarketplaceProduct/);
 assert.match(paypal,/SELF_PURCHASE_NOT_ALLOWED/);
 const endpoint=file("app/api/sasi/marketplace/product/route.ts");
 assert.match(endpoint,/marketplaceCommerceReady\(\)/);
 assert.match(endpoint,/req.nextUrl.searchParams.get\("currency"\)===\"USD\"/);
 const detail=file("components/SasiMarketplaceProductDetail.tsx");
 assert.match(detail,/usePreferredCurrency/);
 assert.match(detail,/const payPaypal=async/);
 assert.match(detail,/PayPal 安全支付/);
 const migration=file("supabase/migrations/20261108194500_sasi_market_paypal_usd_verified_sale.sql");
 assert.match(migration,/o.currency='USD' AND o.provider='paypal'/);
 assert.match(migration,/o.currency='CNY' AND o.provider IN \('wechat','alipay'\)/);
 assert.match(migration,/gross=round\(o.amount_usd\*100\)::bigint; expected=l.price_usd_minor/);
 assert.match(migration,/fee=\(gross\*1500\+5000\)\/10000/);
 assert.match(migration,/SALE_IDEMPOTENCY_CONFLICT/);
 assert.match(migration,/GRANT EXECUTE ON FUNCTION public.sasi_market_record_verified_sale\(uuid\) TO service_role/);
});
