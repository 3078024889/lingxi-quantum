import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const exists=p=>fs.existsSync(path.join(root,p));
const must=(v,m)=>{if(!v)throw new Error(m)};

const required=[
 "lib/seo/global-seo.ts",
 "components/seo/GlobalSeoJsonLd.tsx",
 "app/[locale]/page.tsx",
 "app/[locale]/tools/page.tsx",
 "app/[locale]/tools/[slug]/page.tsx",
 "app/[locale]/discover/[topic]/page.tsx",
 "app/discover/[topic]/page.tsx",
 "public/llms.txt",
 "public/seo-keywords-9lang.json",
 "scripts/seo/indexnow-submit-v216.mjs"
];
for(const p of required)must(exists(p),`SEO_FILE_MISSING:${p}`);

const layout=read("app/layout.tsx");
const home=read("app/page.tsx");
const seo=read("lib/seo/global-seo.ts");
const sitemap=read("app/sitemap.ts");
const robots=read("app/robots.ts");
const mw=read("middleware.ts");
const sd=read("components/SiteStructuredData.tsx");
const llms=read("public/llms.txt");

for(const token of ["PDF","AI 短剧","书本","文档","学习 SASI","科研 SASI","网站与应用构建"])
 must(layout.includes(token),`ROOT_METADATA_SCOPE_MISSING:${token}`);

for(const token of ["PDF","AI 短剧","书本","文档","学习 SASI","科研 SASI"])
 must(home.includes(token),`HOME_METADATA_SCOPE_MISSING:${token}`);

for(const legacy of ["意识显化","潜意识重塑","修炼技术","场域精测","桃花磁场","生命原型"]){
 must(!layout.includes(legacy),`LEGACY_ROOT_METADATA_PRESENT:${legacy}`);
 must(!home.includes(legacy),`LEGACY_HOME_METADATA_PRESENT:${legacy}`);
}

for(const locale of ['"zh"','"en"','"ja"','"ko"','"fr"','"de"','"es"','"pt"','"ar"'])
 must(seo.includes(`${locale}:`)||seo.includes(`"${locale}":`),`SEO_LOCALE_MISSING:${locale}`);

const toolCount=(seo.match(/slug:"/g)||[]).length;
must(toolCount>=60,`SEO_TOOL_CATALOG_TOO_SMALL:${toolCount}`);

must(layout.includes('"x-default":SITE'),"ROOT_X_DEFAULT_MISSING");
for(const lang of ['"zh-CN"','"en"','"ja"','"ko"','"fr"','"de"','"es"','"pt"','"ar"'])
 must(layout.includes(lang),`ROOT_HREFLANG_MISSING:${lang}`);

must(sitemap.includes("GLOBAL_TOOL_CATALOG"),"SITEMAP_TOOL_COVERAGE_MISSING");
must(sitemap.includes("LOCALIZED_LOCALES"),"SITEMAP_LOCALE_COVERAGE_MISSING");
must(sitemap.includes("SEO_TOPICS"),"SITEMAP_SASI_TOPIC_COVERAGE_MISSING");

for(const bot of ["OAI-SearchBot","GPTBot","PerplexityBot","ClaudeBot","Claude-SearchBot","Baiduspider"])
 must(robots.includes(bot),`GEO_BOT_MISSING:${bot}`);

for(const p of ["/practice","/romance","/archetype","/live-as","/declaration"])
 must(mw.includes(p),`RETIRED_410_MISSING:${p}`);

must(sd.includes("AI 短剧生成"),"STRUCTURED_DATA_DRAMA_MISSING");
must(sd.includes("GLOBAL_TOOL_CATALOG"),"STRUCTURED_DATA_TOOL_CATALOG_MISSING");
must(llms.includes("HTTP 410"),"LLMS_RETIRED_POLICY_MISSING");
must(llms.includes("AI short drama"),"LLMS_CURRENT_PRODUCT_MISSING");

console.log(`SEO_GLOBAL_TOOL_CATALOG=${toolCount}`);
console.log("SEO_ROOT_METADATA_SCOPE=PASS");
console.log("SEO_HOME_METADATA_SCOPE=PASS");
console.log("SEO_LEGACY_METADATA_REMOVAL=PASS");
console.log("SEO_9_LANGUAGES=PASS");
console.log("SEO_HREFLANG_ARCHITECTURE=PASS");
console.log("SEO_SITEMAP_GLOBAL_COVERAGE=PASS");
console.log("SEO_GEO_CRAWLER_DISCOVERY=PASS");
console.log("SEO_RETIRED_URL_410_POLICY=PASS");
console.log("SEO_STRUCTURED_DATA=PASS");
console.log("SEO_LLMS_DISCOVERY=PASS");
console.log("AUDIT_SEO_GEO_V2161=PASS");
