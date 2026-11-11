import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { materializeStaticHtmlAssets, PUBLIC_STATIC_HTML_ROUTES, GEO_STATIC_TOPICS, GEO_STATIC_LOCALES, STATIC_HEADER_PATTERNS, staticHeaderPatternMatches } from "../scripts/cloudflare/materialize-static-html-assets-20261110.mjs";
import { loadToolStaticRoutes } from "../scripts/cloudflare/tool-static-route-manifest-20261110.mjs";

const html = "<!doctype html><html><head><title>LINGXIFIELD</title></head><body>" + "x".repeat(5000) + "</body></html>";
const buildScript = await readFile(new URL("../scripts/cloudflare/build-com-static-assets-20261110.sh", import.meta.url), "utf8");

test("robots static capture command is one valid continued curl invocation", () => {
  const lines = buildScript.split("\n");
  const headerIndex = lines.findIndex(line => line.includes("-H 'X-Forwarded-Proto: https'"));
  assert.ok(headerIndex >= 0, "robots request must include the verified public host");
  assert.ok(lines[headerIndex].endsWith("\\"), "robots curl header line must continue exactly once");
  assert.ok(!lines[headerIndex].endsWith("\\\\"), "robots curl header line must not escape its own continuation");
  assert.match(lines[headerIndex + 1] || "", /^\s*http:\/\/127\.0\.0\.1:8787\/robots\.txt/);
  assert.ok(buildScript.includes("COM_ROBOTS_STATIC_ASSET_CAPTURED"));
});


