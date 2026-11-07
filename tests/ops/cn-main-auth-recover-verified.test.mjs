import test from "node:test";
import assert from "node:assert/strict";
import {activePublicType,selectPublicPair,publicOnlyPatch} from "../../scripts/ops/cn-main-auth-recover-verified.mjs";
const PROJECT="https://sxsgdpqojepgbbrxrzlq.supabase.co";
const P="test-public-key-p",S="test-public-key-s";
const trust=x=>x===P?"legacy-anon":x===S?"publishable":null;
const pair=(prodKey,stageKey,prodUrl=PROJECT)=>[
  {NEXT_PUBLIC_SUPABASE_URL:prodUrl,NEXT_PUBLIC_SUPABASE_ANON_KEY:prodKey},
  {NEXT_PUBLIC_SUPABASE_URL:PROJECT,NEXT_PUBLIC_SUPABASE_ANON_KEY:stageKey},
];
test("reject unverified test keys and secret-looking values",()=>{
  assert.equal(activePublicType(""),null);
  assert.equal(activePublicType("sb_secret_"+"A".repeat(30)),null);
  assert.equal(activePublicType("sb_service_"+"A".repeat(30)),null);
  assert.equal(activePublicType("sb_publishable_"+"a".repeat(40)),null);
});
test("keep the production key when both are active but different",()=>{
  const v=selectPublicPair(...pair(P,S),trust);
  assert.equal(v.source,"production");
  assert.equal(v.key,P);
  assert.equal(v.kind,"legacy-anon");
});
test("select approved staging key only when production key unverified",()=>{
  const v=selectPublicPair(...pair("inactive",S),trust);
  assert.equal(v.source,"staging");
  assert.equal(v.key,S);
});
test("refuse unknown keys, never convert them into empty or privileged key",()=>{
  assert.throws(()=>selectPublicPair(...pair("inactive","wrong"),trust),/NO_CURRENT_ENABLED_PUBLIC_KEY_FOUND/);
});
test("refuse cross-project production or staging mismatch",()=>{
  assert.throws(()=>selectPublicPair(...pair(P,S,"https://other.supabase.co"),trust),
   /PRODUCTION_PROJECT_URL_MISMATCH/);
  assert.throws(()=>selectPublicPair(
    {NEXT_PUBLIC_SUPABASE_URL:PROJECT,NEXT_PUBLIC_SUPABASE_ANON_KEY:P},
    {NEXT_PUBLIC_SUPABASE_URL:"https://wrong.supabase.co",NEXT_PUBLIC_SUPABASE_ANON_KEY:S},trust),
    /STAGING_PROJECT_URL_MISMATCH/);
});
test("preserve every non-public entry, even secrets, exactly",()=>{
  const raw="SUPABASE_SERVICE_ROLE_KEY=private-secret\nOTHER_KEY=1\nNEXT_PUBLIC_SUPABASE_URL="+PROJECT+
  "\nNEXT_PUBLIC_SUPABASE_ANON_KEY=obsolete\n";
  const v=publicOnlyPatch(raw,{url:PROJECT,key:S});
  assert(v.includes("SUPABASE_SERVICE_ROLE_KEY=private-secret\nOTHER_KEY=1\n"));
  assert(v.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY="+S));
  assert(!v.includes("obsolete"));
});
test("missing public fields are appended without changing existing config",()=>{
 const v=publicOnlyPatch("SOME_PAYMENT_CONFIG=false\n",{url:PROJECT,key:S});
 assert.equal(v.split("SOME_PAYMENT_CONFIG=false").length,2);
 assert(v.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY="+S));
 assert(v.includes("NEXT_PUBLIC_SUPABASE_URL="+PROJECT));
});
test("no change if both public fields already match",()=>{
  const raw="NEXT_PUBLIC_SUPABASE_URL="+PROJECT+"\nNEXT_PUBLIC_SUPABASE_ANON_KEY="+P+"\n";
  assert.equal(publicOnlyPatch(raw,{url:PROJECT,key:P}),raw);
});
test("reject duplicate public fields to avoid systemd/Node disagreement",()=>{
  const raw="NEXT_PUBLIC_SUPABASE_ANON_KEY=a\nNEXT_PUBLIC_SUPABASE_ANON_KEY=b\n";
  assert.throws(()=>publicOnlyPatch(raw,{url:PROJECT,key:S}),/DUPLICATE_PUBLIC_ENV_FIELD/);
});
test("public patches cannot overwrite privileged fields with a similarly named prefix",()=>{
  const raw="SUPABASE_SERVICE_ROLE_KEY=secret\nNEXT_PUBLIC_SUPABASE_ANON_KEY_ALT=untouched\n";
  const updated=publicOnlyPatch(raw,{url:PROJECT,key:S});
  assert(updated.includes("SUPABASE_SERVICE_ROLE_KEY=secret"));
  assert(updated.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY_ALT=untouched"));
});
