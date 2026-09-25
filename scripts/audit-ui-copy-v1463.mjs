import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const checks=[
  ["footer has no retired product links",!/(href="\/(field-tests|life-map|live-as|subconscious|practice|wealth|tarot|qian|romance|resilience|archetype))/.test(read("components/Footer.tsx"))],
  ["product catalog does not expose readiness engineering state",!read("app/products/ProductCatalogClient.tsx").includes("productionReady")&&!read("app/products/ProductCatalogClient.tsx").includes("api/sasi/readiness")],
  ["home states living field intelligence",read("components/HomeProblemHub.tsx").includes("第三智能体")],
  ["wallet copy talks about user value",read("components/WalletHeroCopy.tsx").includes("不用订阅")],
  ["connections page leads with user outcome",read("app/sasi/connections/page.tsx").includes("把你已经拥有的 AI，接进同一个创作入口")],
];
let failed=false;
for(const [name,ok] of checks){console.log(`${ok?"PASS":"FAIL"} ${name}`);if(!ok)failed=true}
if(failed)process.exit(1);
console.log("V14.63 UI COPY FIRST PASS=PASS");
