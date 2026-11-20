import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("candidate provisioning is pinned to the isolated COM worker",()=>{
 const script=read("scripts/cloudflare/com-provision-celestial-secrets-20261109.mjs");
 assert.match(script,/scriptName="lingxifield-com-celestial-20261109"/);
 assert.doesNotMatch(script,/lingxifield-com-unified-20261108/);
 assert.match(script,/COM_CANDIDATE_LEGACY_SERVICE_BINDING_MISSING/);
 assert.match(script,/COM_CANDIDATE_PUBLIC_R2_BINDING_MISSING/);
});
test("provisioning installs encrypted values only and never enables payments or changes routes",()=>{
 const script=read("scripts/cloudflare/com-provision-celestial-secrets-20261109.mjs");
 for(const name of ["PAYPAL_CLIENT_ID","PAYPAL_CLIENT_SECRET","PAYPAL_WEBHOOK_ID","ALIPAY_APP_ID","WECHAT_MCH_ID","SUPABASE_SECRET_KEY","R2_ACCESS_KEY_ID","R2_SECRET_ACCESS_KEY"])assert.ok(script.includes(name),name);
 assert.match(script,/type:"secret_text"/);
 assert.match(script,/COM_PROVISION_STOP_NONZERO_PAYMENT_FLAGS/);
 assert.match(script,/COM_PROVISION_POSTCHECK_PAYMENT_FLAG_CHANGED/);
 assert.doesNotMatch(script,/workers\/routes|route_patterns|orders\.insert|balance\.update|PAYPAL_ENABLED.*true/);
 assert.match(script,/Never print response bodies/);
 assert.doesNotMatch(script,/console\.log\([^\n]*process\.env\[/);
});
