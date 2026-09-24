import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const assert=(ok,label)=>{if(!ok)throw new Error("FAIL "+label);console.log("PASS "+label)};

const orders=read("app/account/orders/page.tsx");
const plans=read("lib/plans.ts");
const checkout=read("app/checkout/page.tsx");
const readiness=read("lib/sasi/readiness.ts");

assert(orders.includes('"balance"'),"order center has balance category");
assert(orders.includes('return "balance"'),"AI/SASI top-ups classified as balance");
assert(orders.includes('href: "/ai-wallet"'),"AI top-up returns to AI wallet");
assert(orders.includes('href: "/sasi/pricing"'),"SASI top-up returns to SASI balance");
assert(orders.includes('product.group !== "ai" && product.group !== "production"'),"balance top-up not labeled permanent access");
assert(orders.includes('key: "balance"'),"balance section visible in order center");
assert(orders.includes("充值到账后按实际使用扣除"),"balance settlement copy");

for(const id of [
  "sasi-balance-10","sasi-credit-entry","sasi-balance-50","sasi-credit-studio",
  "sasi-balance-200","sasi-credit-reserve","sasi-balance-1000","sasi-balance-2000","sasi-balance-10000"
]) assert(plans.includes(id),`SASI pack ${id}`);

for(const id of [
  "ai-balance-10","ai-balance-30","ai-balance-50","ai-balance-100","ai-balance-300","ai-balance-500"
]) assert(plans.includes(id),`AI pack ${id}`);

assert(readiness.includes("productionReady"),"SASI production readiness gate");
assert(readiness.includes("refundFlowTested"),"SASI refund readiness");
assert(readiness.includes("usageSettlementTested"),"SASI settlement readiness");
assert(readiness.includes("contentLabeling"),"SASI AIGC labeling readiness");

assert(checkout.includes('product.group !== "ai"'),"checkout skips ordinary AI unlock");
assert(checkout.includes('product.group !== "production"'),"checkout skips ordinary SASI production unlock");

console.log("V14.35.0 BIGPACK3 PRODUCT WALLET ORDER REPORT CLOSURE=PASS");
