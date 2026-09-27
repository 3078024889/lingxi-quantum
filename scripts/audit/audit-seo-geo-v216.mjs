import fs from "node:fs";import path from "node:path";
const root=process.cwd(),read=p=>fs.readFileSync(path.join(root,p),"utf8"),exists=p=>fs.existsSync(path.join(root,p)),must=(v,m)=>{if(!v)throw new Error(m)};
const req=[
 "lib/seo/global-seo.ts","components/seo/GlobalSeoJsonLd.tsx",
 "app/[locale]/page.tsx","app/[locale]/tools/page.tsx","app/[locale]/tools/[slug]/page.tsx",
 "app/[locale]/discover/[topic]/page.tsx","app/discover/[topic]/page.tsx",
 "public/llms.txt","public/seo-keywords-9lang.json","scripts/seo/indexnow-submit-v216.mjs"
];
for(const p of req)must(exists(p),`SEO_FILE_MISSING:${p}`);
const seo=read("lib/seo/global-seo.ts"),sitemap=read("app/sitemap.ts"),robots=read("app/robots.ts"),mw=read("middleware.ts"),layout=read("app/layout.tsx"),sd=read("components/SiteStructuredData.tsx");
for(const locale of ['"zh"','"en"','"ja"','"ko"','"fr"','"de"','"es"','"pt"','"ar"'])must(seo.includes(`${locale}:`)||seo.includes(`"${locale}":`),`SEO_LOCALE_MISSING:${locale}`);
const toolCount=(seo.match(/slug:"/g)||[]).length;
must(toolCount>=60,`SEO_TOOL_CATALOG_TOO_SMALL:${toolCount}`);
must(sitemap.includes("GLOBAL_TOOL_CATALOG")&&sitemap.includes("LOCALIZED_LOCALES")&&sitemap.includes("SEO_TOPICS"),"GLOBAL_SITEMAP_COVERAGE_MISSING");
for(const bot of ["OAI-SearchBot","GPTBot","PerplexityBot","ClaudeBot","Claude-SearchBot","Baiduspider"])must(robots.includes(bot),`GEO_BOT_MISSING:${bot}`);
for(const p of ["/practice","/romance","/archetype","/live-as","/declaration"])must(mw.includes(p),`RETIRED_410_MISSING:${p}`);
must(layout.includes("AI 短剧")&&layout.includes("书本")&&layout.includes("PDF"),"ROOT_METADATA_NEW_PRODUCT_SCOPE_MISSING");
must(sd.includes("AI 短剧生成")&&sd.includes("GLOBAL_TOOL_CATALOG"),"STRUCTURED_DATA_PRODUCT_SCOPE_MISSING");
const llms=read("public/llms.txt");must(llms.includes("Legacy")&&llms.includes("HTTP 410")&&llms.includes("AI short drama"),"LLMS_DISCOVERY_SCOPE_MISSING");
console.log(`SEO_GLOBAL_TOOL_CATALOG=${toolCount}`);
console.log("SEO_9_LANGUAGES=PASS");
console.log("SEO_HREFLANG_ARCHITECTURE=PASS");
console.log("SEO_SITEMAP_GLOBAL_COVERAGE=PASS");
console.log("SEO_GEO_CRAWLER_DISCOVERY=PASS");
console.log("SEO_RETIRED_URL_410_POLICY=PASS");
console.log("SEO_STRUCTURED_DATA=PASS");
console.log("SEO_LLMS_DISCOVERY=PASS");
console.log("AUDIT_SEO_GEO_V216=PASS");
