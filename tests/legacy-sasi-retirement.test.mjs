import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const report = JSON.parse(readFileSync("docs/operations/legacy-sasi-retirement-20261108.json", "utf8"));
const helperSource = readFileSync("lib/sasi/retired-route.ts", "utf8");
const helper = await import("data:text/javascript;base64," + Buffer.from(helperSource).toString("base64"));

test("retired SASI API endpoints are inert 410 tombstones with no provider or database execution", async () => {
  for (const file of report.retiredRoutes) {
    const source = readFileSync(file, "utf8");
    assert.match(source, /sasiCreationRetired/, file + " must use the shared retirement handler");
    assert.match(source, /export const GET = sasiCreationRetired/, file + " must retire GET");
    assert.match(source, /export const POST = sasiCreationRetired/, file + " must retire POST");
    assert.doesNotMatch(source, /fetch\\s*\\(|createClient|createAdminClient|providerJsonProbe|runAgentRadar|executeSasiPlan/, file + " must not invoke providers or databases");
  }
  for (const method of ["GET", "POST", "PUT", "PATCH", "DELETE"]) {
    const response = helper.sasiCreationRetired();
    assert.equal(response.status, 410, method);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
    assert.deepEqual(await response.json(), { error: "SASI_CREATION_RETIRED", replacement: "/sasi" });
  }
});

test("retired SASI pages are permanent redirects and never render creation modules", () => {
  const pages = [
    "app/sasi/assemble/page.tsx", "app/sasi/build/page.tsx", "app/sasi/chat/page.tsx",
    "app/sasi/connections/page.tsx", "app/sasi/director/page.tsx", "app/sasi/drama/page.tsx",
    "app/sasi/image/page.tsx", "app/sasi/marketplace/page.tsx", "app/sasi/operator/page.tsx",
    "app/sasi/operator/v5/page.tsx", "app/sasi/project-dna/page.tsx", "app/sasi/series/page.tsx",
    "app/sasi/variants/page.tsx", "app/ai-knowledge/page.tsx", "app/ai-learning/page.tsx", "app/ai-research/page.tsx"
  ];
  for (const file of pages) {
    const source = readFileSync(file, "utf8");
    assert.match(source, /permanentRedirect\\(/, file + " must use a server-side permanent redirect");
    assert.match(source, /robots:\\s*\\{\\s*index:\\s*false,\\s*follow:\\s*false\\s*\\}/, file + " must not be indexed");
    assert.doesNotMatch(source, /Sasi(?:OneSurface|UnifiedLauncher|MultiEpisodeWorkspace|SeriesStudio|ChatCreationStudio|VideoAssembler)/, file + " must not import retired creation UI");
  }
  const pricing = readFileSync("app/sasi/pricing/page.tsx", "utf8");
  assert.match(pricing, /permanentRedirect\\("\\/ai-wallet"\\)/);
  const nextConfig = readFileSync("next.config.js", "utf8");
  for (const route of report.redirectAliases) {
    assert.ok(nextConfig.includes('source: "' + route + '"'), "Next redirects must include " + route);
  }
  assert.ok(nextConfig.includes('source: "/sasi/pricing", destination: "/ai-wallet"'));
});

test("deleted legacy source and media are absent from the release tree and manifests", () => {
  for (const file of report.removed) assert.equal(existsSync(file), false, file + " must be removed");
  for (const file of report.alreadyAbsent) assert.equal(existsSync(file), false, file + " must remain absent");
  for (const file of ["LINGXIFIELD_PROTECTED_MANIFEST.json", "LINGXIFIELD_SOURCE_INVENTORY.json"]) {
    const manifest = JSON.parse(readFileSync(file, "utf8"));
    const stale = manifest.files.filter(row => report.removed.includes(row.path) || report.alreadyAbsent.includes(row.path));
    assert.deepEqual(stale, [], file + " must not advertise retired source");
  }
});

test("software marketplace and historical delivery remain available in source", () => {
  for (const file of [
    "app/sasi/page.tsx", "app/sasi/seller/page.tsx", "app/sasi/delivery/page.tsx",
    "app/sasi/marketplace/[id]/page.tsx", "app/sasi/marketplace/admin/page.tsx",
    "app/api/sasi/software/catalog/route.ts", "app/api/sasi/software/download/route.ts",
    "app/api/sasi/marketplace/download/route.ts", "app/api/sasi/marketplace/seller/route.ts",
    "app/api/internal/sasi/market/release-due/route.ts"
  ]) assert.equal(existsSync(file), true, file);
  assert(readFileSync("app/sasi/page.tsx", "utf8").includes("SasiOpenMarketplace"));
  assert(existsSync("app/api/sasi/assets/[id]/inspect/route.ts"), "historical user asset inspection route must remain");
  assert(existsSync("app/api/sasi/generated-assets/[id]/route.ts"), "historical generated file route must remain");
  const config = JSON.parse(readFileSync("vercel.json", "utf8"));
  assert(!config.crons.some(x => x.path === "/api/cron/sasi-v5-radar"));
  assert(config.crons.some(x => x.path === "/api/cron/privacy-cleanup"));
  assert(config.crons.some(x => x.path === "/api/cron/withdrawal-reconcile"));
});
