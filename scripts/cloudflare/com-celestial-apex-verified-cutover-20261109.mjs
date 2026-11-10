#!/usr/bin/env node
// Promote a verified isolated canary into the existing production Worker in-place.
// The existing script name, custom-domain route, dashboard variables and secrets are preserved.
import { readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const account = process.env.CLOUDFLARE_ACCOUNT_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;
const githubToken = process.env.GH_TOKEN;
const runId = process.env.COM_VERIFIED_CANARY_RUN;
const expectedSha = process.env.COM_VERIFIED_CANARY_SHA;
const productionWorker = "lingxifield-com-celestial-20261109";
const candidateWorkerPrefix = "lingxifield-com-canary-";
const wwwWorker = "lingxifield-com-static-gateway-canary-20261107";
const apexPattern = "lingxifield.com/*";
const candidateWorker = candidateWorkerPrefix + (expectedSha || "").slice(0, 12);

if (!account || !token || !githubToken || !runId || !/^[0-9a-f]{40}$/.test(expectedSha || "")) {
  throw Error("CLOUDFLARE_OR_CANARY_GATE_NOT_CONFIGURED");
}
if (productionWorker === candidateWorker) throw Error("CANARY_MUST_NOT_REUSE_PRODUCTION_WORKER");

const cloudBase = "https://api.cloudflare.com/client/v4";
async function cf(path, init = {}) {
  const response = await fetch(cloudBase + path, {
    ...init,
    headers: {
      authorization: "Bearer " + token,
      "content-type": "application/json",
      ...(init.headers || {})
    },
    signal: AbortSignal.timeout(28000)
  });
  const json = await response.json().catch(() => null);
  if (!response.ok || !json?.success) {
    throw Error("CLOUDFLARE_REQUEST_FAILED:" + path + ":HTTP_" + response.status +
      ":errors_" + JSON.stringify((json?.errors || []).map(error => error.code)));
  }
  return json.result;
}

async function status(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      redirect: "manual",
      signal: AbortSignal.timeout(30000)
    });
    return { status: response.status, headers: response.headers };
  } catch {
    return { status: 0, headers: new Headers() };
  }
}

