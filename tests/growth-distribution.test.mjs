import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const feed=read("app/api/public/siai-widget/route.ts");
const qr=read("app/api/public/qr-code/route.ts");
const rss=read("app/siai/updates.xml/route.ts");
const widget=read("public/widgets/lingxifield-v1.js");
const portal=read("components/partners/PartnerGrowthPortal.tsx");
const tracking=read("components/SiteVisitTracker.tsx");
const analytics=read("app/api/analytics/visit/route.ts");
const catalog=read("app/siai/catalog-data.ts");

test("partner JS is syntactically valid and can run without framing the origin",()=>{
 assert.doesNotThrow(()=>new Function(widget));
 assert.match(widget,/attachShadow\(\{mode:"open"\}\)/);
 assert.match(widget,/data-lx-widget/);
 assert.match(widget,/credentials:"omit"/);
 assert.match(widget,/textContent/);
 assert(!widget.includes("innerHTML="));
 assert(!widget.includes("document.write("));
 assert(!widget.includes("localStorage"));
});

test("SIAI distribution excludes research-only candidate records",()=>{
 assert.match(feed,/const \{curated\}=getSiaiDirectoryRows\(\)/);
 assert(!feed.includes("rows:getSiaiDirectoryRows().rows"));
 for(const prop of ["priceSource","freeSource","regionSource","paymentSource"])
  assert(feed.includes(prop),"Evidence gating missing: "+prop);
 assert.match(feed,/Access-Control-Allow-Origin/);
 assert.match(feed,/Cache-Control/);
 assert.match(catalog,/curated\.length!==MARKET_API_PRODUCTS\.length/);
 assert.match(catalog,/new Set\(rows\.map\(r=>r\.id\)\)\.size!==rows\.length/);
 assert(!catalog.includes("curated.length!==32"));
});

test("QR endpoint is bounded and widget forbids private query strings",()=>{
 assert.match(qr,/raw\.length>256/);
 assert.match(qr,/QRCode\.toString/);
 assert.match(widget,/address\.username\|\|address\.password\|\|address\.search\|\|address\.hash/);
 assert.match(widget,/t\[15\]/);
});

test("growth links are attributed but automated browsing and private routes are excluded",()=>{
 assert.match(portal,/data-lx-widget/);
 assert.match(portal,/data-partner/);
 assert.match(tracking,/navigator\.webdriver===true/);
 assert.match(tracking,/utm_source/);
 assert.match(analytics,/utm_campaign/);
 assert.match(analytics,/utm_content/);
 assert.match(read("lib/analytics/public-visit.ts"),/"\/partners"/);
});

test("updates feed is sourced from reviewed records, not false new launches",()=>{
 assert.match(rss,/const \{curated\}=getSiaiDirectoryRows\(\)/);
 assert.match(rss,/safeDate\(row\.checkedAt\)/);
 assert.match(rss,/application\/rss\+xml/);
 assert.match(read("lib/seo/sitemap-build.ts"),/"\/partners"/);
});
