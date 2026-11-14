#!/usr/bin/env node
// Materialize verified public HTML snapshots at canonical URLs using static-asset proxy rules.
// Matching pages are served by Workers Static Assets before the Worker runs.
// /account is a generic client-auth shell; no user-specific data is serialized into its HTML.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { loadToolStaticRoutes } from "./tool-static-route-manifest-20261110.mjs";

export const GEO_STATIC_TOPICS = Object.freeze([
  "sasi-software-marketplace",
  "mt5-ea-source-code",
  "software-licensing-delivery",
  "developer-software-publishing"
]);
export const GEO_STATIC_LOCALES = Object.freeze(["zh","en","ja","ko","fr","de","es","pt","ar"]);
export const PUBLIC_STATIC_REDIRECTS = Object.freeze([
  { route: "/sasi/marketplace", destination: "/sasi", status: 308 },
  { route: "/sasi/assemble", destination: "/sasi", status: 308 },
  { route: "/sasi/build", destination: "/sasi", status: 308 },
  { route: "/sasi/chat", destination: "/sasi", status: 308 },
  { route: "/sasi/connections", destination: "/sasi", status: 308 },
  { route: "/sasi/director", destination: "/sasi", status: 308 },
  { route: "/sasi/drama", destination: "/sasi", status: 308 },
  { route: "/sasi/image", destination: "/sasi", status: 308 },
  { route: "/sasi/operator", destination: "/sasi", status: 308 },
  { route: "/sasi/operator/v5", destination: "/sasi", status: 308 },
  { route: "/sasi/project-dna", destination: "/sasi", status: 308 },
  { route: "/sasi/series", destination: "/sasi", status: 308 },
  { route: "/sasi/variants", destination: "/sasi", status: 308 },
  { route: "/ai-knowledge", destination: "/sasi", status: 308 },
  { route: "/ai-learning", destination: "/sasi", status: 308 },
  { route: "/ai-research", destination: "/sasi", status: 308 },
  { route: "/sasi/pricing", destination: "/ai-wallet", status: 308 }
]);
const GEO_STATIC_ROUTES = GEO_STATIC_TOPICS.flatMap(topic => [
  { route: `/discover/${topic}`, source: `geo-zh-${topic}.html`, target: `discover/${topic}.html` },
  ...GEO_STATIC_LOCALES.filter(locale => locale !== "zh").map(locale => ({
    route: `/${locale}/discover/${topic}`,
    source: `geo-${locale}-${topic}.html`,
    target: `${locale}/discover/${topic}.html`
  }))
]);
export const PUBLIC_STATIC_HTML_ROUTES = Object.freeze([
  // The reviewed catalogue is sourced from this commit, not a per-request feed.
  // Rebuilds publish the current catalogue to all nine language routes together.
  { route: "/siai", source: "siai.html", target: "siai.html" },
  ...GEO_STATIC_ROUTES,
  ...["en","ja","ko","fr","de","es","pt","ar"].map(locale=>({
    route:`/${locale}/siai`,source:`${locale}-siai.html`,target:`${locale}/siai.html`
  })),
  { route: "/", source: "landing.html", target: "index.html" },
  { route: "/tools", source: "tools.html", target: "tools.html" },
  { route: "/tools/pass", source: "tools-pass.html", target: "tools/pass.html" },
  { route: "/ai-wallet", source: "ai-wallet.html", target: "ai-wallet.html" },
  { route: "/account", source: "account-login.html", target: "account.html" },
  { route: "/sasi", source: "sasi.html", target: "sasi.html" },
  { route: "/about", source: "about.html", target: "about.html" },
  { route: "/announcements", source: "announcements.html", target: "announcements.html" },
]);

const HEADER_BEGIN = "# BEGIN LINGXIFIELD DIRECT STATIC SNAPSHOT HEADERS";
const HEADER_END = "# END LINGXIFIELD DIRECT STATIC SNAPSHOT HEADERS";
const REDIRECT_BEGIN = "# BEGIN LINGXIFIELD DIRECT STATIC SNAPSHOT REDIRECTS";
const REDIRECT_END = "# END LINGXIFIELD DIRECT STATIC SNAPSHOT REDIRECTS";

