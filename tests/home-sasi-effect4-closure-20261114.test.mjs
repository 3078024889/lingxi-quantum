import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("effect-4 homepage layer is loaded and attached to both home routes",()=>{
 const layout=read("app/layout.tsx");
 const home=read("app/page.tsx");
 const localized=read("app/[locale]/page.tsx");
 const css=read("app/home-effect4-20261114.css");
 assert.ok(layout.indexOf("home-sidebar-20261114.css")<layout.indexOf("home-effect4-20261114.css"));
 assert.match(home,/data-home-effect4="20261114"/);
 assert.match(localized,/data-home-effect4="20261114"/);
 assert.match(css,/\.lx-home-fixed-sidebar \.lx11-link\{min-height:41px;font-size:14px!important/);
 assert.match(css,/\.lx-home-fixed-sidebar \.lx11-brand b\{font-size:16px!important/);
 assert.match(css,/-webkit-text-fill-color:#211a58!important/);
 assert.match(css,/\.lx-home-feature-strip\{grid-template-columns:repeat\(6/);
});

test("SASI market and seller pages keep the shared directory compact",()=>{
 assert.match(read("app/sasi/page.tsx"),/<Footer compact\/>/);
 assert.match(read("app/sasi/seller/page.tsx"),/<Footer compact\/>/);
});

test("seller workspace uses approved image artwork instead of legacy vector placeholders",()=>{
 const component=read("components/SasiOpenMarketplace.tsx");
 const styles=read("components/SasiOpenMarketplace.module.css");
 assert.match(component,/sellerHeroArtwork/);
 assert.match(component,/sasi-market-hero-lingxifield\.png/);
 assert.match(component,/sellerJoinArtwork/);
 assert.match(component,/global-scene-20261114\.webp/);
 assert.doesNotMatch(component,/sellerHeroGlobe|sellerHeroTrophy|sellerHeroScreen|sellerHeroCloud|sellerJoinShield|<svg viewBox/);
 assert.match(styles,/\.sellerHeroArtwork\{/);
 assert.match(styles,/\.sellerJoinArtwork\{/);
});

test("CN release package is rebuilt from the exact merged candidate commit",()=>{
 const workflow=read(".github/workflows/cn3194-payment-release-20261110.yml");
 assert.match(workflow,/push:[\s\S]*branches: \[ci\/cn3194-payment-base-20261110\]/);
 assert.match(workflow,/github.event_name != 'pull_request'/);
 assert.equal((workflow.match(/if: github.event_name != 'pull_request'/g)||[]).length,2);
 assert.ok(workflow.includes("ref: ${{ github.event.pull_request.head.sha || github.sha }}"));
 assert.match(workflow,/NO PROD DEPLOY/);
});
