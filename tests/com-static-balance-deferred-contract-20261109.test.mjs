import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const cutover=readFileSync("scripts/cloudflare/com-celestial-apex-verified-cutover-20261109.mjs","utf8");
const canary=readFileSync(".github/workflows/com-unified-next-isolated-canary-20261108.yml","utf8");
const release=readFileSync(".github/workflows/com-unified-verified-apex-release-20261108.yml","utf8");

test("only the private balance summary may defer as 503 for static UI release",()=>{
 assert.match(cutover,/if\s*\(\s*path\s*===\s*"\/api\/money\/summary"\s*&&\s*code\s*===\s*503\s*\)\s*\{/);
 assert.ok(cutover.includes("COM_BALANCE_DYNAMIC_DEFERRED_503_NO_DATA"));
 assert.ok(cutover.includes("availableMinor|refundableMinor|refundHoldMinor|balances|withdrawals"));
 assert.ok(canary.includes('if [[ "$path" == "/api/money/summary" && "$status" == "503" ]];then'));
 assert.ok(canary.includes("COM_CANARY_BALANCE_DYNAMIC_DEFERRED_503_NO_DATA"));
 assert.ok(canary.includes("availableMinor|refundableMinor|refundHoldMinor|balances|withdrawals"));
 assert.ok(release.includes("COM_BALANCE_DYNAMIC_DEFERRED_503_NO_DATA"));
});

test("all other private routes remain strict anonymous 401 and payments stay disabled",()=>{
 assert.ok(canary.includes('[[ "$status" == "401" ]]'));
 for(const flag of ["ALIPAY_ENABLED:'false'","PAYPAL_ENABLED:'false'","WECHAT_ENABLED:'false'"])
  assert.ok(canary.includes(flag),flag);
});
