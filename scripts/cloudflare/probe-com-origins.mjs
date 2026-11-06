#!/usr/bin/env node
/**
 * Read-only dual-origin probe for lingxifield.com Cloudflare/Vercel migration.
 * Performs anonymous GET only. NEVER deploys, changes DNS, logs secrets, or
 * treats an origin health result as permission to switch production traffic.
 *
 * node scripts/cloudflare/probe-com-origins.mjs \
 *   --cloudflare https://your-worker.workers.dev \
 *   --vercel https://your-deployment.vercel.app
 */
import { pathToFileURL } from "node:url";
import { writeFileSync } from "node:fs";

const PATHS = ["/api/health", "/robots.txt", "/siai"];
const HOSTS = {
  cloudflare: (host) => host.endsWith(".workers.dev") || host === "lingxifield.com",
  vercel: (host) => host.endsWith(".vercel.app"),
};

export function validatedOrigin(raw, kind) {
  if (typeof raw !== "string" || !HOSTS[kind]) throw Error("INVALID_ORIGIN");
  let url;
  try { url = new URL(raw); } catch { throw Error("INVALID_ORIGIN_URL"); }
  if (url.protocol !== "https:" || url.username || url.password ||
      url.search || url.hash || url.pathname !== "/" ||
      url.port || !HOSTS[kind](url.hostname.toLowerCase())) {
    throw Error("ORIGIN_NOT_ALLOWED");
  }
  return url.origin;
}

export async function probeOrigin(origin, fetcher = fetch, timeoutMs = 8000) {
  const checks = [];
  for (const path of PATHS) {
    const url = origin + path;
    try {
      const response = await fetcher(url, {
        method: "GET", redirect: "manual",
        headers: { "Accept": path === "/api/health" ? "application/json" : "text/html,*/*" },
        signal: AbortSignal.timeout(timeoutMs),
        cache: "no-store",
      });
      const location = response.headers.get("location");
      let error = "";
      if (response.status !== 200) error = "UNEXPECTED_HTTP_STATUS";
      else if (path === "/api/health") {
        const type = response.headers.get("content-type") || "";
        const control = response.headers.get("cache-control") || "";
        const result = type.includes("application/json")
          ? await response.json().catch(() => null) : null;
        if (result?.ok !== true || result?.service !== "lingxifield")
          error = "INVALID_HEALTH_RESPONSE";
        else if (!/no-store/i.test(control))
          error = "HEALTH_MUST_NOT_BE_CACHED";
      } else {
        const type = response.headers.get("content-type") || "";
        if (path === "/siai" && !type.includes("text/html")) error = "EXPECTED_HTML";
        if (path === "/robots.txt" && !/text\/plain|text\/txt/i.test(type)) error = "EXPECTED_ROBOTS_TEXT";
      }
      checks.push({ path, status: response.status, ok: !error,
        ...error ? {error} : {}, ...location ? {redirect: new URL(location, url).origin} : {} });
    } catch (e) {
      checks.push({ path, ok: false, error: e?.name === "TimeoutError" ? "TIMEOUT" : "NETWORK_OR_RESPONSE_ERROR" });
    }
  }
  return { origin, ok: checks.every(x => x.ok), checks };
}

export function decision(cloudflare, vercel) {
  return {
    cloudflareHealthy: cloudflare?.ok === true,
    vercelHealthy: vercel?.ok === true,
    fallbackReady: vercel?.ok === true,
    safeToSwitchAutomatically: false,
    exactShaVerified: false,
    releaseReady: false,
    reason: "Anonymous page health cannot prove build SHA, authenticated routes, payments, cron, real-file delivery or DNS rollback",
  };
}

function argumentValue(argv, name) {
  const i = argv.indexOf(name);
  return i < 0 ? null : argv[i+1] || null;
}

export async function main(argv = process.argv.slice(2)) {
  const cf = argumentValue(argv, "--cloudflare");
  const vc = argumentValue(argv, "--vercel");
  if (!cf && !vc) {
    console.error("Supply --cloudflare https://*.workers.dev and/or --vercel https://*.vercel.app");
    return 2;
  }
  let primary, standby;
  try {
    primary = cf ? validatedOrigin(cf, "cloudflare") : null;
    standby = vc ? validatedOrigin(vc, "vercel") : null;
  } catch (error) {
    console.error(error.message);
    return 2;
  }
  const [cloudflare, vercel] = await Promise.all([
    primary ? probeOrigin(primary) : Promise.resolve(null),
    standby ? probeOrigin(standby) : Promise.resolve(null),
  ]);
  const report = { schemaVersion: 1, scope: "anonymous-read-only",
    at: new Date().toISOString(), cloudflare, vercel, decision: decision(cloudflare, vercel) };
  const out = argumentValue(argv, "--json");
  if (out) writeFileSync(out, JSON.stringify(report, null, 2) + "\n", { mode: 0o600 });
  console.log(JSON.stringify(report, null, 2));
  return argv.includes("--require-healthy") &&
    ((cloudflare && !cloudflare.ok) || (vercel && !vercel.ok)) ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().then(code => { process.exitCode = code; })
    .catch(() => { console.error("ORIGIN_PROBE_FAILED"); process.exitCode = 1; });
}
