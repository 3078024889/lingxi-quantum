import fs from "node:fs";
const r=p=>fs.readFileSync(p,"utf8");
const failures=[];
const check=(ok,name)=>{console.log(`${ok?"PASS":"FAIL"} ${name}`);if(!ok)failures.push(name)};

const account=r("app/account/page.tsx");
const orders=r("app/account/orders/page.tsx");
const withdrawals=r("app/account/withdrawals/page.tsx");
const panel=r("components/BalanceWithdrawalPanel.tsx");
const refunds=r("app/refunds/page.tsx");
const knowledgePage=r("app/ai-knowledge/page.tsx");
const knowledge=r("components/KnowledgeWorkspace.tsx");
const registry=r("lib/tools/registry.ts");
const hub=r("components/tools/ToolsHubV11.tsx");
const middleware=r("middleware.ts");

check(account.includes("订单与使用记录"),"account uses user-facing order language");
check(account.includes("余额退款"),"account uses refund language");
check(orders.includes("付款已经返回，正在确认到账"),"orders hide local-order engineering language");
check(orders.includes("statusText(o.status"),"raw order status translated");
check(!orders.includes("无法与本地订单安全匹配"),"orders remove local matching language");
check(withdrawals.includes("灵犀场 · 我的账户"),"withdrawal page uses user language");
check(panel.includes("退款记录"),"withdrawal history uses refund language");
check(!panel.includes("{o.product_id}</span>"),"raw product id hidden");
check(refunds.includes("这笔充值确实属于你的账户"),"refund policy explains outcome");
check(!refunds.includes("钱包流水"),"refund policy removes wallet-ledger jargon");
check(!knowledgePage.includes("书本 SASI · 已上线"),"knowledge page removes launch-state label");
check(knowledge.includes("让 SASI 更懂你"),"knowledge feedback is user-facing");
check(!knowledge.includes("SASI LEARNING FEEDBACK"),"knowledge feedback engineering label removed");
check(!knowledge.includes("学习/失败信号"),"knowledge feedback engineering explanation removed");
check(!registry.includes('slug: "number-energy"'),"retired number-energy removed from live registry");
check(!/type Category =[^\n]*"field"/.test(hub),"field category removed from hub type");
check(!hub.includes('field: { zh: "场域小工具"'),"field category label removed from hub");
check(!hub.includes('if (category === "field")'),"field registry mapping removed from hub");
check(!hub.includes('"qr", "field"'),"field category removed from hub buttons");
check(middleware.includes('"/tools/number-energy"'),"retired number-energy URL redirects");

if(failures.length){
  console.error(`V14.67.2_ACCEPT_FAILURES=${failures.length}`);
  failures.forEach((x,i)=>console.error(`${i+1}. ${x}`));
  process.exit(1);
}
console.log("V14.67.2_ACCEPT=PASS");
