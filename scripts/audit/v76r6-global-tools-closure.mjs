import fs from "node:fs";
import path from "node:path";
const root=process.cwd(),read=p=>fs.readFileSync(path.join(root,p),"utf8"),fail=m=>{throw new Error(m)};

const langs=["zh","en","ja","ko","fr","de","es","pt","ar"];
const lingxi=read("lib/lingxi-i18n.ts");
for(const lang of langs)if(!new RegExp(`\\b${lang}\\b`).test(lingxi))fail("LANG_MISSING:"+lang);

const advanced=read("lib/tools/advanced-catalog.ts");
const card=read("lib/tools/card-i18n.ts");
const extra=read("lib/tools/tool-title-extra.ts");
const surface=read("lib/tools/public-surface.ts");
const hub=read("components/tools/ToolsHubV11.tsx");
const site=read("lib/seo/site-domains.ts");
const middleware=read("middleware.ts");
const sitemap=read("app/sitemap.ts");

const advSlugs=[...advanced.matchAll(/href:"\/tools\/([^"]+)"/g)].map(m=>m[1]);
const cardSlugs=[...card.matchAll(/^"([^"]+)":L\(/gm)].map(m=>m[1]);
const extraSlugs=[...extra.matchAll(/^"([^"]+)":L\(/gm)].map(m=>m[1]);
const titleSlugs=new Set([...cardSlugs,...extraSlugs]);
const missingTitles=[...new Set(advSlugs.filter(x=>!titleSlugs.has(x)))];
if(missingTitles.length)fail("9LANG_TITLE_MISSING:"+missingTitles.join(","));
if(!card.includes("extraToolTitle(lang,slug)"))fail("CARD_EXTRA_TITLE_NOT_WIRED");
if(!surface.includes('descEn:""'))fail("NONZH_CHINESE_LEAK_GUARD_MISSING");
if(!hub.includes("PUBLIC_DISPLAY_CATEGORY_BY_HREF"))fail("CATEGORY_SOURCE_OF_TRUTH_NOT_WIRED");

for(const token of ["RECOGNITION","SUBTITLE","TABLE",'category==="video"||category==="audio"','category==="pdf"||category==="sign"']){
 if(!surface.includes(token))fail("CATEGORY_RULE_MISSING:"+token);
}

for(const token of ['PRIMARY_HOST="lingxifield.com"','CHINA_HOST="lingxifield.cn"','canonicalSiteForHost(_host:string){return PRIMARY_SITE}']){
 if(!site.includes(token))fail("DOMAIN_SOURCE_MISSING:"+token);
}
if(!middleware.includes('requestHostname==="lingxifield.cn"'))fail("CN_CANONICAL_HEADER_MISSING");
if(!middleware.includes('www.lingxifield.cn')||!middleware.includes('www.lingxifield.com'))fail("WWW_REDIRECT_MISSING");
if(!sitemap.includes("languageAlternates"))fail("HREFLANG_SITEMAP_MISSING");

const routeRoot=path.join(root,"app","tools");
const routeDirs=fs.readdirSync(routeRoot,{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>x.name);
const missingRoutes=[...new Set(advSlugs.filter(slug=>!routeDirs.includes(slug)))];
if(missingRoutes.length)fail("ADVANCED_ROUTE_MISSING:"+missingRoutes.join(","));

console.log("NINE_LANGUAGE_TOOL_TITLES=PASS");
console.log("NONZH_CHINESE_LEAK_GUARD=PASS");
console.log("TOOL_CATEGORY_SOURCE_OF_TRUTH=PASS");
console.log("DUAL_DOMAIN_COM_CN=PASS");
console.log("WWW_REDIRECTS=PASS");
console.log("CN_CROSS_DOMAIN_CANONICAL=PASS");
console.log("HREFLANG_SITEMAP=PASS");
console.log("ADVANCED_ROUTE_COVERAGE=PASS");
console.log(`ADVANCED_TOOL_COUNT=${new Set(advSlugs).size}`);
console.log("GLOBAL_TOOLS_I18N_DOMAIN_AUDIT=PASS");
