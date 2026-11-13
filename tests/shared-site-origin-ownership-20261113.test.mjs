import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";

const helper=readFileSync("lib/platform/site-origin.ts","utf8");
const routes=[
 "app/api/admin/pay/readiness/route.ts",
 "app/api/pay/alipay/create/route.ts",
 "app/api/pay/alipay/return/route.ts",
 "app/api/pay/create/route.ts",
 "app/api/pay/paypal/return/route.ts",
 "app/api/pay/wechat/create/route.ts",
 "app/api/tools/pay/create/route.ts"
];
for(const path of routes){
 const source=readFileSync(path,"utf8");
 assert.match(source,/trustedSiteOrigin.*@\/lib\/platform\/site-origin/,path);
 assert.doesNotMatch(source,/@\/lib\/sasi\/site-origin/,path);
}
assert.match(helper,/const TRUSTED_HOSTS=new Set/);
for(const host of ["lingxifield.cn","www.lingxifield.cn","lingxifield.com","www.lingxifield.com"]) {
 assert.ok(helper.includes(host),`trusted host missing: ${host}`);
}
assert.match(helper,/NEXT_PUBLIC_SITE_URL/);
assert.equal(existsSync("lib/sasi/site-origin.ts"),false);
console.log("PAYMENT_SITE_ORIGIN_IMPORTS_MOVED_TO_PLATFORM=PASS");
