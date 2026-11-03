import test from "node:test";import assert from "node:assert/strict";
import{readFileSync}from"node:fs";
const market=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const root=p=>readFileSync(new URL("../../"+p,import.meta.url),"utf8");
test("reviewer rights come only from server-fetched immutable app metadata, not public claims",()=>{
 const src=root("lib/ai-market-vendor-review.ts");
 assert.match(src,/app_metadata\?\.ai_market_vendor_reviewer===true/);
 assert.doesNotMatch(src,/user_metadata|role:\s*["']admin/);
 assert.match(root("app/api/ai-market/vendor-review/route.ts"),/getServerUser\(db\)/);
 assert.match(root("app/account/ai-market/review/page.tsx"),/isMarketReviewer\(user\)/);
});
test("reviewer route is origin protected and service-role data access never exposed to the browser",()=>{
 const api=root("app/api/ai-market/vendor-review/route.ts");
 assert.match(api,/isSameOriginMutation\(req\)/);
 assert.match(api,/parseReviewDecision\(raw\)/);
 assert.match(api,/createAdminClient\(\)/);
 assert.match(api,/\.eq\("id",decision.id\)\.eq\("status",decision.expectedStatus\)/);
 assert.match(api,/rankingGrant:false,paymentTaken:false/);
 assert.match(api,/PRODUCT_ALREADY_VERIFIED_BY_ANOTHER_VENDOR/);
 assert.doesNotMatch(root("app/account/ai-market/review/ReviewQueue.tsx"),/SUPABASE_SERVICE_ROLE|createAdminClient|Bearer /);
});
test("approval is one owner per product, with a single-transaction review audit",()=>{
 const sql=root("supabase/migrations/20261102120000_ai_market_vendor_account_claims.sql");
 assert.match(sql,/CREATE UNIQUE INDEX IF NOT EXISTS ai_market_only_one_verified_owner/);
 assert.match(sql,/WHERE status IN \('identity_verified','approved'\)/);
 assert.match(sql,/ai_market_vendor_review_events/);
 assert.match(sql,/AFTER UPDATE OF status/);
 assert.match(sql,/SECURITY INVOKER/);
 assert.match(sql,/REVOKE ALL ON public.ai_market_vendor_review_events FROM PUBLIC,anon,authenticated/);
 assert.match(sql,/REVIEW_PROOF_REQUIRED/);
 const ci=root(".github/workflows/ai-market-postgres-isolated.yml");
 assert.match(ci,/TWO_APPROVED_OWNERS/);
 assert.match(ci,/ATOMIC_REVIEW_AUDIT_MISSING/);
 assert.match(ci,/REVOCATION_WITHOUT_REASON_ALLOWED/);
});
test("review decisions require evidence confirmation and valid transition",()=>{
 const s=root("lib/ai-market-vendor-review.ts");
 assert.match(s,/proofConfirmed===true/);
 assert.match(s,/reason.length<12/);
 assert.match(s,/transitions\[previous\]\.includes\(target\)/);
 assert.match(s,/!proofConfirmed\)return null/);
 assert.match(market("app/api/v1/billing/checkout/route.ts"),/MARKET_CHECKOUT_NOT_LIVE/);
});
