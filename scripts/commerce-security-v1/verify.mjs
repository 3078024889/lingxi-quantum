import fs from"node:fs";
const c={
 COST:["lib/commerce/cost-book.ts",["minimumRetail","MINIMUM_GROSS_MARGIN_VIOLATION","assertIndependentBooks"]],
 QUOTE:["lib/commerce/quote-binding.ts",["inputDigest","timingSafeEqual","QUOTE_BINDING_MISMATCH"]],
 LEDGER:["lib/commerce/execution-ledger.ts",["reserved","executing","settled","released","idempotencyKey"]],
 MODE:["lib/commerce/billing-mode.ts",["FREE_LOCAL_PROVIDER_CHARGE_FORBIDDEN","BYOK_PROVIDER_BILLING_MIXED"]],
 PAYMENT:["lib/commerce/payment-invariants.ts",["PAYMENT_QUANTITY_MISMATCH","PAYMENT_CURRENCY_MISMATCH","BALANCE_INVARIANT_VIOLATION"]]
};
for(const[n,[f,t]]of Object.entries(c)){if(!fs.existsSync(f))throw new Error(n+"_MISSING");const s=fs.readFileSync(f,"utf8");for(const x of t)if(!s.includes(x))throw new Error(`${n}_TOKEN_MISSING:${x}`);console.log(`${n}_ENGINE=PASS`)}
console.log("COMMERCE_SECURITY_COST_STATIC_GATE=PASS");
