import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
const script=readFileSync("scripts/cloudflare/com-active-worker-audit-20261116.mjs","utf8");

test("COM Cloudflare audit identifies the exact zone route and active Worker script",()=>{
 execFileSync(process.execPath,["--check","scripts/cloudflare/com-active-worker-audit-20261116.mjs"]);
 assert.match(script,/\/zones\?name=lingxifield\.com/);
 assert.match(script,/\/workers\/routes/);
 assert.match(script,/\/workers\/scripts/);
 assert.match(script,/COM_PUBLIC_WORKER_ROUTE/);
 assert.match(script,/COM_WORKER name=/);
});

test("COM Worker inventory reveals only binding presence and boolean flag states",()=>{
 for(const name of ["ALIPAY_SELLER_ID","WECHAT_PLATFORM_PUBLIC_KEY_ID","PAYPAL_WEBHOOK_ID","USD_BALANCE_TOPUP_ENABLED","SASI_REFUND_FLOW_TESTED","TOOL_PASS_BACKEND_READY"])
  assert.ok(script.includes(name));
 assert.match(script,/COM_WORKER_FLAG/);
 assert.match(script,/SECRET_BOUND/);
 assert.doesNotMatch(script,/method:\s*["'](?:POST|PUT|PATCH|DELETE)["']/i);
 assert.match(script,/COM_CLOUDFLARE_ROUTING_AUDIT_COMPLETE_READ_ONLY/);
});
