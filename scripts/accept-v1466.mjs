import fs from "node:fs";
const r=p=>fs.readFileSync(p,"utf8");
const checks=[
 ["missing SasiSkillsPanel is shipped",fs.existsSync("components/SasiSkillsPanel.tsx")],
 ["workspace import resolves",r("app/sasi/SasiWorkspace.tsx").includes('@/components/SasiSkillsPanel')],
 ["PayPal review page exists",fs.existsSync("app/paypal/page.tsx")],
 ["PayPal checkout uses USD catalog",r("app/api/pay/create/route.ts").includes("getUsdBalanceProduct")],
 ["PayPal completed capture verifier exists",r("lib/paypal.ts").includes("verifyPaypalCompletedOrder")],
 ["PayPal return requires completed capture",r("app/api/pay/paypal/return/route.ts").includes("verifyPaypalCompletedOrder")],
 ["PayPal webhook requires completed capture",r("app/api/pay/webhook/route.ts").includes("verifyPaypalCompletedOrder")],
];
let failed=false;
for(const [name,ok] of checks){console.log(`${ok?"PASS":"FAIL"} ${name}`);if(!ok)failed=true}
if(failed)process.exit(1);
console.log("V14.66 BUILD + PAYPAL=PASS");
