import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const exists=p=>fs.existsSync(path.join(root,p));
const must=(v,m)=>{if(!v)throw new Error(m)};

for(const p of ["app/layout.tsx","app/sitemap.ts","app/robots.ts","middleware.ts","public/llms.txt","components/SiteStructuredData.tsx"])must(exists(p),`SEO_FILE_MISSING:${p}`);

const layout=read("app/layout.tsx");
must(layout.includes("SiteStructuredData"),"STRUCTURED_DATA_NOT_WIRED");
must(!/意识显化|修炼技术|潜意识重塑|桃花磁场/.test(layout),"OLD_BRAND_COPY_IN_LAYOUT");

const sitemap=read("app/sitemap.ts");
for(const current of ["/tools/temp-mail","/tools/burn-after-read","/tools/id-photo-ai","/sasi/drama"])must(sitemap.includes(current),`SITEMAP_CURRENT_ROUTE_MISSING:${current}`);
for(const old of ["/practice","/romance","/archetype","/live-as"])must(!sitemap.includes(`"${old}"`),`SITEMAP_OLD_ROUTE:${old}`);

const middleware=read("middleware.ts");
must(middleware.includes("status:410"),"LEGACY_410_MISSING");
must(middleware.includes("x-robots-tag"),"LEGACY_NOINDEX_HEADER_MISSING");

const robots=read("app/robots.ts");
must(robots.includes("OAI-SearchBot"),"OAI_SEARCH_BOT_RULE_MISSING");
must(robots.includes("Bingbot"),"BING_RULE_MISSING");

const llms=read("public/llms.txt");
must(llms.includes("algorithm-first"),"LLMS_CURRENT_POSITIONING_MISSING");
must(llms.includes("Retired material"),"LLMS_RETIRED_CONTEXT_MISSING");

for(const p of ["app/tools/temp-mail/page.tsx","app/tools/burn-after-read/page.tsx","app/tools/id-photo-ai/page.tsx"]){
 const t=read(p);must(t.includes("ToolVisualStory"),`VISUAL_STORY_NOT_WIRED:${p}`);
}

console.log("SEO_GEO_AUDIT=PASS");
console.log("CURRENT_BRAND_METADATA=PASS");
console.log("SITEMAP_CURRENT_SURFACES=PASS");
console.log("LEGACY_410_POLICY=PASS");
console.log("AI_SEARCH_CRAWLABILITY=PASS");
console.log("LLMS_TXT=PASS");
console.log("TOOL_VISUAL_STORIES=PASS");
