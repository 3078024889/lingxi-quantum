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
test("all 124 SEO tool entries and nine locale paths feed a canonical public sitemap",()=>{
 const slugs=[...seoCatalog.matchAll(/\{slug:"([^"]+)"/g)].map(x=>x[1]);
 assert.equal(slugs.length,124);
 assert.equal(new Set(slugs).size,slugs.length);
 assert.match(sitemap,/GLOBAL_TOOL_CATALOG\.map\(t=>/);
 assert.match(sitemap,/Object\.keys\(SEO_LOCALES\)/);
 assert.match(sitemap,/localePath\(locale,path\)/);
 assert.match(main,/buildSiteSitemap/);
});
test("redirected and private pages do not masquerade as sitemap content",()=>{
 const active=sitemap.match(/for\(const path of (\[[^\n]+\])\)/)?.[1]||"";
 assert(active.includes('"/sasi/image"'));
 for(const redirected of ['"/sasi/drama"','"/sasi/build"','"/ai-knowledge"','"/ai-learning"','"/ai-research"'])
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
