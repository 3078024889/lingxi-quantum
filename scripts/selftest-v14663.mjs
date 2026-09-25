import fs from "node:fs";

const paypal=fs.readFileSync("lib/paypal.ts","utf8");
const audit=fs.readFileSync("scripts/audit-security.mjs","utf8");

const checks=[
  ["completed verifier export",paypal.includes("export async function verifyPaypalCompletedOrder")],
  ["completed capture lookup",paypal.includes('captures.find((item: any) => item?.status === "COMPLETED")')],
  ["completed capture id required",paypal.includes("if (!capture?.id)")],
  ["completed capture amount reverified",paypal.includes("verifyMoney(capture.amount, expectedAmountUsd)")],
  ["local reference reverified",paypal.includes("verifyReference(unit, expectedReferenceId)")],
  ["audit no brittle nested-paren regex",!audit.includes("captures\\\\.find\\\\([^)]*status")],
];
let failed=false;
for(const [name,ok] of checks){
  console.log(`${ok?"PASS":"FAIL"} SELFTEST ${name}`);
  if(!ok)failed=true;
}
if(failed)process.exit(1);
console.log("V14.66.3_SELFTEST=PASS");