async function sleep(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

async function getActiveVersion() {
  const result = await cf(
    "/accounts/" + account + "/workers/scripts/" + productionWorker + "/deployments?per_page=10"
  );
  const active = result.deployments?.[0];
  if (!active || !Array.isArray(active.versions) || active.versions.length !== 1 ||
      active.versions[0].percentage !== 100 || !active.versions[0].version_id) {
    throw Error("PRODUCTION_WORKER_NOT_SINGLE_VERSION_100_PERCENT");
  }
  return active.versions[0].version_id;
}

async function readProviderFlags(base) {
  const response = await fetch(base + "/api/pay/providers", {
    redirect: "manual",
    signal: AbortSignal.timeout(20000)
  });
  const json = await response.json().catch(() => null);
  const names = ["alipay", "wechat", "paypal"];
  if (response.status !== 200 || names.some(name =>
      typeof json?.[name] !== "boolean" ||
      typeof json?.diagnostics?.[name]?.configured !== "boolean" ||
      typeof json?.diagnostics?.[name]?.enabled !== "boolean" ||
      typeof json?.diagnostics?.[name]?.missingCount !== "number" ||
      json.diagnostics[name].enabled !== json[name])) {
    throw Error("COM_PAYMENT_PROVIDER_DIAGNOSTICS_INVALID:" + response.status);
  }
  return {
    alipay: json.alipay,
    wechat: json.wechat,
    paypal: json.paypal,
    diagnostics: Object.fromEntries(names.map(name => [name, {
      configured: json.diagnostics[name].configured,
      enabled: json.diagnostics[name].enabled,
      missingCount: json.diagnostics[name].missingCount
    }]))
  };
}

async function probe(base, phase, attempts = 3, expectedProviders = null) {
  const routes = [
    "/", "/siai", "/tools", "/tools/pass", "/ai-wallet", "/account",
    "/sasi", "/sasi/marketplace", "/about", "/announcements",
    "/api/health", "/api/pay/providers", "/api/sasi/marketplace/listings",
    "/api/sasi/software/catalog",
    "/en/siai", "/ja/siai", "/ko/siai", "/fr/siai", "/de/siai",
    "/es/siai", "/pt/siai", "/ar/siai",
    "/tools/ico-to-png", "/tools/number-base-converter", "/tools/video-watermark-remover",
    "/tools/png-to-jpg", "/tools/compress-image", "/tools/merge-pdf", "/tools/json-formatter"
  ];
  const staticRoutes = new Set([
    "/", "/siai", "/tools", "/tools/pass", "/ai-wallet", "/account",
    "/sasi", "/sasi/marketplace", "/about", "/announcements",
    "/en/siai", "/ja/siai", "/ko/siai", "/fr/siai", "/de/siai",
    "/es/siai", "/pt/siai", "/ar/siai",
    "/tools/ico-to-png", "/tools/number-base-converter", "/tools/video-watermark-remover"
  ]);
  const staticRenderRoutes = new Set([...staticRoutes, "/api/sasi/software/catalog"]);
  const maxTries = phase === "POSTCUTOVER" || phase === "ROLLBACK" ? 12 : attempts;

  for (const path of routes) {
    let consecutive = 0;
    for (let i = 0; i < maxTries; i++) {
      const url = base + path + ((phase === "POSTCUTOVER" || phase === "ROLLBACK")
        ? "?__lx_com_release_gate=" + i : "");
      const result = await status(url);
      const renderOK = !staticRenderRoutes.has(path) ||
        result.headers.get("x-lingxi-render-mode") === "static-edge-verified";
      const directAssetOK = !staticRoutes.has(path) ||
        result.headers.get("x-lingxi-static-delivery") === "workers-static-assets";
      console.log("COM_" + phase + "_PAGE path=" + path + " attempt=" + (i + 1) +
        " http=" + result.status + " static=" + renderOK + " direct_asset=" + directAssetOK);
      if (result.status === 200 && renderOK && directAssetOK) consecutive++;
      else consecutive = 0;
      if (consecutive >= attempts) break;
      if (phase === "POSTCUTOVER" || phase === "ROLLBACK") await sleep(4000);
    }
    if (consecutive !== attempts) {
      throw Error("COM_" + phase + "_UNSTABLE_ROUTE:" + path + ":" + consecutive + "/" + attempts);
    }
  }

  for (const path of [
    "/api/money/summary",
    "/api/sasi/account",
    "/api/sasi/marketplace/seller",
    "/api/sasi/marketplace/my-orders"
  ]) {
    const response = await fetch(base + path, {
      redirect: "manual",
      signal: AbortSignal.timeout(20000)
    });
    const code = response.status;
    console.log("COM_" + phase + "_PRIVATE " + path + " HTTP_" + code);
    if (code === 401) continue;
    if (path === "/api/money/summary" && code === 503) {
      const body = await response.text();
      if (body.length > 2048 ||
          /(availableMinor|refundableMinor|refundHoldMinor|balances|withdrawals)/i.test(body)) {
        throw Error("COM_" + phase + "_BALANCE_503_CONTAINS_PRIVATE_DATA");
      }
      console.log("COM_BALANCE_DYNAMIC_DEFERRED_503_NO_DATA");
      continue;
    }
    throw Error("COM_" + phase + "_PRIVATE_AUTH_FAILURE:" + path + ":" + code);
  }

  const providers = await readProviderFlags(base);
  console.log("COM_" + phase + "_PAYMENT_PROVIDER_FLAGS " + JSON.stringify(providers));
  if (phase === "CANARY" && (providers.alipay || providers.wechat || providers.paypal)) {
    throw Error("COM_CANARY_PAYMENT_PROVIDER_MUST_REMAIN_DISABLED");
  }
  if (expectedProviders && JSON.stringify(providers) !== JSON.stringify(expectedProviders)) {
    throw Error("COM_PRODUCTION_PAYMENT_FLAGS_CHANGED_DURING_RELEASE");
  }

  for (const path of [
    "/siai/", "/tools/", "/tools/pass/", "/sasi/", "/sasi/marketplace/", "/en/siai/"
  ]) {
    const result = await status(base + path);
    const expected = base + path.slice(0, -1);
    const location = result.headers.get("location");
    console.log("COM_" + phase + "_CANONICAL_SLASH path=" + path +
      " http=" + result.status + " location=" + location);
    if (result.status !== 308 || location !== expected) {
      throw Error("COM_" + phase + "_CANONICAL_SLASH_FAILURE:" + path);
    }
  }

  for (const asset of [
    "/media/ffmpeg-0.12.10/ffmpeg-core.wasm",
    "/models/Xenova/clip-vit-base-patch32/onnx/text_model_quantized.onnx"
  ]) {
    const result = await status(base + asset, { headers: { range: "bytes=0-1023" } });
    console.log("COM_" + phase + "_R2_206 path=" + asset + " http=" + result.status);
    if (result.status !== 206 ||
        !/^bytes 0-1023\//.test(result.headers.get("content-range") || "")) {
      throw Error("COM_" + phase + "_R2_RANGE_FAILURE:" + asset);
    }
  }
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) throw Error("COMMAND_FAILED:" + command + ":" + result.status);
}

