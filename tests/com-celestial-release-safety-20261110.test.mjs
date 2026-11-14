import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = path => readFileSync(path, "utf8");

test("isolated candidate is a different Worker from the current production apex", () => {
  const workflow = read(".github/workflows/com-unified-next-isolated-canary-20261108.yml");
  assert.ok(workflow.includes("CANDIDATE_NAME=lingxifield-com-canary-${GITHUB_SHA:0:12}"));
  assert.ok(workflow.includes("cancel-in-progress: true"));
  assert.ok("lingxifield-com-canary-".length + 12 <= 63, "source-scoped Worker names must remain within Cloudflare limits");
  assert.ok(workflow.includes('jq -e --arg production "lingxifield-com-celestial-20261109"'));
  assert.ok(workflow.includes('pattern=="lingxifield.com/*" and .script==$production'));
  assert.ok(workflow.includes("x-lingxi-static-delivery: workers-static-assets"));
  assert.ok(read("scripts/cloudflare/com-celestial-apex-verified-cutover-20261109.mjs").includes("COM_CANARY_PAYMENT_PROVIDER_MUST_REMAIN_DISABLED"));
  assert.doesNotMatch(workflow, /CANDIDATE_NAME: lingxifield-com-celestial-20261109/);
});

test("production promotion updates the existing Worker in-place and preserves current vars and secrets", () => {
  const script = read("scripts/cloudflare/com-celestial-apex-verified-cutover-20261109.mjs");
  assert.ok(script.includes('const productionWorker = "lingxifield-com-celestial-20261109"'));
  assert.ok(script.includes('const candidateWorkerPrefix = "lingxifield-com-canary-"'));
  assert.ok(script.includes("COM_PRODUCTION_PAYMENT_BASELINE"));
  assert.ok(script.includes("COM_PRODUCTION_PAYMENT_FLAGS_CHANGED_DURING_RELEASE"));
  assert.ok(script.includes("json.diagnostics[name].missingCount"));
  assert.ok(script.includes('"--keep-vars"'));
  assert.ok(script.includes("COM_PRODUCTION_CONFIG_PRESERVES_DASHBOARD_VARS_SECRETS_AND_SERVICE_BINDING"));
  assert.ok(script.includes("pattern: apexPattern"));
  assert.ok(script.includes("zone_name: \"lingxifield.com\""));
  assert.ok(script.includes("COM_PRODUCTION_BINDING_PREFLIGHT_PASS"));
  assert.ok(script.includes("PRODUCTION_WORKER_HAS_UNMAPPED_BINDINGS"));
  assert.ok(script.includes("PRODUCTION_WORKER_BINDINGS_UNREADABLE"));
  assert.ok(script.includes('"rollback"'));
  assert.ok(script.includes("previousVersion"));
  assert.ok(script.includes("COM_PRODUCTION_VERSION_ROLLBACK_CONFIRMED"));
  assert.ok(script.includes("PRODUCTION_APEX_WORKER_CHANGED_STOP"));
  assert.ok(script.includes("COM_EXISTING_PAYMENT_FLAGS_AND_SECRETS_PRESERVED"));
  assert.doesNotMatch(script, /method:\s*"PUT"[\s\S]{0,100}workers\/routes/);
});

