import fs from "node:fs";

const read=(p)=>fs.readFileSync(p,"utf8");
const assert=(ok,label)=>{if(!ok)throw new Error(`FAIL ${label}`);console.log(`PASS ${label}`)};

const gate=read("lib/sasi/payment-gate.ts");
const plans=read("lib/plans.ts");
const fulfill=read("lib/fulfill-order.ts");
const wechat=read("app/api/pay/wechat/create/route.ts");
const alipay=read("app/api/pay/alipay/create/route.ts");
const checkout=read("app/checkout/page.tsx");

const sasiIds=[
  "sasi-balance-10","sasi-credit-entry","sasi-balance-50","sasi-credit-studio",
  "sasi-balance-200","sasi-credit-reserve","sasi-balance-1000",
  "sasi-balance-2000","sasi-balance-10000"
];
for(const id of sasiIds){
  assert(plans.includes(`"${id}"`),`plan contains ${id}`);
  assert(gate.includes(`"${id}"`),`payment gate allows ${id}`);
}
assert(gate.includes("SASI_CUSTOM_TOPUP"),"custom SASI topup gate");
assert(gate.includes("amountRmb >= 10 && amountRmb <= 10000"),"custom SASI ¥10–¥10000");

const aiIds=["ai-balance-10","ai-balance-30","ai-balance-50","ai-balance-100","ai-balance-300","ai-balance-500"];
for(const id of aiIds)assert(plans.includes(`"${id}"`),`AI balance plan contains ${id}`);

assert(wechat.includes('product.group === "production"'),"WeChat SASI production gate");
assert(alipay.includes('product.group === "production"'),"Alipay SASI production gate");
assert(alipay.includes('product.group === "ai"'),"Alipay AI balance subject branch");
assert(alipay.includes("灵犀场AI余额充值-"),"Alipay AI balance subject");
assert(fulfill.includes('product.group==="ai"&&product.aiAmountFen'),"AI balance fulfillment");
assert(fulfill.includes('product.group==="production"&&product.sasiAmountFen'),"SASI balance fulfillment");
assert(fulfill.includes("credit_ai_topup"),"AI topup RPC wired");
assert(fulfill.includes("credit_sasi_topup"),"SASI topup RPC wired");
assert(checkout.includes("充值余额长期保留"),"checkout balance semantics");
assert(checkout.includes('product.group !== "ai" && product.group !== "production"'),"balance products bypass unlock redirect");

console.log("V14.20.0 SASI PAYMENT CLOSURE=PASS");
