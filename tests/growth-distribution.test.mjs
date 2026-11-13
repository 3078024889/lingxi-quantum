import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const feed=read("app/api/public/siai-widget/route.ts");
const freeToolsFeed=read("app/api/public/free-tools-widget/route.ts");
const localFree=read("lib/tools/local-free-tools.ts");
const qr=read("app/api/public/qr-code/route.ts");
const rss=read("app/siai/updates.xml/route.ts");
const widget=read("public/widgets/lingxifield-v1.js");
const portal=read("components/partners/PartnerGrowthPortal.tsx");
const tracking=read("components/SiteVisitTracker.tsx");
const analytics=read("app/api/analytics/visit/route.ts");
const catalog=read("app/siai/catalog-data.ts");
const partnersPage=read("app/partners/page.tsx");

test("partner JS is syntactically valid and can run without framing the origin",()=>{
 assert.doesNotThrow(()=>new Function(widget));
 assert.match(widget,/attachShadow\(\{mode:"open"\}\)/);
 assert.match(widget,/data-lx-widget/);
 assert.match(widget,/api\/public\/free-tools-widget/);
 assert.match(widget,/data\.rows\.filter/);
 assert.match(widget,/r\.execution==="local"/);
 assert.match(widget,/credentials:"omit"/);
 assert.match(widget,/textContent/);
 assert(!widget.includes("innerHTML="));
 assert(!widget.includes("document.write("));
 assert(!widget.includes("localStorage"));
});

