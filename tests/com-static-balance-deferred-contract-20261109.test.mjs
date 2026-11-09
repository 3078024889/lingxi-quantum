import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const cutover=readFileSync("scripts/cloudflare/com-celestial-apex-verified-cutover-20261109.mjs","utf8");
const canary=readFileSync(".github/workflows/com-unified-next-isolated-canary-20261108.yml","utf8");
const release=readFileSync(".github/workflows/com-unified-verified-apex-release-20261108.yml","utf8");

test("only the private balance summary may defer as 503 for static UI release",()=>{
 assert.match(cutover,/path==="\\/api\\/money\\/summary"&&code===503/);
 assert.match(cutover,/COM_BALANCE_DYNAMIC_DEFERRED_503_NO_DATA/);
 assert.match(cutover,/availableMinor\\|refundableMinor\\|refundHoldMinor\\|balances\\|withdrawals/);
 assert.match(canary,/path.*api\\/money\\/summary.*503/);
 assert.match(canary,/COM_CANARY_BALANCE_DYNAMIC_DEFERRED_503_NO_DATA/);
 assert.match(canary,/availableMinor\\|refundableMinor\\|refundHoldMinor\\|balances\\|withdrawals/);
 assert.match(release,/COM_BALANCE_DYNAMIC_DEFERRED_503_NO_DATA/);
});

test("all other private routes remain strict anonymous 401 and payments stay disabled",()=>{
 assert.match(canary,/\\[\\[ "\\$status" == "401" \\]\\]/);
 for(const flag of ["ALIPAY_ENABLED:'false'","PAYPAL_ENABLED:'false'","WECHAT_ENABLED:'false'"])
  assert.ok(canary.includes(flag),flag);
});