const gh = await fetch(
  "https://api.github.com/repos/3078024889/lingxi-quantum/actions/runs/" + runId,
  {
    headers: {
      authorization: "Bearer " + githubToken,
      accept: "application/vnd.github+json",
      "user-agent": "lingxifield-com-verified-canary-release"
    },
    signal: AbortSignal.timeout(20000)
  }
);
if (!gh.ok) throw Error("GITHUB_CANARY_READ_FAILED:" + gh.status);
const canaryRun = await gh.json();
if (canaryRun.head_sha !== expectedSha ||
    canaryRun.status !== "completed" ||
    canaryRun.conclusion !== "success" ||
    canaryRun.name !== "COM unified wallet SASI ToolPass isolated canary (NO PROD ROUTES)" ||
    canaryRun.head_branch !== "release/com-sasi-full-20261108") {
  throw Error("EXACT_COM_CANARY_CI_NOT_SUCCESS");
}
console.log("COM_PINNED_SOURCE_CI_SUCCESS:" + runId + ":" + expectedSha);

await probe("https://" + candidateWorker + ".3078024889.workers.dev", "CANARY", 2);

const zones = await cf("/zones?name=lingxifield.com");
const matchingZones = zones.filter(zone => zone.name === "lingxifield.com" && zone.status === "active");
if (matchingZones.length !== 1) throw Error("CLOUDFLARE_ZONE_NOT_UNAMBIGUOUS");
const zone = matchingZones[0].id;
const routes = await cf("/zones/" + zone + "/workers/routes");
const apex = routes.filter(route => route.pattern === apexPattern);
if (apex.length !== 1 || apex[0].script !== productionWorker) {
  throw Error("PRODUCTION_APEX_WORKER_CHANGED_STOP");
}
const www = routes.filter(route => route.pattern === "www.lingxifield.com/*");
if (www.length !== 1 || www[0].script !== wwwWorker) {
  throw Error("WWW_WILDCARD_CHANGED_STOP");
}

const specialized = {
  "lingxifield.com/api/account/money-admin*": "lingxifield-com-admin-facade",
  "lingxifield.com/api/tools/pass*": "lingxifield-com-admin-facade",
  "lingxifield.com/api/site-announcements*": "lingxifield-com-public-announcements-20261108"
};
for (const [pattern, expectedWorker] of Object.entries(specialized)) {
  const matched = routes.filter(route => route.pattern === pattern);
  if (matched.length !== 1 || matched[0].script !== expectedWorker) {
    throw Error("SPECIAL_PRODUCTION_ROUTE_CHANGED_STOP:" + pattern);
  }
}

const publicFeed = await status("https://lingxifield.com/api/site-announcements");
if (publicFeed.status !== 200) throw Error("COM_PUBLIC_ANNOUNCEMENT_WORKER_NOT_READY");

const baselineProviders = await readProviderFlags("https://lingxifield.com");
console.log("COM_PRODUCTION_PAYMENT_BASELINE " + JSON.stringify(baselineProviders));

const previousVersion = await getActiveVersion();
console.log("COM_PRODUCTION_PREVIOUS_VERSION_PINNED=" + previousVersion);

const currentSettings = await cf(
  "/accounts/" + account + "/workers/scripts/" + productionWorker + "/settings"
);
const currentBindings = currentSettings.bindings || [];
const preservedValueTypes = new Set(["plain_text", "secret_text", "secret_key"]);
const unknownBindings = currentBindings.filter(binding => {
  if (preservedValueTypes.has(binding.type)) return false;
  if (binding.type === "assets") return binding.name === "ASSETS";
  if (binding.type === "r2_bucket") {
    return binding.name !== "LINGXI_PUBLIC_LARGE_R2" ||
      binding.bucket_name !== "lingxifield-com-large-public";
  }
  if (binding.type === "service") {
    return binding.name !== "LINGXI_COM_LEGACY_GATEWAY" || binding.service !== wwwWorker;
  }
  return true;
});
if (unknownBindings.length) {
  throw Error("PRODUCTION_WORKER_HAS_UNMAPPED_BINDINGS:" +
    unknownBindings.map(binding => binding.name + ":" + binding.type).join(","));
}
console.log("COM_PRODUCTION_BINDING_PREFLIGHT_PASS=" +
  currentBindings.map(binding => binding.name + ":" + binding.type).join(","));

