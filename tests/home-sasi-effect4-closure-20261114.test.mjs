import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("effect-4 homepage layer is loaded and attached to both home routes",()=>{
 const layout=read("app/layout.tsx");
 const home=read("app/page.tsx");
 const localized=read("app/[locale]/page.tsx");
 const css=read("app/home-afternoon-20261114.css");
 assert.match(layout,/import "\.\/home-afternoon-20261114\.css"/);
 assert.doesNotMatch(layout,/home-sidebar-20261114|home-effect4-20261114|approved-pages-20261114|home-reference-20261114/);
 assert.match(home,/data-home-effect4="20261114"/);
 assert.match(localized,/data-home-effect4="20261114"/);
 assert.ok(home.includes("<Footer compact/>"));
 assert.ok(localized.includes("<Footer compact/>"));
 assert.match(css,/\.lx-home-hero-copy\{[^}]*z-index:2/);
 assert.match(css,/\.lx-home-hero-grid:after\{[^}]*z-index:1/);
 assert.match(css,/-webkit-text-fill-color:currentColor/);
});

test("SASI market and seller pages keep the shared directory compact",()=>{
 assert.match(read("app/sasi/page.tsx"),/<Footer compact\/>/);
 assert.match(read("app/sasi/seller/page.tsx"),/<Footer compact\/>/);
 const footer=read("components/Footer.tsx");
 assert.match(footer,/Footer\(\{compact=false\}/);
 assert.ok(footer.includes('{compact?<details className="lx-footer-directory">'));
});

test("seller workspace uses approved image artwork instead of legacy vector placeholders",()=>{
 const component=read("components/SasiOpenMarketplace.tsx");
 const styles=read("components/SasiOpenMarketplace.module.css");
 assert.match(component,/sellerHeroArtwork/);
 assert.match(component,/global-scene-20261114\.webp/);
 assert.match(component,/sellerJoinArtwork/);
 assert.match(component,/global-scene-20261114\.webp/);
 assert.doesNotMatch(component,/sellerHeroGlobe|sellerHeroTrophy|sellerHeroScreen|sellerHeroCloud|sellerJoinShield|<svg viewBox/);
 assert.match(styles,/\.sellerHeroArtwork\{/);
 assert.match(styles,/\.sellerJoinArtwork\{/);
});
