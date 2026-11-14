import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const nav = read("../components/Nav.tsx");
const sellerPage = read("../app/sasi/seller/page.tsx");
const workspace = read("../components/SasiOpenMarketplace.tsx");
const listingsApi = read("../app/api/sasi/marketplace/listings/route.ts");
const styles = read("../components/SasiOpenMarketplace.module.css");

test("left navigation opens the seller workspace with the short seller label", () => {
  assert.match(nav, /href:\s*"\/sasi\/seller"/);
  assert.match(nav, /zh:"卖家"/);
  assert.match(nav, /sellerNavNames\[lang\]/);
});
test("seller route is explicitly titled as the seller workspace", () => {
  assert.match(sellerPage, /title:"卖家工作台/);
  assert.match(sellerPage, /SasiOpenMarketplace view="seller"/);
  assert.match(sellerPage, /canonical:"\/sasi\/seller"/);
});
test("seller reference layout contains the hero, four live metrics and three columns", () => {
  assert.match(workspace, /data-testid="seller-workspace-hero"/);
  assert.match(workspace, /data-testid="seller-metrics"/);
  assert.match(workspace, /sellerJoinArt/);
  assert.match(workspace, /sellerWorkspaceGrid/);
  assert.match(workspace, /sellerGuideColumn/);
  assert.match(workspace, /publishedCount/);
  assert.match(workspace, /pendingCount/);
  assert.match(workspace, /format\(cnyGross\)/);
  assert.match(workspace, /自动交付成功率/);
  assert.doesNotMatch(workspace, /99\.6%/);
});
test("real seller operations remain connected to the existing protected APIs", () => {
  for (const endpoint of ["/api/sasi/marketplace/seller","/api/sasi/marketplace/listings","/api/sasi/marketplace/upload-ticket","/api/sasi/marketplace/image-ticket","/api/sasi/marketplace/image-confirm","/api/sasi/marketplace/submit","/api/sasi/marketplace/payouts"]) {
    assert.ok(workspace.includes(endpoint), "missing seller endpoint: " + endpoint);
  }
  assert.match(workspace, /授权或许可文件/);
  assert.match(workspace, /请放入软件 ZIP 包内/);
});
test("seller layout includes desktop density and responsive breakpoints", () => {
  assert.match(styles, /\.sellerWorkspaceGrid\s*\{[^}]*minmax\(240px/);
  assert.match(styles, /\.sellerHeroGlobe/);
  assert.match(styles, /\.sellerJoinShield/);
  assert.match(styles, /@media\s*\(max-width:\s*1360px\)/);
  assert.match(styles, /@media\s*\(max-width:\s*760px\)/);
});

test("published and pending totals come from seller-scoped exact database counts", () => {
  assert.match(listingsApi, /count:"exact",head:true/);
  assert.match(listingsApi, /eq\("seller_id",user\.id\)/);
  assert.match(listingsApi, /eq\("status","published"\)/);
  assert.match(listingsApi, /eq\("status","submitted"\)/);
  assert.match(listingsApi, /counts:sellerCounts/);
  assert.match(workspace, /mineCounts\?\(mineCounts\.published\?\?"—"\)/);
  assert.match(workspace, /mineCounts\?\(mineCounts\.pending\?\?"—"\)/);
  assert.match(listingsApi, /publishedResult\.error\?null/);
});
