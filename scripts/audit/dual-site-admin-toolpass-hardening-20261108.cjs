#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const ts=require("typescript");
const read=p=>fs.readFileSync(p,"utf8");

const src=read("lib/supabase/admin.ts");
const emitted=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function createMock(env){
  const result={last:null};
  const mockRequire=name=>{
    if(name==="server-only")return {};
    if(name==="@supabase/supabase-js")return {createClient:(url,key,options)=>{
      result.last={url,key,options};return result.last;
    }};
    throw new Error("UNEXPECTED_IMPORT:"+name);
  };
  const sandbox={exports:{},require:mockRequire,process:{env},Buffer,URL,Date,Error};
  vm.runInNewContext(emitted,sandbox,{timeout:5000});
  return {module:sandbox.exports,result};
}
const url="https://sxsgdpqojepgbbrxrzlq.supabase.co";
const secret="sb_secret_"+("a".repeat(34));
let fixture=createMock({
  SUPABASE_URL:url,
  SUPABASE_SERVICE_ROLE_KEY:"expired-legacy-placeholder",
  SUPABASE_SECRET_KEY:secret
});
assert.equal(fixture.module.isSupabaseAdminConfigured(),true);
const admin=fixture.module.createAdminClient();
assert.equal(admin.key,secret);
assert.equal(admin.url,url);
assert.equal(admin.options.auth.persistSession,false);
assert.equal(admin.options.auth.autoRefreshToken,false);
console.log("NEW_SECRET_PREFERRED_OVER_STALE_LEGACY_PASS");
fixture=createMock({SUPABASE_URL:url,SUPABASE_SERVICE_ROLE_KEY:"sb_publishable_wrong-key"});
assert.equal(fixture.module.isSupabaseAdminConfigured(),false);
assert.throws(()=>fixture.module.createAdminClient(),/SUPABASE_ADMIN_CONFIG_MISSING/);
console.log("PUBLIC_KEY_REJECTED_FOR_ADMIN_PASS");
function legacy(role){
  const b=s=>Buffer.from(JSON.stringify(s)).toString("base64url");
  return b({alg:"HS256",typ:"JWT"})+"."+b({role,exp:4102444800})+".sig";
}
fixture=createMock({SUPABASE_URL:url,SUPABASE_SERVICE_ROLE_KEY:legacy("service_role")});
assert.equal(fixture.module.isSupabaseAdminConfigured(),true);
assert.equal(fixture.module.createAdminClient().key,legacy("service_role"));
fixture=createMock({SUPABASE_URL:url,SUPABASE_SERVICE_ROLE_KEY:legacy("anon")});
assert.equal(fixture.module.isSupabaseAdminConfigured(),false);
console.log("LEGACY_SERVICE_ROLE_ACCEPTED_ANON_REJECTED_PASS");

const pass=read("lib/tools/commerce/all-tools-pass.ts");
for(const [sku,days,price] of [["tool_pass_7d",7,29],["tool_pass_30d",30,99],["tool_pass_90d",90,269],["tool_pass_365d",365,899]]){
  assert(pass.includes(`{sku:"${sku}",days:${days},price:${price}}`));
}
const access=read("app/api/tools/access/route.ts");
const ready=read("lib/tools/commerce/tool-server-receipt.ts");
const checkout=read("app/api/tools/pass/route.ts");
assert(access.includes("LINGXIFIELD_PRIVACY_HASH_SECRET"));
assert(!access.includes("LINGXIFIELD_PRIVACY_HASH_SECRET||process.env.SUPABASE_SERVICE_ROLE_KEY"));
assert(ready.includes("LINGXIFIELD_PRIVACY_HASH_SECRET"));
assert(checkout.includes("toolPassBackendReady()"));
assert(checkout.includes("process.env.TOOL_PASS_COMMERCE_READY"));
assert(!checkout.includes("TOOL_PASS_commerceReady()"));
assert(checkout.includes('admin.rpc("lingxi_purchase_tool_pass"'));
console.log("PRICE_AND_SERVER_SIDE_PURCHASE_GATE_PASS");

const drop=read("components/tools/FileDropzone.tsx");
const hub=read("components/tools/ToolsHubV11.tsx");
const nav=read("components/Nav.tsx");
const page=read("app/tools/pass/page.tsx");
assert(drop.includes("setPassRequired(e instanceof ToolAccessError"));
assert(drop.includes('href="/tools/pass"'));
assert(hub.includes('href="/tools/pass"'));
assert(nav.includes('href="/tools/pass"'));
assert(page.includes('disabled={busy||!available}'));
assert(!page.includes('<p className="mb-5 text-sm">{c.free}</p>'));
console.log("EXHAUSTED_QUOTA_PURCHASE_CTA_AND_4_TIER_UI_PASS");
console.log("DUAL_SITE_ADMIN_TOOLPASS_HARDENING_STATIC_TEST_PASS");
