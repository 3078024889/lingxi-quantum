import fs from "node:fs";
import path from "node:path";
const root=process.cwd(),fail=m=>{throw new Error(m)};
const host=fs.readFileSync(path.join(root,"components/SasiModeHost.tsx"),"utf8");
const guide=fs.readFileSync(path.join(root,"components/SasiStartGuide.tsx"),"utf8");
const studio=fs.readFileSync(path.join(root,"components/SasiChatCreationStudio.tsx"),"utf8");
const conn=fs.readFileSync(path.join(root,"app/sasi/ConnectionCenter.tsx"),"utf8");

if(!host.includes("SasiStartGuide"))fail("SASI_GUIDE_NOT_WIRED");
if(!guide.includes('/sasi/connections'))fail("SASI_CONNECTION_CTA_MISSING");
if(!guide.includes("does not prepay model costs")&&!guide.includes("模型费用不由灵犀场代付"))fail("NO_COST_TRANSPARENCY");
if(!guide.includes("OpenRouter")||!guide.includes("free models"))fail("FREE_PROVIDER_ONRAMP_MISSING");
if(!studio.includes("LOCAL_WEBSITE_FALLBACK_V8"))fail("WEBSITE_ZERO_SUBSIDY_AHA_MISSING");
if(!conn.includes("PRIMARY_IDS"))fail("CONNECTION_CENTER_NOT_FOUND");

console.log("AUDIT_3_SASI_ONBOARDING_FUNNEL=PASS");
console.log("SASI_CONNECTION_CTA=PASS");
console.log("SASI_ZERO_SUBSIDY_WEBSITE_AHA=PASS");
console.log("SASI_COST_TRANSPARENCY=PASS");
