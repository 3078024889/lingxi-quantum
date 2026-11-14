import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const sitemap=read("lib/seo/sitemap-build.ts");
const seoCatalog=read("lib/seo/global-seo.ts");
const llms=read("app/llms.txt/route.ts");
const publicLlms=read("public/llms.txt");
const main=read("app/sitemap.ts");
const robots=read("app/robots.ts");
const domainPolicy=read("lib/seo/siai-domain-policy.ts");
const metadata=read("lib/seo/search-tool-metadata.ts");
const guide=read("components/seo/ToolFacts.tsx");
const tools=read("components/tools/ToolsHubV11.tsx");
test("124 current catalog entries, 123 non-alias tools and nine locales have canonical indexable paths",()=>{
 const slugs=[...seoCatalog.matchAll(/\{slug:"([^"]+)"/g)].map(x=>x[1]);
 assert.equal(slugs.length,124);
 assert(!slugs.includes("url-to-video"),"retired SASI video creation must not be indexable");
 assert.equal(new Set(slugs).size,slugs.length);
 assert.match(sitemap,/GLOBAL_TOOL_CATALOG\.filter\(t=>t\.slug!==/);
 assert.match(sitemap,/\.map\(t=>/);
 assert.match(sitemap,/Object\.keys\(SEO_LOCALES\)/);
 assert.match(sitemap,/localePath\(locale,path\)/);
 assert.match(main,/buildSiteSitemap/);
});
test("redirected and private pages do not masquerade as sitemap content",()=>{
 const active=sitemap.match(/for\(const path of (\[[^\n]+\])\)/)?.[1]||"";
 assert.match(sitemap,/image-to-pdf-pro/);
 const redirectCfg=read("next.config.js");
 assert.match(redirectCfg,/source: "\/tools\/image-to-pdf-pro"/);
 assert(active.includes('"/sasi/delivery"'));
 assert(!active.includes('"/sasi/image"'),"retired SASI image route must not be indexed");
 assert(!active.includes('"/sasi/marketplace"'),"legacy marketplace root redirects to /sasi");
 assert(!active.includes('"/sasi/seller"'),"seller workspace is not an SEO landing page");
 for(const redirected of ['"/sasi/drama"','"/sasi/build"','"/sasi/connections"','"/sasi/image"','"/ai-knowledge"','"/ai-learning"','"/ai-research"'])
   assert(!active.includes(redirected),redirected+" is a redirect");
 for(const privatePath of ["/account","/checkout","/admin","/share"])
   assert(!active.includes('"'+privatePath+'"'),privatePath+" is private");
 assert.match(sitemap,/CHINA_SITE\+"\/siai"/);
});
test("public tools provide human-readable content, metadata and direct internal links",()=>{
 assert.match(metadata,/toolDescription\(locale, tool\)/);
 assert.match(metadata,/alternates:/);
 assert.match(tools,/list\.map\(item=>/);
 assert.match(tools,/href=\{item\.href\}/);
 assert.match(guide,/SearchIntentFaq/);
 assert.match(guide,/toolTutorialSteps/);
});
test("GEO file provides only canonical public entry links and protects private URLs",()=>{
 assert.match(llms,/GEO_TOOL_SLUGS\.map/);
 assert.match(llms,/GEO_PAGE_IDS\.filter\(id=>id!=='sasi-pricing'\)/);
 assert.match(llms,/fact\.description\} \$\{fact\.com\}/);
 assert.match(llms,/lingxifield\.cn\/siai/);
 assert(!llms.includes("https://lingxifield.cn\u0024{path}"));
 assert(!llms.includes("fact.answer"));
 assert.match(llms,/Do not crawl private share links/);
});

test("public tool titles do not inherit a duplicate LINGXIFIELD brand suffix",()=>{
 const layout=read("app/tools/layout.tsx");
 const searchMetadata=read("lib/seo/search-tool-metadata.ts");
 const dedicated=read("lib/tools/seo.ts");
 assert.match(layout,/template:"%s"/);
 assert.match(searchMetadata,/title:\{absolute:brandedTitle\}/);
 assert.match(dedicated,/title:\{absolute:brandedTitle\}/);
 assert.match(searchMetadata,/LINGXIFIELD\|灵犀场/);
 assert.match(dedicated,/LINGXIFIELD\|灵犀场/);
});
test("language tool paths exclude permanently redirected image-to-pdf alias",()=>{
 const locale=read("app/[locale]/tools/[slug]/page.tsx");
 assert.match(locale,/filter\(tool=>tool\.slug!=="image-to-pdf-pro"\)/);
});
test("search FAQs never claim unverified search demand",()=>{
 const content=read("lib/seo/search-intent-faq.ts");
 assert.match(content,/具体操作和可用功能请以当前页面为准/);
 assert(!content.includes("这些问题来自当前公开搜索结果中反复出现的真实搜索表达"));
});


test("static public LLM index describes the current software marketplace and excludes retired SASI creation modules",()=>{
  assert.match(publicLlms,/SASI Software Marketplace/);
  assert.match(publicLlms,/MT5 EA Source Code & Trading Software/);
  assert.match(publicLlms,/Software Licensing & Automatic Delivery/);
  assert.match(publicLlms,/Developer Software Publishing & Seller Services/);
  for(const slug of ["sasi-software-marketplace","mt5-ea-source-code","software-licensing-delivery","developer-software-publishing"])
    assert(publicLlms.includes("/discover/"+slug),slug);
  assert.doesNotMatch(publicLlms,/AI 短剧|AI Short Drama Generator|网站构建|书本、学习与科研创作/);
  for(const locale of ["en","ja","ko","fr","de","es","pt","ar"])
    assert(publicLlms.includes("https://lingxifield.com/"+locale+"/tools"),locale);
});

test("robots.txt is build-static and selects only the configured allowlisted site origin",()=>{
 assert.ok(robots.includes('export const dynamic = "force-static"'));
 assert.ok(robots.includes("seoSiteForBuild(process.env.NEXT_PUBLIC_SITE_URL)"));
 assert.ok(!robots.includes('from "next/headers"'));
 assert.ok(!robots.includes("await headers()"));
 assert.ok(robots.includes('sitemap:site+"/sitemap.xml"'));
 assert.ok(robots.includes('disallow:["/api/","/admin","/tools/admin","/tools/burn-after-read/","/share/"]'));
 assert.ok(domainPolicy.includes("export function seoSiteForBuild"));
 assert.ok(domainPolicy.includes("CHINA_SITE:PRIMARY_SITE"));
});


test("homepage, localized SEO/GEO pages and partner distribution share the compact growth visual system",()=>{
 const layout=read("app/layout.tsx");
 const growthShell=read("components/seo/GrowthPageShell.tsx");
 const growthCss=read("app/growth-pages.css");
 const homepage=read("components/HomeProblemHub.tsx");
 const homeAnswers=read("components/HomeSeoAnswers.tsx");
 const partner=read("components/partners/PartnerGrowthPortal.tsx");
 const zhProducts=read("app/products/page.tsx");
 const zhDiscover=read("app/discover/[topic]/page.tsx");
 const sasiMarketCss=read("components/SasiOpenMarketplace.module.css");
 assert.ok(layout.includes('import "./growth-pages.css";'));
 assert.ok(layout.includes('import "./lingxifield-premium-20261109.css";\nimport "./growth-pages.css";'));
 assert.ok(growthShell.includes('className="lx-growth-page"'));
 assert.ok(growthShell.includes('<Nav/>'));
 assert.ok(growthShell.includes('<Footer/>'));
 for(const route of [
  "app/[locale]/discover/[topic]/page.tsx",
  "app/[locale]/tools/page.tsx",
  "app/[locale]/tools/[slug]/page.tsx",
  "app/[locale]/products/page.tsx"
 ]) assert.ok(read(route).includes("GrowthPageShell"),route);
 assert.ok(growthCss.includes("--lx-growth-max:1500px"));
 assert.ok(sasiMarketCss.includes(".container{max-width:1500px;margin:auto}"));
 assert.ok(growthCss.includes(".lx11-page .lx11-wrap"));
 assert.ok(growthCss.includes(".lx-growth-hero"));
 assert.ok(growthCss.includes(".lx-growth-tool-grid"));
 assert.ok(growthCss.includes(".lx-growth-partner-grid"));
 assert.ok(growthCss.includes("@media(max-width:760px)"));
 assert.ok(homepage.includes("SASI 智能软件市场"));
 assert.ok(homepage.includes("100+ 在线工具"));
 assert.ok(zhProducts.includes("GrowthPageShell"));
 assert.ok(zhProducts.includes("ProductDirectory"));
 assert.ok(!zhProducts.includes("ProductCatalogClient"));
 assert.ok(zhDiscover.includes("GrowthPageShell"));
 assert.ok(zhDiscover.includes("TopicSeoJsonLd"));
 assert.ok(homeAnswers.includes("SASI 软件市场"));
 assert.ok(partner.includes("lx-growth-partner-page"));
 assert.ok(partner.includes('standard("free-tools")'));
 assert.ok(read("app/siai/page.tsx").includes("lx-growth-siai-page"));
 assert.ok(read("app/[locale]/siai/page.tsx").includes("lx-growth-siai-page"));
});

test("growth visual shell preserves canonical SEO facts and does not create duplicate product routes",()=>{
 const discover=read("app/[locale]/discover/[topic]/page.tsx");
 const tools=read("app/[locale]/tools/[slug]/page.tsx");
 const products=read("components/seo/ProductDirectory.tsx");
 const facts=read("components/seo/ToolFacts.tsx");
 const faq=read("components/seo/SearchIntentFaq.tsx");
 assert.ok(discover.includes("TopicSeoJsonLd"));
 assert.ok(tools.includes("ToolSeoJsonLd"));
 assert.ok(tools.includes("buildSearchOptimizedToolMetadata"));
 assert.ok(products.includes("GLOBAL_TOOL_CATALOG.map"));
 assert.ok(products.includes("localePath(locale"));
 assert.ok(facts.includes("toolTutorialSteps"));
 assert.ok(facts.includes("toolGeoFact"));
 assert.ok(faq.includes("searchIntentFaq"));
 assert.ok(read("lib/seo/sitemap-build.ts").includes("GLOBAL_TOOL_CATALOG"));
 assert.ok(read("app/llms.txt/route.ts").includes("GEO_TOOL_SLUGS"));
});