test("public page snapshots are materialized at canonical asset-first URLs", async () => {
  const root = await mkdtemp(join(tmpdir(), "lingxi-static-assets-"));
  try {
    const snapshotRoot = join(root, "__lingxi_edge_static__");
    const toolRoutes = await loadToolStaticRoutes();
    const allRoutes = [...PUBLIC_STATIC_HTML_ROUTES, ...toolRoutes];
    assert.equal(PUBLIC_STATIC_HTML_ROUTES.some(route => route.route === "/sasi/marketplace"), false,
      "redirect-only marketplace alias must remain Worker-handled");
    for (const topic of GEO_STATIC_TOPICS) {
      for (const locale of GEO_STATIC_LOCALES) {
        const route = locale === "zh" ? `/discover/${topic}` : `/${locale}/discover/${topic}`;
        assert.equal(PUBLIC_STATIC_HTML_ROUTES.some(entry => entry.route === route), true,
          "every localized SASI GEO page must be snapshotted asset-first: " + route);
      }
    }
    for (const retiredTopic of [
      "ai-short-drama-generator", "book-to-ai-agent", "document-ai-agent",
      "learning-ai-agent", "research-ai-agent", "ai-website-builder"
    ]) {
      assert.equal(PUBLIC_STATIC_HTML_ROUTES.some(entry => entry.route.includes(retiredTopic)), false,
        "retired GEO topics must never be published as static assets: " + retiredTopic);
    }
    for (const retired of [
      "/sasi/assemble", "/sasi/build", "/sasi/chat", "/sasi/connections",
      "/sasi/director", "/sasi/drama", "/sasi/image", "/sasi/operator",
      "/sasi/operator/v5", "/sasi/project-dna", "/sasi/series", "/sasi/variants",
      "/ai-knowledge", "/ai-learning", "/ai-research"
    ]) {
      assert.equal(PUBLIC_STATIC_HTML_ROUTES.some(route => route.route === retired), false,
        "retired SASI creation route must never be snapshotted: " + retired);
    }
    const legacyMarket = await readFile(new URL("../app/sasi/marketplace/page.tsx", import.meta.url), "utf8");
    assert.match(legacyMarket, /permanentRedirect\("\/sasi"\)/);
    assert.match(legacyMarket, /index:false/);
    const criticalStaticPatcher = await readFile(new URL("../scripts/cloudflare/patch-critical-static-html-20261108.mjs", import.meta.url), "utf8");
    assert.doesNotMatch(criticalStaticPatcher, /["']\/sasi\/marketplace["']\s*:/,
      "legacy marketplace redirect must not be intercepted by the critical static page map");
    assert.doesNotMatch(criticalStaticPatcher, /marketplace\.html/);
    for (const slug of ["siai", "en/siai", "ja/siai", "ko/siai", "fr/siai", "de/siai", "es/siai", "pt/siai", "ar/siai"]) {
      assert.equal(PUBLIC_STATIC_HTML_ROUTES.some(route => route.route === "/" + slug), true,
        "reviewed source catalogue must be delivered without per-request SSR: /" + slug);
    }
    assert.ok(toolRoutes.length >= 119, "the static manifest must include all dedicated tool pages plus non-overlapping registry-backed generic pages");
    const appTools = await readdir(new URL("../app/tools/", import.meta.url), { withFileTypes: true });
    for (const entry of appTools.filter(item => item.isDirectory() &&
      !["admin", "pay", "pass"].includes(item.name) && !item.name.startsWith("["))) {
      try {
        const pageSource = await readFile(new URL("../app/tools/" + entry.name + "/page.tsx", import.meta.url), "utf8");
        const redirectOnly = pageSource.includes("redirect(") || pageSource.includes("permanentRedirect(");
        assert.equal(toolRoutes.some(route => route.route === "/tools/" + entry.name), !redirectOnly,
          redirectOnly
            ? "redirect-only aliases must remain Worker-handled: " + entry.name
            : "dedicated tool page must be asset-first: " + entry.name);
      } catch (error) {
        if (error?.code !== "ENOENT") throw error;
      }
    }
    const imagePdfAlias = await readFile(new URL("../app/tools/image-to-pdf-pro/page.tsx", import.meta.url), "utf8");
    assert.ok(imagePdfAlias.includes('redirect("/tools/image-to-pdf")'));
    assert.equal(toolRoutes.some(route => route.route === "/tools/image-to-pdf-pro"), false,
      "redirect-only image-to-pdf alias must not be shadowed by a static HTML asset");
    assert.equal(toolRoutes.some(route => route.route === "/tools/admin"), false);
    assert.equal(toolRoutes.some(route => route.route === "/tools/pay"), false);
    assert.equal(toolRoutes.some(route => route.route === "/tools/pass"), false);
    assert.ok(PUBLIC_STATIC_HTML_ROUTES.some(route => route.route === "/tools/pass"));
    await mkdir(snapshotRoot, { recursive: true });
    for (const entry of allRoutes) {
      await writeFile(join(snapshotRoot, entry.source), html + entry.route, "utf8");
    }

    const robotsSite = process.env.NEXT_PUBLIC_SITE_URL === "https://lingxifield.cn" ? "https://lingxifield.cn" : "https://lingxifield.com";
    await writeFile(join(root, "robots.txt"), [
      "User-agent: *",
      "Allow: /",
      "Disallow: /api/",
      "Sitemap: " + robotsSite + "/sitemap.xml",
      "Host: " + robotsSite,
      ""
    ].join("\n"), "utf8");

    const result = await materializeStaticHtmlAssets(root);
    assert.equal(result.materialized, allRoutes.length);

    for (const entry of allRoutes) {
      assert.equal(await readFile(join(root, entry.target), "utf8"), html + entry.route);
    }

    const headers = await readFile(join(root, "_headers"), "utf8");
    for (const entry of allRoutes) {
      for (const path of new Set([entry.route, "/" + entry.target])) {
        assert.ok(STATIC_HEADER_PATTERNS.some(pattern => staticHeaderPatternMatches(pattern, path)),
          path + " must be covered by a grouped static header pattern");
      }
    }
    const newline=String.fromCharCode(10);
    assert.ok(headers.includes([
      "/tools/*",
      "  X-Lingxi-Render-Mode: static-edge-verified",
      "  X-Lingxi-Static-Delivery: workers-static-assets"
    ].join(newline)));
    assert.equal(PUBLIC_STATIC_HTML_ROUTES.some(entry => entry.route === "/account"), true);
    const accountHeaderBlock=[
      "/account",
      "  X-Lingxi-Render-Mode: static-edge-verified",
      "  X-Lingxi-Static-Delivery: workers-static-assets",
      "  Cache-Control: public, max-age=300, stale-while-revalidate=120",
      "  X-Robots-Tag: noindex, nofollow"
    ].join(newline);
    const accountHtmlHeaderBlock=[
      "/account.html",
      "  X-Lingxi-Render-Mode: static-edge-verified",
      "  X-Lingxi-Static-Delivery: workers-static-assets",
      "  Cache-Control: public, max-age=300, stale-while-revalidate=120",
      "  X-Robots-Tag: noindex, nofollow"
    ].join(newline);
    assert.ok(headers.includes(accountHeaderBlock));
    assert.ok(headers.includes(accountHtmlHeaderBlock));
    assert.ok(STATIC_HEADER_PATTERNS.includes("/robots.txt"), "robots.txt must have a bounded static header rule");
    assert.ok(headers.includes([
      "/robots.txt",
      "  X-Lingxi-Render-Mode: static-edge-verified",
      "  X-Lingxi-Static-Delivery: workers-static-assets",
      "  Cache-Control: public, max-age=300, stale-while-revalidate=120"
    ].join(newline)), "robots.txt must be delivered by the static asset layer");
    const headerRuleCount=headers.split(newline).filter(line=>line.trim()&&!line.trim().startsWith("#")&&!line.startsWith(" ")).length;
    assert.ok(headerRuleCount<=100,"Cloudflare _headers rule count must stay at or below 100, got "+headerRuleCount);
    assert.ok(STATIC_HEADER_PATTERNS.includes("/en/discover/*"), "en GEO route must have an explicit Cloudflare header pattern");
    assert.ok(STATIC_HEADER_PATTERNS.includes("/en/discover/*.html"), "en GEO asset must have an explicit Cloudflare header pattern");
    assert.ok(STATIC_HEADER_PATTERNS.includes("/ja/discover/*"), "ja GEO route must have an explicit Cloudflare header pattern");
    assert.ok(STATIC_HEADER_PATTERNS.includes("/ja/discover/*.html"), "ja GEO asset must have an explicit Cloudflare header pattern");
    assert.ok(STATIC_HEADER_PATTERNS.includes("/ko/discover/*"), "ko GEO route must have an explicit Cloudflare header pattern");
    assert.ok(STATIC_HEADER_PATTERNS.includes("/ko/discover/*.html"), "ko GEO asset must have an explicit Cloudflare header pattern");
    assert.ok(STATIC_HEADER_PATTERNS.includes("/fr/discover/*"), "fr GEO route must have an explicit Cloudflare header pattern");
    assert.ok(STATIC_HEADER_PATTERNS.includes("/fr/discover/*.html"), "fr GEO asset must have an explicit Cloudflare header pattern");
    assert.ok(STATIC_HEADER_PATTERNS.includes("/de/discover/*"), "de GEO route must have an explicit Cloudflare header pattern");
    assert.ok(STATIC_HEADER_PATTERNS.includes("/de/discover/*.html"), "de GEO asset must have an explicit Cloudflare header pattern");
    assert.ok(STATIC_HEADER_PATTERNS.includes("/es/discover/*"), "es GEO route must have an explicit Cloudflare header pattern");
    assert.ok(STATIC_HEADER_PATTERNS.includes("/es/discover/*.html"), "es GEO asset must have an explicit Cloudflare header pattern");
    assert.ok(STATIC_HEADER_PATTERNS.includes("/pt/discover/*"), "pt GEO route must have an explicit Cloudflare header pattern");
    assert.ok(STATIC_HEADER_PATTERNS.includes("/pt/discover/*.html"), "pt GEO asset must have an explicit Cloudflare header pattern");
    assert.ok(STATIC_HEADER_PATTERNS.includes("/ar/discover/*"), "ar GEO route must have an explicit Cloudflare header pattern");
    assert.ok(STATIC_HEADER_PATTERNS.includes("/ar/discover/*.html"), "ar GEO asset must have an explicit Cloudflare header pattern");

    // Re-running the materializer is idempotent and does not duplicate its managed header block.
    await materializeStaticHtmlAssets(root);
    const after = await readFile(join(root, "_headers"), "utf8");
    assert.equal(after.split("# BEGIN LINGXIFIELD DIRECT STATIC SNAPSHOT HEADERS").length - 1, 1);
    const redirects = await readFile(join(root, "_redirects"), "utf8");
    for (const entry of allRoutes) {
      assert.ok(redirects.split(/\r?\n/).includes(entry.route + " /" + entry.target + " 200"), entry.route + " must proxy to its exact HTML asset");
    }
    await materializeStaticHtmlAssets(root);
    const redirectsAfter = await readFile(join(root, "_redirects"), "utf8");
    assert.equal(redirectsAfter.split("# BEGIN LINGXIFIELD DIRECT STATIC SNAPSHOT REDIRECTS").length - 1, 1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("invalid HTML snapshots fail closed", async () => {
  const root = await mkdtemp(join(tmpdir(), "lingxi-static-invalid-"));
  try {
    const snapshotRoot = join(root, "__lingxi_edge_static__");
    await mkdir(snapshotRoot, { recursive: true });
    const robotsSite = process.env.NEXT_PUBLIC_SITE_URL === "https://lingxifield.cn" ? "https://lingxifield.cn" : "https://lingxifield.com";
    await writeFile(join(root, "robots.txt"), [
      "User-agent: *",
      "Allow: /",
      "Disallow: /api/",
      "Sitemap: " + robotsSite + "/sitemap.xml",
      "Host: " + robotsSite,
      ""
    ].join("\n"), "utf8");
    await writeFile(join(snapshotRoot, PUBLIC_STATIC_HTML_ROUTES[0].source), "<html>INTERNAL_SERVER_ERROR</html>", "utf8");
    await assert.rejects(() => materializeStaticHtmlAssets(root), /BAD_PUBLIC_STATIC_SNAPSHOT/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("wrangler serves direct HTML assets before the Worker and keeps range paths worker-first", async () => {
  const config = JSON.parse(await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8"));
  assert.equal(config.assets.html_handling, "none");
  assert.equal(config.assets.not_found_handling, "none");
  const workerFirst = new Set(config.assets.run_worker_first);
  const toolRoutes = await loadToolStaticRoutes();
  for (const entry of [...PUBLIC_STATIC_HTML_ROUTES, ...toolRoutes]) {
    assert.equal(workerFirst.has(entry.route), false, entry.route + " must remain asset-first");
  }
  assert.ok(workerFirst.has("/*/"), "trailing-slash requests must reach middleware for permanent 308 canonicalization");
  assert.ok(workerFirst.has("/sasi/marketplace"), "legacy marketplace alias must reach the Worker for a real 308 redirect");
  assert.ok(workerFirst.has("/media/ffmpeg-0.12.10/ffmpeg-core.wasm"));
  assert.ok(workerFirst.has("/models/Xenova/clip-vit-base-patch32/onnx/text_model_quantized.onnx"));
});
