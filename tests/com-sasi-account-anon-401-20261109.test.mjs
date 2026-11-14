import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const route=readFileSync("app/api/sasi/account/route.ts","utf8");
const cutover=readFileSync("scripts/cloudflare/com-celestial-apex-verified-cutover-20261109.mjs","utf8");
test("anonymous SASI account requests use guarded Supabase SSR auth and fail closed",()=>{
 assert.match(route,/getServerUser\(supabase\)/);
 assert.match(route,/AUTH_REQUIRED/);
 assert.match(route,/status: 401/);
 assert.match(route,/AUTH_UNAVAILABLE/);
 assert.match(route,/status: 503/);
 assert.doesNotMatch(route,/supabase\.auth\.getUser\(\)/);
});
test("COM apex canary and post-cutover probes protect all private account and money routes",()=>{
 for(const path of ["/api/sasi/account","/api/money/summary","/api/sasi/marketplace/seller","/api/sasi/marketplace/my-orders"]){
  assert.ok(cutover.includes(path), "missing private route probe: "+path);
 }
 assert.match(cutover,/COM_CANARY_PAYMENT_PROVIDER_MUST_REMAIN_DISABLED/);
 assert.match(cutover,/COM_POSTCUTOVER_HEALTH_FAIL_ROLLBACK_BEGIN/);
});
