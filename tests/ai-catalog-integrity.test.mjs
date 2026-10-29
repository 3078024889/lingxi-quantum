import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const source = readFileSync("lib/ai-discovery/catalog.ts", "utf8");
const match = source.match(/export const aiTools:AITool\[\] = (\[[\s\S]*?\]);/);
assert.ok(match, "Catalog must be parseable");
const tools = JSON.parse(match[1]);

test("AI catalog has unique safe official links", () => {
  const slugs = new Set();
  for (const item of tools) {
    assert.match(item.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(!slugs.has(item.slug), "duplicate slug: " + item.slug);
    slugs.add(item.slug);
    assert.ok(item.name.trim() && item.provider.trim() && item.category.trim());
    const url = new URL(item.url);
    assert.equal(url.protocol, "https:");
    assert.equal(url.username, "");
    assert.equal(url.password, "");
    assert.ok(!["localhost", "127.0.0.1"].includes(url.hostname));
    assert.ok(item.tags.length > 0);
    assert.ok(item.description.trim());
    assert.ok(item.evidenceStatus.trim());
  }
  assert.ok(tools.length >= 30);
});

test("catalog listings do not invent verified popularity or prices", () => {
  for (const item of tools) {
    assert.equal(item.evidenceStatus, "Unverified catalog entry", item.slug);
    assert.equal(item.pricing, "Check official site", item.slug);
  }
});
