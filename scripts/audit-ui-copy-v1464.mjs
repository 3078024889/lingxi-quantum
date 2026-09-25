import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const checks=[
 ["footer has no retired product links",!/(href="\/(field-tests|life-map|live-as|subconscious|practice|wealth|tarot|qian|romance|resilience|archetype))/.test(read("components/Footer.tsx"))],
 ["product page has no readiness engineering state",!read("app/products/ProductCatalogClient.tsx").includes("productionReady")&&!read("app/products/ProductCatalogClient.tsx").includes("api/sasi/readiness")],
 ["home presents field intelligence in user language",read("components/HomeProblemHub.tsx").includes("第三智能体")],
 ["wallet distinguishes CNY and USD",read("components/AiWalletPanel.tsx").includes("人民币余额")&&read("components/AiWalletPanel.tsx").includes("美元余额")],
 ["USD checkout never claims CNY credit",!read("app/checkout-usd/page.tsx").includes("到账 ¥")&&!read("app/checkout-usd/page.tsx").includes("CNY AI 余额")],
 ["SASI pricing offers true USD balance",read("app/sasi/pricing/page.tsx").includes("美元余额")&&read("app/sasi/pricing/page.tsx").includes("sasi-usd-balance")===false],
];
let failed=false;
for(const [name,ok] of checks){console.log(`${ok?"PASS":"FAIL"} ${name}`);if(!ok)failed=true}
if(failed)process.exit(1);
console.log("V14.64 COPY + CURRENCY AUDIT=PASS");
