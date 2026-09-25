import fs from "node:fs";
const fail=[];const c=(ok,n)=>{console.log(`${ok?"PASS":"FAIL"} ${n}`);if(!ok)fail.push(n)};
const checkout=fs.readFileSync("app/checkout/page.tsx","utf8");
const usd=fs.readFileSync("app/checkout-usd/page.tsx","utf8");
const orders=fs.readFileSync("app/account/orders/page.tsx","utf8");
const pricing=fs.readFileSync("app/sasi/pricing/page.tsx","utf8");
const css=fs.readFileSync("app/globals.css","utf8");

c(!checkout.includes("life-map-report")&&!checkout.includes("relationship-resonance")&&!checkout.includes("qian-reading")&&!checkout.includes("tarot-reading"),"retired checkout thumbnails removed");
c(!checkout.includes("返回场域订单")&&!checkout.includes("Field Orders")&&!checkout.includes("正在带你去场域订单"),"old field-order wording removed");
c(checkout.includes('zh="确认付款" en="Confirm payment"'),"checkout title user-facing");
c(checkout.includes('name={(product.group==="ai"||product.group==="production")?"wallet":"orders"}'),"checkout uses shared icon system");
c(usd.includes("lx-checkout-usd-card")&&usd.includes('name="wallet" size="title"'),"USD checkout visual unified");
c(orders.includes("lx-order-card")&&orders.includes("lx-order-status"),"orders visual status installed");
c(orders.includes('zh="查看 AI 余额 →"')&&orders.includes('zh="查看 SASI 余额 →"'),"balance links user-facing");
c(pricing.includes("lx-pricing-card")&&pricing.includes('name="sasi" size="title"'),"SASI pricing visual unified");
c(css.includes("V14.81 payments/orders visual"),"payments/orders CSS installed");

if(fail.length){console.error(`V14.81.1_AUDIT_FAILURES=${fail.length}`);fail.forEach((x,i)=>console.error(`${i+1}. ${x}`));process.exit(1)}
console.log("V14.81.1_AUDIT=PASS");
