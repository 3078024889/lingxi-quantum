import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const assert=(ok,label)=>{if(!ok)throw new Error("FAIL "+label);console.log("PASS "+label)};

const plans=read("lib/plans.ts");
const cat=read("app/products/ProductCatalogClient.tsx");
const explore=read("app/explore/page.tsx");
const nav=read("components/Nav.tsx");
const mw=read("middleware.ts");
const site=read("app/sitemap.ts");
const terms=read("app/terms/page.tsx");
const privacy=read("app/privacy/page.tsx");
const refunds=read("app/refunds/page.tsx");
const account=read("app/account/page.tsx");

assert(plans.includes("export const cultivationProducts: Product[] = [];"),"cultivation products retired");
assert(plans.includes("export const manifestationProducts: Product[] = [];"),"manifestation subscriptions retired");
assert(!plans.includes('id: "life-map-report"'),"field report products removed from sale");
assert(plans.includes("allProducts = [...sasiProductionProducts, ...aiBalanceProducts]"),"sale catalog limited to AI/SASI balances");

for(const forbidden of ["/field-tests","/live-as","/subconscious","/practice"]){
  assert(!nav.includes('href: "'+forbidden+'"'),"nav removed "+forbidden);
}
assert(!cat.includes("life-map-report"),"product center has no legacy field reports");
assert(!explore.includes("/field-tests")&&!explore.includes("/live-as"),"explore rebuilt without retired products");
assert(mw.includes("retiredLegacyPrefixes"),"legacy public routes retired");
assert(!site.includes("/live-as")&&!site.includes("/field-tests")&&!site.includes("/practice"),"sitemap cleaned");
assert(!terms.includes("生命灵签")&&!terms.includes("意识显化"),"terms rewritten");
assert(!privacy.includes("出生时间")&&!privacy.includes("场域精测"),"privacy rewritten");
assert(!refunds.includes("量子生命镜像")&&!refunds.includes("探索体验"),"refunds rewritten");
assert(!account.includes("/live-as")&&!account.includes("/practice"),"account cleaned");

console.log("V14.42.0 LEGACY FIELD PRODUCTS RETIREMENT=PASS");
