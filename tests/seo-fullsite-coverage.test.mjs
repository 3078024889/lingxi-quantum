import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const sitemap=read("lib/seo/sitemap-build.ts");
const seoCatalog=read("lib/seo/global-seo.ts");
const llms=read("app/llms.txt/route.ts");
const main=read("app/sitemap.ts");
const metadata=read("lib/seo/search-tool-metadata.ts");
const guide=read("components/seo/ToolFacts.tsx");
const tools=read("components/tools/ToolsHubV11.tsx");
test("124 catalog entries, 123 non-alias tools and nine locales have canonical indexable paths",()=>{
 const slugs=[...seoCatalog.matchAll(/\{slug:"([^"]+)"/g)].map(x=>x[1]);
 assert.equal(slugs.length,124);
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
