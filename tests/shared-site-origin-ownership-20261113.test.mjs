import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";

const helper=readFileSync("lib/platform/site-origin.ts","utf8");
const paymentReadiness=readFileSync("app/api/admin/pay/readiness/route.ts","utf8");

assert.match(paymentReadiness,/trustedSiteOrigin.*@\/lib\/platform\/site-origin/);
assert.doesNotMatch(paymentReadiness,/@\/lib\/sasi\/site-origin/);
assert.match(helper,/const TRUSTED_HOSTS=new Set/);
for(const host of ["lingxifield.cn","www.lingxifield.cn","lingxifield.com","www.lingxifield.com"]) {
  assert.ok(helper.includes(host),`trusted host missing: ${host}`);
}
assert.match(helper,/NEXT_PUBLIC_SITE_URL/);
assert.equal(existsSync("lib/sasi/site-origin.ts"),false);
console.log("SHARED_PAYMENT_SITE_ORIGIN_MOVED_OUT_OF_RETIRED_SASI=PASS");