test("free tools distribution includes only anonymous local and non-paid catalogue tools",()=>{
 assert.match(freeToolsFeed,/publicToolSurface\(\)/);
 assert.match(freeToolsFeed,/isAnonymousLocalTool/);
 assert.match(freeToolsFeed,/Access-Control-Allow-Origin/);
 assert.match(freeToolsFeed,/Cache-Control/);
 assert.match(freeToolsFeed,/execution:"local"/);
 assert.match(freeToolsFeed,/access:"anonymous"/);
 assert.match(localFree,/isPublicPaidToolId/);
 assert.match(localFree,/tool\.localOnly/);
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
 assert.match(portal,/standard\("free-tools"\)/);
 assert.match(portal,/freeToolsInfo/);
 assert.match(partnersPage,/anonymous free local-tools directory/);
 assert.match(partnersPage,/SIAI, Free Local Tools & QR Widgets/);
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

test("Chrome SIAI finder remains limited to one first-party feed and no browsing privileges",()=>{
 const manifest=JSON.parse(read("integrations/chrome/siai-finder/manifest.json"));
 const popup=read("integrations/chrome/siai-finder/popup.js");
 const page=read("integrations/chrome/siai-finder/popup.html");
 assert.equal(manifest.manifest_version,3);
 assert.deepEqual(manifest.host_permissions,["https://lingxifield.com/*"]);
 assert.deepEqual(manifest.permissions||[],[]);
 assert.doesNotThrow(()=>new Function(popup));
 assert.match(popup,/api\/public\/siai-widget/);
 assert(!/chrome\.(tabs|history|webRequest|scripting|cookies)/.test(popup));
 assert.match(page,/<script src="popup.js" defer><\/script>/);
 assert(!page.includes("<script src=\"https:"));
});


test("WordPress installer is generated before build from an explicit local allowlist",()=>{
 const pkg=JSON.parse(read("package.json"));
 const builder=read("scripts/prepare-wordpress-plugin.cjs");
 const portal=read("components/partners/PartnerGrowthPortal.tsx");
 assert.match(pkg.scripts.prebuild,/prepare-wordpress-plugin\.cjs/);
 assert.match(builder,/require\("jszip"\)/);
 assert.match(builder,/allowed=\[/);
 assert.match(builder,/WORDPRESS_WIDGET_SOURCE_MISMATCH/);
 assert.match(builder,/WORDPRESS_PACKAGE_CONTENTS_MISMATCH/);
 assert(!builder.includes("process.env"));
 assert.match(portal,/lingxifield-siai-wordpress\.zip/);
});

test("WordPress shortcodes sanitize attributes and return output rather than printing",()=>{
 const php=read("integrations/wordpress/lingxifield-widgets/lingxifield-widgets.php");
 assert.match(php,/add_shortcode\('lingxifield_siai'/);
 assert.match(php,/add_shortcode\('lingxifield_qr'/);
 assert.match(php,/add_shortcode\('lingxifield_tools'/);
 assert.match(php,/free-tools/);
 assert.match(php,/add_shortcode\('lingxifield_vendor'/);
 assert.match(php,/esc_attr\(/);
 assert(!php.includes("eval("));
 assert.match(php,/plugins_url\('assets\/lingxifield-v1\.js', __FILE__\)/);
 assert.match(php,/data-api-origin="https:\/\/lingxifield\.com"/);
 assert(!php.includes('src="https://lingxifield.com/widgets/'));
 const bundled=read("integrations/wordpress/lingxifield-widgets/assets/lingxifield-v1.js");
 assert.equal(bundled,widget,"WordPress executable asset must match the reviewed public widget source");
 assert.doesNotThrow(()=>new Function(bundled));
});

test("open developer API is strictly read-only and documents only sourced review facts",()=>{
 const spec=JSON.parse(read("public/siai-openapi.json"));
 assert.equal(spec.openapi,"3.1.0");
 assert(spec.paths["/api/public/siai-widget"]?.get);
 assert(spec.paths["/api/public/free-tools-widget"]?.get);
 assert.equal(spec.components.schemas.FreeToolsDirectory.properties.rows.items.$ref,"#/components/schemas/FreeLocalTool");
 assert(spec.paths["/siai/updates.xml"]?.get);
 for(const methods of Object.values(spec.paths))assert.deepEqual(Object.keys(methods),["get"]);
 assert(!JSON.stringify(spec).includes("source_preview"));
 assert.equal(spec.components.schemas.Directory.properties.rows.items.$ref,"#/components/schemas/Platform");
});

test("vendor applications must pass same-origin and rate-limit gate",()=>{
 const route=read("app/api/vendor/submit/route.ts");
 assert.match(route,/isVendorSameOrigin\(req\)/);
 assert.match(route,/enforceAbuseGuard\(req/);
 assert.match(route,/ipLimit:30/);
 assert.match(route,/return verifiedSubmission\(req\)/);
});

test("growth distribution documentation matches implemented widget boundaries and release status",()=>{
 const guide=read("docs/growth/siai-global-distribution-20261105.md");
 const globalSeo=read("lib/seo/global-seo.ts");
 const toolHub=read("lib/tools/advanced-catalog.ts");
 const config=read("next.config.js");
 assert.match(guide,/data-lx-widget="siai"/);
 assert.ok(!globalSeo.includes('slug:"url-to-video"'));
 assert.ok(!toolHub.includes("/tools/url-to-video"));
 assert.match(guide,/data-lx-widget="tools"/);
 assert.match(guide,/Tool processing does not run inside the partner page/);
 assert.match(guide,/source and build implemented; clean sandbox install pending/);
 assert.match(guide,/prototype\/source and regression tests exist; store submission pending/);
 assert.match(guide,/Local MCP v2 diagnostic server/);
 assert.match(guide,/public route remains disabled\/noindex/);
 assert.match(guide,/Do not claim ChatGPT integration/);
 assert.match(guide,/not an approved WordPress\.org listing/);
 assert.match(config,/frame-ancestors 'self'/);
 assert.match(config,/key: "X-Frame-Options", value: "SAMEORIGIN"/);
});


test("R6/R8 homepage growth engines are real routes, value-first and aligned with the site rail",()=>{
 const growth=read("components/HomeGlobalGrowth.tsx");
 const problem=read("components/HomeProblemHub.tsx");
 const home=read("app/page.tsx");
 const localizedHome=read("app/[locale]/page.tsx");
 const css=read("app/growth-pages.css");
 assert.match(growth,/tag:"STORIES"[^\n]*href:"\/discoveries"/);
 assert.match(growth,/Before \/ After/);
 assert.match(growth,/href:"\/sasi\/seller"/);
 assert.match(growth,/href:"\/sasi\/delivery"/);
 assert.match(growth,/export function HomeToolPassMembership/);
 assert.match(growth,/passValueLead/);
 assert.match(problem,/伏尼契/);
 assert.match(problem,/href:"\/discoveries"/);
 assert.match(problem,/hit\?\.score>0\?hit\.href:'\/tools'/);
 assert.match(home,/HomeProblemHub\/><HomeGlobalGrowth lang="zh"\/><HomeSeoAnswers locale="zh"\/><HomeToolPassMembership\/><Footer/);
 assert.match(localizedHome,/HomeProblemHub\/><HomeGlobalGrowth lang=\{locale\}\/><HomeSeoAnswers locale=\{locale\}\/><HomeToolPassMembership\/><Footer/);
 assert.match(css,/--lx-home-gutter/);
 assert.match(css,/\.lx-home-toolpass-wrap/);
 assert.match(css,/\.lx11-footer\.lx-branded-footer\{padding-left:var\(--lx-home-gutter\)/);
});

test("discoveries content is localized, evidence-led and connected to actual file workflows",()=>{
 const hub=read("components/seo/DiscoveriesHub.tsx");
 const zh=read("app/discoveries/page.tsx");
 const localized=read("app/[locale]/discoveries/page.tsx");
 assert.match(hub,/Record<SeoLocale,DiscoveryCopy>/);
 assert.match(hub,/beinecke\.library\.yale\.edu/);
 assert.match(hub,/science\.nasa\.gov\/uap/);
 assert.match(hub,/AARO_Historical_Record_Report_Volume_1_2024\.pdf/);
 assert.match(hub,/unknown writing system/);
 assert.match(hub,/tools\/pdf-compare/);
 assert.match(hub,/id="use-cases"/);
 assert.match(hub,/id="before-after"/);
 assert.match(hub,/DiscoveryShareAction/);
 assert.match(read("components/seo/DiscoveryShareAction.tsx"),/utm_source","discovery_share"/);
 assert.match(read("components/seo/DiscoveryShareAction.tsx"),/utm_campaign","field_notes"/);
 assert.match(zh,/publicPageMetadata\("zh","\/discoveries"/);
 assert.match(localized,/LOCALIZED_LOCALES/);
 assert.match(localized,/publicPageMetadata\(language,"\/discoveries"/);
});

test("discoveries are included in SEO, GEO, sitemap, public analytics and LLM indexes",()=>{
 const geo=read("lib/seo/site-facts.ts");
 const sitemap=read("lib/seo/sitemap-build.ts");
 const visits=read("lib/analytics/public-visit.ts");
 const llmsRoute=read("app/llms.txt/route.ts");
 const full=read("public/llms-full.txt");
 const index=JSON.parse(read("public/search-intent-index.json"));
 assert.match(geo,/discoveries/);
 assert.match(sitemap,/\/discoveries/);
 assert.match(visits,/siai\|tools\|products\|discoveries/);
 assert.match(llmsRoute,/Evidence-led discoveries and content/);
 assert.match(llmsRoute,/Partner distribution and integrations/);
 assert.match(full,/Tool entry points: 124/);
 assert.match(full,/\/discoveries/);
 assert(!full.includes("url-to-video"));
 assert.equal(index.tools,123);
 assert.equal(index.toolEntryPoints,124);
 assert.equal(index.records.length,123*9);
 assert(!JSON.stringify(index).includes("url-to-video"));
});

test("SASI public guide no longer hardcodes a retired Copernicus version or price",()=>{
 const guide=read("app/sasi/delivery/page.tsx");
 assert.match(guide,/哥白尼 SI 当前仅提供源码授权版/);
 assert(!guide.includes("9.5"));
 assert(!guide.includes("6,900"));
 assert.match(guide,/商品详情页会展示购买时的有效版本、价格/);
});

test("result sharing strips private query and hash and carries bounded source attribution",()=>{
 const share=read("components/growth/ResultGrowthActions.tsx");
 assert.match(share,/publicVisitPath\(location\.pathname\)/);
 assert.match(share,/utm_source","result_share"/);
 assert.match(share,/utm_campaign","tool_result"/);
 assert(!share.includes("url:location.href"));
 assert(!share.includes("writeText(location.href)"));
});
