const fs=require("fs"),path=require("path");
const root=process.argv[2]||process.cwd();
function exists(rel){return fs.existsSync(path.join(root,rel))}
const required=[
 "components/NotificationBell.tsx","app/api/notifications/route.ts","components/AccountProfileCard.tsx",
 "components/AiRefundRequestPanel.tsx","app/api/ai/refund/eligible/route.ts","app/api/pay/providers/route.ts",
 "supabase/migrations/20260923101500_ai_refund_gross_topup_fix.sql"
];
let fail=0;
for(const r of required){
  const ok=exists(r);
  console.log(ok?"PASS":"FAIL",r);
  if(!ok)fail++;
}
const advPath=path.join(root,"lib/tools/advanced-catalog.ts");
if(exists("lib/tools/advanced-catalog.ts")){
  const adv=fs.readFileSync(advPath,"utf8");
  const hrefs=[...adv.matchAll(/href:"(\/tools\/[^"]+)"/g)].map(m=>m[1]);
  const missing=[];
  for(const href of hrefs){
    const rel="app"+href+"/page.tsx";
    if(!exists(rel))missing.push(href);
  }
  console.log("\nAdvanced tool cards:",hrefs.length,"direct route files; missing:",missing.length);
  if(missing.length)console.log("Missing:",missing.join(", "));
}else{
  console.log("WARN lib/tools/advanced-catalog.ts not found; advanced card route scan skipped.");
}
for(const r of [
 "app/api/tools/quote/route.ts",
 "app/api/tools/pay/create/route.ts",
 "app/api/tools/pay/status/route.ts",
 "app/api/tools/export/consume/route.ts"
]){
  const ok=exists(r);
  console.log(ok?"PASS":"FAIL","paid-tool plumbing",r);
  if(!ok)fail++;
}
console.log("\nNOTE: source audit proves route/plumbing presence, not successful external payment capture. WeChat/Alipay/PayPal still require live provider tests.");
if(fail)process.exitCode=2;
