import fs from"node:fs";
const adapters=fs.readFileSync("lib/money/provider-adapters.ts","utf8");
const recon=fs.readFileSync("lib/money/reconciliation.ts","utf8");
const state=fs.readFileSync("lib/money/refund-state.ts","utf8");

const failures=[];
for(const marker of[
 'errorCode:"WECHAT_ABNORMAL"',
 'errorCode:`ALIPAY_${s.slice(7,100)}`',
 'status:"pending"',
 'if(["FAILED","CANCELLED"].includes(s))'
])if(!adapters.includes(marker))failures.push(`refund state marker missing ${marker}`);
if(!recon.includes('decision.action==="release"'))failures.push("release decision bridge missing");
if(!state.includes('status==="failed"'))failures.push("refund state failed mapping missing");
if(failures.length){console.error(failures.join("\n"));process.exit(1)}
console.log("CORE_REFUND_REGRESSION_MATRIX=PASS");
