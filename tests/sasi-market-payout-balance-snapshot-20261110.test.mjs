import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");

test("seller wallet totals come from complete database aggregates, not the bounded activity feed",()=>{
 const route=read("app/api/sasi/marketplace/payouts/route.ts");
 const sql=read("supabase/migrations/20261110121500_sasi_market_seller_balance_snapshot.sql");
 assert.match(route,/rpc\("sasi_market_seller_balance_snapshot"\)/);
 assert.match(route,/\.limit\(151\)/);
 assert.match(route,/salesRows\.slice\(0,150\)/);
 assert.match(route,/payoutRows\.slice\(0,150\)/);
 assert.match(route,/salesTruncated\|\|payoutsTruncated/);
 assert.doesNotMatch(route,/\.reduce\(/);
 assert.match(sql,/SECURITY DEFINER/);
 assert.match(sql,/SET search_path=''/);
 assert.match(sql,/v_user_id uuid := auth\.uid\(\)/);
 assert.match(sql,/s\.seller_id=v_user_id/);
 assert.match(sql,/p\.seller_id=v_user_id/);
 assert.match(sql,/sum\(s\.seller_net_minor\)/);
 assert.match(sql,/sum\(p\.amount_minor\)/);
 assert.match(sql,/status IN \('requested','processing','submitted'\)/);
 assert.match(sql,/status='paid'/);
 assert.match(sql,/availableMinor/);
 assert.match(sql,/balanceDeficitMinor/);
 assert.match(sql,/REVOKE ALL ON FUNCTION public\.sasi_market_seller_balance_snapshot\(\) FROM PUBLIC,anon/);
 assert.match(sql,/GRANT EXECUTE ON FUNCTION public\.sasi_market_seller_balance_snapshot\(\) TO authenticated,service_role/);
});

test("payout creation remains serialized, idempotent and closed while the transfer provider is unverified",()=>{
 const route=read("app/api/sasi/marketplace/payouts/route.ts");
 const schema=read("docs/operations/sasi-marketplace-15pct-private-seller-market-20261108.sql");
 assert.match(route,/SASI_MARKET_PAYOUTS_ENABLED!=="true"/);
 assert.match(route,/providerArrivalGuaranteed:false/);
 assert.match(schema,/FROM public\.sasi_market_sellers WHERE user_id=uid FOR UPDATE/);
 assert.match(schema,/UNIQUE\(seller_id,idempotency_key\)/);
 assert.match(schema,/INSUFFICIENT_SETTLED_BALANCE/);
 assert.match(schema,/status IN \('requested','processing','submitted','paid'\)/);
});

test("seller payout UI rejects over-precision and reuses one idempotency key for retries",()=>{
 const component=read("components/SasiOpenMarketplace.tsx");
 assert.match(component,/parseMarketplacePayoutMinorUnits\(requestedAmount\)/);
 assert.doesNotMatch(component,/Math\.round\(Number\(requestedAmount\)\*100\)/);
 assert.match(component,/payoutAttemptRef\.current/);
 assert.match(component,/idempotencyKey:attempt\.key/);
 assert.match(component,/attempt\.amountMinor!==amountMinor\|\|attempt\.currency!==requestCurrency/);
});
