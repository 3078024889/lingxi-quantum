import fs from "node:fs";
const fail=[];
const read=p=>fs.readFileSync(p,"utf8"),save=(p,s)=>fs.writeFileSync(p,s,"utf8");
function ensureImport(p,anchor,line){
 let s=read(p);if(s.includes(line)){console.log(`ALREADY import ${p}`);return}
 if(!s.includes(anchor)){console.error(`MISS import ${p}`);fail.push(`import ${p}`);return}
 s=s.replace(anchor,`${anchor}\n${line}`);save(p,s);console.log(`PASS import ${p}`);
}
function rep(p,a,b,n){
 let s=read(p);if(s.includes(b)){console.log(`ALREADY ${n}`);return}
 if(!s.includes(a)){console.error(`MISS ${n} :: ${p}`);fail.push(n);return}
 s=s.replace(a,b);save(p,s);console.log(`PASS ${n}`);
}

// CNY checkout: remove retired-product visual table and old "场域订单" wording.
ensureImport("app/checkout/page.tsx",
'import Footer from "@/components/Footer";',
'import LingxiMiniIcon from "@/components/LingxiMiniIcon";');

{
 const p="app/checkout/page.tsx";let s=read(p);

 const start='// 场域订单卡片用的缩略图——直接复用每个产品完整报告页已经在用的';
 const end='function CheckoutInner() {';
 if(s.includes(start)){
   const a=s.indexOf(start),b=s.indexOf(end,a);
   if(b>0){s=s.slice(0,a)+s.slice(b);console.log("PASS retired checkout thumbnails removed")}
   else {console.error("MISS checkout thumb end");fail.push("checkout thumb end")}
 } else if(!s.includes('"life-map-report"')) console.log("ALREADY retired checkout thumbnails removed");
 else {console.error("MISS checkout thumb start");fail.push("checkout thumb start")}

 s=s.replace('`支付已确认到账，但解锁时出现问题：${qData.unlockError}。请稍后在「场域入口 → 场域订单」里重试，不用重新付款。`',
             '`支付已确认到账，但结果处理时出现问题：${qData.unlockError}。请稍后在「账户 → 订单与使用记录」里重试，不用重新付款。`');
 s=s.replace('<Bi zh="← 返回场域订单" en="← Back to Field Orders" />','<Bi zh="← 返回订单与使用记录" en="← Back to orders" />');
 s=s.replace('<Bi zh="正在带你去场域订单……" en="Taking you to Field Orders…" />','<Bi zh="正在带你去订单与使用记录……" en="Taking you to your orders…" />');
 s=s.replace('<Bi zh="数字服务订单" en="Digital Service Order" />','<Bi zh="确认付款" en="Confirm payment" />');
 s=s.replace('<Bi zh="数字服务订单号" en="Digital Service Order No." />','<Bi zh="订单" en="Order" />');
 s=s.replace('<Bi zh="连接账号" en="Connected Account" />','<Bi zh="付款账户" en="Payment account" />');

 const imgStart='{THUMB_BY_PRODUCT[productId] && (';
 if(s.includes(imgStart)){
   const a=s.indexOf(imgStart);
   const marker='              <div className="min-w-0 flex-1">';
   const b=s.indexOf(marker,a);
   if(b>0){s=s.slice(0,a)+'<LingxiMiniIcon name={(product.group==="ai"||product.group==="production")?"wallet":"orders"} size="card"/>\n'+s.slice(b);console.log("PASS checkout product icon installed")}
   else {console.error("MISS checkout img end");fail.push("checkout img end")}
 } else if(s.includes('name={(product.group==="ai"||product.group==="production")?"wallet":"orders"}')) console.log("ALREADY checkout product icon installed");
 else {console.error("MISS checkout image block");fail.push("checkout image block")}

 s=s.replace('<div className="mx-auto max-w-xl px-6 py-16">','<div className="mx-auto max-w-xl px-6 py-16 lx-checkout-page">');
 s=s.replace('<div className="mt-6 overflow-hidden rounded-sm border border-[var(--lx-line)] bg-[var(--lx-panel)]/80 backdrop-blur-sm">',
             '<div className="mt-6 overflow-hidden rounded-sm border border-[var(--lx-line)] bg-[var(--lx-panel)]/80 backdrop-blur-sm lx-checkout-card">');

 save(p,s);console.log("PASS CNY checkout cleanup + visual");
}

