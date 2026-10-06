import fs from "node:fs";

const read=p=>fs.readFileSync(p,"utf8");
const json=p=>JSON.parse(read(p));
const must=(ok,code)=>{if(!ok)throw new Error(code)};

const app=json("miniapp/app.json");
const publicDiscovery=[
 "pages/home/index","pages/tools/index","pages/create/index","pages/agents/index",
 "pages/discover-temp-mail/index","pages/discover-burn-after-read/index",
 "pages/discover-image-watermark-remover/index","pages/discover-e-sign-pdf/index"
];
for(const p of publicDiscovery)must(app.pages.includes(p),`V59_MINI_DISCOVERY_PAGE_MISSING:${p}`);
must(app.tabBar.list.length===4,"V59_MINI_PRIMARY_TAB_COUNT");
must(app.tabBar.list.map(x=>x.pagePath).join("|")==="pages/home/index|pages/tools/index|pages/create/index|pages/profile/index","V59_MINI_PRIMARY_TAB_ORDER");

const sitemap=json("miniapp/sitemap.json");
const s=JSON.stringify(sitemap);
must(!s.includes("pages/field/index"),"V59_RETIRED_MINI_SITEMAP_PAGE");
for(const p of publicDiscovery)must(s.includes(p),`V59_MINI_SITEMAP_DISCOVERY_MISSING:${p}`);
must(s.includes('"action":"disallow"')||s.includes('"action": "disallow"'),"V59_MINI_PRIVATE_FALLBACK_MISSING");

const routeMap={
 "discover-temp-mail":["临时邮箱","/tools/temp-mail"],
 "discover-burn-after-read":["阅后即焚","/tools/burn-after-read"],
 "discover-image-watermark-remover":["图片去水印","/tools/image-watermark-remover"],
 "discover-e-sign-pdf":["PDF电子签名","/tools/e-sign-pdf"],
};
for(const [dir,[term,target]] of Object.entries(routeMap)){
 const w=read(`miniapp/pages/${dir}/index.wxml`);
 const j=read(`miniapp/pages/${dir}/index.js`);
 must(w.includes(term),`V59_MINI_NATIVE_TERM_MISSING:${dir}`);
 must(j.includes(target.replaceAll("/","%2F")),`V59_MINI_TOOL_TARGET_MISSING:${dir}`);
}

const layout=read("app/layout.tsx");
must(layout.includes("灵犀场 LINGXIFIELD｜SASI全球多模型智能创作平台"),"V59_CURRENT_BRAND_TITLE_MISSING");
must(!layout.includes("SASI全球多模型智能创作生态平台"),"V59_OLD_BRAND_TITLE_REMAINS");

const page=read("app/page.tsx")+read('lib/public-feature-copy.ts')+read('lib/brand-public-copy.ts');
for(const term of["PDF","图片","SASI全球多模型智能创作平台"])must(page.includes(term),`V59_HOME_DISCOVERY_TERM_MISSING:${term}`);
must(read('lib/public-feature-copy.ts').includes('付费功能会在使用前显示费用'),"V59_PAID_FEATURES_NOT_DISCLOSED");
must(read('app/page.tsx').includes('HomeToolDirectory'),"V59_SERVER_TOOL_LINKS_MISSING");

const robots=read("app/robots.ts");
must(robots.includes("allow:'/'")||robots.includes('allow:"/"'),"V59_ROBOTS_PUBLIC_ALLOW_MISSING");
must(!/OAI-SearchBot[^]*disallow\s*:\s*['"]\/['"]/.test(robots),"V59_OAI_SEARCHBOT_BLOCKED");

const sitemapWeb=read("app/sitemap.ts");
for(const token of["GLOBAL_TOOL_CATALOG","SEO_LOCALES","languageAlternates"])must(sitemapWeb.includes(token),`V59_GLOBAL_SITEMAP_CAPABILITY_MISSING:${token}`);

const jsonld=read("components/seo/GlobalSeoJsonLd.tsx");
for(const token of["WebApplication","FAQPage","BreadcrumbList"])must(jsonld.includes(token),`V59_TOOL_JSONLD_MISSING:${token}`);

const llms=read("app/llms.txt/route.ts");
for(const token of["GEO_TOOL_SLUGS","Sitemap","Privacy"])must(llms.includes(token),`V59_LLMS_DISCOVERY_MISSING:${token}`);

const middleware=read("middleware.ts");
for(const token of["status:410","x-robots-tag","RETIRED_EXACT"])must(middleware.includes(token),`V59_RETIRED_INDEX_EXIT_MISSING:${token}`);

console.log("V59_WECHAT_SITEMAP_TRUTH=PASS");
console.log("V59_WECHAT_NATIVE_TOOL_DISCOVERY=PASS");
console.log("V59_WECHAT_PRIMARY_NAV_4=PASS");
console.log("V59_GLOBAL_HREFLANG_SITEMAP=PASS");
console.log("V59_GLOBAL_TOOL_JSONLD=PASS");
console.log("V59_CHATGPT_SEARCH_CRAWLABLE=PASS");
console.log("V59_RETIRED_INDEX_EXIT=PASS");
console.log("V59_GLOBAL_DISCOVERABILITY=PASS");