// Cloudflare Workers Static Assets permits at most 100 _headers rules.
// Group page routes so adding localized GEO pages never adds one rule per page.
export const STATIC_HEADER_PATTERNS = Object.freeze([
  "/", "/index.html",
  "/siai", "/*/siai", "/siai.html", "/*/siai.html",
  "/discover/*", "/discover/*.html",
  "/en/discover/*", "/en/discover/*.html",
  "/ja/discover/*", "/ja/discover/*.html",
  "/ko/discover/*", "/ko/discover/*.html",
  "/fr/discover/*", "/fr/discover/*.html",
  "/de/discover/*", "/de/discover/*.html",
  "/es/discover/*", "/es/discover/*.html",
  "/pt/discover/*", "/pt/discover/*.html",
  "/ar/discover/*", "/ar/discover/*.html",
  "/tools", "/tools/*", "/tools.html", "/tools/*.html",
  "/ai-wallet", "/ai-wallet.html",
  "/account", "/account.html",
  "/sasi", "/sasi.html",
  "/about", "/about.html",
  "/announcements", "/announcements.html",
  "/robots.txt", "/sitemap.xml"
]);

export function staticHeaderPatternMatches(pattern, path) {
  const expression = "^" + pattern.replaceAll(".", "\\.").replaceAll("*", ".*") + "$";
  return new RegExp(expression).test(path);
}

function stripManagedBlock(existing, begin, end) {
  const start = existing.indexOf(begin);
  const finish = existing.indexOf(end);
  if ((start >= 0) !== (finish >= 0) || (start >= 0 && finish < start)) {
    throw new Error("STATIC_MANAGED_BLOCK_MALFORMED");
  }
  if (start < 0) return existing;
  return existing.slice(0, start) + existing.slice(finish + end.length);
}

function replaceManagedBlock(existing, block, begin, end) {
  const preserved = stripManagedBlock(existing, begin, end);
  return [preserved.trim(), block].filter(Boolean).join("\n\n") + "\n";
}

function assertNoRedirectConflicts(existing, routes, redirects) {
  const preserved = stripManagedBlock(existing, REDIRECT_BEGIN, REDIRECT_END);
  const sources = new Set([
    ...routes.map(({ route }) => route),
    ...redirects.map(({ route }) => route)
  ]);
  for (const line of preserved.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const source = trimmed.split(/\s+/)[0];
    if (sources.has(source)) throw new Error("STATIC_REDIRECT_ROUTE_CONFLICT:" + source);
  }
}

