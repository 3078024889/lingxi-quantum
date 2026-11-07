#!/usr/bin/env node
/**
 * Anonymous, read-only production-path probe for the two Lingxifield main sites.
 * It uses GET only, sends no cookies or credentials, does not mutate billing,
 * and cannot certify a release by itself. In particular, a public-only Worker
 * preview that answers 503 for protected APIs MUST fail.
 *
 * node scripts/cloudflare/probe-main-backend.mjs --origin https://lingxifield.com
 * node scripts/cloudflare/probe-main-backend.mjs --origin https://lingxifield.cn
 * node scripts/cloudflare/probe-main-backend.mjs --origin https://YOUR.workers.dev
 */
import {pathToFileURL} from "node:url";

const MAX_JSON_BYTES = 262144;
const ROUTES = Object.freeze([
  ["/",200,"html"],
  ["/account",200,"html"],
  ["/tools",200,"html"],
  ["/siai",200,"html"],
  ["/api/health",200,"health"],
  ["/api/public/siai-widget",200,"siai"],
  ["/api/sasi/capabilities",200,"capabilities"],
  ["/api/sasi/account",401,"account-guard"],
  ["/api/tools/jobs",401,"tools-guard"],
]);

export function validateProbeOrigin(raw) {
  if (typeof raw !== "string") throw Error("ORIGIN_REQUIRED");
  let u;
  try { u = new URL(raw); } catch { throw Error("INVALID_ORIGIN"); }
  const host=u.hostname.toLowerCase();
  if (u.protocol!=="https:" || u.username || u.password || u.port ||
      u.pathname!=="/" || u.search || u.hash ||
      !(
        host==="lingxifield.com" || host==="lingxifield.cn" ||
        (/^[a-z0-9-]+(?:\.[a-z0-9-]+)*\.workers\.dev$/.test(host)) ||
        (/^[a-z0-9-]+\.vercel\.app$/.test(host))
      ))
    throw Error("PROBE_TARGET_NOT_ALLOWED");
  return u.origin;
}

async function boundedJson(response) {
  if (!(response.headers.get("content-type")||"").toLowerCase().includes("application/json"))
    throw Error("JSON_CONTENT_TYPE_REQUIRED");
  const advertised=Number(response.headers.get("content-length")||0);
  if (advertised>MAX_JSON_BYTES) throw Error("RESPONSE_TOO_LARGE");
  if (!response.body) throw Error("EMPTY_RESPONSE");
  const reader=response.body.getReader();
  let count=0;
  const chunks=[];
  try {
    for (;;) {
      const {value,done}=await reader.read();
      if (done) break;
      count+=value.byteLength;
      if (count>MAX_JSON_BYTES) throw Error("RESPONSE_TOO_LARGE");
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes=new Uint8Array(count);let at=0;
  for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.byteLength;}
  return JSON.parse(new TextDecoder().decode(bytes));
}

function validatePayload(kind, data, response) {
  if (kind==="health")
    return data?.ok===true && data?.service==="lingxifield" &&
      /no-store/i.test(response.headers.get("cache-control")||"");
  if (kind==="siai")
    return data?.publisher==="LINGXIFIELD" &&
      Array.isArray(data.rows) && data.rows.length>0 &&
      Number.isInteger(data.total) && data.total===data.rows.length;
  if (kind==="capabilities")
    return !!data?.stats && typeof data.stats==="object" && Array.isArray(data.matches);
  if (kind==="account-guard") return data?.error==="AUTH_REQUIRED";
  if (kind==="tools-guard") return typeof data?.error==="string" && data.error.length>0;
  return false;
}

export async function probeMainBackend(rawOrigin, {fetcher=fetch, timeoutMs=10000}={}) {
  const origin=validateProbeOrigin(rawOrigin);
  const checks=[];
  for (const [path,expected,kind] of ROUTES) {
    let response;
    try {
      response=await fetcher(origin+path,{
        method:"GET",redirect:"manual",cache:"no-store",
        headers:{"Accept":kind==="html"?"text/html":"application/json"},
        signal:AbortSignal.timeout(timeoutMs),
      });
      if(response.status!==expected) {
        checks.push({path,status:response.status,ok:false,
          reason:response.status===503?"BACKEND_DISABLED_OR_UNAVAILABLE":"HTTP_STATUS_MISMATCH"});
        continue;
      }
      if(response.headers.get("location")) {
        checks.push({path,status:response.status,ok:false,reason:"UNEXPECTED_REDIRECT"});
        continue;
      }
      if (kind==="html") {
        const ok=(response.headers.get("content-type")||"").includes("text/html");
        checks.push({path,status:response.status,ok,...(!ok?{reason:"HTML_REQUIRED"}:{})});
        continue;
      }
      const data=await boundedJson(response);
      const ok=validatePayload(kind,data,response);
      checks.push({path,status:response.status,ok,...(!ok?{reason:"INVALID_CONTRACT_OR_CACHE_POLICY"}:{})});
    } catch (error) {
      checks.push({path,status:response?.status??null,ok:false,
        reason:error?.name==="TimeoutError"?"TIMEOUT":"NETWORK_OR_RESPONSE_ERROR"});
    }
  }
  const anonymousBackendReady=checks.every(c=>c.ok);
  return {
    origin, anonymousBackendReady, checks,
    releaseReady:false, exactShaVerified:false,
    reason:"Anonymous GET checks cannot validate real sign-in, payment/refund, all tools, SASI generation, cron, backup and rollback.",
  };
}

async function main(argv) {
  const index=argv.indexOf("--origin");
  if(index<0 || index+2!==argv.length) {
    console.error("Usage: node scripts/cloudflare/probe-main-backend.mjs --origin https://lingxifield.com");
    return 2;
  }
  let result;
  try {result=await probeMainBackend(argv[index+1]);}
  catch(e) {console.error(e.message);return 2;}
  console.log(JSON.stringify(result,null,2));
  return result.anonymousBackendReady?0:1;
}

if (process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href)
  main(process.argv.slice(2)).then(code=>{process.exitCode=code;})
    .catch(()=>{console.error("BACKEND_PROBE_ERROR");process.exitCode=1;});
