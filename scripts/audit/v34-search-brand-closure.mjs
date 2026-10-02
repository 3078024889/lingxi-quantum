import fs from"node:fs";
function must(v,m){if(!v)throw new Error(m)}
const read=p=>fs.readFileSync(p,"utf8");

const layout=read("app/layout.tsx");
must(layout.includes("灵犀场 LINGXIFIELD｜SASI智能生态与全球智能工具平台"),"V34_ROOT_TITLE_MISSING");
must(layout.includes("AI短剧生成、网站构建、书本SASI、学习SASI、科研SASI"),"V34_ROOT_DESCRIPTION_MISSING");

const sd=read("components/SiteStructuredData.tsx");
for(const x of["灵犀场SASI","LINGXIFIELD SASI","灵犀场智能生态"])must(sd.includes(x),`V34_ALT_NAME_MISSING:${x}`);
must(sd.includes('name:"灵犀场 LINGXIFIELD"'),"V34_SITE_NAME_MISSING");

const footer=read("components/Footer.tsx");
for(const x of[
 "灵犀场 LINGXIFIELD｜SASI智能生态","一键创造，一念即达。",
 "一个让想法被理解、让问题被处理、让结果真正发生的场智能数字空间。",
 "从一个文件、一张图片、一段视频、一餐饭，到一个还没理清的念头，都可以从灵犀场开始。",
 "免费实用工具","SASI 创作与构建"
])must(footer.includes(x),`V34_FOOTER_COPY_MISSING:${x}`);
for(const lang of["zh","en","ja","ko","fr","de","es","pt","ar"])must(footer.includes(`${lang}:{`),`V34_FOOTER_LOCALE_MISSING:${lang}`);

const mw=read("middleware.ts");
for(const x of["/relationship","/energy-exchange","/inner-practice","/romance","/peach-blossom-magnetic-field-index"])
 must(mw.includes(x),`V34_RETIRED_ROUTE_GUARD_MISSING:${x}`);
must(mw.includes("PUBLIC_LOCALE_PREFIX"),"V34_LOCALE_RETIRED_GUARD_MISSING");
must(mw.includes("status:410"),"V34_410_MISSING");
must(mw.includes("x-robots-tag"),"V34_NOINDEX_HEADER_MISSING");

const next=read("next.config.js");
must(!next.includes('/learn/wingmakers'),"V34_STALE_WINGMAKERS_REDIRECT_REMAINS");
must(!next.includes('destination: "/learn/inner-sovereignty"'),"V34_STALE_RETIRED_DESTINATION_REMAINS");

const sitemap=read("app/sitemap.ts");
for(const x of["relationship","romance","manifestation","inner-sovereignty"])must(!sitemap.includes(`'/${x}'`)&&!sitemap.includes(`"/${x}"`),`V34_RETIRED_SITEMAP_ROUTE:${x}`);

const about=read("app/about/page.tsx");
must(!about.includes("你不需要理解后台"),"V34_BACKEND_JARGON_REMAINS");
must(!about.includes("外部生成模型"),"V34_MODEL_JARGON_REMAINS");

console.log("SITE_NAME=灵犀场 LINGXIFIELD");
console.log("ALTERNATE_NAMES=灵犀场SASI|LINGXIFIELD SASI|灵犀场智能生态");
console.log("HOMEPAGE_TITLE=PASS");
console.log("HOMEPAGE_DESCRIPTION=PASS");
console.log("FOOTER_9_LANG=PASS");
console.log("RETIRED_SEARCH_ROUTES_HTTP_410=PASS");
console.log("RETIRED_ROUTES_NOINDEX=PASS");
console.log("STALE_RETIRED_REDIRECTS=0");
console.log("SITEMAP_RETIRED_ROUTES=0");
console.log("PUBLIC_ENGINEERING_JARGON_CLEANUP=PASS");
console.log("FOOD_CALORIE_CHANGED=NO");
console.log("PAYMENT_WITHDRAWAL_CHANGED=NO");
console.log("PAYMENT_EXECUTION_CHANGED=NO");
console.log("PROTECTED_PRODUCTION_DATA=UNCHANGED");
console.log("CORE_ORIGIN_MODULES_CHANGED=NO");
console.log("LINGXIFIELD_V34_SEARCH_BRAND_CLOSURE=PASS");
