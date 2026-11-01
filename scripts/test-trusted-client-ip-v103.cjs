#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict"),ts=require("typescript"),vm=require("node:vm");
const source=fs.readFileSync("lib/security/trusted-client-ip.ts","utf8");
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
function load(env){
 const m={exports:{}};const req=(name)=>name==="server-only"?{}:require(name);
 vm.runInNewContext(code,{module:m,exports:m.exports,require:req,process:{env}});
 return m.exports.trustedClientIp;
}
function request(h){return{headers:new Headers(h)}}
const edge=load({VERCEL:"1"});
assert.equal(edge(request({"x-vercel-forwarded-for":"203.0.113.77","x-forwarded-for":"198.51.100.21"})),"203.0.113.77");
assert.equal(edge(request({"x-vercel-forwarded-for":"2001:DB8::9","x-forwarded-for":"198.51.100.99"})),"2001:db8::9");
assert.equal(edge(request({"x-vercel-forwarded-for":"malformed","x-real-ip":"203.0.113.88"})),"203.0.113.88");
assert.equal(edge(request({"x-vercel-forwarded-for":"203.0.113.77, 198.51.100.22"})),"unknown");
assert.equal(edge(request({"x-forwarded-for":"198.51.100.5"})),"unknown");
assert.equal(load({})(request({"x-forwarded-for":"203.0.113.54"})),"unknown");
assert.equal(load({LINGXIFIELD_TRUST_PROXY_HEADERS:"true"})(request({"x-forwarded-for":"198.51.100.9"})),"198.51.100.9");
for(const path of ["lib/rate-limit.ts","lib/security/abuse-guard.ts","lib/tools/commerce/free-entitlement.ts","app/api/tools/temp-mail/create/route.ts","app/api/tools/food/free-status/route.ts","lib/tools/food/request-identity.ts"]){
 assert.match(fs.readFileSync(path,"utf8"),/trustedClientIp/,"trusted client IP parser missing in "+path);
}
console.log("SECURITY_TRUSTED_IP_GATE=PASS");
