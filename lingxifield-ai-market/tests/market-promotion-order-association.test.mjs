import test from "node:test";import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PAID_PLANS} from "../lib/market-order-policy.mjs";
const root=p=>readFileSync(new URL("../../"+p,import.meta.url),"utf8");
test("seller placement prices match marketplace quote and immutable PostgreSQL generation",()=>{
 const pricing=root("lib/ai-market-promotion-request.ts");
 const sql=root("supabase/migrations/20261102123000_ai_market_vendor_promotion_requests.sql");
 for(const [key,value] of Object.entries(PAID_PLANS)){
  assert.match(pricing,new RegExp(key+":"+value));
  assert.ok(sql.includes("WHEN '"+key+"' THEN "+value));
 }
 assert.match(sql,/GENERATED ALWAYS AS/);
 assert.match(sql,/CHECK\(plan_id IN \('sponsored','category','brand'\)\)/);
 assert.match(sql,/UNIQUE\(user_id,idempotency_key\)/);
 assert.match(sql,/ON public\.ai_market_vendor_promotion_requests\(claim_id,plan_id\) WHERE status='requested'/);
});
test("approved claim and RLS owner scope cannot be bypassed with foreign product or client amount",()=>{
 const sql=root("supabase/migrations/20261102123000_ai_market_vendor_promotion_requests.sql");
 assert.match(sql,/ENABLE ROW LEVEL SECURITY/);
 assert.match(sql,/REVOKE ALL ON public\.ai_market_vendor_promotion_requests FROM PUBLIC,anon,authenticated/);
 assert.match(sql,/GRANT INSERT\(user_id,claim_id,product_id,plan_id,currency,provider,idempotency_key\)/);
 assert.match(sql,/user_id=\(SELECT auth\.uid\(\)\)/);
 assert.match(sql,/c\.user_id=\(SELECT auth\.uid\(\)\)/);
 assert.match(sql,/c\.product_id=public\.ai_market_vendor_promotion_requests\.product_id AND c\.status='approved'/);
 assert.match(sql,/APPROVED_VENDOR_REQUIRED/);
 assert.doesNotMatch(sql,/GRANT (?:UPDATE|DELETE).*authenticated/);
});
test("bound main-site order must be non-SASI SKU, same owner, plan, amount, provider and currency",()=>{
 const sql=root("supabase/migrations/20261102123000_ai_market_vendor_promotion_requests.sql");
 const api=root("app/api/ai-market/vendor-promotions/route.ts");
 for(const token of ["o.user_id IS DISTINCT FROM NEW.user_id","'ai-market:'||NEW.plan_id",
  "o.provider IS DISTINCT FROM NEW.provider","o.currency IS DISTINCT FROM NEW.currency",
  "o.status IS DISTINCT FROM 'pending'","WHEN 'sponsored' THEN 4900","MAIN_SITE_ORDER_NOT_VERIFIED"])
  assert.ok(sql.includes(token),token);
 assert.match(api,/isSameOriginMutation\(req\)/);
 assert.match(api,/parseMarketPromotionRequest\(raw\)/);
 assert.match(api,/\.eq\("user_id",user.id\)\.eq\("idempotency_key",request.idempotency_key\)/);
 assert.match(api,/checkoutEnabled:false,paymentUrl:null/);
 assert.doesNotMatch(api,/createAdminClient|createPaypalOrder|alipayEnabled|SUPABASE_SERVICE_ROLE_KEY/);
});
test("approved only placement UI, multilingual display and explicit no-charge are enforced",()=>{
 const portal=root("app/account/ai-market/PromotionRequestsPanel.tsx");
 const copy=root("lib/ai-market-promotion-locale.ts");
 assert.match(portal,/x\.status==="approved"/);
 assert.match(portal,/crypto\.randomUUID\(\)/);
 assert.match(portal,/AI_MARKET_PROMOTION_COPY\[lang\]/);
 assert.match(portal,/dir=\{lang==="ar"\?"rtl":"ltr"\}/);
 assert.match(portal,/PromotionRequestsPanel/);
 assert.match(copy,/付款尚未|尚未启用|不会扣款/);
 for(const lang of ["zh","en","ja","ko","fr","de","es","pt","ar"])
  assert.match(copy,new RegExp("\\b"+lang+":\\{"),lang);
});
