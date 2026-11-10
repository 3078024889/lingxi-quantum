#!/usr/bin/env node
import { readFile } from "node:fs/promises";
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

  const slugs = registry.TOOLS
    .filter(tool => !tool.dedicatedRoute)
    .map(tool => tool.slug);
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
