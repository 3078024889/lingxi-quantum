import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { materializeStaticHtmlAssets, PUBLIC_STATIC_HTML_ROUTES } from "../scripts/cloudflare/materialize-static-html-assets-20261110.mjs";

const html = "<!doctype html><html><head><title>LINGXIFIELD</title></head><body>" + "x".repeat(5000) + "</body></html>";

test("public page snapshots are materialized at canonical asset-first URLs", async () => {
  const root = await mkdtemp(join(tmpdir(), "lingxi-static-assets-"));
  try {
    const snapshotRoot = join(root, "__lingxi_edge_static__");
    await mkdir(snapshotRoot, { recursive: true });
    for (const entry of PUBLIC_STATIC_HTML_ROUTES) {
      await writeFile(join(snapshotRoot, entry.source), html + entry.route, "utf8");
    }

    const result = await materializeStaticHtmlAssets(root);
    assert.equal(result.materialized, PUBLIC_STATIC_HTML_ROUTES.length);

    for (const entry of PUBLIC_STATIC_HTML_ROUTES) {
      assert.equal(await readFile(join(root, entry.target), "utf8"), html + entry.route);
    }

    const headers = await readFile(join(root, "_headers"), "utf8");
    for (const entry of PUBLIC_STATIC_HTML_ROUTES) {
      assert.ok(headers.includes(entry.route + "\n  X-Lingxi-Render-Mode: static-edge-verified"), entry.route + " must receive the static marker");
    }
    assert.equal(PUBLIC_STATIC_HTML_ROUTES.some(entry => entry.route === "/account"), true);
    assert.ok(headers.includes("/account\n  X-Lingxi-Render-Mode: static-edge-verified\n  X-Lingxi-Static-Delivery: workers-static-assets\n  Cache-Control: public, max-age=300, stale-while-revalidate=120\n  X-Robots-Tag: noindex, nofollow"));

    // Re-running the materializer is idempotent and does not duplicate its managed header block.
    await materializeStaticHtmlAssets(root);
    const after = await readFile(join(root, "_headers"), "utf8");
    assert.equal(after.split("# BEGIN LINGXIFIELD DIRECT STATIC SNAPSHOT HEADERS").length - 1, 1);
    const redirects = await readFile(join(root, "_redirects"), "utf8");
    for (const entry of PUBLIC_STATIC_HTML_ROUTES) {
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
  for (const entry of PUBLIC_STATIC_HTML_ROUTES) {
    assert.equal(workerFirst.has(entry.route), false, entry.route + " must remain asset-first");
  }
  assert.ok(workerFirst.has("/*/"), "trailing-slash requests must reach middleware for permanent 308 canonicalization");
  assert.ok(workerFirst.has("/media/ffmpeg-0.12.10/ffmpeg-core.wasm"));
  assert.ok(workerFirst.has("/models/Xenova/clip-vit-base-patch32/onnx/text_model_quantized.onnx"));
});
