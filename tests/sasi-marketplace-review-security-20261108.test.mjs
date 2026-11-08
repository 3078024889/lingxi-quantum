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
test("seller submission queues optional scanning fail-closed, with eight main/detail images",()=>{
 const submit=file("app/api/sasi/marketplace/submit/route.ts");
 const dispatch=file("lib/sasi-marketplace/dispatch-scan.ts");
 const media=file("lib/sasi-marketplace/r2.ts");
 const upload=file("app/api/sasi/marketplace/upload-ticket/route.ts");
 assert.match(submit,/status:"submitted",file_size_bytes:info.size,scan_status:"unscanned"/);
 assert.match(submit,/dispatchMarketplaceScan\(saved.id\)/);
 assert.match(submit,/published:false/);
 assert.match(dispatch,/repository_dispatch/);
 assert.match(dispatch,/if\(!token/);
 assert.match(media,/MARKET_MEDIA_IMAGE_LIMIT=8/);
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