test("static assets use explicit proxy mappings and do not depend on automatic HTML slash handling", () => {
  const config = JSON.parse(readFileSync("wrangler.jsonc", "utf8"));
  assert.equal(config.assets.html_handling, "none");
  assert.equal(config.assets.not_found_handling, "none");
  const materializer = read("scripts/cloudflare/materialize-static-html-assets-20261110.mjs");
  const patcher = read("scripts/cloudflare/patch-critical-static-html-20261108.mjs");
  assert.match(patcher, /"\/siai":"siai.html"/);
  assert.ok(patcher.includes("COM_PUBLIC_ANONYMOUS_EDGE_ROUTES_ENABLED"));
  const manifest = read("scripts/cloudflare/tool-static-route-manifest-20261110.mjs");
  assert.ok(manifest.includes('new Set(["admin", "pay", "pass"])') || manifest.includes('new Set(["admin","pay","pass"])'));
  assert.ok(manifest.includes('new URL("../../app/tools/", import.meta.url)'));
  assert.ok(manifest.includes("registryRoutesOverriddenByDedicatedPages"));
  assert.ok(materializer.includes("LINGXIFIELD DIRECT STATIC SNAPSHOT REDIRECTS"));
  assert.ok(materializer.includes('route + " /" + target + " 200'));
  assert.ok(materializer.includes("X-Lingxi-Static-Delivery: workers-static-assets"));
  assert.ok(materializer.includes("Content-Security-Policy:"));
  assert.ok(materializer.includes("Strict-Transport-Security:"));
  assert.ok(materializer.includes("loadToolStaticRoutes"));
  assert.match(materializer, /route: "\/siai", source: "siai.html"/);
  const staticRoutes = read("scripts/cloudflare/com-celestial-apex-verified-cutover-20261109.mjs").split("const staticRoutes = new Set([")[1].split("]);")[0];
  assert.match(staticRoutes, /\/siai/);
  assert.match(staticRoutes, /\/robots\.txt/);
  assert.ok(materializer.includes('"/tools/*"'));
  assert.ok(manifest.includes("TOOL_STATIC_SLUG_DUPLICATE"));
  const build = read("scripts/cloudflare/build-com-static-assets-20261110.sh");
  assert.ok(build.includes("tool-static-route-manifest-20261110.mjs --slugs"));
  assert.ok(build.includes("opennextjs-cloudflare build"));
  assert.ok(build.includes("materialize-static-html-assets-20261110.mjs"));
  assert.ok(build.includes("'announcements:announcements'; do"));
});

test("release workflow rebuilds the pinned source and only promotes after exact canary success", () => {
  const workflow = read(".github/workflows/com-unified-verified-apex-release-20261108.yml");
  assert.ok(workflow.includes("COM_PINNED_SASI_RELEASE_TRIGGER"));
  assert.ok(workflow.includes("COM_VERIFIED_CANARY_RUN"));
  assert.ok(workflow.includes("build-com-static-assets-20261110.sh"));
  assert.ok(workflow.includes("com-celestial-apex-verified-cutover-20261109.mjs"));
  const canary=read(".github/workflows/com-unified-next-isolated-canary-20261108.yml");
  assert.ok(canary.includes('async function getText(path)'));
  assert.ok(canary.includes('SEO_ENDPOINT_EXHAUSTED'));
  assert.ok(canary.includes('COM_CANARY_ROUTE_EXHAUSTED'));
  assert.ok(canary.includes('RETIRED_ALIAS_EXHAUSTED'));
  assert.ok(canary.includes('COM_CANARY_CANONICAL_EXHAUSTED'));
  assert.ok(canary.includes("COM_CANARY_ROBOTS_STATIC_ORIGIN_PASS"));
  assert.ok(workflow.includes("pnpm install --frozen-lockfile"));
});

test("COM homepage reference gate accepts Chinese labels while requiring the real external destinations", () => {
  const script = read("scripts/cloudflare/com-celestial-apex-verified-cutover-20261109.mjs");
  const homepage = read("components/HomeGlobalGrowth.tsx");
  assert.ok(script.includes('["JS Widget", "网站嵌入组件"]'));
  assert.ok(script.includes('["Before / After", "使用前后对比"]'));
  assert.ok(script.includes('"/widgets/lingxifield-v1.js"'));
  assert.ok(script.includes('"/discoveries#before-after"'));
  assert.ok(script.includes("const missingAny"));
  assert.ok(script.includes("const missingLinks"));
  assert.ok(homepage.includes('label:"网站嵌入组件"'));
  assert.ok(homepage.includes('label:"使用前后对比"'));
  assert.ok(homepage.includes('href:"/widgets/lingxifield-v1.js"'));
  assert.ok(homepage.includes('href:"/discoveries"'));
});
