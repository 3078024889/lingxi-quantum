import test from "node:test";
import assert from "node:assert/strict";
import {validatedOrigin, probeOrigin, decision} from "../../scripts/cloudflare/probe-com-origins.mjs";

const cf = "https://lingxi-com-test.celestial.workers.dev";
const vc = "https://lingxi-quantum-example-celestial9.vercel.app";

test("accepts only expected HTTPS provider preview hosts", () => {
  assert.equal(validatedOrigin(cf, "cloudflare"), cf);
  assert.equal(validatedOrigin(vc, "vercel"), vc);
  for (const invalid of [
    "http://lingxi-com-test.workers.dev",
    "https://evil.example.org",
    "https://lingxi-com-test.workers.dev/anything",
    "https://lingxi-com-test.workers.dev?token=x",
    "https://user:pass@lingxi-com-test.workers.dev",
    "https://lingxi-com-test.workers.dev:444",
    "https://workers.dev.attacker.example",
  ]) assert.throws(() => validatedOrigin(invalid, "cloudflare"));
  assert.throws(() => validatedOrigin(cf, "vercel"));
});

test("healthy anonymous routes are not proof of safe release", async () => {
  let n = 0;
  const requests = [];
  const fakeFetch = async (url, options) => {
    requests.push({url,options});
    const responses = [
      new Response(JSON.stringify({ok:true,service:"lingxifield"}), {status:200,
        headers:{"content-type":"application/json","cache-control":"no-store"}}),
      new Response("User-agent: *", {status:200, headers:{"content-type":"text/plain"}}),
      new Response("<html>ok</html>", {status:200, headers:{"content-type":"text/html"}}),
    ];
    return responses[n++];
  };
  const c = await probeOrigin(cf, fakeFetch);
  assert.equal(c.ok,true);
  assert.equal(requests.length,3);
  assert(requests.every(x=>x.options.redirect==="manual" && x.options.cache==="no-store"));
  const verdict = decision(c, {ok:true});
  assert.equal(verdict.vercelHealthy,true);
  assert.equal(verdict.safeToSwitchAutomatically,false);
  assert.equal(verdict.exactShaVerified,false);
  assert.equal(verdict.releaseReady,false);
});

test("redirect, cacheable health, malformed health and network errors fail closed", async () => {
  const redirect = await probeOrigin(cf, async () => new Response(null,{status:307,headers:{location:"https://lingxifield.com/"}}));
  assert.equal(redirect.ok,false);
  assert.equal(redirect.checks[0].redirect,"https://lingxifield.com");
  let count=0;
  const cacheable=await probeOrigin(cf, async () => {
    count++;
    return count === 1
      ? new Response('{"ok":true,"service":"lingxifield"}',{headers:{"content-type":"application/json","cache-control":"public, max-age=30"}})
      : new Response("whatever",{headers:{"content-type":"text/plain"}});
  });
  assert.equal(cacheable.checks[0].error,"HEALTH_MUST_NOT_BE_CACHED");
  const malformed=await probeOrigin(cf,async()=>new Response("not json",{headers:{"content-type":"application/json","cache-control":"no-store"}}));
  assert.equal(malformed.checks[0].error,"INVALID_HEALTH_RESPONSE");
  const offline=await probeOrigin(cf,async()=>{throw Error("offline");});
  assert.equal(offline.ok,false);
  assert.equal(offline.checks.length,3);
  assert(offline.checks.every(item=>item.error==="NETWORK_OR_RESPONSE_ERROR"));
});
