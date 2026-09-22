import fs from "node:fs";
import path from "node:path";

const root=process.argv[2]||process.cwd();
const base=(process.argv[3]||"http://127.0.0.1:3011").replace(/\/$/,"");

let failed=0;
const rows=[];

function record(kind,name,ok,detail){
  rows.push({kind,name,ok,detail});
  if(!ok) failed++;
  console.log(`${ok?"PASS":"FAIL"}  ${kind.padEnd(8)} ${name} ${detail?`— ${detail}`:""}`);
}

async function hit(route,expected=[200],opts={}){
  try{
    const r=await fetch(base+route,{redirect:"manual",...opts});
    const ok=expected.includes(r.status);
    record("HTTP",route,ok,`status ${r.status}, expected ${expected.join("/")}`);
    return r;
  }catch(e){
    record("HTTP",route,false,e?.message||String(e));
    return null;
  }
}

console.log(`\nLINGXIFIELD V10.1 ACCEPTANCE\nBase: ${base}\n`);

const public200=[
  "/",
  "/tools",
  "/sasi",
  "/ai-wallet",
  "/ai-knowledge",
  "/ai-learning",
  "/ai-research",
  "/field-tests",
  "/live-as",
  "/subconscious",
  "/practice",
  "/learn",
  "/stellar-trace",
  "/terms",
  "/privacy",
  "/declaration",
  "/refunds",
  "/tools/image-watermark-remover",
  "/tools/batch-image-watermark-remover",
  "/tools/video-watermark-remover",
  "/tools/food-calorie",
  "/tools/video-transcription",
  "/tools/audio-transcription",
  "/tools/pdf-compress",
  "/tools/pdf-ocr",
  "/tools/png-to-jpg",
  "/tools/qr-safe-reader",
];
for(const r of public200) await hit(r,[200]);

// Redirect-only routes are valid when they return an HTTP redirect.
for(const r of ["/dream","/narrative"]) await hit(r,[301,302,307,308]);

// Checkout should render; auth/payment method selection happens client-side.
await hit("/checkout?productId=ai-balance-50&redirect=/ai-wallet",[200,307,308]);

console.log("\nAPI contract — unauthenticated expectations\n");
await hit("/api/pay/alipay/status",[200]);
await hit("/api/ai/wallet",[401]);
await hit("/api/ai/provider-test?tier=light",[401]);
await hit("/api/ai/provider-test?tier=standard",[401]);
await hit("/api/ai/provider-test?tier=high",[401]);
await hit("/api/ai/referral/code",[401]);
await hit("/api/ai/referral/claim",[401],{
  method:"POST",
  headers:{"content-type":"application/json"},
  body:JSON.stringify({code:"TEST"})
});
await hit("/api/ai/refund/request",[401],{
  method:"POST",
  headers:{"content-type":"application/json"},
  body:JSON.stringify({orderId:"test",amountRmb:1})
});

console.log("\nSource behavior checks\n");
const checks=[
  ["shared language state","lib/lingxi-i18n.ts",/lingxi:lang/],
  ["theme persistence","components/Nav.tsx",/lx-theme/],
  ["global search route","components/Nav.tsx",/\/tools\?q=/],
  ["SASI attachment entry","components/SasiCommandCenter.tsx",/type="file"/],
  ["SASI Skills entry","components/SasiCommandCenter.tsx",/view=skills/],
  ["SASI connection center","components/SasiCommandCenter.tsx",/view=connections/],
  ["AI video marked coming soon","components/SasiCommandCenter.tsx",/coming/],
  ["wallet repeatable top-up CTA","components/AiWalletPanel.tsx",/ai-balance-\$\{selected\}/],
  ["checkout skips AI permanent unlock guard","app/checkout/page.tsx",/product\.group\s*!==\s*["']ai["'][\s\S]*product\.group\s*!==\s*["']production["']/],
  ["tools inherited shell","app/tools/layout.tsx",/@\/components\/Nav[\s\S]*@\/components\/Footer/],
  ["learn inherited shell","app/learn/layout.tsx",/@\/components\/Nav[\s\S]*@\/components\/Footer/],
];
for(const [name,rel,re] of checks){
  const p=path.join(root,rel);
  const exists=fs.existsSync(p);
  const content=exists?fs.readFileSync(p,"utf8"):"";
  record("SOURCE",name,exists&&re.test(content),rel);
}

console.log("\nAcceptance summary\n");
const pass=rows.filter(x=>x.ok).length;
console.log(`Passed: ${pass}`);
console.log(`Failed: ${failed}`);
if(failed){
  console.log("\nAcceptance FAILED. Do not commit yet.");
  process.exit(1);
}
console.log("\nAcceptance PASSED. Core public routes, auth guards and key UI wiring are intact.");
