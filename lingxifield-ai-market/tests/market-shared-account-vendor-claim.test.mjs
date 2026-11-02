import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const root=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');
test('main and global SIAI catalogs contain the exact same 32 vendor IDs',()=>{
 const market=src('lib/market-api-service-catalog.ts');
 const match=market.match(/const ALL=\[([^\]]+)\] as const;/);
 assert.ok(match);
 const marketIds=[...match[1].matchAll(/'([^']+)'/g)].map(x=>x[1]);
 const main=root('lib/ai-market-vendor-claims.ts');
 const primary=main.split('export const AI_MARKET_CLAIMABLE_IDS = [')[1].split('] as const;')[0];
 const mainIds=[...primary.matchAll(/'([^']+)'/g)].map(x=>x[1]);
 assert.equal(marketIds.length,32);
 assert.deepEqual([...mainIds].sort(),[...marketIds].sort());
});
test('existing LINGXIFIELD Supabase identity authenticates owner and prevents anonymous or unverified claim',()=>{
 const mainPage=root('app/account/ai-market/page.tsx'),api=root('app/api/ai-market/vendor-claims/route.ts');
 const auth=root('lib/supabase/server.ts'),marketRoute=src('app/api/vendor/submit/route.ts');
 assert.ok(auth.includes('client.auth.getUser()'));
 assert.ok(mainPage.includes('getServerUser(createClient())'));
 assert.ok(mainPage.includes('redirect("/account?next="'));
 assert.ok(api.includes('getServerUser(db)'));
 assert.ok(api.includes('!user.email_confirmed_at'));
 assert.ok(api.includes('isSameOriginMutation(req)'));
 assert.ok(api.includes('user_id:user.id'));
 assert.ok(api.includes('parseMarketVendorClaim(input)'));
 assert.ok(marketRoute.includes("parsed.request_type==='claim'"));
 assert.ok(marketRoute.includes("LOGIN_REQUIRED_MAIN_ACCOUNT"));
 assert.doesNotMatch(api,/createAdminClient|SUPABASE_SERVICE_ROLE|PAYPAL_CLIENT_SECRET|status:\s*['"]approved/);
});
test('database RLS isolates the claiming user, limits 3 products under lock, and denies user ranking approval',()=>{
 const sql=root('supabase/migrations/20261102120000_ai_market_vendor_account_claims.sql');
 assert.match(sql,/REFERENCES auth\.users\(id\)/);
 assert.match(sql,/ENABLE ROW LEVEL SECURITY/);
 assert.match(sql,/REVOKE ALL ON public\.ai_market_vendor_claims FROM PUBLIC,anon,authenticated/);
 assert.match(sql,/FOR SELECT TO authenticated USING\(user_id=\(SELECT auth\.uid\(\)\)\)/);
 assert.match(sql,/FOR INSERT TO authenticated WITH CHECK\(user_id=\(SELECT auth\.uid\(\)\) AND status='pending_review'\)/);
 assert.match(sql,/SECURITY INVOKER/);
 assert.match(sql,/pg_advisory_xact_lock/);
 assert.match(sql,/>=3/);
 assert.match(sql,/UNIQUE\(user_id,product_id\)/);
 assert.doesNotMatch(sql,/GRANT (?:UPDATE|DELETE)\b/);
 assert.doesNotMatch(sql,/SECURITY DEFINER/);
});
test('same account is used for claims but no cross-domain token leak, account duplication or premature checkout',()=>{
 const portal=src('app/(default)/vendor/claim/page.tsx');
 const account=root('app/account/page.tsx'),claim=root('app/account/ai-market/VendorClaimsPanel.tsx');
 assert.match(portal,/https:\/\/lingxifield\.com\/account\/ai-market/);
 assert.doesNotMatch(portal,/access_token|refresh_token|auth\.token|PAYPAL_CLIENT_SECRET/);
 assert.match(account,/href="\/account\/ai-market"/);
 assert.match(claim,/claims\.length>=3/);
 assert.match(claim,/AI_MARKET_VENDOR_COPY\[lang\]/);
 assert.match(root('lib/ai-market-vendor-locale.ts'),/付费推广/);
 assert.doesNotMatch(claim,/signInWithPassword|createUser|signup|createAdminClient/);
 const checkout=src('app/api/v1/billing/checkout/route.ts');
 assert.match(checkout,/MARKET_CHECKOUT_NOT_LIVE/);
});

test('central vendor claim account is translated in all nine languages and Arabic has RTL direction',()=>{
 const s=root('lib/ai-market-vendor-locale.ts');
 const portal=root('app/account/ai-market/VendorClaimsPanel.tsx');
 const page=root('app/account/ai-market/page.tsx');
 for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar'])assert.match(s,new RegExp('\\b'+lang+':\\{'),lang);
 for(const key of ['claims','empty','form','product','company','site','email','evidence','submit','limit','paidTitle','paid','pending','approved'])assert.match(s,new RegExp(key+':'));
 assert.match(portal,/dir=\\{lang==="ar"\\?"rtl":"ltr"\\}/);
 assert.match(portal,/disabled=\\{busy\\|\\|claims.length>=3\\|\\|!ready\\|\\|!available\\}/);
 assert.match(page,/LxText/);
});
