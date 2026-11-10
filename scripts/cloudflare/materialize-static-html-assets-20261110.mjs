#!/usr/bin/env node
// Materialize verified public HTML snapshots at their canonical asset paths.
// Matching requests are served by Workers Static Assets before the Worker runs.
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

function replaceManagedHeaderBlock(existing, block) {
  const start = existing.indexOf(HEADER_BEGIN);
  const end = existing.indexOf(HEADER_END);
  if ((start >= 0) !== (end >= 0) || (start >= 0 && end < start)) {
    throw new Error("STATIC_HEADERS_MANAGED_BLOCK_MALFORMED");
  }
  let preserved = existing;
  if (start >= 0) {
    const after = end + HEADER_END.length;
    preserved = existing.slice(0, start) + existing.slice(after);
  }
  return [preserved.trim(), block].filter(Boolean).join("\n\n") + "\n";
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

  const managedRules = [
    HEADER_BEGIN,
    ...PUBLIC_STATIC_HTML_ROUTES.flatMap(({ route }) => [
      route,
      "  X-Lingxi-Render-Mode: static-edge-verified",
      "  X-Content-Type-Options: nosniff",
      ...(route === "/account" ? ["  Referrer-Policy: no-referrer"] : [])
    ]),
    HEADER_END
  ].join("\n");

  const headers = replaceManagedHeaderBlock(existingHeaders, managedRules);
  await writeFile(headerPath, headers, "utf8");
  const verifiedHeaders = await readFile(headerPath, "utf8");

  for (const { route } of PUBLIC_STATIC_HTML_ROUTES) {
    if (!verifiedHeaders.includes("\n" + route + "\n") &&
        !(route === "/" && verifiedHeaders.startsWith("/\n"))) {
      throw new Error("STATIC_HEADER_ROUTE_MISSING:" + route);
    }
  }
  if (!PUBLIC_STATIC_HTML_ROUTES.some(({ route }) => route === "/account")) {
    throw new Error("STATIC_ACCOUNT_CLIENT_AUTH_SHELL_MISSING");
  }

  console.log("COM_STATIC_ASSET_FIRST_ROUTES_PASS=" + materialized);
  console.log("COM_STATIC_ASSET_ACCOUNT_CLIENT_AUTH_SHELL");
  return { materialized, headerPath };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await materializeStaticHtmlAssets(process.argv[2] || ".open-next/assets");
}
