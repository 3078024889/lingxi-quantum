import test from "node:test";
import assert from "node:assert/strict";
import {
  classifyPublicKey, comparePublicConfig, probePublicKey,
  processKeyDiagnostics, interpretDiagnosis
} from "../../scripts/ops/cn-auth-key-readonly.mjs";
const URL="https://sxsgdpqojepgbbrxrzlq.supabase.co";
const pub="sb_publishable_"+"p".repeat(24);
const other="sb_publishable_"+"q".repeat(24);
const jwt=role=>{
  const payload=Buffer.from(JSON.stringify({role,exp:Math.floor(Date.now()/1000)+86400})).toString("base64url");
  return "eyJhbGciOiJIUzI1NiJ9."+payload+".fake-signature";
};
test("distinguishes valid *candidate types* and refuses privileged public keys",()=>{
 assert.equal(classifyPublicKey(pub),"PUBLISHABLE");
 assert.equal(classifyPublicKey(jwt("anon")),"LEGACY_ANON_JWT");
 assert.equal(classifyPublicKey(jwt("service_role")),"JWT_NOT_ANON_REJECT");
 assert.equal(classifyPublicKey("sb_secret_"+"a".repeat(32)),"PRIVILEGED_KEY_MUST_NOT_BE_PUBLIC");
 assert.equal(classifyPublicKey(""),"MISSING_OR_MALFORMED");
 assert.equal(classifyPublicKey("not-a-real-key".repeat(2)),"UNRECOGNIZED_KEY");
});
test("reports differing keys without treating them as invalid or sharing values",()=>{
 const x=comparePublicConfig(
  {NEXT_PUBLIC_SUPABASE_URL:URL,NEXT_PUBLIC_SUPABASE_ANON_KEY:pub},
  {NEXT_PUBLIC_SUPABASE_URL:URL,NEXT_PUBLIC_SUPABASE_ANON_KEY:other});
 assert.equal(x.keysEqual,false);
 assert.equal(x.productionKeyKind,"PUBLISHABLE");
 assert.equal(x.stagingKeyKind,"PUBLISHABLE");
 assert.equal(x.productionUrlMatchesProject,true);
 assert(!JSON.stringify(x).includes(pub));
 assert(!JSON.stringify(x).includes(other));
});
test("valid key probe performs only safe GET and transmits key in header",async()=>{
 let request;
 const fake=async(uri,opts)=>{
  request={uri,opts};
  return new Response("{}",{status:200,headers:{"content-type":"application/json"}});
 };
 assert.equal(await probePublicKey(pub,URL,fake),"HTTP_200_API_GATEWAY_ACCEPTS_KEY");
 assert.equal(request.uri,URL+"/rest/v1/");
 assert.equal(request.opts.method,"GET");
 assert.equal(request.opts.redirect,"manual");
 assert.equal(request.opts.headers.apikey,pub);
 assert(!request.uri.includes(pub));
});
test("invalid key type or project mismatch must never hit network",async()=>{
 let calls=0;
 const fake=async()=>{calls++;throw Error("unexpected fetch");};
 assert.equal(await probePublicKey("sb_secret_"+"a".repeat(32),URL,fake),
   "NOT_PROBED_INVALID_TYPE_OR_PROJECT");
 assert.equal(await probePublicKey(pub,"https://attacker.example",fake),
   "NOT_PROBED_INVALID_TYPE_OR_PROJECT");
 assert.equal(calls,0);
});
test("401 and TLS failure are reported without leaking underlying error",async()=>{
 assert.equal(await probePublicKey(pub,URL,async()=>new Response("{}",{status:401})),
   "HTTP_401_KEY_OR_PERMISSION_REJECTED");
 assert.equal(await probePublicKey(pub,URL,async()=>{throw Error("APIKEY IS SECRET");}),
   "NETWORK_OR_TLS_UNREACHABLE");
});
test("read-only process comparison distinguishes absent key from stale process",()=>{
 const file={NEXT_PUBLIC_SUPABASE_URL:URL,NEXT_PUBLIC_SUPABASE_ANON_KEY:pub};
 const same=processKeyDiagnostics(file,file);
 assert.equal(same.NEXT_PUBLIC_SUPABASE_ANON_KEY.matchesEnvFile,true);
 const stale=processKeyDiagnostics(file,{NEXT_PUBLIC_SUPABASE_URL:URL,NEXT_PUBLIC_SUPABASE_ANON_KEY:other});
 assert.equal(stale.NEXT_PUBLIC_SUPABASE_ANON_KEY.matchesEnvFile,false);
 const absent=processKeyDiagnostics(file,{});
 assert.equal(absent.NEXT_PUBLIC_SUPABASE_ANON_KEY.present,false);
 assert(!JSON.stringify(stale).includes(pub));
});
test("a different but working production public key is kept, not overwritten",()=>{
 const summary={...comparePublicConfig(
  {NEXT_PUBLIC_SUPABASE_URL:URL,NEXT_PUBLIC_SUPABASE_ANON_KEY:pub},
  {NEXT_PUBLIC_SUPABASE_URL:URL,NEXT_PUBLIC_SUPABASE_ANON_KEY:other})};
 assert.equal(interpretDiagnosis(summary,"HTTP_200_API_GATEWAY_ACCEPTS_KEY","HTTP_200_API_GATEWAY_ACCEPTS_KEY"),
   "KEEP_PRODUCTION_KEY_CHECK_PROCESS_AND_BUILD");
 assert.equal(interpretDiagnosis(summary,"NETWORK_OR_TLS_UNREACHABLE","HTTP_200_API_GATEWAY_ACCEPTS_KEY"),
   "KEY_DIFFERENCE_INCONCLUSIVE_NO_CHANGES");
 assert.equal(interpretDiagnosis(summary,"HTTP_401_KEY_OR_PERMISSION_REJECTED","HTTP_200_API_GATEWAY_ACCEPTS_KEY"),
   "PRODUCTION_KEY_REJECTED_REQUIRE_REVIEW_AND_REBUILD");
});
test("never interpret wrong project as a safe replacement",()=>{
 const summary=comparePublicConfig(
  {NEXT_PUBLIC_SUPABASE_URL:"https://wrong.supabase.co",NEXT_PUBLIC_SUPABASE_ANON_KEY:pub},
  {NEXT_PUBLIC_SUPABASE_URL:URL,NEXT_PUBLIC_SUPABASE_ANON_KEY:other});
 assert.equal(interpretDiagnosis(summary,"HTTP_200_API_GATEWAY_ACCEPTS_KEY","HTTP_200_API_GATEWAY_ACCEPTS_KEY"),
  "PROJECT_URL_MISMATCH_STOP");
});
