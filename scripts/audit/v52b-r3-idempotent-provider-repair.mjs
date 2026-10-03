import fs from "node:fs";
const bad=[];
for(const p of["lib/paypal.ts","lib/wechatpay.ts"]){
  const s=fs.readFileSync(p,"utf8");
  if(/\bexport\s+export\b/.test(s))bad.push(`${p}: duplicate export`);
  if(/\bexport\s+export\s+export\b/.test(s))bad.push(`${p}: triple export`);
}
if(!fs.readFileSync("lib/paypal.ts","utf8").includes("export function paypalBaseUrl()"))bad.push("paypalBaseUrl export missing");
if(!fs.readFileSync("lib/wechatpay.ts","utf8").includes("export async function wechatRequest("))bad.push("wechatRequest export missing");
if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log("V52B_R3_PROVIDER_EXPORTS_IDEMPOTENT=PASS");
