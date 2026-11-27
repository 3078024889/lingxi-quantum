#!/usr/bin/env node
import { readFile, readdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import ts from "typescript";

export async function loadToolStaticRoutes() {
  const registryPath = new URL("../../lib/tools/registry.ts", import.meta.url);
  const source = await readFile(registryPath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      removeComments: true
    }
  }).outputText;
  const moduleUrl = "data:text/javascript;base64," +
    Buffer.from(transpiled, "utf8").toString("base64");
  const registry = await import(moduleUrl);
  if (!Array.isArray(registry.TOOLS)) throw Error("TOOL_REGISTRY_EXPORT_MISSING");

  const genericSlugs = registry.TOOLS
    .filter(tool => !tool.dedicatedRoute)
    .map(tool => tool.slug);
  const declaredDedicatedSlugs = registry.TOOLS
    .filter(tool => tool.dedicatedRoute)
    .map(tool => tool.slug);
  const toolsRoot = new URL("../../app/tools/", import.meta.url);
  const excludedDirectories = new Set(["admin", "pay", "pass"]);
  const directSlugs = [];

  for (const entry of await readdir(toolsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith("[") ||
        excludedDirectories.has(entry.name)) continue;
    const slug = entry.name;
    if (!/^[a-z0-9-]+$/.test(slug)) throw Error("TOOL_STATIC_SLUG_INVALID:" + slug);
    let pageSource;
    try {
      pageSource = await readFile(new URL(slug + "/page.tsx", toolsRoot), "utf8");
    } catch (error) {
      if (error?.code === "ENOENT") continue;
      throw error;
    }
    // Redirect-only aliases must stay Worker-first; snapshotting their redirect HTML would shadow Next redirects.
    if (pageSource.includes("redirect(") || pageSource.includes("permanentRedirect(")) {
      console.log("TOOL_STATIC_ROUTE_SKIPPED_REDIRECT_ONLY:" + slug);
      continue;
    }
    if (/(?:cookies\s*\(|headers\s*\(|searchParams|force-dynamic|getServerUser|createServerClient|createAdminClient|SUPABASE_SERVICE_ROLE)/.test(pageSource)) {
      throw Error("TOOL_PAGE_NOT_STATIC_SAFE:" + slug);
    }
    directSlugs.push(slug);
  }

  if (declaredDedicatedSlugs.some(slug => !directSlugs.includes(slug))) {
    throw Error("DEDICATED_TOOL_PAGE_MISSING_FROM_APP_ROUTE");
  }
  const directSlugSet = new Set(directSlugs);
  const registryRoutesOverriddenByDedicatedPages = genericSlugs.filter(slug => directSlugSet.has(slug));
  const genericOnlySlugs = genericSlugs.filter(slug => !directSlugSet.has(slug));
  const slugs = [...genericOnlySlugs, ...directSlugs].sort();
  if (slugs.some(slug => typeof slug !== "string" || !/^[a-z0-9-]+$/.test(slug))) {
    throw Error("TOOL_STATIC_SLUG_INVALID");
  }
  if (new Set(slugs).size !== slugs.length) throw Error("TOOL_STATIC_SLUG_DUPLICATE");

  return slugs.map(slug => ({
    route: "/tools/" + slug,
    source: "tool-" + slug + ".html",
    target: "tools/" + slug + ".html"
  }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const routes = await loadToolStaticRoutes();
  if (process.argv[2] === "--slugs") {
    console.log(routes.map(route => route.route.slice("/tools/".length)).join("\n"));
  } else {
    console.log(JSON.stringify(routes));
  }
}
