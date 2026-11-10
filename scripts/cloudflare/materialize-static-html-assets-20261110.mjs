#!/usr/bin/env node
// Materialize verified public HTML snapshots at canonical URLs using static-asset proxy rules.
// Matching pages are served by Workers Static Assets before the Worker runs.
// /account is a generic client-auth shell; no user-specific data is serialized into its HTML.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

export const PUBLIC_STATIC_HTML_ROUTES = Object.freeze([
  { route: "/", source: "landing.html", target: "index.html" },
  { route: "/siai", source: "siai.html", target: "siai.html" },
  { route: "/tools", source: "tools.html", target: "tools.html" },
  { route: "/tools/pass", source: "tools-pass.html", target: "tools/pass.html" },
  { route: "/ai-wallet", source: "ai-wallet.html", target: "ai-wallet.html" },
  { route: "/account", source: "account-login.html", target: "account.html" },
  { route: "/sasi", source: "sasi.html", target: "sasi.html" },
  { route: "/sasi/marketplace", source: "marketplace.html", target: "sasi/marketplace.html" },
  { route: "/about", source: "about.html", target: "about.html" },
  { route: "/announcements", source: "announcements.html", target: "announcements.html" },
  { route: "/en/siai", source: "en-siai.html", target: "en/siai.html" },
  { route: "/ja/siai", source: "ja-siai.html", target: "ja/siai.html" },
  { route: "/ko/siai", source: "ko-siai.html", target: "ko/siai.html" },
  { route: "/fr/siai", source: "fr-siai.html", target: "fr/siai.html" },
  { route: "/de/siai", source: "de-siai.html", target: "de/siai.html" },
  { route: "/es/siai", source: "es-siai.html", target: "es/siai.html" },
  { route: "/pt/siai", source: "pt-siai.html", target: "pt/siai.html" },
  { route: "/ar/siai", source: "ar-siai.html", target: "ar/siai.html" },
  { route: "/tools/ico-to-png", source: "tool-ico-to-png.html", target: "tools/ico-to-png.html" },
  { route: "/tools/number-base-converter", source: "tool-number-base-converter.html", target: "tools/number-base-converter.html" },
  { route: "/tools/video-watermark-remover", source: "tool-video-watermark-remover.html", target: "tools/video-watermark-remover.html" }
]);

const HEADER_BEGIN = "# BEGIN LINGXIFIELD DIRECT STATIC SNAPSHOT HEADERS";
const HEADER_END = "# END LINGXIFIELD DIRECT STATIC SNAPSHOT HEADERS";
const REDIRECT_BEGIN = "# BEGIN LINGXIFIELD DIRECT STATIC SNAPSHOT REDIRECTS";
const REDIRECT_END = "# END LINGXIFIELD DIRECT STATIC SNAPSHOT REDIRECTS";

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

function assertNoRedirectConflicts(existing, routes) {
  const preserved = stripManagedBlock(existing, REDIRECT_BEGIN, REDIRECT_END);
  const sources = new Set(routes.map(({ route }) => route));
  for (const line of preserved.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const source = trimmed.split(/\s+/)[0];
    if (sources.has(source)) throw new Error("STATIC_REDIRECT_ROUTE_CONFLICT:" + source);
  }
}

export async function materializeStaticHtmlAssets(assetRoot = ".open-next/assets") {
  const snapshotRoot = join(assetRoot, "__lingxi_edge_static__");
  let materialized = 0;

  for (const entry of PUBLIC_STATIC_HTML_ROUTES) {
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

  const routeHeaderRules = PUBLIC_STATIC_HTML_ROUTES.flatMap(({ route, target }) => {
    const paths = [...new Set([route, "/" + target])];
    return paths.flatMap(path => [
      path,
      "  X-Lingxi-Render-Mode: static-edge-verified",
      "  X-Lingxi-Static-Delivery: workers-static-assets",
      ...(route === "/account" ? ["  X-Robots-Tag: noindex, nofollow"] : [])
    ]);
  });

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

  for (const { route, target } of PUBLIC_STATIC_HTML_ROUTES) {
    for (const path of new Set([route, "/" + target])) {
      if (!verifiedHeaders.includes("\n" + path + "\n") &&
          !(path === "/" && verifiedHeaders.startsWith("/\n"))) {
        throw new Error("STATIC_HEADER_ROUTE_MISSING:" + path);
      }
    }
  }
  if (!verifiedHeaders.includes("X-Lingxi-Static-Delivery: workers-static-assets")) {
    throw new Error("STATIC_ASSET_DELIVERY_HEADER_MISSING");
  }

  const redirectPath = join(assetRoot, "_redirects");
  let existingRedirects = "";
  try {
    existingRedirects = await readFile(redirectPath, "utf8");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  assertNoRedirectConflicts(existingRedirects, PUBLIC_STATIC_HTML_ROUTES);
  const managedRedirects = [
    REDIRECT_BEGIN,
    ...PUBLIC_STATIC_HTML_ROUTES.map(({ route, target }) => route + " /" + target + " 200"),
    REDIRECT_END
  ].join("\n");
  const redirects = replaceManagedBlock(existingRedirects, managedRedirects, REDIRECT_BEGIN, REDIRECT_END);
  await writeFile(redirectPath, redirects, "utf8");
  const verifiedRedirects = await readFile(redirectPath, "utf8");

  for (const { route, target } of PUBLIC_STATIC_HTML_ROUTES) {
    if (!verifiedRedirects.split(/\r?\n/).includes(route + " /" + target + " 200")) {
      throw new Error("STATIC_PROXY_RULE_MISSING:" + route);
    }
  }

  console.log("COM_STATIC_ASSET_FIRST_ROUTES_PASS=" + materialized);
  console.log("COM_STATIC_ASSET_DIRECT_PROXY_RULES_PASS=" + PUBLIC_STATIC_HTML_ROUTES.length);
  console.log("COM_STATIC_ASSET_SECURITY_HEADERS_PASS");
  console.log("COM_STATIC_ASSET_ACCOUNT_CLIENT_AUTH_SHELL");
  return { materialized, headerPath, redirectPath };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await materializeStaticHtmlAssets(process.argv[2] || ".open-next/assets");
}