export async function materializeStaticHtmlAssets(assetRoot = ".open-next/assets") {
  const snapshotRoot = join(assetRoot, "__lingxi_edge_static__");
  const toolRoutes = await loadToolStaticRoutes();
  const allRoutes = [...PUBLIC_STATIC_HTML_ROUTES, ...toolRoutes];
  const robotsText = await readFile(join(assetRoot, "robots.txt"), "utf8");
  const sitemapText = await readFile(join(assetRoot, "sitemap.xml"), "utf8");
  const buildHost = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://lingxifield.com").hostname.toLowerCase().replace(/^www\./, "");
  if (buildHost !== "lingxifield.com" && buildHost !== "lingxifield.cn") {
    throw new Error("STATIC_ROBOTS_UNTRUSTED_BUILD_ORIGIN:" + buildHost);
  }
  const buildSite = "https://" + buildHost;
  if (!robotsText.includes("Sitemap: " + buildSite + "/sitemap.xml") || !robotsText.includes("Disallow: /api/")) {
    throw new Error("STATIC_ROBOTS_ASSET_CONTENT_INVALID:" + buildSite);
  }
  if (!/<urlset\b/i.test(sitemapText) || !sitemapText.includes(buildSite)) {
    throw new Error("STATIC_SITEMAP_ASSET_CONTENT_INVALID:" + buildSite);
  }
  const requiredSitemapPaths = buildHost === "lingxifield.cn"
    ? ["/siai"]
    : [
        "/discover/sasi-software-marketplace",
        "/discover/mt5-ea-source-code",
        "/discover/software-licensing-delivery",
        "/discover/developer-software-publishing"
      ];
  for (const path of requiredSitemapPaths) {
    if (!sitemapText.includes(buildSite + path)) {
      throw new Error("STATIC_SITEMAP_REQUIRED_PATH_MISSING:" + path);
    }
  }
  if (buildHost === "lingxifield.cn" && sitemapText.includes("https://lingxifield.cn/discover/")) {
    throw new Error("STATIC_CN_SITEMAP_MUST_REMAIN_REGIONAL");
  }
  for (const retired of [
    "ai-short-drama-generator", "book-to-ai-agent", "document-ai-agent",
    "learning-ai-agent", "research-ai-agent", "ai-website-builder"
  ]) {
    if (sitemapText.includes("/discover/" + retired)) {
      throw new Error("STATIC_SITEMAP_RETIRED_TOPIC_PRESENT:" + retired);
    }
  }
  if (new Set(allRoutes.map(route => route.route)).size !== allRoutes.length) {
    throw new Error("PUBLIC_STATIC_ROUTE_DUPLICATE");
  }
  let materialized = 0;

  for (const entry of allRoutes) {
    const sourcePath = join(snapshotRoot, entry.source);
    const targetPath = join(assetRoot, entry.target);
    const html = await readFile(sourcePath, "utf8");
    const bytes = Buffer.byteLength(html);

    if (
      bytes < 4500 ||
      !/<html/i.test(html) ||
      !/<head/i.test(html) ||
      !/<body/i.test(html) ||
      /INTERNAL_SERVER_ERROR|WORKERD_HEALTH_NOT_READY/.test(html)
    ) {
      throw new Error("BAD_PUBLIC_STATIC_SNAPSHOT:" + entry.route);
    }

    await mkdir(dirname(targetPath), { recursive: true });
    let existing = null;
    try {
      existing = await readFile(targetPath, "utf8");
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }

    if (existing !== null && existing !== html) {
      throw new Error("STATIC_ASSET_TARGET_COLLISION:" + entry.target);
    }
    if (existing === null) await writeFile(targetPath, html, "utf8");
    const copied = await readFile(targetPath, "utf8");
    if (copied !== html) throw new Error("STATIC_ASSET_COPY_VERIFY_FAILED:" + entry.route);

    materialized++;
    console.log("COM_STATIC_ASSET_MATERIALIZED:" + entry.route + ":" + entry.target + ":" + bytes);
  }

  const headerPath = join(assetRoot, "_headers");
  let existingHeaders = "";
  try {
    existingHeaders = await readFile(headerPath, "utf8");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  const reportOnlyCsp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://*.googlesyndication.com",
    "script-src-attr 'none'",
    "worker-src 'self' blob:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: https:",
    "connect-src 'self' https: wss:",
    "frame-src 'self' https://www.paypal.com https://www.sandbox.paypal.com https://open.weixin.qq.com https://*.google.com https://*.doubleclick.net https://*.googlesyndication.com https://*.adtrafficquality.google",
    "upgrade-insecure-requests"
  ].join("; ");

  const routeHeaderRules = STATIC_HEADER_PATTERNS.flatMap(path => [
    path,
    "  X-Lingxi-Render-Mode: static-edge-verified",
    "  X-Lingxi-Static-Delivery: workers-static-assets",
    "  Cache-Control: public, max-age=300, stale-while-revalidate=120",
    ...(path === "/account" || path === "/account.html" ? ["  X-Robots-Tag: noindex, nofollow"] : [])
  ]);

  const managedHeaders = [
    HEADER_BEGIN,
    "/*",
    "  Content-Security-Policy: base-uri 'self'; object-src 'none'; frame-ancestors 'self'; script-src-attr 'none'; upgrade-insecure-requests",
    "  Content-Security-Policy-Report-Only: " + reportOnlyCsp,
    "  Cross-Origin-Opener-Policy: same-origin-allow-popups",
    "  Origin-Agent-Cluster: ?1",
    "  X-DNS-Prefetch-Control: off",
    "  X-Frame-Options: SAMEORIGIN",
    "  X-Content-Type-Options: nosniff",
    "  Referrer-Policy: strict-origin-when-cross-origin",
    "  Permissions-Policy: camera=(), microphone=(), geolocation=()",
    "https://lingxifield.com/*",
    "  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload",
    ...routeHeaderRules,
    HEADER_END
  ].join("\n");

  const headers = replaceManagedBlock(existingHeaders, managedHeaders, HEADER_BEGIN, HEADER_END);
  await writeFile(headerPath, headers, "utf8");
  const verifiedHeaders = await readFile(headerPath, "utf8");

  for (const { route, target } of allRoutes) {
    for (const path of new Set([route, "/" + target])) {
      if (!STATIC_HEADER_PATTERNS.some(pattern => staticHeaderPatternMatches(pattern, path))) {
        throw new Error("STATIC_HEADER_PATTERN_MISSING:" + path);
      }
    }
  }
  const newline = String.fromCharCode(10);
  const toolHeaderBlock = [
    "/tools/*",
    "  X-Lingxi-Render-Mode: static-edge-verified",
    "  X-Lingxi-Static-Delivery: workers-static-assets"
  ].join(newline);
  if (!verifiedHeaders.includes(toolHeaderBlock)) {
    throw new Error("STATIC_TOOL_ASSET_DELIVERY_HEADER_MISSING");
  }
  const headerRuleCount = verifiedHeaders.split(newline)
    .filter(line => line.trim() && !line.trim().startsWith("#") && !line.startsWith(" ")).length;
  if (headerRuleCount > 100) {
    throw new Error("CLOUDFLARE_STATIC_HEADERS_RULE_LIMIT_EXCEEDED:" + headerRuleCount);
  }
  console.log("COM_STATIC_HEADER_RULE_COUNT=" + headerRuleCount);

  const redirectPath = join(assetRoot, "_redirects");
  let existingRedirects = "";
  try {
    existingRedirects = await readFile(redirectPath, "utf8");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  assertNoRedirectConflicts(existingRedirects, allRoutes, PUBLIC_STATIC_REDIRECTS);
  const managedRedirects = [
    REDIRECT_BEGIN,
    ...allRoutes.map(({ route, target }) => route + " /" + target + " 200"),
    ...PUBLIC_STATIC_REDIRECTS.map(({ route, destination, status }) => route + " " + destination + " " + status),
    REDIRECT_END
  ].join("\n");
  const redirects = replaceManagedBlock(existingRedirects, managedRedirects, REDIRECT_BEGIN, REDIRECT_END);
  await writeFile(redirectPath, redirects, "utf8");
  const verifiedRedirects = await readFile(redirectPath, "utf8");

  for (const { route, target } of allRoutes) {
    if (!verifiedRedirects.split(/\r?\n/).includes(route + " /" + target + " 200")) {
      throw new Error("STATIC_PROXY_RULE_MISSING:" + route);
    }
  }
  for (const { route, destination, status } of PUBLIC_STATIC_REDIRECTS) {
    if (!verifiedRedirects.split(/\r?\n/).includes(route + " " + destination + " " + status)) {
      throw new Error("STATIC_REDIRECT_RULE_MISSING:" + route);
    }
  }
  console.log("COM_STATIC_LEGACY_REDIRECTS_PASS=" + PUBLIC_STATIC_REDIRECTS.length);

  console.log("COM_STATIC_ASSET_FIRST_ROUTES_PASS=" + materialized);
  console.log("COM_STATIC_TOOL_DETAIL_STATIC_ROUTES_PASS=" + toolRoutes.length);
  console.log("COM_STATIC_ASSET_DIRECT_PROXY_RULES_PASS=" + allRoutes.length);
  console.log("COM_STATIC_ASSET_SECURITY_HEADERS_PASS");
  console.log("COM_STATIC_ASSET_ACCOUNT_CLIENT_AUTH_SHELL");
  return { materialized, headerPath, redirectPath };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await materializeStaticHtmlAssets(process.argv[2] || ".open-next/assets");
}
