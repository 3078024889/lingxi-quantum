import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const assert=(ok,label)=>{if(!ok)throw new Error(`FAIL ${label}`);console.log(`PASS ${label}`)};

const route=read("app/api/sasi/readiness/route.ts");
const product=read("app/products/ProductCatalogClient.tsx");
const sasi=read("app/sasi/page.tsx");
const readiness=read("lib/sasi/readiness.ts");
const gate=read("lib/sasi/payment-gate.ts");

assert(route.includes("sasiPublicReadiness"),"readiness endpoint uses public projection");
assert(route.includes('"Cache-Control": "no-store"'),"readiness endpoint no-store");
assert(!route.includes("process.env"),"readiness endpoint does not expose env");
assert(readiness.includes("productionReady"),"server readiness has productionReady");
assert(readiness.includes("refundFlowTested"),"server readiness includes refund gate");
assert(readiness.includes("usageSettlementTested"),"server readiness includes settlement gate");
assert(readiness.includes("contentLabeling"),"server readiness includes AIGC gate");
assert(product.includes('fetch("/api/sasi/readiness"'),"product center checks real readiness");
assert(product.includes("sasi-balance-10000"),"product center exposes 9-pack ceiling");
assert(product.includes("cursor-not-allowed opacity-40"),"product center disables topups when not ready");
assert(sasi.includes("sasiPublicReadiness"),"SASI landing uses server readiness");
assert(sasi.includes("生产与支付链路已就绪"),"SASI landing ready state");
assert(gate.includes("sasiPaidProductionEnabled"),"existing production gate preserved");

console.log("V14.21.5B SASI READINESS UI=PASS");
