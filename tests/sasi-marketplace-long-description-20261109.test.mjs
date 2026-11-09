import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read = path => readFileSync(path,"utf8");

test("seller editor, server input and database all cap descriptions at 5,000 characters",()=>{
 const ui=read("components/SasiOpenMarketplace.tsx");
 const api=read("app/api/sasi/marketplace/listings/route.ts");
 const migration=read("supabase/migrations/20261109110500_sasi_market_description_5000.sql");
 assert.match(ui,/maxLength=\{5000\}/);
 assert.match(ui,/description\.length\.toLocaleString/);
 assert.match(api,/description\.length>5000/);
 assert.match(migration,/CHECK \(char_length\(description\) <= 5000\)/);
 assert.doesNotMatch(api,/description\.length>100000/);
 assert.doesNotMatch(ui,/maxLength=\{100000\}/);
 assert.doesNotMatch(migration,/DELETE\s+FROM|TRUNCATE\s+TABLE|DROP\s+TABLE/i);
});

test("long descriptions remain complete on detail pages but public listing responses stay compact",()=>{
 const listings=read("app/api/sasi/marketplace/listings/route.ts");
 const product=read("app/api/sasi/marketplace/product/route.ts");
 const details=read("components/SasiMarketplaceProductDetail.tsx");
 const detailCss=read("components/SasiMarketplaceProductDetail.module.css");
 assert.match(listings,/description:item\.description\.slice\(0,800\)/);
 assert.match(product,/note:r\.description,noteEn:r\.description/);
 assert.match(details,/descriptionOpen\?fullDescription:excerpt/);
 assert.match(detailCss,/white-space:pre-wrap/);
});

test("software branding uses the supplied reference and avoids obsolete shopping language",()=>{
 const landing=read("components/SasiOpenMarketplace.tsx");
 assert.ok(landing.includes('<h1><em>SASI</em> {sasiSoftwareUiText(lang,"智能软件市场","Software Market")'));
 assert.ok(landing.includes("/images/sasi/hero-original.webp"));
 assert.doesNotMatch(landing,/软件商城/);
});
