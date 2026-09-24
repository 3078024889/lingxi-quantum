import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const assert=(ok,label)=>{if(!ok)throw new Error("FAIL "+label);console.log("PASS "+label)};
const home=read("components/HomeProblemHub.tsx");
const nav=read("components/Nav.tsx");
const catalog=read("app/products/ProductCatalogClient.tsx");
const account=read("app/account/page.tsx");
const orders=read("app/account/orders/page.tsx");
const page=read("app/page.tsx");
const mw=read("middleware.ts");

for(const bad of ["场域精测","潜意识重塑","一念显化","修炼技术"]){
  assert(!home.includes(bad),"home removed "+bad);
}
assert(!page.includes("一念显化"),"home metadata clean");
assert(!nav.includes('href: "/live-as"')&&!nav.includes('href: "/practice"')&&!nav.includes('href: "/field-tests"'),"nav old products absent");
assert(catalog.includes("免费实用工具")&&catalog.includes("SASI 创作与构建"),"product center current identity");
assert(account.includes("产品中心")&&account.includes("AI Balance")&&account.includes("SASI"),"account practical surface");
assert(!orders.includes("历史服务（已下架）"),"orders no legacy field framing");
assert(mw.includes('"/learn","/glossary"'),"legacy learn system retired");
console.log("V14.43.0 PRACTICAL SASI LIVING FLOW UI=PASS");
