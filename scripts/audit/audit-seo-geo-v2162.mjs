import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const exists=p=>fs.existsSync(path.join(root,p));
const must=(v,m)=>{if(!v)throw new Error(m)};

const home=read("app/[locale]/page.tsx");
const tools=read("app/[locale]/tools/page.tsx");
must(!home.includes("keywords:c.searchTerms"),"LOCALIZED_HOME_READONLY_KEYWORDS");
must(!tools.includes("keywords:c.searchTerms"),"LOCALIZED_TOOLS_READONLY_KEYWORDS");
must(home.includes("keywords:[...c.searchTerms]"),"LOCALIZED_HOME_MUTABLE_KEYWORDS_MISSING");
must(tools.includes("keywords:[...c.searchTerms]"),"LOCALIZED_TOOLS_MUTABLE_KEYWORDS_MISSING");

const retired=[
 "/learn","/glossary","/live-as","/subconscious","/practice","/field-tests",
 "/life-map","/relationship","/qian","/mirror","/tarot","/resilience","/romance",
 "/daily","/wealth","/archetype","/mini-report","/membership","/origin","/dream",
 "/declaration","/narrative","/gate","/field","/manifestation","/consciousness",
 "/inner-sovereignty","/learn/inner-sovereignty"
];

const mw=read("middleware.ts");
for(const route of retired)must(mw.includes(`"${route}"`),`RETIRED_ROUTE_NOT_410:${route}`);

const sitemap=read("app/sitemap.ts");
const llms=read("public/llms.txt");
const sd=read("components/SiteStructuredData.tsx");
const rootLayout=read("app/layout.tsx");
const homePage=read("app/page.tsx");

const legacyTerms=[
 "意识显化","潜意识重塑","修炼技术","场域精测",
 "桃花磁场","生命原型","生命图谱","量子显化","关系磁场"
];
for(const term of legacyTerms){
 must(!sitemap.includes(term),`LEGACY_TERM_IN_SITEMAP:${term}`);
 must(!sd.includes(term),`LEGACY_TERM_IN_STRUCTURED_DATA:${term}`);
 must(!rootLayout.includes(term),`LEGACY_TERM_IN_ROOT_METADATA:${term}`);
 must(!homePage.includes(term),`LEGACY_TERM_IN_HOME_METADATA:${term}`);
}
must(llms.includes("Legacy")&&llms.includes("HTTP 410"),"LLMS_LEGACY_RETIREMENT_MISSING");

const currentTerms=["AI 短剧","书本","文档","学习 SASI","科研 SASI","PDF"];
for(const term of currentTerms)must(rootLayout.includes(term),`CURRENT_PRODUCT_METADATA_MISSING:${term}`);

console.log("SEO_TYPESCRIPT_READONLY_FIX=PASS");
console.log(`SEO_RETIRED_410_ROUTE_COUNT=${retired.length}`);
console.log("SEO_LEGACY_DISCOVERY_SURFACES_CLEAN=PASS");
console.log("SEO_CURRENT_PRODUCT_SCOPE=PASS");
console.log("AUDIT_SEO_GEO_V2162=PASS");
