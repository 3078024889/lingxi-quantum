import fs from "node:fs";
const p=fs.readFileSync("scripts/patch-v14811.mjs","utf8");
const tests=[
 ["retired payment visuals removed",p.includes("retired checkout thumbnails removed")],
 ["return link old wording replacement exists",p.includes('返回订单与使用记录')&&p.includes('Back to orders')],
 ["success redirect old wording replacement exists",p.includes('正在带你去订单与使用记录')&&p.includes('Taking you to your orders')],
 ["unlock recovery wording replacement exists",p.includes('账户 → 订单与使用记录')],
 ["payment amounts untouched",!p.includes("priceRmb=")&&!p.includes("amountUsd=")&&!p.includes("CREDIT_PACKS=")],
 ["payment API untouched",!p.includes("/api/pay/create")&&!p.includes("/api/pay/wechat")&&!p.includes("/api/pay/alipay")],
 ["orders use shared icon system",p.includes("lx-order-main")&&p.includes("LingxiMiniIcon name={tool")],
 ["no destructive git",!p.includes("reset --hard")&&!p.includes("clean -fd")&&!p.includes("checkout .")],
];
let bad=false;for(const [n,ok] of tests){console.log(`${ok?"PASS":"FAIL"} SELFTEST ${n}`);if(!ok)bad=true}
if(bad)process.exit(1);console.log("V14.81.1_SELFTEST=PASS");
