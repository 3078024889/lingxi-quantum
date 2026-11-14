import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");
const sql=read("docs/operations/sasi-marketplace-15pct-private-seller-market-20261108.sql");
assert.match(sql,/sasi_market_sellers/);assert.match(sql,/sasi_market_sales/);
assert.match(sql,/sasi_market_payouts/);
assert.match(sql,/ENABLE ROW LEVEL SECURITY/g);
assert.match(sql,/REVOKE ALL ON public\.sasi_market_sellers/);
assert.match(sql,/REVOKE ALL ON FUNCTION public\.sasi_market_record_verified_sale\(uuid\) FROM PUBLIC,anon,authenticated/);
assert.match(sql,/sasi_market_request_payout/);
assert.match(sql,/GRANT EXECUTE ON FUNCTION public\.sasi_market_request_payout\(bigint,text,uuid\) TO authenticated,service_role/);
assert.match(sql,/now\(\)\+interval '7 days'/);
assert.match(sql,/submission_target_at.*15 minutes/);
assert.match(sql,/CREATE POLICY sasi_market_listings_public/);
assert.match(sql,/status='published' AND scan_status='clean'/);
assert.match(sql,/sasi_market_claim_download/);
assert.match(sql,/buyer_id=uid/);
assert.match(sql,/seller_id=uid/);
assert.match(sql,/FOR UPDATE/);
assert.match(sql,/browser-to-R2 presigned PUT/);
assert.match(sql,/CREATE TABLE IF NOT EXISTS public\.sasi_market_media/);
assert.doesNotMatch(sql,/GRANT (?:INSERT|UPDATE|DELETE) ON public\.sasi_market_sales TO authenticated/);
const listings=read("app/api/sasi/marketplace/listings/route.ts");
assert.match(listings,/isSameOriginMutation/);
assert.match(listings,/enforceAbuseGuard/);
assert.match(listings,/\.eq\("seller_id",user\.id\)/);
const uploader=read("app/api/sasi/marketplace/upload-ticket/route.ts");
assert.match(uploader,/!marketplaceUploadReady\(\)/);
assert.match(uploader,/profile\?\.status!=="approved"/);
assert.match(uploader,/signedMarketplaceUpload/);
assert.match(uploader,/newMarketplaceObjectKey/);
assert.match(uploader,/upload.*RESERVATION|UPLOAD_RESERVATION_FAILED/);
const submit=read("app/api/sasi/marketplace/submit/route.ts");
assert.match(submit,/marketplaceObjectHead\(path\)/);
assert.match(submit,/status:"submitted"/);
assert.match(submit,/scan_status:"unscanned"/);
assert.doesNotMatch(submit,/status:"published"/);
const delivery=read("app/api/sasi/marketplace/download/route.ts");
assert.match(delivery,/isSameOriginMutation/);
assert.match(delivery,/\.eq\("buyer_id",user\.id\)/);
assert.match(delivery,/signedMarketplaceDownload|createSignedUrl/);
assert.match(delivery,/sasi_market_claim_download/);
assert.doesNotMatch(delivery,/getPublicUrl/);
const payout=read("app/api/sasi/marketplace/payouts/route.ts");
assert.match(payout,/SASI_MARKET_PAYOUTS_ENABLED!=="true"/);
assert.match(payout,/providerArrivalGuaranteed:false/);
assert.match(payout,/sasi_market_request_payout/);
assert.doesNotMatch(payout,/\.from\("balance_withdrawals"\)/);
const wx=read("app/api/pay/wechat/create/route.ts");
const ali=read("app/api/pay/alipay/create/route.ts");
for(const content of [wx,ali]){
 assert.match(content,/resolveMarketplaceProduct/);
 assert.match(content,/SELF_PURCHASE_NOT_ALLOWED/);
}
const fulfill=read("lib/fulfill-order.ts");
assert.match(fulfill,/isMarketProductId/);
assert.match(fulfill,/sasi_market_record_verified_sale/);
assert.match(fulfill,/PROVIDER_PAYMENT_VERIFICATION_REQUIRED/);
const marketplaceGate=read("lib/sasi-marketplace/checkout.ts");
assert.match(marketplaceGate,/process\.env\.SASI_MARKETPLACE_COMMERCE_READY==="true"/);
assert.match(marketplaceGate,/marketplaceR2Ready\(\)/);
assert.match(marketplaceGate,/\.eq\("status","published"\)\.eq\("scan_status","clean"\)/);
assert.match(wx,/if \(!wechatPayEnabled\(\)\)/);
assert.match(ali,/if \(!alipayEnabled\(\)\)/);
assert.match(read("app/api/pay/create/route.ts"),/if\(!paypal(?:Pay)?Enabled\(\)\)/);
assert.match(read("app/api/sasi/marketplace/payouts/route.ts"),/SASI_MARKET_PAYOUTS_ENABLED!=="true"/);
const checkout=read("app/checkout/page.tsx");
assert.match(checkout,/marketProductCanBuy/);
assert.match(checkout,/isMarketProductId/);
assert.match(read("app/sasi/page.tsx"),/SasiOpenMarketplace/);
assert.ok(read("app/sasi/page.tsx").includes('canonical:"/sasi"'));
assert.ok(read("app/sasi/marketplace/page.tsx").includes('permanentRedirect("/sasi")'));
assert.ok(read("app/sasi/seller/page.tsx").includes('SasiOpenMarketplace view="seller"'));
assert.ok(read("app/sasi/seller/page.tsx").includes('robots:{index:false,follow:true}'));
assert.ok(read("app/sasi/marketplace/[id]/page.tsx").includes("SasiMarketplaceProductDetail"));
assert.match(read("components/SasiOpenMarketplace.tsx"),/fetch\(ticket\.uploadUrl/);
assert.match(read("components/SasiOpenMarketplace.tsx"),/image-confirm/);
assert.match(read("app/api/sasi/marketplace/images/route.ts"),/signedMarketplaceDownload/);
assert.match(read("components/SasiOpenMarketplace.tsx"),/navigator\.share/);
console.log("SASI_MARKET_SELLER_RLS_PRIVATE_UPLOAD_VERIFIED_PAYMENT_AND_PAYOUT_CONTRACT_PASS");

const perf=read("supabase/migrations/20261111110000_sasi_market_rls_query_performance.sql");
for(const policy of [
 "sasi_v5_route_owner_read","sasi_v5_signal_owner_read","sasi_v5_dna_owner_read",
 "sasi_v5_assets_owner_read","sasi_v5_validation_owner_read","sasi_v5_assignment_owner_read",
 "sasi_intelligence_runs_select_own","nutrition_history_own_select","nutrition_history_own_insert",
 '"own sasi tasks read"','"own sasi task nodes read"','"own sasi task events read"',
 '"own sasi artifacts read"','"own sasi capability runs read"',"sasi_native_runs_owner_read"
])assert.ok(perf.includes("ALTER POLICY "+policy),"RLS initplan optimization missing: "+policy);
for(const index of [
 "sasi_market_sales_buyer_created_idx","sasi_market_sales_listing_created_idx",
 "sasi_market_sales_seller_created_idx","sasi_market_media_seller_created_idx",
 "sasi_market_review_events_actor_created_idx","sasi_market_payouts_seller_requested_idx"
])assert.ok(perf.includes("CREATE INDEX IF NOT EXISTS "+index),"query index missing: "+index);
assert.ok(perf.includes("CREATE POLICY sasi_market_listings_visible_read"));
assert.ok(perf.includes("CREATE POLICY sasi_market_media_visible_read"));
assert.doesNotMatch(perf,/DROP TABLE|TRUNCATE|DELETE FROM|UPDATE public\.(?:orders|sasi_market_sales|sasi_market_payouts)/i);
// Public listing reads must never request private moderation columns omitted from anon/authenticated grants.
assert.match(listings,/const PUBLIC_LISTING_COLUMNS="id,seller_id,title,description,category,price_cny_minor,price_usd_minor,status,scan_status,published_at,created_at"/);
assert.match(listings,/\.select\(PUBLIC_LISTING_COLUMNS\)/);
assert.doesNotMatch(listings,/const PUBLIC_LISTING_COLUMNS=[^;]*rejection_reason/);
// Seller-only rejection details are returned through a server-side owner-scoped read after auth.getUser().
assert.match(listings,/const SELLER_LISTING_COLUMNS=PUBLIC_LISTING_COLUMNS\+",rejection_reason"/);
assert.match(listings,/\.select\(SELLER_LISTING_COLUMNS\)/);
assert.match(listings,/\.eq\("seller_id",user\.id\)/);
assert.match(listings,/const sessionDb=createClient\(\)/);
const sellerAuthIndex=listings.indexOf('if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"}');
const sellerAdminIndex=listings.indexOf('const admin=createAdminClient();');
const sellerReadIndex=listings.indexOf('admin.from("sasi_market_listings")');
assert.ok(sellerAuthIndex>=0&&sellerAdminIndex>sellerAuthIndex&&sellerReadIndex>sellerAdminIndex);
const sellerReadBlock=listings.slice(sellerAdminIndex,listings.indexOf('}else{',sellerAdminIndex));
assert.equal((sellerReadBlock.match(/admin\.from\("sasi_market_listings"\)/g)||[]).length,3);
assert.equal((sellerReadBlock.match(/\.eq\("seller_id",user\.id\)/g)||[]).length,3);
assert.match(listings,/mode==="public"\?data\.map/);