// USD checkout: unified visual hierarchy, no amount/payment logic changes.
ensureImport("app/checkout-usd/page.tsx",
'import PaypalHelp from "@/components/PaypalHelp";',
'import LingxiMiniIcon from "@/components/LingxiMiniIcon";');
{
 const p="app/checkout-usd/page.tsx";let s=read(p);
 s=s.replace('<section className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-7">',
             '<section className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-7 lx-checkout-usd-card">');
 s=s.replace('<p className="text-sm text-[var(--lx-faint)]">PayPal · USD</p>',
             '<div className="lx-page-title-line"><LingxiMiniIcon name="wallet" size="title"/><p className="text-sm text-[var(--lx-faint)]">PayPal · USD</p></div>');
 save(p,s);console.log("PASS USD checkout visual");
}

// Orders: stronger state/card hierarchy and localized balance links.
{
 const p="app/account/orders/page.tsx";let s=read(p);
 s=s.replace('return <article key={o.id} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">',
             'return <article key={o.id} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5 lx-order-card">');
 s=s.replace('<div className="min-w-0">\n                  <p className="text-[11px] text-[var(--lx-faint)]">',
             '<div className="min-w-0 lx-order-main"><LingxiMiniIcon name={tool?"tools":current?.group==="production"?"sasi":current?.group==="ai"?"wallet":"orders"} size="title"/><div><p className="text-[11px] text-[var(--lx-faint)]">');
 s=s.replace('<p className="mt-2 text-xs text-[var(--lx-muted)]">{new Date(o.created_at).toLocaleString()} · <Bi zh={providerText(o.provider,"zh")} en={providerText(o.provider,"en")}/></p>\n                </div>',
             '<p className="mt-2 text-xs text-[var(--lx-muted)]">{new Date(o.created_at).toLocaleString()} · <Bi zh={providerText(o.provider,"zh")} en={providerText(o.provider,"en")}/></p></div>\n                </div>');
 s=s.replace('<div className="text-right"><b className="text-lg text-[var(--lx-ink)]">{amount}</b><p className="mt-1 text-xs text-[var(--lx-muted)]"><Bi zh={statusText(o.status,"zh")} en={statusText(o.status,"en")}/></p></div>',
             '<div className="text-right lx-order-side"><b className="text-lg text-[var(--lx-ink)]">{amount}</b><p className={`mt-1 text-xs lx-order-status status-${o.status}`}><Bi zh={statusText(o.status,"zh")} en={statusText(o.status,"en")}/></p></div>');
 s=s.replace('<Link href="/ai-wallet" className="mt-4 inline-block text-sm">AI Balance →</Link>',
             '<Link href="/ai-wallet" className="mt-4 inline-block text-sm"><Bi zh="查看 AI 余额 →" en="View AI balance →"/></Link>');
 s=s.replace('<Link href="/sasi/pricing" className="mt-4 inline-block text-sm">SASI Balance →</Link>',
             '<Link href="/sasi/pricing" className="mt-4 inline-block text-sm"><Bi zh="查看 SASI 余额 →" en="View SASI balance →"/></Link>');
 save(p,s);console.log("PASS orders visual");
}

// Withdrawal/refund/legal headers.
{
 const p="app/account/withdrawals/page.tsx";let s=read(p);
 s=s.replace('<main className="mx-auto max-w-3xl px-6 py-20">','<main className="mx-auto max-w-3xl px-6 py-20 lx-account-subpage">');
 save(p,s);console.log("PASS withdrawal page visual");
}
{
 const p="app/refunds/page.tsx";let s=read(p);
 s=s.replace('<div className="lx-legal-card">','<div className="lx-legal-card lx-refund-policy-card">');
 save(p,s);console.log("PASS refund policy visual");
}

