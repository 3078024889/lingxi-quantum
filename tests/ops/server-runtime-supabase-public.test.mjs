import test from "node:test";
import assert from "node:assert/strict";
import {getRuntimeSupabasePublicConfig} from "../../lib/supabase/server-runtime-config.ts";

const url="https://sxsgdpqojepgbbrxrzlq.supabase.co";
const publish="sb_publishable_"+ "x".repeat(32);
const jwt = (role,expired=false) => [
  Buffer.from('{"alg":"HS256"}').toString("base64url"),
  Buffer.from(JSON.stringify({role,exp:Math.floor(Date.now()/1000)+(expired?-60:3600)})).toString("base64url"),
  "not-a-signature",
].join(".");
test("runtime server selects non-NEXT_PUBLIC server environment without build inlining",()=>{
 const result=getRuntimeSupabasePublicConfig({SUPABASE_URL:url,SUPABASE_PUBLISHABLE_KEY:publish});
 assert.deepEqual(result,{url,key:publish});
});
test("legacy public env remains supported for existing ECS configuration",()=>{
 const result=getRuntimeSupabasePublicConfig({NEXT_PUBLIC_SUPABASE_URL:url,NEXT_PUBLIC_SUPABASE_ANON_KEY:jwt("anon")});
 assert.equal(result?.url,url);
});
test("server public variables take priority over frozen public build values",()=>{
 const result=getRuntimeSupabasePublicConfig({
   SUPABASE_URL:url,SUPABASE_PUBLISHABLE_KEY:publish,
   NEXT_PUBLIC_SUPABASE_URL:"https://wrong.supabase.co",
   NEXT_PUBLIC_SUPABASE_ANON_KEY:jwt("anon"),
 });
 assert.equal(result?.key,publish);
});
test("reject secret service keys, role-confused JWT and expired anon",()=>{
 for(const key of ["sb_secret_"+"A".repeat(24),"sb_service_"+"A".repeat(24),
   jwt("service_role"),jwt("authenticated"),jwt("anon",true),"invalid-public-key"]) {
  assert.equal(getRuntimeSupabasePublicConfig({SUPABASE_URL:url,SUPABASE_ANON_KEY:key}),null);
 }
});
test("reject unsupported URL schemes and nonlocal insecure HTTP",()=>{
 for(const bad of ["http://sxsgdpqojepgbbrxrzlq.supabase.co",
  "file:///etc/passwd","javascript:evil",""]) {
  assert.equal(getRuntimeSupabasePublicConfig({SUPABASE_URL:bad,SUPABASE_PUBLISHABLE_KEY:publish}),null);
 }
});
test("no public configuration cannot become authenticated by omission",()=>{
 assert.equal(getRuntimeSupabasePublicConfig({}),null);
});