const baseConfig = JSON.parse(await readFile("wrangler.jsonc", "utf8"));
if (baseConfig.name !== "lingxifield-main-global-testonly") {
  throw Error("SOURCE_WORKER_CONFIG_CHANGED");
}
if ((baseConfig.r2_buckets || []).length !== 1 ||
    baseConfig.r2_buckets[0].bucket_name !== "lingxifield-com-large-public") {
  throw Error("R2_BINDING_UNEXPECTED");
}
const productionConfig = {
  ...baseConfig,
  name: productionWorker,
  workers_dev: false,
  keep_vars: true,
  upload_source_maps: false,
  services: [{
    binding: "LINGXI_COM_LEGACY_GATEWAY",
    service: wwwWorker
  }]
};
delete productionConfig.vars;
delete productionConfig.route;
delete productionConfig.routes;
await writeFile("wrangler.production.jsonc", JSON.stringify(productionConfig, null, 2) + "\n", "utf8");
const checkedConfig = JSON.parse(await readFile("wrangler.production.jsonc", "utf8"));
if (checkedConfig.name !== productionWorker ||
    checkedConfig.workers_dev !== false ||
    checkedConfig.vars ||
    checkedConfig.routes ||
    checkedConfig.route ||
    checkedConfig.keep_vars !== true ||
    checkedConfig.services?.[0]?.service !== wwwWorker) {
  throw Error("UNSAFE_IN_PLACE_PRODUCTION_CONFIG");
}
console.log("COM_PRODUCTION_CONFIG_PRESERVES_DASHBOARD_VARS_SECRETS_AND_SERVICE_BINDING");

let deploymentChanged = false;
let success = false;
try {
  run("pnpm", [
    "exec", "wrangler", "deploy",
    "--config", "wrangler.production.jsonc",
    "--minify",
    "--no-upload-source-maps",
    "--keep-vars"
  ]);

  const activeVersion = await getActiveVersion();
  if (activeVersion === previousVersion) throw Error("PRODUCTION_DEPLOYMENT_VERSION_DID_NOT_CHANGE");
  deploymentChanged = true;
  console.log("COM_PRODUCTION_WORKER_IN_PLACE_VERSION_DEPLOYED=" + activeVersion);

  const routesAfter = await cf("/zones/" + zone + "/workers/routes");
  const apexAfter = routesAfter.filter(route => route.pattern === apexPattern);
  if (apexAfter.length !== 1 || apexAfter[0].script !== productionWorker) {
    throw Error("PRODUCTION_APEX_ROUTE_NOT_PRESERVED");
  }
  const wwwAfter = routesAfter.filter(route => route.pattern === "www.lingxifield.com/*");
  if (wwwAfter.length !== 1 || wwwAfter[0].script !== wwwWorker) {
    throw Error("WWW_ROUTE_NOT_PRESERVED");
  }

  await probe("https://lingxifield.com", "POSTCUTOVER", 2, baselineProviders);
  const feedAfter = await status("https://lingxifield.com/api/site-announcements");
  if (feedAfter.status !== 200) throw Error("COM_PUBLIC_ANNOUNCEMENTS_POSTCUTOVER_FAILED");

  const wwwPage = await status("https://www.lingxifield.com/siai");
  console.log("COM_WWW_CANONICAL_HTTP_" + wwwPage.status);
  if (wwwPage.status !== 308) throw Error("WWW_CANONICAL_REDIRECT_CHANGED");

  success = true;
  console.log("COM_CELESTIAL_STATIC_ASSETS_ACCOUNT_WALLET_TOOLS_RELEASE_PASS_PRODUCTION");
  console.log("COM_EXISTING_PAYMENT_FLAGS_AND_SECRETS_PRESERVED");
  console.log("COM_PAYMENT_PRIVATE_R2_AND_SELLER_PAYOUTS_REMAIN_FEATURE_GATED");
} catch (error) {
  if (!deploymentChanged) {
    try {
      const activeVersion = await getActiveVersion();
      deploymentChanged = activeVersion !== previousVersion;
    } catch (inspectError) {
      console.error("COM_PRODUCTION_VERSION_INSPECTION_FAILED:" + String(inspectError));
    }
  }
  if (deploymentChanged && !success) {
    console.log("COM_POSTCUTOVER_HEALTH_FAIL_ROLLBACK_BEGIN");
    try {
      run("pnpm", [
        "exec", "wrangler", "rollback", previousVersion,
        "--name", productionWorker,
        "--message", "Automatic rollback: LINGXIFIELD COM post-deploy gate failed"
      ]);
      const restoredVersion = await getActiveVersion();
      if (restoredVersion !== previousVersion) {
        throw Error("ROLLBACK_VERSION_MISMATCH:" + restoredVersion);
      }
      const restoredRoutes = await cf("/zones/" + zone + "/workers/routes");
      const restoredApex = restoredRoutes.filter(route => route.pattern === apexPattern);
      if (restoredApex.length !== 1 || restoredApex[0].script !== productionWorker) {
        throw Error("ROLLBACK_APEX_ROUTE_NOT_PRESERVED");
      }
      console.log("COM_PRODUCTION_VERSION_ROLLBACK_CONFIRMED=" + restoredVersion);
      await probe("https://lingxifield.com", "ROLLBACK", 2, baselineProviders);
    } catch (rollbackError) {
      console.error("COM_PRODUCTION_ROLLBACK_FAILED_MANUAL_ACTION_REQUIRED:" + String(rollbackError));
      process.exitCode = 2;
    }
  }
  throw error;
}