// SASI pricing: add visual icon hierarchy while keeping catalog/pricing untouched.
ensureImport("app/sasi/pricing/page.tsx",
'import Footer from "@/components/Footer";',
'import LingxiMiniIcon from "@/components/LingxiMiniIcon";');
{
 const p="app/sasi/pricing/page.tsx";let s=read(p);
 s=s.replace('<p className="text-sm text-[var(--lx-faint)]">SASI · 创作余额</p>',
             '<div className="lx-page-title-line"><LingxiMiniIcon name="sasi" size="title"/><p className="text-sm text-[var(--lx-faint)]">SASI · 创作余额</p></div>');
 s=s.replace('<section className="mt-10">','<section className="mt-10 lx-pricing-section">');
 s=s.replace('<section className="mt-12">','<section className="mt-12 lx-pricing-section">');
 s=s.replace(/className="rounded-2xl border border-\[var\(--lx-line\)\] bg-\[var\(--lx-panel\)\] p-5"/g,
             'className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5 lx-pricing-card"');
 save(p,s);console.log("PASS SASI pricing visual");
}

// Shared styles.
{
 const p="app/globals.css";let s=read(p);
 const marker="/* V14.81 payments/orders visual */";
 if(!s.includes(marker))s+=`

${marker}
.lx-checkout-page>h1{font-size:30px!important;font-weight:790!important;letter-spacing:-.025em!important}
.lx-checkout-card{
  border-radius:20px!important;
  box-shadow:0 14px 34px rgba(45,62,88,.07)!important;
}
.lx-checkout-card>.flex.items-start.gap-4{align-items:center!important}
.lx-checkout-card>.flex.items-start.gap-4>.lx-mini-icon{flex:0 0 auto!important}
.lx-checkout-card .font-display.text-lg{font-size:17px!important;font-weight:760!important}
.lx-checkout-card .text-xs{font-size:12.5px!important}
.lx-checkout-usd-card{
  border-radius:22px!important;
  box-shadow:0 14px 34px rgba(45,62,88,.07)!important;
}
.lx-checkout-usd-card h1{font-size:30px!important;font-weight:790!important;letter-spacing:-.025em!important}
.lx-checkout-usd-card>div.rounded-2xl{border-radius:17px!important;background:linear-gradient(135deg,var(--lx-panel),var(--lx-soft))!important}

.lx-order-card{
  border-radius:18px!important;
  box-shadow:0 8px 24px rgba(47,64,90,.045)!important;
}
.lx-order-main{display:grid!important;grid-template-columns:38px minmax(0,1fr)!important;gap:13px!important;align-items:start!important}
.lx-order-main>.lx-mini-icon{margin-top:1px!important}
.lx-order-main h2{font-size:17px!important;font-weight:760!important}
.lx-order-side{min-width:108px!important}
.lx-order-status{display:inline-flex!important;border-radius:999px!important;padding:4px 8px!important;background:#f2f5f9!important;color:#64748b!important}
.lx-order-status.status-paid{background:#eafaf3!important;color:#13865c!important}
.lx-order-status.status-refunded{background:#edf6ff!important;color:#2472a4!important}
.lx-order-status.status-pending{background:#fff7df!important;color:#a36c00!important}
.lx-order-status.status-failed,.lx-order-status.status-cancelled{background:#fff0f2!important;color:#b44258!important}

.lx-account-subpage>div:first-child{margin-bottom:6px!important}
.lx-account-subpage h1{font-size:32px!important;font-weight:800!important;letter-spacing:-.03em!important}
.lx-refund-policy-card{border-radius:22px!important;box-shadow:0 12px 34px rgba(47,64,90,.05)!important}
.lx-refund-policy-card h1{font-weight:800!important;letter-spacing:-.03em!important}
.lx-refund-policy-card section h2{font-weight:760!important}

.lx-pricing-section>h2{font-size:21px!important;font-weight:790!important}
.lx-pricing-card{
  border-radius:18px!important;
  box-shadow:0 8px 24px rgba(47,64,90,.045)!important;
  transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease!important;
}
.lx-pricing-card:hover{transform:translateY(-2px)!important;box-shadow:0 14px 30px rgba(47,64,90,.075)!important}
.lx-pricing-card h3{letter-spacing:-.02em!important}

@media(max-width:640px){
  .lx-checkout-page{padding-inline:18px!important}
  .lx-order-main{grid-template-columns:34px minmax(0,1fr)!important;gap:10px!important}
  .lx-order-side{min-width:auto!important}
}
`;
 save(p,s);console.log("PASS payments/orders CSS");
}

if(fail.length){console.error(`V14.81.1_PATCH_FAILURES=${fail.length}`);fail.forEach((x,i)=>console.error(`${i+1}. ${x}`));process.exit(1)}
console.log("V14.81.1_PATCH=PASS");
