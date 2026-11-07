import test from "node:test";
import assert from "node:assert/strict";
import {checkSupabaseBrowserBuild} from "../../scripts/ci/require-supabase-browser-build.mjs";

const url="https://sxsgdpqojepgbbrxrzlq.supabase.co";
const key="sb_publishable_"+"B".repeat(28);
const verified=x=>x===key?"publishable":null;
test("no-key production build cannot claim browser login readiness",()=>{
 assert.equal(checkSupabaseBrowserBuild({},verified).ok,false);
 assert.equal(checkSupabaseBrowserBuild({NEXT_PUBLIC_SUPABASE_URL:url},verified).ok,false);
});
test("correct Supabase project and active PUBLIC key allow release build",()=>{
 assert.deepEqual(checkSupabaseBrowserBuild({
  NEXT_PUBLIC_SUPABASE_URL:url,NEXT_PUBLIC_SUPABASE_ANON_KEY:key,
 },verified),{ok:true,project:"sxsgdpqojepgbbrxrzlq",keyType:"publishable"});
});
test("cross-project and private-key browser build fail closed",()=>{
 assert.equal(checkSupabaseBrowserBuild({
  NEXT_PUBLIC_SUPABASE_URL:"https://evil.supabase.co",NEXT_PUBLIC_SUPABASE_ANON_KEY:key,
 },verified).ok,false);
 assert.equal(checkSupabaseBrowserBuild({
  NEXT_PUBLIC_SUPABASE_URL:url,NEXT_PUBLIC_SUPABASE_ANON_KEY:"sb_secret_DONT_EXPOSE",
 }).ok,false);
});
